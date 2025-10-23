import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, currentPassword, newPassword } = body;

    // Validate required fields
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Email, current password, and new password are required" },
        { status: 400 }
      );
    }

    // Validate new password strength (same as sign-up)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }
    if (!/(?=.*[a-z])/.test(newPassword)) {
      return NextResponse.json(
        { error: "New password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }
    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return NextResponse.json(
        { error: "New password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }
    if (!/(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { error: "New password must contain at least one number" },
        { status: 400 }
      );
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Find user by email - since user is logged in, we assume they exist
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user!.password);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedNewPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
      },
    });

    // Return success with user data (excluding password)
    return NextResponse.json(
      {
        message: "Password changed successfully",
        user: updatedUser,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}