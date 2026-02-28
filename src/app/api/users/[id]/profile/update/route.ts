import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(req: Request, { params }: any) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const targetUserId = (await params).id;
        if (payload.userId !== targetUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const {
            weight_kg,
            height_cm,
            age,
            gender,
            activity_level,
            fitness_goal,
            dietary_preference
        } = body;

        // Validate inputs
        if (!weight_kg || !height_cm || !age || !gender || !activity_level || !fitness_goal) {
            return NextResponse.json({ error: "Missing required body metrics." }, { status: 400 });
        }

        // --- MIFFLIN-ST JEOR BMR CALCULATION ---
        let bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);
        bmr += (gender === 'male') ? 5 : -161;

        // --- ACTIVITY MULTIPLIER ---
        let multiplier = 1.2; // sedentary
        switch (activity_level) {
            case 'light': multiplier = 1.375; break;
            case 'moderate': multiplier = 1.55; break;
            case 'heavy': multiplier = 1.725; break;
        }
        const tdee = Math.round(bmr * multiplier);

        // --- GOAL ADJUSTMENT ---
        let daily_calorie_target = tdee;
        if (fitness_goal === 'fat_loss') daily_calorie_target -= 500;
        if (fitness_goal === 'muscle_gain') daily_calorie_target += 300;

        // --- MACRO SPLIT (General Baseline) ---
        // Protein: 2g per kg of bodyweight
        const daily_protein_target = Math.round(weight_kg * 2);
        const protein_calories = daily_protein_target * 4;

        // Fat: 25% of total calories
        const daily_fat_target = Math.round((daily_calorie_target * 0.25) / 9);
        const fat_calories = daily_fat_target * 9;

        // Carbs: The rest
        const remaining_calories = daily_calorie_target - protein_calories - fat_calories;
        const daily_carb_target = Math.max(0, Math.round(remaining_calories / 4));

        // Water Goal (Rule of thumb: 30ml per kg + 500ml for activity)
        const daily_water_goal = Math.round((weight_kg * 30) + 500);

        // Update the database
        await db.execute({
            sql: `
        UPDATE users SET 
            weight_kg = ?, 
            height_cm = ?, 
            age = ?, 
            gender = ?, 
            activity_level = ?, 
            fitness_goal = ?, 
            dietary_preference = ?,
            daily_calorie_target = ?,
            daily_protein_target = ?,
            daily_fat_target = ?,
            daily_carb_target = ?,
            daily_water_goal_ml = ?
        WHERE id = ?
    `,
            args: [
                weight_kg, height_cm, age, gender, activity_level, fitness_goal, dietary_preference || null,
                daily_calorie_target, daily_protein_target, daily_fat_target, daily_carb_target, daily_water_goal,
                targetUserId
            ] as any[]
        });

        return NextResponse.json({
            message: "Profile updated successfully.",
            targets: {
                daily_calorie_target,
                daily_protein_target,
                daily_fat_target,
                daily_carb_target,
                daily_water_goal
            }
        });

    } catch (error) {
        console.error("Failed to update profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
