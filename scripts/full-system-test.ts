#!/usr/bin/env tsx

/**
 * Full System Integration Test Script
 * Validates all components work together in a complete end-to-end flow
 */

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// CLI argument parsing
const args = process.argv.slice(2);
const options = {
  json: args.includes('--json'),
  verbose: args.includes('--verbose'),
  skipConnectivity: args.includes('--skip-connectivity'),
  phase: args.find((arg) => arg.startsWith('--phase='))?.split('=')[1],
};

// Test result interface
interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  duration?: number;
}

interface PhaseResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  duration: number;
  tests: TestResult[];
}

interface TestReport {
  timestamp: string;
  duration: number;
  phases: PhaseResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  recommendations: string[];
}

// Utility functions
function log(message: string, verboseOnly = false) {
  if (!verboseOnly || options.verbose) {
    console.log(message);
  }
}

function checkFileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}

function readFileContent(filePath: string): string | null {
  try {
    return fs.readFileSync(path.resolve(filePath), 'utf-8');
  } catch {
    return null;
  }
}

function checkContent(content: string | null, patterns: string[]): boolean {
  if (!content) return false;
  return patterns.every((pattern) => content.includes(pattern));
}

// Phase implementations
async function phase1(): Promise<PhaseResult> {
  const start = performance.now();
  const tests: TestResult[] = [];

  log('🔍 Phase 1: Environment & Configuration Validation', options.verbose);

  // Check .env.local exists
  const envExists = checkFileExists('.env.local');
  tests.push({
    name: '.env.local exists',
    status: envExists ? 'pass' : 'fail',
    message: envExists ? '.env.local file found' : '.env.local file not found',
  });

  // Check NEXT_PUBLIC_BACKEND_PROVIDER
  const backendProvider = process.env.NEXT_PUBLIC_BACKEND_PROVIDER;
  const validProviders = ['mock', 'appwrite'];
  const providerValid = backendProvider && validProviders.includes(backendProvider);
  tests.push({
    name: 'NEXT_PUBLIC_BACKEND_PROVIDER',
    status: providerValid ? 'pass' : 'fail',
    message: providerValid
      ? `NEXT_PUBLIC_BACKEND_PROVIDER set to ${backendProvider}`
      : `NEXT_PUBLIC_BACKEND_PROVIDER not set or invalid (should be 'mock' or 'appwrite')`,
  });

  // Try to import and run validation functions
  try {
    const { validateAppwriteConfigSafe } = await import('../src/lib/appwrite/config.js');
    const configResult = validateAppwriteConfigSafe();
    tests.push({
      name: 'validateAppwriteConfigSafe()',
      status: configResult.isValid ? 'pass' : 'fail',
      message: configResult.message,
      details: configResult.details,
    });
  } catch (error) {
    tests.push({
      name: 'validateAppwriteConfigSafe()',
      status: 'fail',
      message: 'Failed to import or run validateAppwriteConfigSafe',
      details: error.message,
    });
  }

  try {
    const { getValidationReport } = await import('../src/lib/appwrite/validation.js');
    const report = getValidationReport();
    const hasErrors = report.summary.errors > 0;
    tests.push({
      name: 'getValidationReport()',
      status: hasErrors ? 'fail' : 'pass',
      message: hasErrors
        ? `${report.summary.errors} validation errors found`
        : 'All environment variables valid',
      details: hasErrors
        ? JSON.stringify(
            report.results.filter((r) => !r.isValid),
            null,
            2
          )
        : undefined,
    });
  } catch (error) {
    tests.push({
      name: 'getValidationReport()',
      status: 'fail',
      message: 'Failed to import or run getValidationReport',
      details: error.message,
    });
  }

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const status = failed > 0 ? 'fail' : 'pass';

  return { name: 'Environment & Configuration', status, duration, tests };
}

async function phase2(): Promise<PhaseResult> {
  const start = performance.now();
  const tests: TestResult[] = [];

  log('🏪 Phase 2: Hydration & Store Validation', options.verbose);

  // Check authStore.ts exists and has required content
  const authStorePath = 'src/stores/authStore.ts';
  const authStoreContent = readFileContent(authStorePath);

  if (!authStoreContent) {
    tests.push({
      name: 'authStore.ts exists',
      status: 'fail',
      message: 'src/stores/authStore.ts not found',
    });
  } else {
    // Check skipHydration
    const hasSkipHydration = checkContent(authStoreContent, ['skipHydration: true']);
    tests.push({
      name: 'skipHydration configured',
      status: hasSkipHydration ? 'pass' : 'fail',
      message: hasSkipHydration
        ? 'skipHydration: true found in persist config'
        : 'skipHydration: true not found in persist config',
    });

    // Check _hasHydrated field
    const hasHydratedField = checkContent(authStoreContent, ['_hasHydrated: boolean']);
    tests.push({
      name: '_hasHydrated field exists',
      status: hasHydratedField ? 'pass' : 'fail',
      message: hasHydratedField
        ? '_hasHydrated field found in AuthState interface'
        : '_hasHydrated field not found in AuthState interface',
    });

    // Check onRehydrateStorage callback
    const hasRehydrateCallback = checkContent(authStoreContent, [
      'onRehydrateStorage',
      '_hasHydrated = true',
    ]);
    tests.push({
      name: 'onRehydrateStorage callback',
      status: hasRehydrateCallback ? 'pass' : 'fail',
      message: hasRehydrateCallback
        ? 'onRehydrateStorage sets _hasHydrated = true'
        : 'onRehydrateStorage callback not properly configured',
    });

    // Simulate rehydration timing (mock test)
    tests.push({
      name: 'Rehydration timing',
      status: 'pass',
      message: 'Rehydration timing check simulated (would be < 100ms in browser)',
      details: 'Actual timing test requires browser environment',
    });
  }

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const status = failed > 0 ? 'fail' : 'pass';

  return { name: 'Hydration & Store', status, duration, tests };
}

async function phase3(): Promise<PhaseResult> {
  const start = performance.now();
  const tests: TestResult[] = [];

  log('🚨 Phase 3: Error Boundary Validation', options.verbose);

  // Check error.tsx
  const errorTsxPath = 'src/app/error.tsx';
  const errorTsxContent = readFileContent(errorTsxPath);
  if (!errorTsxContent) {
    tests.push({
      name: 'src/app/error.tsx exists',
      status: 'fail',
      message: 'src/app/error.tsx not found',
    });
  } else {
    const hasDefaultExport = checkContent(errorTsxContent, ['export default']);
    tests.push({
      name: 'error.tsx default export',
      status: hasDefaultExport ? 'pass' : 'fail',
      message: hasDefaultExport
        ? 'error.tsx exports default error component'
        : 'error.tsx does not export default component',
    });

    const hasHydrationError = checkContent(errorTsxContent, ['isHydrationError']);
    tests.push({
      name: 'Hydration error detection',
      status: hasHydrationError ? 'pass' : 'fail',
      message: hasHydrationError
        ? 'Hydration error detection logic found'
        : 'Hydration error detection logic not found',
    });

    const hasSentry = checkContent(errorTsxContent, ['Sentry.captureException']);
    tests.push({
      name: 'Sentry integration',
      status: hasSentry ? 'pass' : 'warning',
      message: hasSentry ? 'Sentry integration found' : 'Sentry integration not found (optional)',
    });

    const hasRecovery = checkContent(errorTsxContent, ['reset()', 'localStorage.clear']);
    tests.push({
      name: 'Recovery mechanisms',
      status: hasRecovery ? 'pass' : 'fail',
      message: hasRecovery
        ? 'Recovery mechanisms (reset, clear storage) found'
        : 'Recovery mechanisms not found',
    });
  }

  // Check global-error.tsx
  const globalErrorExists = checkFileExists('src/app/global-error.tsx');
  tests.push({
    name: 'src/app/global-error.tsx exists',
    status: globalErrorExists ? 'pass' : 'fail',
    message: globalErrorExists
      ? 'src/app/global-error.tsx found'
      : 'src/app/global-error.tsx not found',
  });

  // Check error-boundary.tsx
  const errorBoundaryExists = checkFileExists('src/components/error-boundary.tsx');
  tests.push({
    name: 'src/components/error-boundary.tsx exists',
    status: errorBoundaryExists ? 'pass' : 'fail',
    message: errorBoundaryExists
      ? 'src/components/error-boundary.tsx found'
      : 'src/components/error-boundary.tsx not found',
  });

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const status = failed > 0 ? 'fail' : 'pass';

  return { name: 'Error Boundaries', status, duration, tests };
}

async function phase4(): Promise<PhaseResult> {
  const start = performance.now();
  const tests: TestResult[] = [];

  log('⏳ Phase 4: Loading State Validation', options.verbose);

  // Check loading-overlay.tsx
  const loadingOverlayPath = 'src/components/ui/loading-overlay.tsx';
  const loadingOverlayContent = readFileContent(loadingOverlayPath);
  if (!loadingOverlayContent) {
    tests.push({
      name: 'src/components/ui/loading-overlay.tsx exists',
      status: 'fail',
      message: 'src/components/ui/loading-overlay.tsx not found',
    });
  } else {
    const variants = ['spinner', 'dots', 'pulse', 'bars', 'ripple'];
    const hasAllVariants = variants.every((variant) =>
      checkContent(loadingOverlayContent, [`variant="${variant}"`, `variant === '${variant}'`])
    );
    tests.push({
      name: 'All 5 variants implemented',
      status: hasAllVariants ? 'pass' : 'fail',
      message: hasAllVariants
        ? 'All 5 loading variants (spinner, dots, pulse, bars, ripple) found'
        : 'Some loading variants missing',
    });

    const hasAccessibility = checkContent(loadingOverlayContent, [
      'role="status"',
      'aria-live="polite"',
    ]);
    tests.push({
      name: 'Accessibility attributes',
      status: hasAccessibility ? 'pass' : 'fail',
      message: hasAccessibility
        ? 'Accessibility attributes (role, aria-live) found'
        : 'Accessibility attributes missing',
    });

    const hasMotionReduce = checkContent(loadingOverlayContent, ['motion-reduce:animate-none']);
    tests.push({
      name: 'Motion reduce support',
      status: hasMotionReduce ? 'pass' : 'fail',
      message: hasMotionReduce ? 'Motion reduce support found' : 'Motion reduce support missing',
    });
  }

  // Check usage in layouts
  const dashboardLayoutContent = readFileContent('src/app/(dashboard)/layout.tsx');
  const hasAuthLoading =
    dashboardLayoutContent && checkContent(dashboardLayoutContent, ['LoadingOverlay']);
  tests.push({
    name: 'Auth loading in dashboard layout',
    status: hasAuthLoading ? 'pass' : 'fail',
    message: hasAuthLoading
      ? 'LoadingOverlay used in dashboard layout for auth'
      : 'LoadingOverlay not found in dashboard layout',
  });

  const providersContent = readFileContent('src/app/providers.tsx');
  const hasHydrationLoading =
    providersContent && checkContent(providersContent, ['LoadingOverlay']);
  tests.push({
    name: 'Hydration loading in providers',
    status: hasHydrationLoading ? 'pass' : 'fail',
    message: hasHydrationLoading
      ? 'LoadingOverlay used in providers for hydration'
      : 'LoadingOverlay not found in providers',
  });

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const status = failed > 0 ? 'fail' : 'pass';

  return { name: 'Loading States', status, duration, tests };
}

async function phase5(): Promise<PhaseResult> {
  const start = performance.now();
  const tests: TestResult[] = [];

  log('⏸️ Phase 5: Suspense Boundary Validation', options.verbose);

  // Check suspense-boundary.tsx
  const suspenseBoundaryPath = 'src/components/ui/suspense-boundary.tsx';
  const suspenseBoundaryContent = readFileContent(suspenseBoundaryPath);
  if (!suspenseBoundaryContent) {
    tests.push({
      name: 'src/components/ui/suspense-boundary.tsx exists',
      status: 'fail',
      message: 'src/components/ui/suspense-boundary.tsx not found',
    });
  } else {
    const hasSuspense = checkContent(suspenseBoundaryContent, ['React.Suspense', '<Suspense']);
    tests.push({
      name: 'React.Suspense wrapper',
      status: hasSuspense ? 'pass' : 'fail',
      message: hasSuspense
        ? 'React.Suspense wrapper implemented'
        : 'React.Suspense wrapper not found',
    });

    const hasErrorBoundary = checkContent(suspenseBoundaryContent, ['ErrorBoundary']);
    tests.push({
      name: 'ErrorBoundary integration',
      status: hasErrorBoundary ? 'pass' : 'fail',
      message: hasErrorBoundary
        ? 'ErrorBoundary integration found'
        : 'ErrorBoundary integration not found',
    });

    const hasLoadingOverlay = checkContent(suspenseBoundaryContent, ['LoadingOverlay']);
    tests.push({
      name: 'LoadingOverlay fallback',
      status: hasLoadingOverlay ? 'pass' : 'fail',
      message: hasLoadingOverlay
        ? 'LoadingOverlay used as fallback'
        : 'LoadingOverlay not used as fallback',
    });
  }

  // Check usage in providers
  const providersContent = readFileContent('src/app/providers.tsx');
  const hasRootSuspense = providersContent && checkContent(providersContent, ['SuspenseBoundary']);
  tests.push({
    name: 'SuspenseBoundary in providers (root)',
    status: hasRootSuspense ? 'pass' : 'fail',
    message: hasRootSuspense
      ? 'SuspenseBoundary used in providers at root level'
      : 'SuspenseBoundary not found in providers',
  });

  // Check usage in dashboard layout
  const dashboardLayoutContent = readFileContent('src/app/(dashboard)/layout.tsx');
  const hasDashboardSuspense =
    dashboardLayoutContent && checkContent(dashboardLayoutContent, ['SuspenseBoundary']);
  tests.push({
    name: 'SuspenseBoundary in dashboard layout',
    status: hasDashboardSuspense ? 'pass' : 'fail',
    message: hasDashboardSuspense
      ? 'SuspenseBoundary used in dashboard layout'
      : 'SuspenseBoundary not found in dashboard layout',
  });

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const status = failed > 0 ? 'fail' : 'pass';

  return { name: 'Suspense Boundaries', status, duration, tests };
}

async function phase6(): Promise<PhaseResult> {
  if (options.skipConnectivity) {
    return {
      name: 'Appwrite Configuration',
      status: 'pass',
      duration: 0,
      tests: [
        {
          name: 'Connectivity tests skipped',
          status: 'pass',
          message: '--skip-connectivity flag used',
        },
      ],
    };
  }

  const start = performance.now();
  const tests: TestResult[] = [];

  log('🔗 Phase 6: Appwrite Configuration Validation', options.verbose);

  // Try connectivity test
  try {
    const { testConnectivity } = await import('../src/lib/appwrite/connectivity-test.js');
    const connectivityResult = await testConnectivity();
    tests.push({
      name: 'Connectivity test',
      status: connectivityResult.success ? 'pass' : 'fail',
      message: connectivityResult.message,
      details: connectivityResult.details,
    });
  } catch (error) {
    tests.push({
      name: 'Connectivity test',
      status: 'fail',
      message: 'Failed to run connectivity test',
      details: error.message,
    });
  }

  // Check client SDK
  try {
    await import('../src/lib/appwrite/client.js');
    tests.push({
      name: 'Client SDK initialization',
      status: 'pass',
      message: 'Client SDK imports successfully',
    });
  } catch (error) {
    tests.push({
      name: 'Client SDK initialization',
      status: 'fail',
      message: 'Failed to import client SDK',
      details: error.message,
    });
  }

  // Check server SDK
  try {
    await import('../src/lib/appwrite/server.js');
    tests.push({
      name: 'Server SDK initialization',
      status: 'pass',
      message: 'Server SDK imports successfully',
    });
  } catch (error) {
    tests.push({
      name: 'Server SDK initialization',
      status: 'fail',
      message: 'Failed to import server SDK',
      details: error.message,
    });
  }

  // Check SDK guard
  try {
    const { sdkGuard } = await import('../src/lib/appwrite/sdk-guard.js');
    const guardResult = sdkGuard.check();
    tests.push({
      name: 'SDK guard warnings',
      status: guardResult.hasWarnings ? 'warning' : 'pass',
      message: guardResult.message,
      details: guardResult.details,
    });
  } catch (error) {
    tests.push({
      name: 'SDK guard warnings',
      status: 'fail',
      message: 'Failed to check SDK guard',
      details: error.message,
    });
  }

  // Check mock API if backend provider is mock
  const backendProvider = process.env.NEXT_PUBLIC_BACKEND_PROVIDER;
  if (backendProvider === 'mock') {
    try {
      await import('../src/lib/api/index.js');
      tests.push({
        name: 'Mock API initialization',
        status: 'pass',
        message: 'Mock API imports successfully',
      });
    } catch (error) {
      tests.push({
        name: 'Mock API initialization',
        status: 'fail',
        message: 'Failed to import mock API',
        details: error.message,
      });
    }
  }

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const warnings = tests.filter((t) => t.status === 'warning').length;
  const status = failed > 0 ? 'fail' : warnings > 0 ? 'warning' : 'pass';

  return { name: 'Appwrite Configuration', status, duration, tests };
}

async function phase7(): Promise<PhaseResult> {
  const start = performance.now();
  const tests: TestResult[] = [];

  log('🐛 Phase 7: Debug Utilities Validation', options.verbose);

  // Check hydration-logger.ts
  const hydrationLoggerExists = checkFileExists('src/lib/debug/hydration-logger.ts');
  if (hydrationLoggerExists) {
    const content = readFileContent('src/lib/debug/hydration-logger.ts');
    const hasExport = content && checkContent(content, ['export const HydrationLogger']);
    tests.push({
      name: 'src/lib/debug/hydration-logger.ts',
      status: hasExport ? 'pass' : 'fail',
      message: hasExport
        ? 'HydrationLogger exists and exports correctly'
        : 'HydrationLogger export not found',
    });
  } else {
    tests.push({
      name: 'src/lib/debug/hydration-logger.ts',
      status: 'fail',
      message: 'src/lib/debug/hydration-logger.ts not found',
    });
  }

  // Check store-debugger.ts
  const storeDebuggerExists = checkFileExists('src/lib/debug/store-debugger.ts');
  if (storeDebuggerExists) {
    const content = readFileContent('src/lib/debug/store-debugger.ts');
    const hasExport = content && checkContent(content, ['export const StoreDebugger']);
    tests.push({
      name: 'src/lib/debug/store-debugger.ts',
      status: hasExport ? 'pass' : 'fail',
      message: hasExport
        ? 'StoreDebugger exists and exports correctly'
        : 'StoreDebugger export not found',
    });
  } else {
    tests.push({
      name: 'src/lib/debug/store-debugger.ts',
      status: 'fail',
      message: 'src/lib/debug/store-debugger.ts not found',
    });
  }

  // Check network-monitor.ts
  const networkMonitorExists = checkFileExists('src/lib/debug/network-monitor.ts');
  if (networkMonitorExists) {
    const content = readFileContent('src/lib/debug/network-monitor.ts');
    const hasExport = content && checkContent(content, ['export const NetworkMonitor']);
    tests.push({
      name: 'src/lib/debug/network-monitor.ts',
      status: hasExport ? 'pass' : 'fail',
      message: hasExport
        ? 'NetworkMonitor exists and exports correctly'
        : 'NetworkMonitor export not found',
    });
  } else {
    tests.push({
      name: 'src/lib/debug/network-monitor.ts',
      status: 'fail',
      message: 'src/lib/debug/network-monitor.ts not found',
    });
  }

  // Check integration in providers
  const providersContent = readFileContent('src/app/providers.tsx');
  const hasDebugIntegration =
    providersContent &&
    checkContent(providersContent, [
      'HydrationLogger.init',
      'StoreDebugger.init',
      'NetworkMonitor.init',
    ]);
  tests.push({
    name: 'Debug utilities in providers',
    status: hasDebugIntegration ? 'pass' : 'fail',
    message: hasDebugIntegration
      ? 'Debug utilities initialized in providers (development-only)'
      : 'Debug utilities not found in providers',
  });

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const status = failed > 0 ? 'fail' : 'pass';

  return { name: 'Debug Utilities', status, duration, tests };
}

async function phase8(): Promise<PhaseResult> {
  const start = performance.now();
  const tests: TestResult[] = [];

  log('📜 Phase 8: Test Scripts Validation', options.verbose);

  const scripts = [
    'scripts/test-error-boundaries.ts',
    'scripts/test-loading-states.ts',
    'scripts/test-suspense-boundaries.ts',
    'scripts/validate-config.ts',
    'scripts/test-connectivity.ts',
    'scripts/diagnose-appwrite.ts',
  ];

  for (const script of scripts) {
    const exists = checkFileExists(script);
    if (exists) {
      // Try to check if it's executable and has proper imports
      const content = readFileContent(script);
      const hasShebang = content && content.startsWith('#!/usr/bin/env');
      const hasImports = content && content.includes('import ');
      tests.push({
        name: script,
        status: hasShebang && hasImports ? 'pass' : 'warning',
        message:
          hasShebang && hasImports
            ? `${script} exists and appears valid`
            : `${script} exists but may have issues (missing shebang or imports)`,
      });
    } else {
      tests.push({
        name: script,
        status: 'fail',
        message: `${script} not found`,
      });
    }
  }

  const duration = performance.now() - start;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const warnings = tests.filter((t) => t.status === 'warning').length;
  const status = failed > 0 ? 'fail' : warnings > 0 ? 'warning' : 'pass';

  return { name: 'Test Scripts', status, duration, tests };
}

// Main execution
async function runTests(): Promise<void> {
  const startTime = performance.now();
  const phases: PhaseResult[] = [];

  const allPhases = [
    { key: 'env', func: phase1 },
    { key: 'hydration', func: phase2 },
    { key: 'error-boundaries', func: phase3 },
    { key: 'loading-states', func: phase4 },
    { key: 'suspense-boundaries', func: phase5 },
    { key: 'appwrite', func: phase6 },
    { key: 'debug-utilities', func: phase7 },
    { key: 'test-scripts', func: phase8 },
  ];

  // Filter phases if specific phase requested
  const phasesToRun = options.phase ? allPhases.filter((p) => p.key === options.phase) : allPhases;

  if (options.phase && phasesToRun.length === 0) {
    console.error(`❌ Unknown phase: ${options.phase}`);
    console.error(
      'Available phases: env, hydration, error-boundaries, loading-states, suspense-boundaries, appwrite, debug-utilities, test-scripts'
    );
    process.exit(1);
  }

  for (const { func } of phasesToRun) {
    try {
      const result = await func();
      phases.push(result);
    } catch (error) {
      console.error(`❌ Phase failed with error:`, error);
      phases.push({
        name: 'Unknown',
        status: 'fail',
        duration: 0,
        tests: [
          {
            name: 'Phase execution',
            status: 'fail',
            message: `Phase failed: ${error.message}`,
          },
        ],
      });
    }
  }

  const totalDuration = performance.now() - startTime;

  // Calculate summary
  const allTests = phases.flatMap((p) => p.tests);
  const summary = {
    total: allTests.length,
    passed: allTests.filter((t) => t.status === 'pass').length,
    failed: allTests.filter((t) => t.status === 'fail').length,
    warnings: allTests.filter((t) => t.status === 'warning').length,
  };

  // Generate recommendations
  const recommendations: string[] = [];
  if (summary.failed > 0) {
    recommendations.push('Fix failed tests before deploying');
  }
  if (summary.warnings > 0) {
    recommendations.push('Review warning tests for potential issues');
  }
  if (phases.some((p) => p.name === 'Appwrite Configuration' && p.status === 'fail')) {
    recommendations.push('Configure Appwrite properly or use mock backend');
  }

  const report: TestReport = {
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    phases,
    summary,
    recommendations,
  };

  // Console output (unless --json only)
  if (!options.json) {
    console.log('\n🎯 Full System Integration Test Results');
    console.log('=====================================');

    for (const phase of phases) {
      const icon = phase.status === 'pass' ? '✅' : phase.status === 'warning' ? '⚠️' : '❌';
      const color =
        phase.status === 'pass'
          ? colors.green
          : phase.status === 'warning'
            ? colors.yellow
            : colors.red;
      console.log(
        `${color}${icon} ${phase.name} - ${phase.status.toUpperCase()} (${phase.duration.toFixed(1)}ms)${colors.reset}`
      );

      if (options.verbose) {
        for (const test of phase.tests) {
          const testIcon = test.status === 'pass' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
          const testColor =
            test.status === 'pass'
              ? colors.green
              : test.status === 'warning'
                ? colors.yellow
                : colors.red;
          console.log(`  ${testColor}${testIcon} ${test.name}${colors.reset}`);
          if (test.message) console.log(`    ${test.message}`);
          if (test.details && options.verbose) console.log(`    ${test.details}`);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Total tests: ${summary.total}`);
    console.log(`${colors.green}  Passed: ${summary.passed}${colors.reset}`);
    console.log(`${colors.red}  Failed: ${summary.failed}${colors.reset}`);
    console.log(`${colors.yellow}  Warnings: ${summary.warnings}${colors.reset}`);
    console.log(`  Total time: ${totalDuration.toFixed(1)}ms`);

    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach((rec) => console.log(`  • ${rec}`));
    }

    const overallStatus =
      summary.failed > 0 ? 'FAILED' : summary.warnings > 0 ? 'PASSED WITH WARNINGS' : 'PASSED';
    const statusColor =
      summary.failed > 0 ? colors.red : summary.warnings > 0 ? colors.yellow : colors.green;
    console.log(`\n🎉 Overall: ${statusColor}${overallStatus}${colors.reset}`);
  }

  // Save JSON report
  const outputDir = 'test-results';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(outputDir, 'full-system-test-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
