#!/usr/bin/env node

/**
 * Zero-dependency cross-platform runner
 * Launches both backend and frontend processes in parallel.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==========================================================');
console.log(' Starting Project Management System (Backend + Frontend) ');
console.log('==========================================================');
console.log('  Backend API  : http://localhost:5001');
console.log('  Web Frontend : http://localhost:5173');
console.log('==========================================================');
console.log('Press Ctrl+C to stop both servers.\n');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// 1. Spawn Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
});

// 2. Spawn Web Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'web'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\nShutting down backend and frontend...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
