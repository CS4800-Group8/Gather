import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Define an asynchronous GET handler for fetching user details by ID
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extract 'id' from the URL parameters
    const { id } = await context.params;
    const userId = parseInt(id, 10); // convert to integer

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        avatarId: true,
        _count: { select: { recipes: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
