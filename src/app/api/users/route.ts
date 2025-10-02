import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma"; // adjust path if needed

// Extend the global type so we can cache PrismaClient safely
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
