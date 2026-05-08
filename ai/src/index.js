import http from 'node:http';
import dotenv from 'dotenv';
import { startMCPServer } from './mcpServer.js';

dotenv.config();

// Start the MCP server (stdio-based)
startMCPServer().catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

// Minimal HTTP health server so Render can keep this as a Web Service
const port = Number(process.env.PORT ?? 5002);
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`AI health server listening on http://0.0.0.0:${port}`);
});
