import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = payload.userId;
        const body = await req.json();
        const { weight_kg, date } = body;

        if (!weight_kg || !date) {
            return NextResponse.json({ error: "Weight (kg) and date are required." }, { status: 400 });
        }

        const logId = randomUUID();

        // 1. Insert Weight Log
        const insertLog = db.prepare(`
        INSERT INTO weight_logs (id, user_id, weight_kg, date)
        VALUES (?, ?, ?, ?)
    `);

        insertLog.run(logId, userId, weight_kg, date);

        // 2. Update Latest User Weight in Users Table
        const updateUser = db.prepare(`
        UPDATE users SET weight_kg = ? WHERE id = ?
    `);

        updateUser.run(weight_kg, userId);

        return NextResponse.json({ message: "Weight logged successfully" }, { status: 201 });

    } catch (error) {
        console.error("Weight logging error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = payload.userId;
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get("limit") || "30";

        const logs = db.prepare("SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date DESC LIMIT ?").all(userId, limit);

        return NextResponse.json({ logs }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
