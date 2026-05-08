import { Server } from 'socket.io';
import http from 'node:http';
import dotenv from 'dotenv';
import { seedStep } from '../../database/src/state.js';

dotenv.config();

const port = Number(process.env.PORT ?? process.env.SOCKET_PORT ?? 5001);
const host = process.env.HOST ?? '0.0.0.0';
const apiBase =
  process.env.API_BASE_URL ??
  process.env.SERVER_URL ??
  process.env.SERVER_INTERNAL_URL ??
  'http://localhost:5000';
const server = http.createServer();

// CORS function to allow all localhost origins in dev
const corsOrigin = process.env.CLIENT_ORIGIN === '*' 
  ? (origin, callback) => callback(null, true)  // Allow all origins
  : (origin, callback) => callback(null, origin === process.env.CLIENT_ORIGIN);

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
