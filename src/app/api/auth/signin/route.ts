/**
 * @file Sign-In API Route (POST /api/auth/signin)
 *
 * @description
 * Handles user authentication by verifying credentials against stored data.
 * Accepts either an email or username as the login identifier.
 * Validates input, checks user existence, verifies password via bcrypt,
 * and returns sanitized user data on success.
 *
 * @returns
 * JSON response containing either authenticated user details or an error message.
 *
 * @dependencies
 * - Prisma: Database access for user lookup
 * - bcryptjs: Secure password verification
 * - NextResponse: Standardized HTTP JSON responses for Next.js API routes
 */

// An fix: Created signin API route (was missing from dev branch)

import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailOrUsername, password } = body;

    // Validate required fields
    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return success with user data (excluding password)
    return NextResponse.json(
      {
        message: "Sign in successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarId: user.avatarId, // AnN add: Include avatarId from database on 11/1
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
