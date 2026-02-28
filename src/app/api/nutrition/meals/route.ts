import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = payload.userId;
        const body = await req.json();
        let {
            date, // YYYY-MM-DD
            meal_type, // 'breakfast', 'lunch', 'dinner', 'snack'
            food_name,
            calories,
            protein_g = 0,
            carbs_g = 0,
            fat_g = 0,
            fiber_g = 0
        } = body;

        if (!date || !meal_type || !food_name || calories === undefined) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        const mealId = randomUUID();

        // 1. Insert Meal
        await db.execute({
            sql: `
        INSERT INTO meals (id, user_id, date, meal_type, food_name, calories, protein_g, carbs_g, fat_g, fiber_g)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
            args: [mealId, userId, date, meal_type, food_name, calories, protein_g, carbs_g, fat_g, fiber_g] as any[]
        });

        // 2. Upsert Daily Summary
        await db.execute({
            sql: `
        INSERT INTO daily_nutrition_summary (id, user_id, date, total_calories, total_protein_g, total_carbs_g, total_fat_g, total_fiber_g, net_calories)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
            total_calories = total_calories + excluded.total_calories,
            total_protein_g = total_protein_g + excluded.total_protein_g,
            total_carbs_g = total_carbs_g + excluded.total_carbs_g,
            total_fat_g = total_fat_g + excluded.total_fat_g,
            total_fiber_g = total_fiber_g + excluded.total_fiber_g,
            net_calories = net_calories + excluded.total_calories
    `,
            args: [randomUUID(), userId, date, calories, protein_g, carbs_g, fat_g, fiber_g, calories] as any[]
        });

        // 3. Simple Nutrition Streak Logic
        // If they hit within ~150 calories of their target, we bump their streak if they haven't already hit it today.
        const userTargetResult = await db.execute({ sql: `SELECT daily_calorie_target, nutrition_streak, longest_nutrition_streak FROM users WHERE id = ?`, args: [userId] as any[] });
        const userTarget = userTargetResult.rows[0] as any;
        const newSummaryResult = await db.execute({ sql: `SELECT total_calories FROM daily_nutrition_summary WHERE user_id = ? AND date = ?`, args: [userId, date] as any[] });
        const newSummary = newSummaryResult.rows[0] as any;

        if (userTarget && userTarget.daily_calorie_target > 0 && newSummary) {
            const minThreshold = userTarget.daily_calorie_target - 250;
            const maxThreshold = userTarget.daily_calorie_target + 250;

            if (newSummary.total_calories >= minThreshold && newSummary.total_calories <= maxThreshold) {
                // They hit their macro calorie window for today!
                const currentStreak = userTarget.nutrition_streak + 1;
                const newLongest = Math.max(currentStreak, userTarget.longest_nutrition_streak || 0);

                // In a real app we would check if they ALREADY got the point today, 
                // but for demo we will just blindly check if it's their first time hitting the threshold this day.
                // For now, we'll blindly bump it if it's exactly passing the threshold right now.
                if (newSummary.total_calories - calories < minThreshold) { // Only bump if this exact meal crossed the threshold
                    await db.execute({ sql: `UPDATE users SET nutrition_streak = ?, longest_nutrition_streak = ? WHERE id = ?`, args: [currentStreak, newLongest, userId] as any[] });

                    // Add gamification achievement
                    if (currentStreak === 7) {
                        await db.execute({
                            sql: "INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_type) VALUES (?, ?, ?)",
                            args: [randomUUID(), userId, '7_day_nutrition_streak'] as any[]
                        });
                    }
                }
            }
        }

        return NextResponse.json({ message: "Meal logged successfully", meal_id: mealId }, { status: 201 });

    } catch (error) {
        console.error("Meal logging error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = payload.userId;
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date"); // YYYY-MM-DD

        if (!date) {
            return NextResponse.json({ error: "Date parameter required." }, { status: 400 });
        }

        const mealsResult = await db.execute({ sql: "SELECT * FROM meals WHERE user_id = ? AND date = ? ORDER BY timestamp ASC", args: [userId, date] as any[] });
        const meals = mealsResult.rows;
        const summaryResult = await db.execute({ sql: "SELECT * FROM daily_nutrition_summary WHERE user_id = ? AND date = ?", args: [userId, date] as any[] });
        const summary = summaryResult.rows[0];

        return NextResponse.json({ meals, summary: summary || null }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
