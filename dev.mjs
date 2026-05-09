#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

console.log('🚀 Starting all services...\n');

const children = [];

// Start server directly without wrapper
const serverBin = path.join(rootDir, 'server', 'src', 'index.js');
const server = spawn(process.execPath, [serverBin], {
  cwd: rootDir,
  stdio: 'inherit'
});
children.push(server);

// Start socket directly without wrapper
const socketBin = path.join(rootDir, 'socket', 'src', 'index.js');
const socket = spawn(process.execPath, [socketBin], {
  cwd: rootDir,
  stdio: 'inherit'
});
children.push(socket);

// Start Vite directly
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const vite = spawn(process.execPath, [viteBin], {
  cwd: rootDir,
  stdio: 'inherit'
});
children.push(vite);

process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping all services...');
  children.forEach(child => {
    try {
      child.kill('SIGTERM');
    } catch (e) {}
  });
  setTimeout(() => process.exit(0), 500);
});
