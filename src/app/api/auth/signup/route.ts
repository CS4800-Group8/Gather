import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstname, lastname, username, email, password, confirmPassword} = body;

    // Validate required fields
    // if (!firstname || !lastname || !username || !email || !password || !confirmPassword) {
    //   return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    // }

    // Basic validation
    const errors: Record<string, string> = {};
    if (!username) errors.username = 'Username is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    if (password && confirmPassword && password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    // Check if user already exists // username or email already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email or username already taken" }, { status: 400 });
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword, // Store hashed password
      },
    });

    // AnN edit: Return full user data including avatarId on 11/1
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarId: user.avatarId, // AnN add: Include avatarId from database on 11/1
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
