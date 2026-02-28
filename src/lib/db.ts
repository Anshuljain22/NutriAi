import Database from "better-sqlite3";
import path from "path";

// Initialize the database file in the project directory
const dbPath = path.resolve(process.cwd(), "nutriai.db");
const db = new Database(dbPath, { verbose: console.log });
db.pragma("journal_mode = WAL");

export function initializeDatabase() {
  // Turn on foreign keys
  db.pragma("foreign_keys = ON");

  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      total_active_days INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Nutrition & Profile Additions
      weight_kg REAL,
      height_cm REAL,
      age INTEGER,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')),
      activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'heavy')),
      fitness_goal TEXT CHECK(fitness_goal IN ('fat_loss', 'maintenance', 'muscle_gain')),
      dietary_preference TEXT,
      
      -- Calculated Targets
      daily_calorie_target INTEGER,
      daily_protein_target INTEGER,
      daily_fat_target INTEGER,
      daily_carb_target INTEGER,
      daily_water_goal_ml INTEGER,
      
      -- Nutrition Gamification
      nutrition_streak INTEGER DEFAULT 0,
      longest_nutrition_streak INTEGER DEFAULT 0
    )
  `);

  // Try to safely add new columns to existing users table if they don't exist
  // We wrap in a try-catch for each column since SQLite doesn't have "ADD COLUMN IF NOT EXISTS"
  const addColumnSafely = (tableName: string, columnDef: string) => {
    try {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef}`);
    } catch (e: any) {
      // Ignore "duplicate column name" errors
      if (!e.message.includes('duplicate column name')) {
        console.error(`Failed to add column ${columnDef} to ${tableName}:`, e);
      }
    }
  };

  addColumnSafely('users', 'weight_kg REAL');
  addColumnSafely('users', 'height_cm REAL');
  addColumnSafely('users', 'age INTEGER');
  addColumnSafely('users', "gender TEXT CHECK(gender IN ('male', 'female', 'other'))");
  addColumnSafely('users', "activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'heavy'))");
  addColumnSafely('users', "fitness_goal TEXT CHECK(fitness_goal IN ('fat_loss', 'maintenance', 'muscle_gain'))");
  addColumnSafely('users', 'dietary_preference TEXT');
  addColumnSafely('users', 'daily_calorie_target INTEGER');
  addColumnSafely('users', 'daily_protein_target INTEGER');
  addColumnSafely('users', 'daily_fat_target INTEGER');
  addColumnSafely('users', 'daily_carb_target INTEGER');
  addColumnSafely('users', 'daily_water_goal_ml INTEGER');
  addColumnSafely('users', 'nutrition_streak INTEGER DEFAULT 0');
  addColumnSafely('users', 'longest_nutrition_streak INTEGER DEFAULT 0');

  // Create WorkoutSessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_sessions(
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          duration INTEGER,
          total_volume REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
          `);

  // Create Exercises Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises(
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            name TEXT NOT NULL,
            muscle_group TEXT NOT NULL,
            total_volume REAL DEFAULT 0,
            FOREIGN KEY(session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
          )
          `);

  // Create Sets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sets(
            id TEXT PRIMARY KEY,
            exercise_id TEXT NOT NULL,
            reps INTEGER NOT NULL DEFAULT 0,
            weight REAL NOT NULL DEFAULT 0,
            volume REAL NOT NULL DEFAULT 0,
            FOREIGN KEY(exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
          )
          `);

  // Create ChatHistory Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history(
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN('user', 'assistant')),
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
          `);

  // --- PHASE 4: SOCIAL FITNESS PLATFORM EXPANSION ---

  // 1. Follows Table (Many-to-Many relationship between Users)
  db.exec(`
    CREATE TABLE IF NOT EXISTS follows(
            follower_id TEXT NOT NULL,
            following_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(follower_id, following_id),
            FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE
          )
          `);

  // 2. Workout Posts Table (Social wrapper around a completed workout_session)
  db.exec(`
    CREATE TABLE IF NOT EXISTS workout_posts(
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            workout_id TEXT NOT NULL UNIQUE,
            caption TEXT,
            privacy TEXT CHECK(privacy IN('public', 'followers', 'private')) DEFAULT 'public',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(workout_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
          )
          `);

  // 3. Communities Table (Reddit-style Hubs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS communities(
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
          )
          `);

  // 4. Community Members Table (User Roles in specific Hubs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_members(
            community_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT CHECK(role IN('moderator', 'member')) DEFAULT 'member',
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(community_id, user_id),
            FOREIGN KEY(community_id) REFERENCES communities(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
          `);

  // 5. Community Posts Table (Discussion Threads inside Hubs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_posts(
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
          )
          `);

  // 6. Comments Table (Threaded comments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments(
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
          )
          `);

  // 7. Votes Table (Upvotes/Downvotes on posts and comments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes(
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            target_type TEXT NOT NULL CHECK(target_type IN('post', 'comment', 'workout_post')),
            vote_value INTEGER NOT NULL CHECK(vote_value IN(1, -1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, target_id, target_type),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
          `);

  // 8. Notifications Table (Inbound engagement alerts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications(
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            actor_id TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN('follow', 'upvote_post', 'comment_post', 'achievement', 'mention')),
            reference_id TEXT,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE SET NULL
          )
          `);

  // 9. User Achievements Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_achievements(
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            achievement_type TEXT NOT NULL,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
          )
          `);

  // --- PHASE 5: NUTRITION INTELLIGENCE SYSTEM ---

  // 10. Meals Table 
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals(
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            date TEXT NOT NULL, --YYYY - MM - DD format for easy querying
      meal_type TEXT NOT NULL CHECK(meal_type IN('breakfast', 'lunch', 'dinner', 'snack')),
          food_name TEXT NOT NULL,
            calories INTEGER NOT NULL,
              protein_g REAL DEFAULT 0,
                carbs_g REAL DEFAULT 0,
                  fat_g REAL DEFAULT 0,
                    fiber_g REAL DEFAULT 0,
                      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 11. Daily Nutrition Summary Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_nutrition_summary(
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL, --YYYY - MM - DD
      total_calories INTEGER DEFAULT 0,
    total_protein_g REAL DEFAULT 0,
    total_carbs_g REAL DEFAULT 0,
    total_fat_g REAL DEFAULT 0,
    total_fiber_g REAL DEFAULT 0,
    total_water_ml INTEGER DEFAULT 0,
    net_calories INTEGER DEFAULT 0, --(Total Calories - Burned via Exercise)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date), --One summary per user per day
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 12. Weight Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS weight_logs(
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    date TEXT NOT NULL, --YYYY - MM - DD
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
    `);

  // 13. Water Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS water_logs(
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_ml INTEGER NOT NULL,
      date TEXT NOT NULL, --YYYY - MM - DD
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    `);

  console.log("Database initialized securely with Social Platform and Nutrition Expansion schemas.");
}

// Ensure tables exist on boot
initializeDatabase();

export default db;
