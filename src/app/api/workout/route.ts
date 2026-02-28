import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";
import { WorkoutSession } from "@/types/workout";

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch all sessions for this specific user
        const sessionsStmt = db.prepare("SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY start_time DESC");
        const sessionRows = sessionsStmt.all(payload.userId) as any[];

        // This is a naive but effective approach for small databases. 
        // In production we would JOIN or aggregate, but SQLite easily handles this parsing loop.
        const history: WorkoutSession[] = sessionRows.map(sess => {

            const exStmt = db.prepare("SELECT * FROM exercises WHERE session_id = ?");
            const exercises = exStmt.all(sess.id) as any[];

            const populatedExercises = exercises.map(ex => {
                const setStmt = db.prepare("SELECT * FROM sets WHERE exercise_id = ?");
                const sets = setStmt.all(ex.id) as any[];
                return {
                    id: ex.id,
                    name: ex.name,
                    muscle_group: ex.muscle_group,
                    sets: sets.map(s => ({ id: s.id, reps: s.reps, weight: s.weight, volume: s.volume })),
                    total_volume: ex.total_volume
                }
            });

            return {
                id: sess.id,
                user_id: sess.user_id,
                start_time: sess.start_time,
                end_time: sess.end_time,
                duration: sess.duration,
                total_volume: sess.total_volume,
                exercises: populatedExercises
            };
        });

        return NextResponse.json({ history }, { status: 200 });
    } catch (error) {
        console.error("Fetch Workouts error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const match = cookieHeader.match(/auth_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const sessionData: WorkoutSession = await req.json();

        // Use a transaction to ensure all related records insert safely together
        const insertWorkout = db.transaction((sess: WorkoutSession) => {
            // 1. Insert Session
            db.prepare(
                "INSERT INTO workout_sessions (id, user_id, start_time, end_time, duration, total_volume) VALUES (?, ?, ?, ?, ?, ?)"
            ).run(sess.id, payload.userId, sess.start_time, sess.end_time || null, sess.duration || 0, sess.total_volume);

            // 2. Insert Exercises
            for (const ex of sess.exercises) {
                db.prepare(
                    "INSERT INTO exercises (id, session_id, name, muscle_group, total_volume) VALUES (?, ?, ?, ?, ?)"
                ).run(ex.id, sess.id, ex.name, ex.muscle_group, ex.total_volume);

                // 3. Insert Sets
                for (const set of ex.sets) {
                    db.prepare(
                        "INSERT INTO sets (id, exercise_id, reps, weight, volume) VALUES (?, ?, ?, ?, ?)"
                    ).run(set.id, ex.id, set.reps, set.weight, set.volume);
                }
            }
        });

        // Execute the transaction
        insertWorkout(sessionData);

        // --- Post-Save Analytics & Gamification ---

        // 1. Calculate and update Streaks and Active Days
        const allDatesStmt = db.prepare("SELECT DATE(start_time) as d FROM workout_sessions WHERE user_id = ? ORDER BY d DESC");
        const dateRows = allDatesStmt.all(payload.userId) as { d: string }[];

        const uniqueDates = Array.from(new Set(dateRows.map(r => r.d)));
        const total_active_days = uniqueDates.length;

        let current_streak = 0;
        if (uniqueDates.length > 0) {
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            const mostRecentStr = uniqueDates[0] + 'T00:00:00';
            const mostRecentDate = new Date(mostRecentStr);

            const msInDay = 24 * 60 * 60 * 1000;
            const daysSinceLatest = Math.floor((currentDate.getTime() - mostRecentDate.getTime()) / msInDay);

            if (daysSinceLatest <= 1) {
                let expectedDate = mostRecentDate;
                for (const dateStr of uniqueDates) {
                    const d = new Date(dateStr + 'T00:00:00');
                    if (d.getTime() === expectedDate.getTime()) {
                        current_streak++;
                        expectedDate = new Date(expectedDate.getTime() - msInDay);
                    } else {
                        break;
                    }
                }
            }
        }

        // Update User Profile Stats
        db.prepare(`
            UPDATE users 
            SET current_streak = ?, 
                longest_streak = MAX(longest_streak, ?), 
                total_active_days = ? 
            WHERE id = ?
        `).run(current_streak, current_streak, total_active_days, payload.userId);

        // 1.5 Nutrition Integration: Adjust Net Calories
        // Simple heuristic: 5 calories burned per minute of workout
        const burnedCalories = (sessionData.duration || 0) * 5;
        if (burnedCalories > 0) {
            const workoutDate = new Date(sessionData.start_time).toISOString().split('T')[0];
            db.prepare(`
                INSERT INTO daily_nutrition_summary (id, user_id, date, net_calories)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(user_id, date) DO UPDATE SET
                    net_calories = net_calories - ?
            `).run(crypto.randomUUID(), payload.userId, workoutDate, -burnedCalories, burnedCalories);
        }

        // 2. Achievements
        if (total_active_days === 1) {
            // First ever workout!
            db.prepare(
                "INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_type) VALUES (?, ?, ?)"
            ).run(crypto.randomUUID(), payload.userId, 'first_workout');

            db.prepare(
                "INSERT INTO notifications (id, user_id, actor_id, type) VALUES (?, ?, ?, ?)"
            ).run(crypto.randomUUID(), payload.userId, payload.userId, 'achievement');
        }

        if (current_streak === 7) {
            db.prepare(
                "INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_type) VALUES (?, ?, ?)"
            ).run(crypto.randomUUID(), payload.userId, '7_day_streak');
        }


        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Save Workout error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
