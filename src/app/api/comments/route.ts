/**
 * @file Comments API Route (GET/POST/DELETE /api/comments)
 *
 * @description
 * Provides functionality for comments on both user-created recipes
 * and API-based recipes (TheMealDB). Supports fetching comments, creating new
 * comments, and deleting comments with strict ownership validation.
 *
 * This route uses two identifiers to distinguish recipe types:
 * - `recipeId` for user recipes (integer FK)
 * - `apiId` for TheMealDB recipes (string identifier)
 *
 * @returns
 * - GET: List of comments with user information
 * - POST: Newly created comment with author details
 * - DELETE: Deletion success message
 *
 * @dependencies
 * - Prisma: Comment creation, retrieval, and deletion
 * - NextResponse: Standardized JSON responses
 */

// AnN add: Comment API routes on 11/12

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/comments?recipeId=123&type=user
// GET /api/comments?recipeId=52771&type=api
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");
    const type = searchParams.get("type"); // "user" or "api"

    if (!recipeId || !type) {
      return NextResponse.json(
        { error: "Missing recipeId or type parameter" },
        { status: 400 }
      );
    }

    // AnN add: Build query based on recipe type on 11/12
    const where = type === "user"
      ? { recipeId: parseInt(recipeId), apiId: null }
      : { apiId: recipeId, recipeId: null };

    // AnN add: Fetch comments with user info on 11/12
    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            avatarId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments
// Body: { recipeId, type, content, userId }
export async function POST(req: Request) {
  try {
    const { recipeId, type, content, userId } = await req.json();

    // AnN add: Validation on 11/12
    if (!recipeId || !type || !content || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type !== "user" && type !== "api") {
      return NextResponse.json(
        { error: "Type must be 'user' or 'api'" },
        { status: 400 }
      );
    }

    // AnN add: Character limit validation on 11/12
    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // AnN add: Prepare data based on type on 11/12
    const data = type === "user"
      ? {
          recipeId: parseInt(recipeId),
          apiId: null,
          content: content.trim(),
          userId,
        }
      : {
          recipeId: null,
          apiId: recipeId,
          content: content.trim(),
          userId,
        };

    // AnN add: Create comment on 11/12
    const comment = await prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            avatarId: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// DELETE /api/comments
// Body: { commentId, userId }
export async function DELETE(req: Request) {
  try {
    const { commentId, userId } = await req.json();

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: "Missing commentId or userId" },
        { status: 400 }
      );
    }

    // AnN add: Check comment ownership on 11/12
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own comments" },
        { status: 403 }
      );
    }

    // AnN add: Delete comment on 11/12
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
