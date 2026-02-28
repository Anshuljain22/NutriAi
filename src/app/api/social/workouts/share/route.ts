import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/social/workouts/share - Create a Workout Post
export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { workout_id, caption, privacy } = await req.json();

        if (!workout_id) return NextResponse.json({ error: "Missing workout_id" }, { status: 400 });

        // Verify the workout actually belongs to this user before they can share it
        const workoutCheck = db.prepare("SELECT id FROM workout_sessions WHERE id = ? AND user_id = ?").get(workout_id, payload.userId);
        if (!workoutCheck) {
            return NextResponse.json({ error: "Workout not found or you don't own it" }, { status: 403 });
        }

        const postId = crypto.randomUUID();
        const safePrivacy = ['public', 'followers', 'private'].includes(privacy) ? privacy : 'public';

        try {
            db.prepare(
                "INSERT INTO workout_posts (id, user_id, workout_id, caption, privacy) VALUES (?, ?, ?, ?, ?)"
            ).run(postId, payload.userId, workout_id, caption || null, safePrivacy);

            return NextResponse.json({ success: true, post_id: postId }, { status: 201 });
        } catch (insertError: any) {
            if (insertError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return NextResponse.json({ error: "This workout is already shared" }, { status: 409 });
            }
            throw insertError;
        }

    } catch (error) {
        console.error("Share workout error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
