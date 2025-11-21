// Manage user's recipes: get (especially in search).

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET - Get users' recipe by searching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categories = (searchParams.get("categories") || "").split(",").filter(Boolean);
    const ingredients = (searchParams.get("ingredients") || "").split(",").filter(Boolean);

    // Viet edit: Support filtering by name, category, and ingredient
    const whereClause: Prisma.RecipeWhereInput = {
      AND: [
        query
          ? {
              OR: [
                { recipeName: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            }
          : undefined,
        categories.length > 0 || ingredients.length > 0
          ? {
              OR: [
                categories.length > 0
                  ? {
                      recipeCategories: {
                        some: {
                          category: {
                            categoryName: {
                              in: categories.map((c) => c.trim()),
                              mode: 'insensitive',
                            },
                          },
                        },
                      },
                    }
                  : undefined,
                ingredients.length > 0
                  ? {
                      recipeIngredients: {
                        some: {
                          ingredient: {
                            ingredientName: {
                              in: ingredients.map((i) => i.trim()),
                              mode: 'insensitive',
                            },
                          },
                        },
                      },
                    }
                  : undefined,
              ],
            }
          : undefined,
      ].filter(Boolean) as Prisma.RecipeWhereInput[], // ✅ filter out undefined entries safely
    };

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
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