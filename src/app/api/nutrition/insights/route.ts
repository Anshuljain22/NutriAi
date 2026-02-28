import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

        // 1. Fetch User Data
        const userDataResult = await db.execute({
            sql: `
            SELECT 
                weight_kg, height_cm, age, gender, activity_level, 
                fitness_goal, dietary_preference, 
                daily_calorie_target, daily_protein_target, 
                daily_carb_target, daily_fat_target, daily_water_goal_ml as daily_water_goal
            FROM users WHERE id = ?
        `,
            args: [user.id] as any[]
        });
        const userData = userDataResult.rows[0] as any;

        if (!userData || !userData.daily_calorie_target) {
            return NextResponse.json({ error: 'Please complete your profile to receive insights.' }, { status: 400 });
        }

        // 2. Fetch past 7 days of nutrition
        const recentNutritionResult = await db.execute({
            sql: `
            SELECT date, total_calories, total_protein_g, total_carbs_g, total_fat_g, total_water_ml
            FROM daily_nutrition_summary
            WHERE user_id = ? AND date >= date('now', '-7 days')
            ORDER BY date ASC
        `,
            args: [user.id] as any[]
        });
        const recentNutrition = recentNutritionResult.rows as any[];

        if (recentNutrition.length === 0) {
            return NextResponse.json({
                insight: "Welcome to the Nutrition Dashboard! Start logging your meals and water intake to receive personalized, AI-driven feedback and insights on your progress."
            });
        }

        // 3. Prepare AI Prompt
        const dataContext = `
            User Profile:
            - Goal: ${userData.fitness_goal}, Dietary Preference: ${userData.dietary_preference || 'None'}
            - Weight: ${userData.weight_kg}kg, Height: ${userData.height_cm}cm, Age: ${userData.age}
            - Targets -> Calories: ${userData.daily_calorie_target}kcal, Protein: ${userData.daily_protein_target}g, Carbs: ${userData.daily_carb_target}g, Fat: ${userData.daily_fat_target}g, Water: ${userData.daily_water_goal}ml
            
            Last 7 Days Nutrition Log:
            ${recentNutrition.map((day: any) => `- ${day.date}: ${day.total_calories} kcal (P: ${day.total_protein_g}g, C: ${day.total_carbs_g}g, F: ${day.total_fat_g}g), Water: ${day.total_water_ml}ml`).join('\n')}
        `;

        const prompt = `
            You are a professional, motivating fitness and nutrition AI coach. 
            Your role is strictly limited to health, fitness, and nutrition. You MUST NOT answer out-of-domain questions.
            
            Based on the following data, write a tailored, structured, and insightful summary of the user's nutrition over the past week.
            Highlight what they did right, what they can improve (e.g., hitting protein goals, drinking more water, or staying within the calorie limit), and give 2-3 highly actionable tips.
            
            Make sure to use a good format with markdown (bullet points, bold text). Keep it encouraging but objective.

            Data:
            ${dataContext}
        `;

        // 4. Call Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing from environment variables.");
            return NextResponse.json({ error: 'AI capabilities are currently unavailable due to missing API configuration.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast and cheap model 
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        return NextResponse.json({ insight: aiResponse });

    } catch (error) {
        console.error('Error generating AI insight:', error);
        return NextResponse.json({ error: 'Internal server error while generating insights' }, { status: 500 });
    }
}
