import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const user = { id: payload.userId };

        const url = new URL(request.url);
        const days = parseInt(url.searchParams.get('days') || '7');

        // Fetch Daily Nutrition Summaries (Calories, Macros) for the last N days
        const summariesResult = await db.execute({
            sql: `
            SELECT 
                date, 
                total_calories, 
                total_protein_g, 
                total_carbs_g, 
                total_fat_g, 
                total_water_ml
            FROM daily_nutrition_summary
            WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
            ORDER BY date ASC
        `,
            args: [user.id, days] as any[]
        });
        const summariesRows = summariesResult.rows as any[];

        // Fetch Weight Logs for the last N days
        const weightResult = await db.execute({
            sql: `
            SELECT 
                date, 
                weight_kg
            FROM weight_logs
            WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
            ORDER BY date ASC
        `,
            args: [user.id, days] as any[]
        });
        const weightRows = weightResult.rows as any[];

        // Fetch User Targets for context/comparisons
        const targetsResult = await db.execute({
            sql: `
            SELECT 
                daily_calorie_target,
                daily_protein_target,
                daily_carb_target,
                daily_fat_target,
                daily_water_goal_ml as daily_water_goal,
                nutrition_streak
            FROM users
            WHERE id = ?
        `,
            args: [user.id] as any[]
        });
        const userTargets = targetsResult.rows[0];

        return NextResponse.json({
            days,
            nutrition_history: summariesRows,
            weight_history: weightRows,
            targets: userTargets
        });

    } catch (error) {
        console.error('Error fetching nutrition analytics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
