import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// GET /api/communities - List public communities + ones user is in
export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        let userId = null;
        if (cookieHeader) {
            const match = cookieHeader.match(/auth_token=([^;]+)/);
            const token = match ? match[1] : null;
            if (token) {
                const payload = await verifyToken(token);
                if (payload) userId = payload.userId;
            }
        }

        let communities = [];
        if (userId) {
            communities = db.prepare(`
        SELECT c.*, 
               EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = ?) as is_member
        FROM communities c
        WHERE c.privacy = 'public' OR 
              EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = ?)
        ORDER BY c.member_count DESC
      `).all(userId, userId);
        } else {
            communities = db.prepare(`
        SELECT c.*, 
               0 as is_member
        FROM communities c
        WHERE c.privacy = 'public'
        ORDER BY c.member_count DESC
      `).all();
        }

        return NextResponse.json({ communities }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST /api/communities - Create a new community
export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, description, privacy, cover_image, rules, tags } = await req.json();

        if (!name) return NextResponse.json({ error: "Community name required" }, { status: 400 });

        const safePrivacy = privacy === 'private' ? 'private' : 'public';
        const communityId = crypto.randomUUID();

        try {
            db.transaction(() => {
                db.prepare(
                    "INSERT INTO communities (id, name, description, cover_image, rules, tags, privacy, creator_id, member_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)"
                ).run(communityId, name.trim(), description || "", cover_image || null, rules || null, tags || null, safePrivacy, payload.userId);

                db.prepare(
                    "INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, ?)"
                ).run(communityId, payload.userId, 'moderator'); // Creator is instantly moderator
            })();

            return NextResponse.json({ success: true, community_id: communityId }, { status: 201 });
        } catch (err: any) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return NextResponse.json({ error: "Community name already taken" }, { status: 409 });
            }
            throw err;
        }
    } catch (error) {
        console.error("Create community error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
