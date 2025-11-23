/**
 * @file Friend Request API Route (POST /api/friends/request)
 *
 * @description
 * Handles sending new friend requests between users.
 * Ensures:
 *   - User IDs are valid and not identical
 *   - No duplicate friendship (pending/accepted/rejected) is created
 *
 * When a request is successfully created, the route:
 *   - Creates a new Friendship record with `status = "pending"`
 *   - Sends a notification to the target user (addressee)
 *
 * @returns
 * - On success: `{ friendship: {...} }`
 * - On duplicate: `{ message: "Friendship already exists" }`
 * - On error: `{ error: "...", status: 500 }`
 *
 * @dependencies
 * - Prisma: Friendship + Notification creation and lookup
 * - NextResponse: Standard Next.js JSON response formatting
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust path if different

export async function POST(req: Request) {
  try {
    const { requesterId, addresseeId } = await req.json();

    if (!requesterId || !addresseeId || requesterId === addresseeId) {
      return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 });
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Friendship already exists" });
    }

    // Create new friendship
    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: "pending",
      },
    });

    // Optional: create notification for the addressee
    await prisma.notification.create({
      data: {
        userId: addresseeId,
        type: "friend_request",
        message: `You have a new friend request.`,
      },
    });

    return NextResponse.json({ friendship });
  } catch (error) {
    console.error("Error creating friend request:", error);
    return NextResponse.json(
      { error: "Failed to create friend request" },
      { status: 500 }
    );
  }
}
