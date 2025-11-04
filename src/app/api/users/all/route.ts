// AnN add: API endpoint to get all users for Community page on 11/4
// Thu will add friend status checking later
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get all users with their recipe counts
export async function GET(req: Request) {
  try {
    const currentUserId = req.headers.get('x-user-id');

    // AnN add: Get all users except current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId ? parseInt(currentUserId) : undefined }
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        avatarId: true,
        // AnN add: Count recipes for each user
        _count: {
          select: {
            recipes: true
          }
        }
      },
      orderBy: {
        firstname: 'asc'  // AnN add: Alphabetical order by first name
      }
    });

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
