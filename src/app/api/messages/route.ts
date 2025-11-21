// AnN add: Messages API routes on 11/19
// Handles fetching and creating messages in conversations

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// AnN add: GET - Get all messages in a conversation on 11/19
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const conversationIdNum = parseInt(conversationId);

    // Fetch all messages in the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationIdNum,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatarId: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest first (chronological order)
      },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// AnN add: POST - Send a new message on 11/19
export async function POST(req: Request) {
  try {
    const { conversationId, senderId, content } = await req.json();

    // Validation
    if (!conversationId || !senderId || !content) {
      return NextResponse.json(
        { error: "conversationId, senderId, and content are required" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Message content cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // AnN add: Create message and update conversation timestamp on 11/19
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: {
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

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/messages:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
