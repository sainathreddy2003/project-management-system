import app from './app.js';
import { config } from './config/index.js';
import { initDatabase, pool } from './config/db.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // Ensure MySQL database schema and tables exist
    await initDatabase();
    logger.info('MySQL Database connected and verified.');

    const server = app.listen(config.port, () => {
      logger.info(`Project Management System Backend listening on port ${config.port}`, {
        port: config.port,
        env: config.env,
      });
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await pool.end();
          logger.info('Database connection pool closed.');
          process.exit(0);
        } catch (err) {
          logger.error('Error closing database pool', { error: err.message });
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

startServer();
