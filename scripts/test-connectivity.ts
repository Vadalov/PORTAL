#!/usr/bin/env tsx

/**
 * CLI Connectivity Testing Script
 * Tests Appwrite connectivity with detailed reporting and progress indicators
 *
 * Usage: npx tsx scripts/test-connectivity.ts [options]
 *
 * Options:
 *   --json                 Output as JSON instead of formatted text
 *   --service <name>       Test specific service only (endpoint, account, database, storage)
 *   --retry <count>        Number of retries (default: 3)
 *   --timeout <ms>         Timeout in milliseconds (default: 5000)
 *
 * Examples:
 *   npx tsx scripts/test-connectivity.ts
 *   npx tsx scripts/test-connectivity.ts --service database
 *   npx tsx scripts/test-connectivity.ts --json
 */

import { connectivityTester } from '@/lib/appwrite/connectivity-test';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

interface TestResult {
  success: boolean;
  timing: number;
  error?: string;
  retryCount?: number;
  details?: Record<string, unknown>;
}

interface ConnectivityReport {
  endpoint: string;
  timestamp: string;
  tests: {
    endpoint: TestResult;
    account: TestResult;
    database: TestResult;
    storage: TestResult;
  };
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    overallHealth: number;
  };
  recommendations: string[];
}

/**
 * Print formatted test result for a specific service
 */
function printResult(serviceName: string, result: TestResult): void {
  const status = result.success ? '✅' : '❌';
  const timing = result.timing ? ` (${result.timing}ms)` : '';

  console.log(
    `${status} ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service${timing}`
  );

  if (!result.success && result.error) {
    console.log(`   Error: ${result.error}`);
  }

  if (result.details) {
    console.log(`   Details: ${JSON.stringify(result.details)}`);
  }

  if (result.retryCount && result.retryCount > 0) {
    console.log(`   Retries: ${result.retryCount}`);
  }
}

/**
 * Print formatted connectivity report
 */
function printReport(report: ConnectivityReport): void {
  console.log(`\n📊 Connectivity Test Results`);
  console.log(`Endpoint: ${report.endpoint}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Overall Health: ${report.summary.overallHealth}%`);
  console.log(`Tests: ${report.summary.successfulTests}/${report.summary.totalTests} passed\n`);

  printResult('endpoint', report.tests.endpoint);
  printResult('account', report.tests.account);
  printResult('database', report.tests.database);
  printResult('storage', report.tests.storage);

  if (report.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    report.recommendations.forEach((rec) => console.log(`   • ${rec}`));
  }
}

/**
 * Show progress indicator for a test
 */
function showProgress(service: string): void {
  console.log(`🔄 Testing ${service}...`);
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  console.log('🔌 Testing Appwrite Connectivity...\n');

  // Check backend provider
  const provider = process.env.BACKEND_PROVIDER;
  if (provider !== 'appwrite') {
    console.log('ℹ️  Backend provider is set to "mock". Skipping connectivity tests.');
    process.exit(0);
  }

  // Validate required environment variables
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is not configured');
    process.exit(2);
  }

  if (!projectId) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not configured');
    process.exit(2);
  }

  if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is not configured');
    process.exit(2);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  let jsonOutput = false;
  let service: string | null = null;
  let retryCount = 3;
  let timeout = 5000;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      jsonOutput = true;
    } else if (arg === '--service' && args[i + 1]) {
      service = args[i + 1];
      i++;
    } else if (arg === '--retry' && args[i + 1]) {
      retryCount = parseInt(args[i + 1], 10);
      if (isNaN(retryCount) || retryCount < 0) {
        console.error('❌ Invalid retry count. Must be a positive integer.');
        process.exit(2);
      }
      i++;
    } else if (arg === '--timeout' && args[i + 1]) {
      timeout = parseInt(args[i + 1], 10);
      if (isNaN(timeout) || timeout <= 0) {
        console.error('❌ Invalid timeout. Must be a positive integer.');
        process.exit(2);
      }
      i++;
    } else {
      console.error(`❌ Unknown option: ${arg}`);
      console.error('Use --help for usage information.');
      process.exit(2);
    }
  }

  try {
    if (service) {
      // Test specific service
      showProgress(service);

      let result: TestResult;
      switch (service) {
        case 'endpoint':
          result = await connectivityTester.testEndpointReachability();
          break;
        case 'account':
          result = await connectivityTester.testAccountService();
          break;
        case 'database':
          result = await connectivityTester.testDatabaseService();
          break;
        case 'storage':
          result = await connectivityTester.testStorageService();
          break;
        default:
          console.error(
            `❌ Unknown service: ${service}. Valid options: endpoint, account, database, storage`
          );
          process.exit(2);
      }

      if (jsonOutput) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printResult(service, result);
      }

      process.exit(result.success ? 0 : 1);
    } else {
      // Run full connectivity test
      const report = await connectivityTester.getConnectivityReport();

      if (jsonOutput) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printReport(report);
      }

      process.exit(report.summary.failedTests === 0 ? 0 : 1);
    }
  } catch (error) {
    console.error(
      '❌ Error running connectivity tests:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * Exported function for programmatic use
 */
export async function testConnectivity(options?: {
  json?: boolean;
  service?: string;
  retry?: number;
  timeout?: number;
}): Promise<ConnectivityReport | TestResult> {
  // Load environment if not already loaded
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
    dotenv.config({ path: '.env.local' });
  }

  const provider = process.env.BACKEND_PROVIDER;
  if (provider !== 'appwrite') {
    throw new Error('Backend provider is not set to "appwrite"');
  }

  if (options?.service) {
    let result: TestResult;
    switch (options.service) {
      case 'endpoint':
        result = await connectivityTester.testEndpointReachability();
        break;
      case 'account':
        result = await connectivityTester.testAccountService();
        break;
      case 'database':
        result = await connectivityTester.testDatabaseService();
        break;
      case 'storage':
        result = await connectivityTester.testStorageService();
        break;
      default:
        throw new Error(`Unknown service: ${options.service}`);
    }
    return result;
  } else {
    return await connectivityTester.getConnectivityReport();
  }
}

// Run main if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
