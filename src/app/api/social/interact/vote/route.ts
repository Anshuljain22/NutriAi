import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/social/interact/vote
export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { target_id, target_type, vote_value } = await req.json();

        if (!target_id || !target_type || (vote_value !== 1 && vote_value !== -1 && vote_value !== 0)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const validTypes = ['post', 'comment', 'workout_post'];
        if (!validTypes.includes(target_type)) {
            return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
        }

        try {
            // Check existing vote
            const checkResult = await db.execute({
                sql: "SELECT vote_value FROM votes WHERE user_id = ? AND target_id = ? AND target_type = ?",
                args: [payload.userId, target_id, target_type] as any[]
            });
            const existingVote = checkResult.rows[0] as { vote_value: number } | undefined;

            if (vote_value === 0 || (existingVote && existingVote.vote_value === vote_value)) {
                // Remove vote if sending 0 or sending the same vote again (toggle off)
                await db.execute({
                    sql: "DELETE FROM votes WHERE user_id = ? AND target_id = ? AND target_type = ?",
                    args: [payload.userId, target_id, target_type] as any[]
                });
            } else {
                // Insert or Update vote
                await db.execute({
                    sql: `
                        INSERT INTO votes (id, user_id, target_id, target_type, vote_value)
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(user_id, target_id, target_type) DO UPDATE SET
                        vote_value = excluded.vote_value, created_at = CURRENT_TIMESTAMP
                    `,
                    args: [crypto.randomUUID(), payload.userId, target_id, target_type, vote_value] as any[]
                });

                // If it's a new upvote, trigger a notification
                if (vote_value === 1 && (!existingVote || existingVote.vote_value !== 1)) {
                    let ownerId = null;
                    if (target_type === 'post') {
                        const rowResult = await db.execute({ sql: "SELECT user_id FROM community_posts WHERE id = ?", args: [target_id] as any[] });
                        const row = rowResult.rows[0] as any;
                        if (row) ownerId = row.user_id;
                    } else if (target_type === 'workout_post') {
                        const rowResult = await db.execute({ sql: "SELECT user_id FROM workout_posts WHERE id = ?", args: [target_id] as any[] });
                        const row = rowResult.rows[0] as any;
                        if (row) ownerId = row.user_id;
                    } else if (target_type === 'comment') {
                        const rowResult = await db.execute({ sql: "SELECT user_id FROM comments WHERE id = ?", args: [target_id] as any[] });
                        const row = rowResult.rows[0] as any;
                        if (row) ownerId = row.user_id;
                    }

                    if (ownerId && ownerId !== payload.userId) {
                        await db.execute({
                            sql: "INSERT INTO notifications (id, user_id, actor_id, type, reference_id) VALUES (?, ?, ?, ?, ?)",
                            args: [crypto.randomUUID(), ownerId, payload.userId, 'upvote_post', target_id] as any[]
                        });
                    }
                }
            }

            // Recalculate score on target
            const scoreResult = await db.execute({
                sql: `
                    SELECT 
                        COUNT(CASE WHEN vote_value = 1 THEN 1 END) as up,
                        COUNT(CASE WHEN vote_value = -1 THEN 1 END) as down
                    FROM votes WHERE target_id = ? AND target_type = ?
                `,
                args: [target_id, target_type] as any[]
            });
            const { up, down } = scoreResult.rows[0] as any;
            const score = Number(up) - Number(down);

            if (target_type === 'post') {
                await db.execute({
                    sql: "UPDATE community_posts SET upvote_count = ?, downvote_count = ?, score = ? WHERE id = ?",
                    args: [up, down, score, target_id] as any[]
                });
            } else if (target_type === 'comment') {
                await db.execute({
                    sql: "UPDATE comments SET vote_score = ? WHERE id = ?",
                    args: [score, target_id] as any[]
                });
            }

            return NextResponse.json({ success: true }, { status: 200 });
        } catch (err) {
            console.error("Vote transaction error:", err);
            return NextResponse.json({ error: "Failed to apply vote" }, { status: 500 });
        }

    } catch (error) {
        console.error("Vote endpoint error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
