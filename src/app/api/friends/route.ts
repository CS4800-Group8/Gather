/**
 * @file Friends API Route (GET /api/friends)
 *
 * @description
 * Returns the full list of accepted friends for a given user.
 * A "friend" is defined as any friendship record where:
 *   - status === "accepted"
 *   - AND the user is either the requester or addressee
 *
 * This route normalizes results so the frontend always receives an array of
 * **User objects** representing the other participant in each accepted friendship.
 *
 * @returns
 * - GET: Array of friend user profiles
 *
 * @dependencies
 * - Prisma: Friendship model queries + joined user lookup
 * - NextResponse: Standard JSON responses for Next.js API routes
 */

// AnN add: Get user's friend list on 11/13

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get user's friends
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId);

    // Get all friendships where user is either requester or addressee and status is accepted
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: userIdInt },
          { addresseeId: userIdInt },
        ],
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
        addressee: {
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

    // Map to friend objects (get the other person in the friendship)
    const friends = friendships.map((friendship) => {
      // If current user is the requester, return the addressee, otherwise return the requester
      if (friendship.requesterId === userIdInt) {
        return friendship.addressee;
      } else {
        return friendship.requester;
      }
    });

    return NextResponse.json(
      { friends },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
