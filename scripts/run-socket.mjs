import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const socketEntry = path.join(rootDir, 'socket', 'src', 'index.js');

let child;
let shuttingDown = false;

function start() {
  child = spawn(process.execPath, [socketEntry], {
    cwd: rootDir,
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

    console.error(`Socket dev server exited unexpectedly (${code ?? signal ?? 'unknown'}). Restarting...`);
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
