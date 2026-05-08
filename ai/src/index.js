import dotenv from 'dotenv';
import { startMCPServer } from './mcpServer.js';

dotenv.config();

// Start the MCP server
// This provides fleet tools that can be called by MCP clients like Claude
startMCPServer().catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
