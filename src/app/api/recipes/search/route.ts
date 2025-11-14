// Manage user's recipes: get (especially in search).

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get users' recipe by searching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ recipes: [] });
    }

    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { recipeName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
          },
        },
        recipeCategories: {
          include: {
            category: true,
          },
        },
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedRecipes = recipes.map(recipe => ({
      recipeId: recipe.recipeId,
      recipeName: recipe.recipeName,
      description: recipe.description,
      photoUrl: recipe.photoUrl,
      instructions: recipe.instructions,
      videoUrl: recipe.videoUrl,
      createdAt: recipe.createdAt.toISOString(),
      user: recipe.user,
      categories: recipe.recipeCategories.map(rc => ({
        id: rc.category.categoryId,
        name: rc.category.categoryName,
      })),
      ingredients: recipe.recipeIngredients.map(ri => ({
        id: ri.ingredient.ingredientId,
        name: ri.ingredient.ingredientName,
        quantity: ri.quantity,
      })),
    }));

    return NextResponse.json({ recipes: transformedRecipes });
  } catch (error) {
    console.error('Error searching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}