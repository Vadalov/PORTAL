#!/usr/bin/env node
/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import process from 'node:process';

async function freePort(port) {
  try {
    const { default: killPort } = await import('kill-port');
    await killPort(port);
    console.log(`[dev] Freed port ${port}`);
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      console.warn('[dev] kill-port module not found; skipping port cleanup.');
    } else if (error && /not running|could not kill/i.test(error.message)) {
      console.log(`[dev] Port ${port} already free.`);
    } else {
      console.warn(`[dev] Failed to free port ${port}: ${error.message}`);
    }
  }
}

function startNext(port) {
  const isWindows = process.platform === 'win32';
  const executable = isWindows ? 'npx.cmd' : 'npx';

  const child = spawn(executable, ['next', 'dev', '-p', String(port)], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
    },
    shell: isWindows,
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
}

async function main() {
  const port = Number(process.env.PORT || 3000);
  await freePort(port);
  startNext(port);
}

main().catch((error) => {
  console.error('[dev] Unexpected error:', error);
  process.exit(1);
});

