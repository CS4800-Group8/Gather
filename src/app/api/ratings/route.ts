import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, recipeId, apiId, value, score, type } = await req.json();

    // Support both "value" and "score" from frontend
    const ratingValue = value ?? score;

    // Validation
    if (!userId || (!recipeId && !apiId) || ratingValue == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Distinguish between API recipes and user recipes
    const whereClause = recipeId
      ? { userId_recipeId: { userId, recipeId: Number(recipeId) } }
      : { userId_apiId: { userId, apiId } };

    // Upsert (update if exists, create if new)
    const rating = await prisma.rating.upsert({
      where: whereClause,
      update: { value: ratingValue },
      create: {
        userId,
        recipeId: recipeId ? Number(recipeId) : null,
        apiId: apiId || null,
        value: ratingValue,
      },
    });

    // Create notification for user recipe ratings (not API recipes)
    if (recipeId) {
      try {
        // Fetch recipe to get owner and name
        const recipe = await prisma.recipe.findUnique({
          where: { recipeId: Number(recipeId) },
          select: { userId: true, recipeName: true },
        });

        // Only notify if rating someone else's recipe
        if (recipe && recipe.userId !== userId) {
          const stars = "⭐".repeat(ratingValue);

          await prisma.notification.create({
            data: {
              userId: recipe.userId,
              relatedUserId: userId, // AnN add: Link to rater for avatar display on 11/25
              relatedRecipeId: Number(recipeId), // AnN add: Link to recipe for click-to-open on 11/25
              type: "recipe_rating",
              message: `rated your recipe "${recipe.recipeName}" ${stars}`,
            },
          });
        }
      } catch (notifErr) {
        // Don't fail the rating if notification fails
        console.error("Error creating rating notification:", notifErr);
      }
    }

    return NextResponse.json(rating, { status: 200 });
  } catch (err) {
    console.error("Error adding rating:", err);
    return NextResponse.json({ error: "Failed to add rating" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");
    const apiId = searchParams.get("apiId");
    const userId = searchParams.get("userId");

    if (!recipeId && !apiId) {
      return NextResponse.json({ error: "Missing recipeId or apiId" }, { status: 400 });
    }

    // Get all ratings for the recipe
    const ratings = await prisma.rating.findMany({
      where: recipeId ? { recipeId: Number(recipeId) } : { apiId: apiId! },
      include: {
        user: {
          select: { id: true, firstname: true, lastname: true, avatarId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const count = ratings.length;
    const average = count > 0 ? ratings.reduce((sum, r) => sum + r.value, 0) / count : 0;

    // Find current user's rating if logged in
    let userRating = null;
    if (userId) {
      userRating = ratings.find((r) => r.userId === Number(userId)) || null;
    }

    return NextResponse.json({
      average: Number(average.toFixed(1)),
      count,
      ratings,
      userRating,
    });
  } catch (err) {
    console.error("Error fetching ratings:", err);
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}
