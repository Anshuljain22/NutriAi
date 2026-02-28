import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const result = await db.execute({
            sql: "SELECT * FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC",
            args: [payload.userId] as any[]
        });
        const history = result.rows;

        return NextResponse.json({ history }, { status: 200 });
    } catch (error) {
        console.error("Fetch DB error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { role, content } = await req.json();

        const id = crypto.randomUUID();
        await db.execute({
            sql: "INSERT INTO chat_history (id, user_id, role, content) VALUES (?, ?, ?, ?)",
            args: [id, payload.userId, role, content] as any[]
        });

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
