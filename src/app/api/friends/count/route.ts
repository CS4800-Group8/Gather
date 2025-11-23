/**
 * @file Friend Count API Route (GET /api/friends/count)
 *
 * @description
 * Returns the total number of accepted friends for a specific user.
 * Counts all friendship records where:
 *   - status === "accepted"
 *   - AND the user is either the requester or addressee.
 *
 * This endpoint is optimized for fast numeric lookup and does not return friend details,
 * only the computed count.
 *
 * @returns
 * JSON object containing: { count: number }
 *
 * @dependencies
 * - Prisma: Efficient count query on Friendship model
 * - NextResponse: Standard Next.js JSON response handling
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("userId") || "0");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const count = await prisma.friendship.count({
    where: {
      OR: [
        { requesterId: userId, status: "accepted" },
        { addresseeId: userId, status: "accepted" },
      ],
    },
  });

  return NextResponse.json({ count });
}
