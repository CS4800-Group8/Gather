import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "secret";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required!" })
    };

    try {
        const user = await db.user.findUnique({
            where: { email },
        });
        
        if (!user || password !== user.password) {
            return NextResponse.json(
                { message: "Invalid credentials!" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            { userID: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        const response = NextResponse.json(
        {
            message: "Login successful!",
            userID: user.id,
            token,
        },
        { status: 200 }
        );

        response.headers.set("Cache-Control", "no-store");
        return response;

    } catch (error) {
        console.error("[LOGIN_ERROR]", error);
        return NextResponse.json(
        { message: "An error occurred during login." },
        { status: 500 }
        );
    }
}
