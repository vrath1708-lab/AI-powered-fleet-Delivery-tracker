import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';

function parseAllowedOrigins(value) {
  if (!value) {
    return [];
  }

  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export function createApp() {
  const app = express();

  const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_ORIGIN);

  app.use(cors({
    origin: allowedOrigins.length === 0
      ? true
      : (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin))
  }));
  // Fallback middleware to ensure CORS headers are present even if
  // the `cors` middleware doesn't reflect the origin in some deployments.
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.length === 0) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '');
    }

    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(apiRoutes);

  return app;
}
