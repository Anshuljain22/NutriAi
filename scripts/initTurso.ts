import db, { initializeDatabase } from '../src/lib/db';

async function run() {
    try {
        console.log("Initializing Turso DB with URL:", process.env.TURSO_DATABASE_URL);
        await initializeDatabase();
        console.log("Success! Schema created.");
        process.exit(0);
    } catch (e) {
        console.error("Error setting up DB schema:", e);
        process.exit(1);
    }
}

run();
