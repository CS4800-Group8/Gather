// AnN add: Get single recipe by ID for notification click on 11/25
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = Number(id);

    if (!recipeId || Number.isNaN(recipeId)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const recipeRaw = await prisma.recipe.findUnique({
      where: { recipeId },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
        recipeCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!recipeRaw) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Flatten nested relations for frontend
    const recipe = {
      recipeId: recipeRaw.recipeId,
      recipeName: recipeRaw.recipeName,
      description: recipeRaw.description,
      photoUrl: recipeRaw.photoUrl,
      instructions: recipeRaw.instructions,
      videoUrl: recipeRaw.videoUrl,
      createdAt: recipeRaw.createdAt,
      ingredients: recipeRaw.recipeIngredients.map((ri) => ({
        id: ri.ingredient.ingredientId,
        name: ri.ingredient.ingredientName,
        quantity: ri.quantity,
      })),
      categories: recipeRaw.recipeCategories.map((rc) => ({
        id: rc.category.categoryId,
        name: rc.category.categoryName,
      })),
    };

    return NextResponse.json({ recipe });
  } catch (e) {
    console.error('GET /api/recipes/[id] error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
