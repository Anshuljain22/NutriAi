import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await requestBody(req);

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user already exists
        const checkResult = await db.execute({
            sql: "SELECT email FROM users WHERE email = ?",
            args: [email]
        });
        const existingUser = checkResult.rows[0];
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID();

        // Insert user
        await db.execute({
            sql: "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
            args: [userId, name, email, passwordHash]
        });

        // Generate JWT
        const token = await signToken({ userId, email });

        const response = NextResponse.json({ success: true, user: { id: userId, name, email } }, { status: 201 });

        // Set HTTP-only Cookie
        response.cookies.set({
            name: "auth_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

async function requestBody(req: Request) {
    return await req.json();
}
