import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(rootDir, 'client');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

let child;
let shuttingDown = false;

function start() {
  child = spawn(process.execPath, [viteBin], {
    cwd: clientDir,
    stdio: 'inherit'
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      process.exit(code ?? 0);
      return;
    }

    if (code === 0 && !signal) {
      process.exit(0);
      return;
    }

    console.error(`Client dev server exited unexpectedly (${code ?? signal ?? 'unknown'}). Restarting...`);
    setTimeout(start, 1000);
  });
}

process.on('SIGINT', () => {
  shuttingDown = true;
  child?.kill('SIGINT');
});

process.on('SIGTERM', () => {
  shuttingDown = true;
  child?.kill('SIGTERM');
});

start();
