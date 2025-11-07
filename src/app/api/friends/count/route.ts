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
