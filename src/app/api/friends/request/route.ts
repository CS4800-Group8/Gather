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
