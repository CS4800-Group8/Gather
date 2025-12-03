/**
 * @file Notification Detail API Route (PATCH/DELETE /api/notifications/[id])
 *
 * @description
 * Provides operations for interacting with a specific notification by ID:
 *
 *   - PATCH: Mark a notification as "read"
 *   - DELETE: Remove a notification entirely from the database
 *
 * These actions allow the frontend to:
 *   - Clear notification badges
 *   - Remove dismissed notifications
 *   - Keep a clean notification history for each user
 *
 * @params
 *  - `id`: The notification ID extracted from the dynamic route segment
 *
 * @returns
 *  - PATCH: Updated notification object
 *  - DELETE: Success message
 *
 * @dependencies
 * - Prisma: Notification update and deletion
 * - NextResponse: JSON response handling
 */

// AnN add: Mark notification as read on 11/6
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    // AnN add: Update notification to mark as read on 11/6
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
