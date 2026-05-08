import http from 'node:http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from '../../database/src/connection.js';
import { seedStep } from '../../database/src/state.js';

dotenv.config();

await connectDatabase();

const port = Number(process.env.PORT ?? 5000);
const app = createApp();
const server = http.createServer(app);

setInterval(() => {
  seedStep();
}, 4000);

server.listen(port, () => {
  console.log(`Fleet server listening on http://localhost:${port}`);
});
