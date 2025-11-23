/**
 * @file Update User Avatar API (PUT /api/user/avatar)
 *
 * @description
 * Updates the logged-in user’s avatar by storing a new `avatarId`
 * in the Users table. This endpoint:
 *   - Validates required fields (`userId`, `avatarId`)
 *   - Updates only the avatar field
 *   - Returns the updated user profile (without password)
 *
 * Typical use cases:
 *   - Profile settings → user selects a new avatar
 *   - Onboarding flow → choose default profile image
 * 
 * @dependencies
 * - Prisma: Update user model
 * - NextResponse: Standard JSON response formatting
 */

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
