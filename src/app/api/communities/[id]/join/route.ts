import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/communities/[id]/join
export async function POST(req: Request, { params }: any) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const communityId = (await params).id;

        // Check if community exists
        const commResult = await db.execute({
            sql: "SELECT privacy FROM communities WHERE id = ?",
            args: [communityId] as any[]
        });
        const comm = commResult.rows[0] as any;
        if (!comm) return NextResponse.json({ error: "Community not found" }, { status: 404 });

        if (comm.privacy === 'private') {
            // Future expansion: Invite logic over Private Hubs
            return NextResponse.json({ error: "Cannot join private communities this way" }, { status: 403 });
        }

        try {
            await db.execute({
                sql: "INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, ?)",
                args: [communityId, payload.userId, 'member'] as any[]
            });

            return NextResponse.json({ success: true, message: "Joined community" }, { status: 201 });
        } catch (err: any) {
            if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ error: "Already a member" }, { status: 409 });
            }
            throw err;
        }

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// DELETE /api/communities/[id]/join
export async function DELETE(req: Request, { params }: any) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const communityId = (await params).id;

        // Prevent creator from leaving and stranding the community (or implement abdication logic)
        const roleCheckResult = await db.execute({
            sql: "SELECT role FROM community_members WHERE community_id = ? AND user_id = ?",
            args: [communityId, payload.userId] as any[]
        });
        const roleCheck = roleCheckResult.rows[0] as any;

        if (!roleCheck) {
            return NextResponse.json({ error: "Not a member" }, { status: 404 });
        }

        if (roleCheck.role === 'admin') {
            const creatorCheckResult = await db.execute({
                sql: "SELECT creator_id FROM communities WHERE id = ?",
                args: [communityId] as any[]
            });
            const creatorCheck = creatorCheckResult.rows[0] as any;
            if (creatorCheck && creatorCheck.creator_id === payload.userId) {
                return NextResponse.json({ error: "Creator cannot leave the community. Delete it instead." }, { status: 403 });
            }
        }

        await db.execute({
            sql: "DELETE FROM community_members WHERE community_id = ? AND user_id = ?",
            args: [communityId, payload.userId] as any[]
        });

        return NextResponse.json({ success: true, message: "Left community" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
