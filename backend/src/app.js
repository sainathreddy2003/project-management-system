import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './utils/response.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, '../../web/dist');
const hasWebDist = fs.existsSync(webDistPath) && fs.existsSync(path.join(webDistPath, 'index.html'));


// Security headers - relaxed CSP & CORP so React SPA and Google Fonts load cleanly
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Serve frontend static files immediately (never blocked by CORS or body parsers)
if (hasWebDist) {
  app.use(express.static(webDistPath));
}

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowed = config.cors.origin;
      if (allowed.includes('*') || allowed.includes(origin)) {
        return callback(null, true);
      }

      // Check for wildcard domains (e.g. *.vercel.app, *.onrender.com)
      try {
        const originUrl = new URL(origin);
        // Automatically allow any onrender.com or vercel.app deployment
        if (
          originUrl.hostname.endsWith('.onrender.com') ||
          originUrl.hostname.endsWith('.vercel.app') ||
          originUrl.hostname === 'localhost' ||
          originUrl.hostname === '127.0.0.1'
        ) {
          return callback(null, true);
        }

        const matchesWildcard = allowed.some((pattern) => {
          if (!pattern) return false;
          const cleanPattern = pattern.replace(/^https?:\/\//, '');
          if (cleanPattern.startsWith('*.')) {
            const domainSuffix = cleanPattern.slice(1);
            return originUrl.hostname.endsWith(domainSuffix);
          }
          return pattern === origin;
        });

        if (matchesWildcard) return callback(null, true);
      } catch {
        // invalid URL
      }

      if (config.env === 'development') {
        return callback(null, true);
      }

      // Safe CORS rejection: deny headers without throwing 500 server crash
      return callback(null, false);
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// Root health check endpoints for cloud PaaS uptime monitors (Render, Railway, Fly.io, AWS)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'pms-backend',
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// SPA fallback: any non-API GET request serves index.html
if (hasWebDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  // If web/dist is not present, provide default API metadata on root
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'Project Management System API',
      version: '1.0.0',
      documentation: '/api',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        projects: '/api/projects',
        tasks: '/api/tasks',
        dashboard: '/api/dashboard',
      },
    });
  });
}

// 404 handler for API routes
app.use((req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
});



// Centralized error handler
app.use(errorHandler);

export default app;
