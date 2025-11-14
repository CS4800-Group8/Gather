// Manage user's favorite API recipes: add, remove, and list favorites.

import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// POST - Add API recipe to favorites
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, apiId } = body;

    // Validate required fields
    if (!userId || !apiId) {
      return NextResponse.json(
        { error: "User ID and API Recipe ID are required" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavoriteAPI = await prisma.favoriteAPIRecipe.findUnique({
      where: {
        userId_apiId: {
          userId: parseInt(userId),
          apiId: apiId
        }
      }
    });

    if (existingFavoriteAPI) {
      return NextResponse.json(
        { error: "Recipe already in favorites" },
        { status: 409 }
      );
    }

    // Add to favorites
    const favoriteRecipeAPI = await prisma.favoriteAPIRecipe.create({
      data: {
        userId: parseInt(userId),
        apiId: apiId
      }
    });

    return NextResponse.json(
      { 
        message: "Recipe added to favorites",
        favoriteRecipe: favoriteRecipeAPI
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding favorite recipe:', error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

// DELETE - Remove API recipe from favorites
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, apiId } = body;

    // Validate required fields
    if (!userId || !apiId) {
      return NextResponse.json(
        { error: "User ID and API Recipe ID are required" },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const existingFavoriteAPI = await prisma.favoriteAPIRecipe.findUnique({
      where: {
        userId_apiId: {
          userId: parseInt(userId),
          apiId: apiId
        }
      }
    });

    if (!existingFavoriteAPI) {
      return NextResponse.json(
        { error: "Recipe not found in favorites" },
        { status: 404 }
      );
    }

    // Remove from favorites
    await prisma.favoriteAPIRecipe.delete({
      where: {
        userId_apiId: {
          userId: parseInt(userId),
          apiId: apiId
        }
      }
    });

    return NextResponse.json(
      { message: "Recipe removed from favorites" },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error removing favorite recipe:', error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

// GET - Get user's favorite API recipes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const parsedFavorites = await prisma.favoriteAPIRecipe.findMany({
      where: {
        userId: parseInt(userId)
      }
    });

    return NextResponse.json(
      { favoriteAPIRecipes: parsedFavorites },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }

}