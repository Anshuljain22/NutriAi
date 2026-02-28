import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// GET /api/communities/[id]/post/[postId] - Fetch a specific post and its threaded comments
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

        const { id: commId, postId } = await params;

        // 1. Verify Community & Membership for privacy
        const comm = db.prepare(`
            SELECT privacy,
                   EXISTS(SELECT 1 FROM community_members WHERE community_id = ? AND user_id = ?) as is_member
            FROM communities WHERE id = ?
        `).get(commId, userId, commId) as any;

        if (!comm) return NextResponse.json({ error: "Community not found" }, { status: 404 });
        if (comm.privacy === 'private' && comm.is_member === 0) {
            return NextResponse.json({ error: "Private community" }, { status: 403 });
        }

        // 2. Fetch the Post itself
        const post = db.prepare(`
            SELECT cp.*, u.name as author_name,
                   (SELECT COUNT(*) FROM comments WHERE post_id = cp.id) as comment_count,
                   (SELECT vote_value FROM votes WHERE target_id = cp.id AND target_type = 'post' AND user_id = ?) as user_vote
            FROM community_posts cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.id = ? AND cp.community_id = ?
        `).get(userId, postId, commId) as any;

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // 3. Fetch all comments for this post
        // We will fetch them flat, and let the frontend build the threaded tree, or build it here.
        // It's often easier to build the tree on the backend so the frontend just renders it recursively.
        const flatComments = db.prepare(`
            SELECT c.*, u.name as author_name,
                   (SELECT vote_value FROM votes WHERE target_id = c.id AND target_type = 'comment' AND user_id = ?) as user_vote
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.vote_score DESC, c.created_at ASC
        `).all(userId, postId) as any[];

        // Build Nested Tree
        const commentsMap = new Map();
        const rootComments: any[] = [];

        flatComments.forEach(c => {
            commentsMap.set(c.id, { ...c, replies: [] });
        });

        flatComments.forEach(c => {
            const commentNode = commentsMap.get(c.id);
            if (c.parent_comment_id) {
                const parentNode = commentsMap.get(c.parent_comment_id);
                if (parentNode) {
                    parentNode.replies.push(commentNode);
                } else {
                    // Orphan comment (parent deleted?), treat as root
                    rootComments.push(commentNode);
                }
            } else {
                rootComments.push(commentNode);
            }
        });

        return NextResponse.json({
            post: { ...post, user_vote: post.user_vote || 0 },
            comments: rootComments
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch post error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
