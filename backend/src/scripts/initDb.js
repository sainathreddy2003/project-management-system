import { initDatabase, pool } from '../config/db.js';

async function main() {
  try {
    console.log('[DB] Initializing MySQL tables and foreign keys...');
    await initDatabase();
    console.log('[DB] All tables (users, projects, tasks, refresh_sessions, audit_logs) created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[DB] Database initialization failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
