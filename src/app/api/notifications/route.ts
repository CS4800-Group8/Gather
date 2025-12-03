/**
 * @file Notifications API Route (GET /api/notifications)
 *
 * @description
 * Retrieves and constructs the notification list for a user.
 *
 * This endpoint:
 *   1. Fetches all raw notification records for the user
 *   2. Fetches all *pending* friend requests directed at the user
 *   3. Matches raw notifications to friendships by timestamp proximity
 *   4. Produces a clean notification list enriched with the requester’s profile
 *
 * This logic is required because:
 *   - A friend request generates both a Friendship and a Notification row
 *   - They share no direct foreign key relationship
 *   - Therefore they must be matched heuristically by creation time
 *
 * @returns
 * `{ notifications: [...] }`
 *
 * @dependencies
 * - Prisma: Notification + Friendship queries
 * - NextResponse: JSON responses
 */

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
      select: {
        id: true,
        userId: true,
        relatedUserId: true, // AnN add: Include relatedUserId on 11/25
        relatedRecipeId: true, // AnN add: Include relatedRecipeId for click-to-open on 11/25
        type: true,
        message: true,
        isRead: true,
        createdAt: true,
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
    const enrichedFriendRequestNotifications = Array.from(validNotifications.entries()).map(
      ([requesterId, notif]) => {
        const friendship = pendingFriendships.find((f) => f.requesterId === requesterId);
        return {
          ...notif,
          relatedUser: friendship?.requester || null,
        };
      }
    );

    // AnN add: Include other notification types (ratings, comments, etc.) on 11/24
    // AnN update: Fetch relatedUser for avatar display on 11/25
    const otherNotifications = await Promise.all(
      notifications
        .filter((n) => n.type !== "friend_request")
        .map(async (notif) => {
          // Fetch related user if relatedUserId exists (for ratings/comments)
          let relatedUser = null;
          if (notif.relatedUserId) {
            relatedUser = await prisma.user.findUnique({
              where: { id: notif.relatedUserId },
              select: {
                id: true,
                username: true,
                firstname: true,
                lastname: true,
                avatarId: true,
              },
            });
          }
          return {
            ...notif,
            relatedUser,
          };
        })
    );

    // Combine all notifications and sort by date
    const allNotifications = [...enrichedFriendRequestNotifications, ...otherNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ notifications: allNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
