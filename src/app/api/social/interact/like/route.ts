import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/social/interact/like
export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { target_id, target_type } = await req.json();

        if (!target_id || !target_type) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        if (!['workout_post', 'community_post', 'comment'].includes(target_type)) {
            return NextResponse.json({ error: "Invalid target_type" }, { status: 400 });
        }

        try {
            const likeId = crypto.randomUUID();
            await db.execute({
                sql: "INSERT INTO likes (id, user_id, target_id, target_type) VALUES (?, ?, ?, ?)",
                args: [likeId, payload.userId, target_id, target_type] as any[]
            });

            // Determine owner of the target to send a notification
            let ownerId = null;
            if (target_type === 'workout_post') {
                const rowResult = await db.execute({ sql: "SELECT user_id FROM workout_posts WHERE id = ?", args: [target_id] as any[] });
                const row = rowResult.rows[0] as any;
                if (row) ownerId = row.user_id;
            } else if (target_type === 'community_post') {
                const rowResult = await db.execute({ sql: "SELECT user_id FROM community_posts WHERE id = ?", args: [target_id] as any[] });
                const row = rowResult.rows[0] as any;
                if (row) ownerId = row.user_id;
            }

            // Generate Notification if we aren't liking our own post
            if (ownerId && ownerId !== payload.userId) {
                await db.execute({
                    sql: "INSERT INTO notifications (id, user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?, ?)",
                    args: [crypto.randomUUID(), ownerId, payload.userId, 'like', target_id] as any[]
                });
            }

            return NextResponse.json({ success: true, message: "Liked successfully" }, { status: 201 });
        } catch (insertError: any) {
            if (insertError.message && insertError.message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ error: "Already liked this item" }, { status: 409 });
            }
            throw insertError;
        }

    } catch (error) {
        console.error("Like error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// DELETE /api/social/interact/like - Remove a Like
export async function DELETE(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { target_id, target_type } = await req.json();
        if (!target_id || !target_type) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        const result = await db.execute({
            sql: "DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?",
            args: [payload.userId, target_id, target_type] as any[]
        });

        if (result.rowsAffected === 0) {
            return NextResponse.json({ error: "Not liked yet" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Unliked successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
