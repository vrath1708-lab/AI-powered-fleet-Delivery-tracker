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
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(apiRoutes);

  return app;
}
