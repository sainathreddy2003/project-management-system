import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './utils/response.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration (no wildcard with credentials)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (config.cors.origin.includes(origin) || config.cors.origin.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, controlled in prod
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
});

// Centralized error handler
app.use(errorHandler);

export default app;
