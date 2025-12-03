/**
 * @file Friendship Status API Route (GET /api/friends/status)
 *
 * @description
 * Retrieves all friendship records related to a specific user,
 * including:
 *   - Friend requests the user SENT
 *   - Friend requests the user RECEIVED
 *   - Accepted friendships
 *   - Any status values stored in the database (“pending”, “accepted”, etc.)
 *
 * This endpoint is used primarily to:
 *   - Determine whether two users are already friends
 *   - Check whether a request is pending (incoming or outgoing)
 *   - Disable/enable friendship-related UI buttons
 *
 * @returns
 * JSON response with an array of friendship status objects.
 *
 * @dependencies
 * - Prisma: Friendship model lookup
 * - NextResponse: Standard JSON response formatting
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // make sure you have this file

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "0");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Get all friendships involving this user
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: {
      requesterId: true,
      addresseeId: true,
      status: true,
    },
  });

  return NextResponse.json({ friendships });
}
