// AnN add: Conversation API routes on 11/19
// Handles creating/fetching conversations between two users

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// AnN add: POST - Create or get existing conversation on 11/19
export async function POST(req: Request) {
  try {
    const { userId1, userId2 } = await req.json();

    // Validation
    if (!userId1 || !userId2) {
      return NextResponse.json(
        { error: "Both user IDs are required" },
        { status: 400 }
      );
    }

    if (userId1 === userId2) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // AnN add: Normalize user IDs (smaller ID as user1, larger as user2) on 11/19
    // This ensures consistent ordering and prevents duplicate conversations
    const user1Id = Math.min(userId1, userId2);
    const user2Id = Math.max(userId1, userId2);

    // Check if conversation already exists
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatarId: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatarId: true,
          },
        },
      },
    });

    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
        },
        include: {
          user1: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              avatarId: true,
            },
          },
          user2: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              username: true,
              avatarId: true,
            },
          },
        },
      });
    }

    return NextResponse.json(
      { conversation },
      { status: conversation ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/conversations:", error);
    return NextResponse.json(
      { error: "Failed to create or fetch conversation" },
      { status: 500 }
    );
  }
}

// AnN add: GET - Get all conversations for a user on 11/19
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    // Find all conversations where user is either user1 or user2
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userIdNum }, { user2Id: userIdNum }],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatarId: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatarId: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get only the last message
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc", // Most recently active conversations first
      },
    });

    // AnN add: Transform data to include other user info on 11/19
    // For each conversation, determine who the "other user" is
    const conversationsWithOtherUser = conversations.map((conv) => {
      const otherUser = conv.user1Id === userIdNum ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherUser,
        lastMessage,
      };
    });

    return NextResponse.json(
      { conversations: conversationsWithOtherUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
