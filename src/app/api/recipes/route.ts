import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Parse and sanitize request body
    const body = await req.json().catch(() => ({}))
    const recipeName = (body?.recipeName ?? '').toString().trim()
    const description = body?.description ? body.description.toString() : null
    const photoUrl = body?.photoUrl ? body.photoUrl.toString() : null  // AnN add: Accept photo URL on 10/23

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
      select: { recipeId: true, recipeName: true, description: true, photoUrl: true, createdAt: true }, // AnN add: Return photo URL on 10/23
    })

    // Respond with created recipe
    return NextResponse.json({ recipe }, { status: 201 })
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

    // Fetch recipes belonging to the user, newest first
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { recipeId: true, recipeName: true, description: true, photoUrl: true, createdAt: true }, // AnN add: Return photo URL on 10/23
    });

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

