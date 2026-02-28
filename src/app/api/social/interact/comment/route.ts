import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/social/interact/comment
export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { post_id, parent_comment_id, content } = await req.json();

        if (!post_id || !content) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        const commentId = crypto.randomUUID();

        await db.execute({
            sql: "INSERT INTO comments (id, user_id, post_id, parent_comment_id, content) VALUES (?, ?, ?, ?, ?)",
            args: [commentId, payload.userId, post_id, parent_comment_id || null, content] as any[]
        });

        // Determine owner of the target to send a notification
        let ownerId = null;
        if (parent_comment_id) {
            // Replying to a comment
            const rowResult = await db.execute({ sql: "SELECT user_id FROM comments WHERE id = ?", args: [parent_comment_id] as any[] });
            const row = rowResult.rows[0] as any;
            if (row) ownerId = row.user_id;
        } else {
            // Replying to the post
            const rowResult = await db.execute({ sql: "SELECT user_id FROM community_posts WHERE id = ?", args: [post_id] as any[] });
            const row = rowResult.rows[0] as any;
            if (row) ownerId = row.user_id;
        }

        // Generate Notification if we aren't commenting on our own post/comment
        if (ownerId && ownerId !== payload.userId) {
            await db.execute({
                sql: "INSERT INTO notifications (id, user_id, actor_id, type, reference_id) VALUES (?, ?, ?, ?, ?)",
                args: [crypto.randomUUID(), ownerId, payload.userId, 'comment_post', post_id] as any[]
            });
        }

        return NextResponse.json({ success: true, comment_id: commentId }, { status: 201 });

    } catch (error) {
        console.error("Comment error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
