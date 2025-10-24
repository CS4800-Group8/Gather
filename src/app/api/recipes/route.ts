import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Parse and sanitize request body
    const body = await req.json().catch(() => ({}))
    const recipeName = (body?.recipeName ?? '').toString().trim()
    const description = body?.description ? body.description.toString() : null

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
      data: { userId, recipeName, description: description || undefined }, // Expects JSON body: { recipeName: string, description?: string }
      select: { recipeId: true, recipeName: true, description: true, createdAt: true },
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
      select: { recipeId: true, recipeName: true, description: true, createdAt: true },
    });

    return NextResponse.json({ recipes });
  } catch (e) {
    console.error('GET /api/recipes error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

