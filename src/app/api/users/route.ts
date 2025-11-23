/**
 * @file Users API Route (GET /api/users)
 *
 * @description
 * Fetches **all users** in the system. This endpoint is typically used for:
 *   - Community directory display
 *   - Friend search or user search features - might be used in future
 *
 * The handler:
 *   - Retrieves all users in ascending ID order
 *   - Returns raw user records (no relations included)
 *
 * @dependencies
 * - db.user: Prisma client instance (imported from @/lib/db)
 * - NextResponse: JSON response helper for Next.js
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}