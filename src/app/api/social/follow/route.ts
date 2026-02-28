import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/social/follow - Follow a user
export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { following_id } = await req.json();

        if (!following_id) return NextResponse.json({ error: "Missing following_id" }, { status: 400 });

        if (payload.userId === following_id) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        // Check if user to follow exists
        const userStmt = db.prepare("SELECT id FROM users WHERE id = ?");
        const userExists = userStmt.get(following_id);
        if (!userExists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        try {
            db.prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)").run(payload.userId, following_id);

            // Send Notification to the user being followed
            const notifId = crypto.randomUUID();
            db.prepare(
                "INSERT INTO notifications (id, user_id, actor_id, type) VALUES (?, ?, ?, ?)"
            ).run(notifId, following_id, payload.userId, 'follow');

            return NextResponse.json({ success: true, message: "Followed successfully" }, { status: 201 });
        } catch (insertError: any) {
            // SQLite UNIQUE constraint violation
            if (insertError.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                return NextResponse.json({ error: "Already following this user" }, { status: 409 });
            }
            throw insertError;
        }
    } catch (error) {
        console.error("Follow error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// DELETE /api/social/follow - Unfollow a user
export async function DELETE(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { following_id } = await req.json();

        if (!following_id) return NextResponse.json({ error: "Missing following_id" }, { status: 400 });

        const result = db.prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?").run(payload.userId, following_id);

        if (result.changes === 0) {
            return NextResponse.json({ error: "Not following this user" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Unfollowed successfully" }, { status: 200 });

    } catch (error) {
        console.error("Unfollow error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
