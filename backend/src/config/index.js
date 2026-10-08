import dotenv from 'dotenv';
dotenv.config();

function parseDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.JAWSDB_URL;
  const sslRequested =
    process.env.DB_SSL === 'true' ||
    (databaseUrl && (databaseUrl.includes('ssl=true') || databaseUrl.includes('sslmode=require')));

  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      return {
        uri: databaseUrl,
        host: parsed.hostname,
        port: parseInt(parsed.port || '3306', 10),
        user: decodeURIComponent(parsed.username || 'root'),
        password: decodeURIComponent(parsed.password || ''),
        database: (parsed.pathname || '').replace(/^\//, '') || 'project_management_db',
        ssl: sslRequested ? { rejectUnauthorized: false } : undefined,
      };
    } catch {
      // Fallback to uri if URL parsing fails
      return {
        uri: databaseUrl,
        ssl: sslRequested ? { rejectUnauthorized: false } : undefined,
      };
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'project_management_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  db: parseDatabaseConfig(),
  autoSeed: process.env.AUTO_SEED === 'true' || process.env.SEED_ON_STARTUP === 'true',
  jwt: {
    secret: process.env.JWT_SECRET || 'pms-super-secure-production-ready-jwt-secret-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresInDays: parseInt(process.env.REFRESH_EXPIRES_DAYS || '7', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
      : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxAuthRequests: 50,
    maxGeneralRequests: 500,
  },
};

