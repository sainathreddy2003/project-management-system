import app from './app.js';
import { config } from './config/index.js';
import { initDatabase, pool } from './config/db.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // Ensure MySQL database schema and tables exist with connection retries for cloud PaaS cold starts
    let retries = 5;
    while (retries > 0) {
      try {
        await initDatabase();
        logger.info('MySQL Database connected and verified.');
        break;
      } catch (dbErr) {
        retries -= 1;
        if (retries === 0) {
          throw dbErr;
        }
        logger.warn(`Database connection attempt failed, retrying in 2s (${retries} attempts left)...`, {
          error: dbErr.message,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Optional auto-seeding for staging/demo cloud deployments
    if (config.autoSeed) {
      try {
        const { seed } = await import('./scripts/seed.js');
        await seed();
        logger.info('Database auto-seeded successfully.');
      } catch (seedErr) {
        logger.warn('Auto-seed failed or skipped:', { error: seedErr.message });
      }
    }

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
