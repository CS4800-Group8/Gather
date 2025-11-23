/**
 * @file Message Notifications Check API (GET /api/messages/has-new)
 *
 * @description
 * Determines whether the user has **any new unread messages** since their last visit.
 * This endpoint is optimized for lightweight polling and is used to:
 *   - Show a red notification badge on the Messages icon
 *   - Provide real-time-ish updates using polling instead of WebSockets
 *
 * Logic:
 *   - Checks all conversations involving the user
 *   - Looks for messages sent *to* the user (senderId != userId)
 *   - Filters messages created *after* the provided `lastViewed` timestamp
 *
 * @returns
 * `{ hasNew: boolean }`
 *
 * @dependencies
 * - Prisma: Message count query across user conversations
 * - NextResponse: Next.js standardized JSON response handling
 */

// AnN add: API endpoint to check if user has new messages since last visit on 20/11

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get("userId") || "0");
  const lastViewed = searchParams.get("lastViewed");

  if (!userId || !lastViewed) {
    return NextResponse.json({ hasNew: false });
  }

  try {
    // Check if there are any messages sent TO this user after their last visit
    const newMessageCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [{ user1Id: userId }, { user2Id: userId }]
        },
        senderId: { not: userId }, // Not sent by me
        createdAt: { gt: new Date(lastViewed) } // After last visit
      }
    });

    return NextResponse.json({ hasNew: newMessageCount > 0 });
  } catch (error) {
    console.error("Error checking for new messages:", error);
    return NextResponse.json({ hasNew: false });
  }
}
