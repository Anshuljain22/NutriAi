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
        const { amount_ml, date } = body;

        if (!amount_ml || !date) {
            return NextResponse.json({ error: "Amount (ml) and date are required." }, { status: 400 });
        }

        const logId = randomUUID();

        // 1. Insert Water Log
        await db.execute({
            sql: `
        INSERT INTO water_logs (id, user_id, amount_ml, date)
        VALUES (?, ?, ?, ?)
    `,
            args: [logId, userId, amount_ml, date] as any[]
        });

        // 2. Upsert Daily Summary
        await db.execute({
            sql: `
        INSERT INTO daily_nutrition_summary (id, user_id, date, total_water_ml)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
            total_water_ml = total_water_ml + excluded.total_water_ml
    `,
            args: [randomUUID(), userId, date, amount_ml] as any[]
        });

        return NextResponse.json({ message: "Water logged successfully" }, { status: 201 });

    } catch (error) {
        console.error("Water logging error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
