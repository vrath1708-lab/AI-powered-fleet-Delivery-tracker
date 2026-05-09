import { Server } from 'socket.io';
import http from 'node:http';
import dotenv from 'dotenv';
import { seedStep } from '../../database/src/state.js';

dotenv.config();

let port = Number(process.env.PORT ?? process.env.SOCKET_PORT ?? 5001);
const host = process.env.HOST ?? '0.0.0.0';

if (!Number.isFinite(port) || port < 0 || port > 65535) {
  console.warn(`Invalid PORT value (${process.env.PORT}); falling back to 5001`);
  port = 5001;
}

const apiBase =
  process.env.API_BASE_URL ??
  process.env.SERVER_URL ??
  process.env.SERVER_INTERNAL_URL ??
  'http://localhost:5000';

const server = http.createServer();

function parseAllowedOrigins(value) {
  if (!value) {
    return [];
  }

  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_ORIGIN);
const corsOrigin = allowedOrigins.length === 0
  ? true
  : (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin));

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

async function fetchSnapshotFromApi() {
  const [dashboardResponse, driversResponse, ordersResponse, historyResponse] = await Promise.all([
    fetch(`${apiBase}/api/dashboard`),
    fetch(`${apiBase}/api/drivers`),
    fetch(`${apiBase}/api/orders`),
    fetch(`${apiBase}/api/history`)
  ]);

  if (!dashboardResponse.ok || !driversResponse.ok || !ordersResponse.ok || !historyResponse.ok) {
    throw new Error('Failed to fetch snapshot from API server');
  }

  const [dashboard, drivers, orders, history] = await Promise.all([
    dashboardResponse.json(),
    driversResponse.json(),
    ordersResponse.json(),
    historyResponse.json()
  ]);

  return { dashboard, drivers, orders, history };
}

async function emitSnapshot(target) {
  const snapshot = await fetchSnapshotFromApi();
  target.emit('dashboard:update', snapshot.dashboard);
  target.emit('drivers:update', snapshot.drivers);
  target.emit('orders:update', snapshot.orders);
  target.emit('history:update', snapshot.history);
}

io.on('connection', async (socket) => {
  try {
    await emitSnapshot(socket);
  } catch (error) {
    console.error('Socket snapshot fetch failed on connection, using local fallback:', error.message);
    const snapshot = seedStep();
    socket.emit('dashboard:update', snapshot.dashboard);
    socket.emit('drivers:update', snapshot.drivers);
    socket.emit('orders:update', snapshot.orders);
    socket.emit('history:update', snapshot.history);
  }
});

setInterval(async () => {
  try {
    await emitSnapshot(io);
  } catch (error) {
    console.error('Socket snapshot fetch failed:', error.message);
  }
}, 4000);

server.listen(port, host, () => {
  console.log(`Socket service listening on http://${host}:${port}`);
  console.log(`Socket API base: ${apiBase}`);
});
