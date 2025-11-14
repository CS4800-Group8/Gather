// Manage user's favorite recipes (user-created): add, remove, and list favorites.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Add user recipe to favorites
export async function POST(req: Request) {
  try {
    const { userId, recipeId } = await req.json();

    // Validate input
    if (!userId || !recipeId) {
      return NextResponse.json(
        { error: "User ID and Recipe ID are required" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: Number(userId),
          recipeId: Number(recipeId),
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Recipe already in favorites" },
        { status: 409 }
      );
    }

    // Add to favorites
    const favoriteRecipe = await prisma.favoriteRecipe.create({
      data: {
        userId: Number(userId),
        recipeId: Number(recipeId),
      },
    });

    return NextResponse.json(
      {
        message: "Recipe added to favorites",
        favoriteRecipe,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding favorite recipe:", error);
    return NextResponse.json(
      { error: "Failed to add favorite recipe" },
      { status: 500 }
    );
  }
}

// DELETE - Remove user recipe from favorites
export async function DELETE(req: Request) {
  try {
    const { userId, recipeId } = await req.json();

    // Validate input
    if (!userId || !recipeId) {
      return NextResponse.json(
        { error: "User ID and Recipe ID are required" },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const existingFavorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: Number(userId),
          recipeId: Number(recipeId),
        },
      },
    });

    if (!existingFavorite) {
      return NextResponse.json(
        { error: "Recipe not found in favorites" },
        { status: 404 }
      );
    }

    // Remove favorite
    await prisma.favoriteRecipe.delete({
      where: {
        userId_recipeId: {
          userId: Number(userId),
          recipeId: Number(recipeId),
        },
      },
    });

    return NextResponse.json(
      { message: "Recipe removed from favorites" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing favorite recipe:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite recipe" },
      { status: 500 }
    );
  }
}

// GET - Get user's favorite user-created recipes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch favorite recipes and related data
    const favoriteRecipes = await prisma.favoriteRecipe.findMany({
      where: { userId: Number(userId) },
      include: {
        recipe: {
          include: {
            recipeIngredients: { include: { ingredient: true } },
            recipeCategories: { include: { category: true } },
          },
        },
      },
    });

    // Flatten nested relations for frontend display
    const parsedFavorites = favoriteRecipes.map((fav) => ({
      ...fav,
      recipe: {
        ...fav.recipe,
        ingredients: fav.recipe.recipeIngredients.map((ri) => ({
          id: ri.ingredient.ingredientId,
          name: ri.ingredient.ingredientName,
          quantity: ri.quantity,
        })),
        categories: fav.recipe.recipeCategories.map((rc) => ({
          id: rc.category.categoryId,
          name: rc.category.categoryName,
        })),
      },
    }));

    return NextResponse.json(
      { favoriteRecipes: parsedFavorites },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching favorite recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite recipes" },
      { status: 500 }
    );
  }
}