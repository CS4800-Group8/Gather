// AnN add: API endpoint to update user avatar on 11/1
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT - Update user avatar
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, avatarId } = body;

    // Validate required fields
    if (!userId || !avatarId) {
      return NextResponse.json(
        { error: 'User ID and Avatar ID are required' },
        { status: 400 }
      );
    }

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { avatarId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        email: true,
        avatarId: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Avatar updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}
