import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Parse and sanitize request body
    const body = await req.json().catch(() => ({}))
    const recipeName = (body?.recipeName ?? '').toString().trim()
    const description = body?.description ? body.description.toString() : null
    const photoUrl = body?.photoUrl ? body.photoUrl.toString() : null  // AnN add: Accept photo URL on 10/23
    const ingredients: { id: number; quantity?: string }[] = body?.ingredients || [] // Viet add: Accept ingredients
    const categories: number[] = body?.categoryIds || [] // Viet add: Accept categories

    // Get userId from request header (replace with real auth later)
    const userIdHeader = req.headers.get('x-user-id')
    const userId = userIdHeader ? Number(userIdHeader) : NaN

    // Validate required fields
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 401 })
    }
    if (!recipeName) {
      return NextResponse.json({ error: 'Recipe name is required' }, { status: 400 })
    }

    // Create new recipe record in DB
    const recipe = await prisma.recipe.create({
      data: { userId, recipeName, description: description || undefined, photoUrl: photoUrl || undefined }, // AnN add: Save photo URL on 10/23
    })

    // Viet add: link ingredients to recipe
    for (const ing of ingredients) {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.recipeId,
          ingredientId: ing.id,
          quantity: ing.quantity ?? '',
        },
      })
    }
    // Viet add: link categories to recipe
    for (const categoryId of categories) {
      await prisma.recipeCategory.create({
        data: {
          recipeId: recipe.recipeId,
          categoryId,
        },
      })
    }
    // Viet add: return full recipe
    const fullRecipe = await prisma.recipe.findUnique({
      where: { recipeId: recipe.recipeId },
      include: {
        recipeIngredients: { include: { ingredient: true } },
        recipeCategories: { include: { category: true } },
      },
    })

    // Respond with created recipe
    return NextResponse.json({ fullRecipe }, { status: 201 })
  } catch (e) {
    console.error('Create recipe error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Get userId from request header (replace with real auth later)
    const userIdHeader = req.headers.get('x-user-id');
    const userId = userIdHeader ? Number(userIdHeader) : NaN;

    // Validate user
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 401 });
    }

    // Viet changed: Fetch recipes belonging to the user, newest first, include ingredients and categories
    const recipesRaw = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true, // Include ingredient name and id
          },
        },
        recipeCategories: {
          include: {
            category: true, // Include category name and id
          },
        },
      },
    });

    // Viet add: Flatten nested relations for front end
    const recipes = recipesRaw.map((r) => ({
      recipeId: r.recipeId,
      recipeName: r.recipeName,
      description: r.description,
      photoUrl: r.photoUrl,
      createdAt: r.createdAt,
      ingredients: r.recipeIngredients.map((ri) => ({
        id: ri.ingredient.ingredientId,
        name: ri.ingredient.ingredientName,
        quantity: ri.quantity,
      })),
      categories: r.recipeCategories.map((rc) => ({
        id: rc.category.categoryId,
        name: rc.category.categoryName,
      })),
    }));

    return NextResponse.json({ recipes });
  } catch (e) {
    console.error('GET /api/recipes error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// AnN add: Delete recipe endpoint on 10/23
export async function DELETE(req: Request) {
  try {
    // Get userId from request header
    const userIdHeader = req.headers.get('x-user-id');
    const userId = userIdHeader ? Number(userIdHeader) : NaN;

    // Get recipeId from request body
    const body = await req.json().catch(() => ({}));
    const recipeId = body?.recipeId ? Number(body.recipeId) : NaN;

    // Validate required fields
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 401 });
    }
    if (!recipeId || Number.isNaN(recipeId)) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Delete recipe (only if it belongs to the user)
    const deletedRecipe = await prisma.recipe.deleteMany({
      where: {
        recipeId: recipeId,
        userId: userId,  // Security: only delete if owned by this user
      },
    });

    // Check if recipe was deleted
    if (deletedRecipe.count === 0) {
      return NextResponse.json({ error: 'Recipe not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 });
  } catch (e) {
    console.error('DELETE /api/recipes error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

