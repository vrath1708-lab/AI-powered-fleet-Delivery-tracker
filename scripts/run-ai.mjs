import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const aiEntry = path.join(rootDir, 'ai', 'src', 'index.js');

const child = spawn(process.execPath, [aiEntry], {
  cwd: rootDir,
  stdio: 'inherit'
});

child.on('exit', (code) => process.exit(code ?? 0));
