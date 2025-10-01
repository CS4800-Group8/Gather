import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma"; // client path

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") (globalThis as any).prisma = prisma;

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
