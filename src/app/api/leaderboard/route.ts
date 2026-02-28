import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/leaderboard - Public endpoint (or auth optional)
export async function GET(req: Request) {
    try {
        // 1. Top Users by Longest Streak
        const topStreaks = db.prepare(`
            SELECT id, name, longest_streak as score, current_streak
            FROM users
            ORDER BY longest_streak DESC, current_streak DESC
            LIMIT 10
        `).all();

        // 2. Top Users by Total Volume (Lifetime)
        const topVolume = db.prepare(`
            SELECT u.id, u.name, COALESCE(SUM(ws.total_volume), 0) as score
            FROM users u
            LEFT JOIN workout_sessions ws ON u.id = ws.user_id
            GROUP BY u.id, u.name
            ORDER BY score DESC
            LIMIT 10
        `).all();

        // 3. Top Users by Consistency (Total Active Days)
        const topConsistency = db.prepare(`
            SELECT id, name, total_active_days as score
            FROM users
            ORDER BY total_active_days DESC
            LIMIT 10
        `).all();

        return NextResponse.json({
            leaderboards: {
                streaks: topStreaks,
                volume: topVolume,
                consistency: topConsistency
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
