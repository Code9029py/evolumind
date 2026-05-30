import { spawn } from 'node:child_process';
import { join } from 'node:path';

const cwd = process.cwd();
const child = spawn(process.execPath, [join(cwd, 'scripts', 'serve-dist.mjs')], {
  cwd,
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
});

child.unref();
