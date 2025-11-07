import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { requesterId, addresseeId, action } = await req.json();

    if (
      !requesterId ||
      !addresseeId ||
      !["accept", "reject"].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Find the friendship record (regardless of direction)
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // ✅ Accept request → update to accepted
      const updated = await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: "accepted" },
      });
      return NextResponse.json({ friendship: updated });
    } else {
      // ✅ Reject request → delete record so user can resend later
      await prisma.friendship.delete({
        where: { id: friendship.id },
      });
      return NextResponse.json({ message: "Friend request rejected and deleted" });
    }
  } catch (error) {
    console.error("Error responding to friend request:", error);
    return NextResponse.json(
      { error: "Failed to update friendship" },
      { status: 500 }
    );
  }
}
