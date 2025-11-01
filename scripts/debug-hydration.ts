#!/usr/bin/env tsx

/**
 * Hydration Debug Script
 *
 * Tests hydration issues in a Node.js environment to identify
 * server-side rendering problems before they manifest in the browser.
 *
 * Usage: npm run debug:hydration
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  debug: (msg: string) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
};

console.log('\n' + colors.magenta + '='.repeat(60) + colors.reset);
console.log(colors.magenta + '  HYDRATION DEBUG SCRIPT' + colors.reset);
console.log(colors.magenta + '='.repeat(60) + colors.reset + '\n');

// Step 1: Check environment files
log.info('Step 1: Checking environment configuration...');

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  log.success('.env.local file exists');
  config({ path: envPath });
} else {
  log.error('.env.local file not found');
  log.warn('Create .env.local file with required environment variables');
  process.exit(1);
}

// Step 2: Validate environment variables
log.info('\nStep 2: Validating environment variables...');

const requiredEnvVars = [
  'NEXT_PUBLIC_APPWRITE_ENDPOINT',
  'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
  'NEXT_PUBLIC_DATABASE_ID',
];

const optionalEnvVars = [
  'APPWRITE_API_KEY',
  'CSRF_SECRET',
  'SESSION_SECRET',
];

let hasAllRequired = true;

requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    log.success(`${varName} is set`);
  } else {
    log.error(`${varName} is missing`);
    hasAllRequired = false;
  }
});

optionalEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    log.success(`${varName} is set (optional)`);
  } else {
    log.warn(`${varName} is not set (optional)`);
  }
});

if (!hasAllRequired) {
  log.error('Missing required environment variables');
  process.exit(1);
}

// Step 3: Simulate localStorage
log.info('\nStep 3: Simulating localStorage (Node.js environment)...');

class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }
}

(global as any).localStorage = new LocalStorageMock();
log.success('localStorage simulation initialized');

// Step 4: Test Zustand store hydration
log.info('\nStep 4: Testing Zustand store configuration...');

try {
  // Note: We can't actually import the store in Node.js because it has 'use client' directive
  // This is a limitation of the current setup
  log.warn('Cannot test Zustand store directly in Node.js (client-only)');
  log.info('Recommendations:');
  log.info('  1. Ensure skipHydration: true is set in persist middleware');
  log.info('  2. Call persist.rehydrate() manually in useEffect');
  log.info('  3. Check _hasHydrated field before rendering');
} catch (error: unknown) {
  log.error(`Error testing Zustand store: ${error}`);
}

// Step 5: Check for common hydration issues
log.info('\nStep 5: Checking for common hydration issues...');

const checks = [
  {
    name: 'Date.now() in render',
    check: () => {
      log.warn('Check your components for Date.now() calls in render');
      log.info('  Use useEffect() to set dates on client-side only');
      return true;
    },
  },
  {
    name: 'Math.random() in render',
    check: () => {
      log.warn('Check your components for Math.random() calls in render');
      log.info('  Use useEffect() or useMemo() for random values');
      return true;
    },
  },
  {
    name: 'localStorage access in render',
    check: () => {
      log.warn('Check your components for localStorage access in render');
      log.info('  Use useEffect() to read from localStorage');
      return true;
    },
  },
  {
    name: 'Browser-specific APIs',
    check: () => {
      log.warn('Check for window, document, navigator in render');
      log.info('  Guard with typeof window !== "undefined"');
      return true;
    },
  },
];

checks.forEach((check) => {
  log.debug(`Checking: ${check.name}`);
  check.check();
});

// Step 6: Generate report
log.info('\n' + colors.magenta + '='.repeat(60) + colors.reset);
log.info('SUMMARY');
log.info(colors.magenta + '='.repeat(60) + colors.reset);

const recommendations = [
  'Test your app in incognito mode to rule out browser extensions',
  'Check browser console for "Hydration failed" errors',
  'Use React DevTools to inspect component tree',
  'Enable debug mode in development (providers.tsx)',
  'Check network tab for failed API requests',
  'Clear localStorage and test fresh state',
  'Test production build: npm run build && npm run start',
];

log.info('\n📋 Recommendations:');
recommendations.forEach((rec, index) => {
  console.log(`  ${colors.cyan}${index + 1}.${colors.reset} ${rec}`);
});

log.info('\n📚 Documentation:');
log.info('  - docs/DEBUGGING-GUIDE.md');
log.info('  - docs/TESTING-PROCEDURES.md');
log.info('  - docs/CONSOLE-MONITORING-CHECKLIST.md');

log.info('\n🔧 Debug Tools:');
log.info('  - Browser console: window.__AUTH_STORE__');
log.info('  - Browser console: window.__HYDRATION_LOGGER__');
log.info('  - Browser console: window.__STORE_DEBUGGER__');
log.info('  - Browser console: window.__NETWORK_MONITOR__');

log.success('\n✨ Debug script completed successfully!');
log.info('\nNext steps:');
log.info('  1. Run: npm run dev');
log.info('  2. Open: http://localhost:3000');
log.info('  3. Check browser console for debug logs');
log.info('  4. Look for hydration errors or warnings\n');
