const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.resolve(process.cwd(), "nutriai.db");
const db = new Database(dbPath, { verbose: console.log });

console.log("Running SQLite Migrations...");

try {
  // Check if columns exist
  const tableInfo = db.pragma("table_info(users)");
  const columns = tableInfo.map(c => c.name);

  if (!columns.includes("current_streak")) {
    console.log("Adding current_streak column to users table...");
    db.prepare("ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0").run();
  }

  if (!columns.includes("longest_streak")) {
    console.log("Adding longest_streak column to users table...");
    db.prepare("ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0").run();
  }

  if (!columns.includes("total_active_days")) {
    console.log("Adding total_active_days column to users table...");
    db.prepare("ALTER TABLE users ADD COLUMN total_active_days INTEGER DEFAULT 0").run();
  }

  const notiTableInfo = db.pragma("table_info(notifications)");
  const notiColumns = notiTableInfo.map(c => c.name);

  if (!notiColumns.includes("reference_id")) {
    console.log("Adding reference_id column to notifications table...");
    db.prepare("ALTER TABLE notifications ADD COLUMN reference_id TEXT").run();
  }

  console.log("Migrations completed successfully!");
} catch (error) {
  console.error("Migration failed:", error);
}

db.close();
