// app/api/recipes/route.ts
import { NextResponse } from 'next/server';

// ⚠️ In-memory store (persists only while the server stays warm).
// Swap this with a real DB later.
type NewRecipeInput = {
  name: string;
  instructions: string;
  category?: string;
  imageUrl?: string; // optional for now (you can wire real upload later)
};

type StoredRecipe = {
  id: string;
  name: string;
  instructions: string;
  category?: string;
  imageUrl?: string;
  createdAt: string;
};

const RECIPES: StoredRecipe[] = [];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<NewRecipeInput>;
    const name = body.name?.trim();
    const instructions = body.instructions?.trim();
    const category = body.category?.trim();
    const imageUrl = body.imageUrl?.trim();

    if (!name || !instructions) {
      return NextResponse.json(
        { error: 'name and instructions are required.' },
        { status: 400 }
      );
    }

    const recipe: StoredRecipe = {
      id: crypto.randomUUID(),
      name,
      instructions,
      category,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    RECIPES.unshift(recipe);
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (err) {
    console.error('Create recipe failed:', err);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

// Optional: simple GET to verify items while developing
export async function GET() {
  return NextResponse.json({ recipes: RECIPES });
}
