import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// GET /api/notifications
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
            sql: `
      SELECT n.id, n.type, n.reference_id as target_id, n.is_read, n.created_at,
             u.id as actor_id, u.name as actor_name
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `,
            args: [payload.userId] as any[]
        });
        const notifications = result.rows;

        const countResult = await db.execute({
            sql: `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
            args: [payload.userId] as any[]
        });
        const unreadCount = countResult.rows[0] as any;

        return NextResponse.json({ notifications, unread: unreadCount.count }, { status: 200 });
    } catch (error) {
        console.error("Notifications error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// PUT /api/notifications - Mark all as read
export async function PUT(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await db.execute({
            sql: "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
            args: [payload.userId] as any[]
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
