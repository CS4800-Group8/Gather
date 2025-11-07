// AnN add: Notification API routes on 11/6
// Reuses Thu's Notification model from schema.prisma

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/notifications - Fetch user's notifications
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // AnN add: Fetch notifications sorted by newest first on 11/6
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
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

    // AnN add: Get all pending friendships for this user on 11/6
    const pendingFriendships = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: "pending",
      },
      include: {
        requester: {
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

    // AnN add: Match notifications to friendships by timestamp proximity on 11/6
    const validNotifications = new Map<number, typeof notifications[0]>();

    for (const friendship of pendingFriendships) {
      // Find the notification created closest to when this friendship was created
      // This matches them together since they're created at nearly the same time
      const matchingNotif = notifications
        .filter((n) => n.type === "friend_request" && !validNotifications.has(friendship.requesterId))
        .sort((a, b) => {
          const aDiff = Math.abs(new Date(a.createdAt).getTime() - new Date(friendship.createdAt).getTime());
          const bDiff = Math.abs(new Date(b.createdAt).getTime() - new Date(friendship.createdAt).getTime());
          return aDiff - bDiff;
        })[0];

      if (matchingNotif) {
        validNotifications.set(friendship.requesterId, matchingNotif);
      }
    }

    // AnN add: Enrich notifications with requester info on 11/6
    const enrichedNotifications = Array.from(validNotifications.entries()).map(
      ([requesterId, notif]) => {
        const friendship = pendingFriendships.find((f) => f.requesterId === requesterId);
        return {
          ...notif,
          relatedUser: friendship?.requester || null,
        };
      }
    );

    return NextResponse.json({ notifications: enrichedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
