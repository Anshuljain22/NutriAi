import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";
import { WorkoutSession } from "@/types/workout";

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const sort = searchParams.get("sort") || "newest"; // 'newest' or 'trending'

        let feedRows = [];

        // The feed should fetch posts from:
        // 1. Users that the caller follows
        // 2. The caller's own posts (so they see them in their feed)
        // 3. AND where privacy = 'public' or 'followers' (if following).  'private' is only for self.

        // For 'trending', we'll calculate an engagement score based on likes and comments. In SQLite we can do a LEFT JOIN to count these.

        const baseQuery = `
      SELECT wp.id as post_id, wp.caption, wp.privacy, wp.created_at as post_date,
             u.id as author_id, u.name as author_name,
             ws.id as workout_id, ws.duration, ws.total_volume,
             (SELECT COUNT(*) FROM likes WHERE target_id = wp.id AND target_type = 'workout_post') as like_count,
             (SELECT COUNT(*) FROM comments WHERE target_id = wp.id AND target_type = 'workout_post') as comment_count,
             EXISTS(SELECT 1 FROM likes WHERE target_id = wp.id AND target_type = 'workout_post' AND user_id = @userId) as has_liked
      FROM workout_posts wp
      JOIN users u ON wp.user_id = u.id
      JOIN workout_sessions ws ON wp.workout_id = ws.id
      WHERE (
        wp.user_id = @userId 
        OR 
        (wp.user_id IN (SELECT following_id FROM follows WHERE follower_id = @userId) AND wp.privacy IN ('public', 'followers'))
        OR 
        (wp.privacy = 'public') 
      )
    `;

        const orderByClause = sort === "trending"
            ? "ORDER BY (like_count + (comment_count * 2)) DESC, post_date DESC LIMIT 50"
            : "ORDER BY post_date DESC LIMIT 50";

        const stmt = db.prepare(baseQuery + orderByClause);
        feedRows = stmt.all({ userId: payload.userId }) as any[];

        // Reconstruct the full Workout object per post
        const feed = feedRows.map(row => {

            const exStmt = db.prepare("SELECT * FROM exercises WHERE session_id = ?");
            const exercises = exStmt.all(row.workout_id) as any[];

            const populatedExercises = exercises.map(ex => {
                const setStmt = db.prepare("SELECT * FROM sets WHERE exercise_id = ?");
                const sets = setStmt.all(ex.id) as any[];
                return {
                    id: ex.id,
                    name: ex.name,
                    muscle_group: ex.muscle_group,
                    sets: sets.map(s => ({ id: s.id, reps: s.reps, weight: s.weight, volume: s.volume })),
                    total_volume: ex.total_volume
                }
            });

            return {
                post_id: row.post_id,
                author: { id: row.author_id, name: row.author_name },
                caption: row.caption,
                privacy: row.privacy,
                created_at: row.post_date,
                likes: row.like_count,
                comments: row.comment_count,
                has_liked: row.has_liked === 1,
                workout: {
                    id: row.workout_id,
                    duration: row.duration,
                    total_volume: row.total_volume,
                    exercises: populatedExercises
                }
            };
        });

        return NextResponse.json({ feed }, { status: 200 });
    } catch (error) {
        console.error("Feed error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
