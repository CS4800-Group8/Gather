// Manage user's favorite recipes: add, remove, and list favorites.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Add API recipe to favorites
export async function POST(request: NextRequest) {
  try {
    const { userId, recipeId } = await request.json();

    // Validate required fields
    if (!userId || !recipeId) {
      return NextResponse.json(
        { error: 'User ID and Recipe ID are required' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: parseInt(userId),
          recipeId: parseInt(recipeId),
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Recipe is already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    const favorite = await prisma.favoriteRecipe.create({
      data: {
        userId: parseInt(userId),
        recipeId: parseInt(recipeId),
      },
    });

    return NextResponse.json({ favorite });
  } catch (error) {
    console.error('Error adding favorite recipe:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite recipe' },
      { status: 500 }
    );
  }
}

// DELETE - Remove API recipe from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { userId, recipeId } = await request.json();
    
    // Validate required fields
    if (!userId || !recipeId) {
      return NextResponse.json(
        { error: 'User ID and Recipe ID are required' },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const existingFavorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: parseInt(userId),
          recipeId: parseInt(recipeId),
        },
      },
    });

    if (!existingFavorite) {
      return NextResponse.json(
        { error: 'Recipe is not in favorites' },
        { status: 404 }
      );
    }

    // Remove from favorites
    await prisma.favoriteRecipe.delete({
      where: {
        userId_recipeId: {
          userId: parseInt(userId),
          recipeId: parseInt(recipeId),
        },
      },
    });

    return NextResponse.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite recipe:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite recipe' },
      { status: 500 }
    );
  }
}