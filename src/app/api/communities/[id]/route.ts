import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// GET /api/communities/[id] - Fetch Community details and posts
export async function GET(req: Request, { params }: any) {
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

        const commId = (await params).id;

        // 1. Get Community Profile
        const comm = db.prepare(`
      SELECT c.*, 
             u.name as creator_name,
             EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = ?) as is_member
      FROM communities c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = ?
    `).get(userId, commId) as any;

        if (!comm) return NextResponse.json({ error: "Community not found" }, { status: 404 });

        // 2. Fetch Posts (Only if member or public)
        let posts: any[] = [];
        // TODO: Implement sorting logic (Hot, New, Top, Controversial) based on request query param
        if (comm.privacy === 'public' || comm.is_member === 1) {
            posts = db.prepare(`
         SELECT cp.id as post_id, cp.title, cp.body, cp.image_url, cp.score, cp.upvote_count, cp.downvote_count, cp.created_at, cp.is_pinned, cp.is_locked,
                u.id as author_id, u.name as author_name,
                (SELECT COUNT(*) FROM comments WHERE post_id = cp.id) as comment_count,
                (SELECT vote_value FROM votes WHERE target_id = cp.id AND target_type = 'post' AND user_id = ?) as user_vote
         FROM community_posts cp
         JOIN users u ON cp.user_id = u.id
         WHERE cp.community_id = ?
         ORDER BY cp.is_pinned DESC, cp.created_at DESC
         LIMIT 50
       `).all(userId, commId) as any[];
        }

        return NextResponse.json({
            community: {
                id: comm.id,
                name: comm.name,
                description: comm.description,
                privacy: comm.privacy,
                creator: comm.creator_name,
                members: comm.member_count,
                cover_image: comm.cover_image,
                rules: comm.rules,
                tags: comm.tags,
                is_member: comm.is_member === 1
            },
            posts: posts.map(p => ({
                ...p,
                user_vote: p.user_vote || 0
            }))
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// POST /api/communities/[id] - Create a Post in a Community
export async function POST(req: Request, { params }: any) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const commId = (await params).id;
        const { title, body, image_url } = await req.json();

        if (!title || !body) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        // Verify membership
        const isMember = db.prepare("SELECT 1 FROM community_members WHERE community_id = ? AND user_id = ?").get(commId, payload.userId);

        if (!isMember) {
            return NextResponse.json({ error: "You must join this community to post" }, { status: 403 });
        }

        const postId = crypto.randomUUID();
        db.prepare(
            "INSERT INTO community_posts (id, community_id, user_id, title, body, image_url) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(postId, commId, payload.userId, title, body, image_url || null);

        return NextResponse.json({ success: true, post_id: postId }, { status: 201 });

    } catch (error) {
        console.error("Create post error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
