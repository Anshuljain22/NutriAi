import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: Request, { params }: any) {
    try {
        const cookieHeader = req.headers.get("cookie");
        // We allow public profile viewing, but checking auth lets us return 'is_following' state
        let viewingUserId = null;
        if (cookieHeader) {
            const match = cookieHeader.match(/auth_token=([^;]+)/);
            const token = match ? match[1] : null;
            if (token) {
                const payload = await verifyToken(token);
                if (payload) viewingUserId = payload.userId;
            }
        }

        const targetUserId = (await params).id;

        // 1. Get Basic User Info & Aggregation Stats
        const userStmt = db.prepare(`
      SELECT 
        u.id, 
        u.name,
        u.current_streak,
        u.longest_streak,
        u.total_active_days,
        u.weight_kg,
        u.height_cm,
        u.age,
        u.gender,
        u.activity_level,
        u.fitness_goal,
        u.dietary_preference,
        u.daily_calorie_target,
        u.daily_protein_target,
        u.daily_fat_target,
        u.daily_carb_target,
        u.daily_water_goal_ml as daily_water_goal,
        u.nutrition_streak,
        u.longest_nutrition_streak,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM workout_sessions WHERE user_id = u.id) as total_workouts,
        (SELECT SUM(total_volume) FROM workout_sessions WHERE user_id = u.id) as lifetime_volume,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
      FROM users u
      WHERE u.id = ?
    `);

        const userProfile = userStmt.get(viewingUserId, targetUserId) as any;

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Determine the most trained muscle group for this user
        const topMuscleStmt = db.prepare(`
      SELECT muscle_group, SUM(e.total_volume) as vol
      FROM exercises e
      JOIN workout_sessions ws ON e.session_id = ws.id
      WHERE ws.user_id = ?
      GROUP BY muscle_group
      ORDER BY vol DESC
      LIMIT 1
    `);
        const topMuscleRow = topMuscleStmt.get(targetUserId) as any;
        const favoriteMuscle = topMuscleRow ? topMuscleRow.muscle_group : "None";

        // Fetch user achievements
        const achivements = db.prepare(`
            SELECT achievement_type, earned_at 
            FROM user_achievements 
            WHERE user_id = ? 
            ORDER BY earned_at DESC
        `).all(targetUserId);

        // 2. Fetch Recent Public/Follower Workouts for this User
        // If it's their own profile, see all. 
        // If following, see public + followers.
        // If not following, see only public.

        const isSelf = viewingUserId === targetUserId;
        const isFollowing = userProfile.is_following === 1;

        let privacyCondition = "wp.privacy = 'public'";
        if (isSelf) {
            privacyCondition = "1=1"; // See everything
        } else if (isFollowing) {
            privacyCondition = "wp.privacy IN ('public', 'followers')";
        }

        const postsQuery = `
      SELECT wp.id as post_id, wp.caption, wp.privacy, wp.created_at as post_date,
             ws.id as workout_id, ws.duration, ws.total_volume,
             (SELECT COUNT(CASE WHEN vote_value = 1 THEN 1 END) FROM votes WHERE target_id = wp.id AND target_type = 'workout_post') as upvote_count,
             (SELECT COUNT(CASE WHEN vote_value = -1 THEN 1 END) FROM votes WHERE target_id = wp.id AND target_type = 'workout_post') as downvote_count,
             (SELECT vote_value FROM votes WHERE target_id = wp.id AND target_type = 'workout_post' AND user_id = ?) as user_vote
      FROM workout_posts wp
      JOIN workout_sessions ws ON wp.workout_id = ws.id
      WHERE wp.user_id = ? AND (${privacyCondition})
      ORDER BY wp.created_at DESC
      LIMIT 10
    `;

        const recentPostsRows = db.prepare(postsQuery).all(viewingUserId, targetUserId) as any[];

        // Hydrate exercises for the posts safely
        const recentPosts = recentPostsRows.map(row => {
            const exercises = db.prepare("SELECT name, muscle_group, total_volume as volume FROM exercises WHERE session_id = ?").all(row.workout_id) as any[];
            return {
                post_id: row.post_id,
                caption: row.caption,
                privacy: row.privacy,
                created_at: row.post_date,
                score: (row.upvote_count || 0) - (row.downvote_count || 0),
                user_vote: row.user_vote || 0,
                workout: {
                    id: row.workout_id,
                    duration: row.duration || 0,
                    total_volume: row.total_volume || 0,
                    exercises: exercises || []
                }
            };
        });

        return NextResponse.json({
            profile: {
                id: userProfile.id,
                name: userProfile.name,
                followers: userProfile.followers_count,
                following: userProfile.following_count,
                total_workouts: userProfile.total_workouts,
                lifetime_volume: userProfile.lifetime_volume || 0,
                current_streak: userProfile.current_streak || 0,
                longest_streak: userProfile.longest_streak || 0,
                total_active_days: userProfile.total_active_days || 0,
                favorite_muscle: favoriteMuscle,
                is_following: isFollowing,
                achievements: achivements || [],
                weight_kg: userProfile.weight_kg,
                height_cm: userProfile.height_cm,
                age: userProfile.age,
                gender: userProfile.gender,
                activity_level: userProfile.activity_level,
                fitness_goal: userProfile.fitness_goal,
                dietary_preference: userProfile.dietary_preference,
                daily_calorie_target: userProfile.daily_calorie_target,
                daily_protein_target: userProfile.daily_protein_target,
                daily_fat_target: userProfile.daily_fat_target,
                daily_carb_target: userProfile.daily_carb_target,
                daily_water_goal: userProfile.daily_water_goal,
                nutrition_streak: userProfile.nutrition_streak || 0,
                longest_nutrition_streak: userProfile.longest_nutrition_streak || 0,
            },
            recent_posts: recentPosts
        }, { status: 200 });

    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
