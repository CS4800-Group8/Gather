/**
 * @file All Recipes API Route (GET /api/recipes/all)
 *
 * @description
 * Fetches **all user-created recipes globally**, including:
 *   - Recipe metadata (name, description, media, timestamps)
 *   - Recipe owner information (user)
 *   - Ingredients + quantities
 *   - Categories
 *
 * This endpoint is used for:
 *   - Home feed (community feed)
 *
 * The handler:
 *   1. Fetches all recipes with joined relations
 *   2. Sorts by newest created
 *   3. Transforms nested Prisma structures into flat frontend-friendly objects
 *
 * @returns
 * `{ recipes: [...] }`
 *
 * @dependencies
 * - Prisma: Recipe, User, RecipeIngredient, RecipeCategory models
 * - NextResponse: JSON response helper
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get all users' recipes
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
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
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}