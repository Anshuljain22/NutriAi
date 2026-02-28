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
            db.transaction(() => {
                // Check existing vote
                const existingVote = db.prepare(
                    "SELECT vote_value FROM votes WHERE user_id = ? AND target_id = ? AND target_type = ?"
                ).get(payload.userId, target_id, target_type) as { vote_value: number } | undefined;

                if (vote_value === 0 || (existingVote && existingVote.vote_value === vote_value)) {
                    // Remove vote if sending 0 or sending the same vote again (toggle off)
                    db.prepare(
                        "DELETE FROM votes WHERE user_id = ? AND target_id = ? AND target_type = ?"
                    ).run(payload.userId, target_id, target_type);
                    // Insert or Update vote
                    db.prepare(`
                        INSERT INTO votes (id, user_id, target_id, target_type, vote_value)
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(user_id, target_id, target_type) DO UPDATE SET
                        vote_value = excluded.vote_value, created_at = CURRENT_TIMESTAMP
                    `).run(crypto.randomUUID(), payload.userId, target_id, target_type, vote_value);

                    // If it's a new upvote, trigger a notification
                    if (vote_value === 1 && (!existingVote || existingVote.vote_value !== 1)) {
                        let ownerId = null;
                        if (target_type === 'post') {
                            const row = db.prepare("SELECT user_id FROM community_posts WHERE id = ?").get(target_id) as any;
                            if (row) ownerId = row.user_id;
                        } else if (target_type === 'workout_post') {
                            const row = db.prepare("SELECT user_id FROM workout_posts WHERE id = ?").get(target_id) as any;
                            if (row) ownerId = row.user_id;
                        } else if (target_type === 'comment') {
                            const row = db.prepare("SELECT user_id FROM comments WHERE id = ?").get(target_id) as any;
                            if (row) ownerId = row.user_id;
                        }

                        if (ownerId && ownerId !== payload.userId) {
                            db.prepare(
                                "INSERT INTO notifications (id, user_id, actor_id, type, reference_id) VALUES (?, ?, ?, ?, ?)"
                            ).run(crypto.randomUUID(), ownerId, payload.userId, 'upvote_post', target_id);
                        }
                    }
                }

                // Recalculate score on target
                const { up, down } = db.prepare(`
                    SELECT 
                        COUNT(CASE WHEN vote_value = 1 THEN 1 END) as up,
                        COUNT(CASE WHEN vote_value = -1 THEN 1 END) as down
                    FROM votes WHERE target_id = ? AND target_type = ?
                `).get(target_id, target_type) as { up: number, down: number };

                const score = up - down;

                if (target_type === 'post') {
                    db.prepare("UPDATE community_posts SET upvote_count = ?, downvote_count = ?, score = ? WHERE id = ?")
                        .run(up, down, score, target_id);
                } else if (target_type === 'comment') {
                    db.prepare("UPDATE comments SET vote_score = ? WHERE id = ?")
                        .run(score, target_id);
                }
            })();

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
