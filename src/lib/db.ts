import { createClient } from "@libsql/client";

const dbUrl = process.env.TURSO_DATABASE_URL;
const dbAuthToken = process.env.TURSO_AUTH_TOKEN;

// Throw an error if environment variables are missing
if (!dbUrl || !dbAuthToken) {
  throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables.");
}

const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

export async function initializeDatabase() {
  // Turn on foreign keys
  await db.execute("PRAGMA foreign_keys = ON;");

  const batchQueries = [
    // Create Users Table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      total_active_days INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      weight_kg REAL,
      height_cm REAL,
      age INTEGER,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')),
      activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'heavy')),
      fitness_goal TEXT CHECK(fitness_goal IN ('fat_loss', 'maintenance', 'muscle_gain')),
      dietary_preference TEXT,
      daily_calorie_target INTEGER,
      daily_protein_target INTEGER,
      daily_fat_target INTEGER,
      daily_carb_target INTEGER,
      daily_water_goal_ml INTEGER,
      nutrition_streak INTEGER DEFAULT 0,
      longest_nutrition_streak INTEGER DEFAULT 0
    )`,

    // Create WorkoutSessions Table
    `CREATE TABLE IF NOT EXISTS workout_sessions(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration INTEGER,
      total_volume REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Create Exercises Table
    `CREATE TABLE IF NOT EXISTS exercises(
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      total_volume REAL DEFAULT 0,
      FOREIGN KEY(session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
    )`,

    // Create Sets Table
    `CREATE TABLE IF NOT EXISTS sets(
      id TEXT PRIMARY KEY,
      exercise_id TEXT NOT NULL,
      reps INTEGER NOT NULL DEFAULT 0,
      weight REAL NOT NULL DEFAULT 0,
      volume REAL NOT NULL DEFAULT 0,
      FOREIGN KEY(exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    )`,

    // Create ChatHistory Table
    `CREATE TABLE IF NOT EXISTS chat_history(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN('user', 'assistant')),
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 1. Follows Table
    `CREATE TABLE IF NOT EXISTS follows(
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(follower_id, following_id),
      FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 2. Workout Posts Table
    `CREATE TABLE IF NOT EXISTS workout_posts(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workout_id TEXT NOT NULL UNIQUE,
      caption TEXT,
      privacy TEXT CHECK(privacy IN('public', 'followers', 'private')) DEFAULT 'public',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(workout_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
    )`,

    // 3. Communities Table
    `CREATE TABLE IF NOT EXISTS communities(
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      cover_image TEXT,
      rules TEXT,
      tags TEXT,
      privacy TEXT CHECK(privacy IN('public', 'private')) DEFAULT 'public',
      creator_id TEXT NOT NULL,
      member_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(creator_id) REFERENCES users(id) ON DELETE SET NULL
    )`,

    // 4. Community Members Table
    `CREATE TABLE IF NOT EXISTS community_members(
      community_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT CHECK(role IN('moderator', 'member')) DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(community_id, user_id),
      FOREIGN KEY(community_id) REFERENCES communities(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 5. Community Posts Table
    `CREATE TABLE IF NOT EXISTS community_posts(
      id TEXT PRIMARY KEY,
      community_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      image_url TEXT,
      is_pinned INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      upvote_count INTEGER DEFAULT 0,
      downvote_count INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      edited_at DATETIME,
      FOREIGN KEY(community_id) REFERENCES communities(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 6. Comments Table
    `CREATE TABLE IF NOT EXISTS comments(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      parent_comment_id TEXT,
      content TEXT NOT NULL,
      vote_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY(parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
    )`,

    // 7. Votes Table
    `CREATE TABLE IF NOT EXISTS votes(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN('post', 'comment', 'workout_post')),
      vote_value INTEGER NOT NULL CHECK(vote_value IN(1, -1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, target_id, target_type),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 8. Notifications Table
    `CREATE TABLE IF NOT EXISTS notifications(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN('follow', 'upvote_post', 'comment_post', 'achievement', 'mention')),
      reference_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE SET NULL
    )`,

    // 9. User Achievements Table
    `CREATE TABLE IF NOT EXISTS user_achievements(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_type TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 10. Meals Table
    `CREATE TABLE IF NOT EXISTS meals(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK(meal_type IN('breakfast', 'lunch', 'dinner', 'snack')),
      food_name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein_g REAL DEFAULT 0,
      carbs_g REAL DEFAULT 0,
      fat_g REAL DEFAULT 0,
      fiber_g REAL DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 11. Daily Nutrition Summary Table
    `CREATE TABLE IF NOT EXISTS daily_nutrition_summary(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      total_calories INTEGER DEFAULT 0,
      total_protein_g REAL DEFAULT 0,
      total_carbs_g REAL DEFAULT 0,
      total_fat_g REAL DEFAULT 0,
      total_fiber_g REAL DEFAULT 0,
      total_water_ml INTEGER DEFAULT 0,
      net_calories INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 12. Weight Logs Table
    `CREATE TABLE IF NOT EXISTS weight_logs(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      weight_kg REAL NOT NULL,
      date TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 13. Water Logs Table
    `CREATE TABLE IF NOT EXISTS water_logs(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_ml INTEGER NOT NULL,
      date TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const query of batchQueries) {
    try {
      await db.execute(query);
    } catch (e) {
      console.error("Failed to execute init query", e);
    }
  }

  // Handle column additions safely if they aren't included in table creation
  const addColumnSafely = async (tableName: string, columnDef: string) => {
    try {
      await db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef}`);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) {
        console.error(`Failed to add column ${columnDef} to ${tableName}:`, e);
      }
    }
  };

  await addColumnSafely('users', 'weight_kg REAL');
  await addColumnSafely('users', 'height_cm REAL');
  await addColumnSafely('users', 'age INTEGER');
  await addColumnSafely('users', "gender TEXT CHECK(gender IN ('male', 'female', 'other'))");
  await addColumnSafely('users', "activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'heavy'))");
  await addColumnSafely('users', "fitness_goal TEXT CHECK(fitness_goal IN ('fat_loss', 'maintenance', 'muscle_gain'))");
  await addColumnSafely('users', 'dietary_preference TEXT');
  await addColumnSafely('users', 'daily_calorie_target INTEGER');
  await addColumnSafely('users', 'daily_protein_target INTEGER');
  await addColumnSafely('users', 'daily_fat_target INTEGER');
  await addColumnSafely('users', 'daily_carb_target INTEGER');
  await addColumnSafely('users', 'daily_water_goal_ml INTEGER');
  await addColumnSafely('users', 'nutrition_streak INTEGER DEFAULT 0');
  await addColumnSafely('users', 'longest_nutrition_streak INTEGER DEFAULT 0');

  console.log("Database initialized securely with Turso SQLite schema.");
}

// Since Vercel executes routes repeatedly, we can optionally call initializeDatabase at the start of app routing, 
// but it's often better to run a separate migration script for serverless rather than on every boot.
// We'll leave it exported for manual/bootstrap use.

export default db;
