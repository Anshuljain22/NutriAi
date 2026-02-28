import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/leaderboard - Public endpoint (or auth optional)
export async function GET(req: Request) {
    try {
        // 1. Top Users by Longest Streak
        const streaksResult = await db.execute(`
            SELECT id, name, longest_streak as score, current_streak
            FROM users
            ORDER BY longest_streak DESC, current_streak DESC
            LIMIT 10
        `);

        // 2. Top Users by Total Volume (Lifetime)
        const volumeResult = await db.execute(`
            SELECT u.id, u.name, COALESCE(SUM(ws.total_volume), 0) as score
            FROM users u
            LEFT JOIN workout_sessions ws ON u.id = ws.user_id
            GROUP BY u.id, u.name
            ORDER BY score DESC
            LIMIT 10
        `);

        // 3. Top Users by Consistency (Total Active Days)
        const consistencyResult = await db.execute(`
            SELECT id, name, total_active_days as score
            FROM users
            ORDER BY total_active_days DESC
            LIMIT 10
        `);

        return NextResponse.json({
            leaderboards: {
                streaks: streaksResult.rows,
                volume: volumeResult.rows,
                consistency: consistencyResult.rows
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
