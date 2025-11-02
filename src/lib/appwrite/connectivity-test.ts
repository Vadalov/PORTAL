/**
 * Appwrite Connectivity Testing Utility
 * Tests connection to Appwrite services with retry logic and detailed reporting
 *
 * Used by health endpoint, CLI tools, and manual debugging
 *
 * @packageDocumentation
 */

/* eslint-disable no-console */
import { account } from './client';
import { serverDatabases, serverStorage } from './server';
import type { AppwriteError } from './types';
import { appwriteConfig } from './config';

interface TestResult {
  success: boolean;
  timing: number;
  error?: string;
  retryCount?: number;
  details?: unknown;
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
    overallHealth: number; // 0-100
  };
  recommendations: string[];
}

/**
 * Connectivity Tester Class
 * Tests Appwrite endpoint and service connectivity
 */
export class ConnectivityTester {
  private readonly timeout = 5000; // 5 seconds
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  /**
   * Test endpoint reachability
   * Checks DNS resolution and network connectivity
   */
  async testEndpointReachability(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const response = await this.testWithRetry(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          const res = await fetch(`${appwriteConfig.endpoint}/health`, {
            method: 'GET',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return res;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      });

      const timing = Date.now() - startTime;
      return {
        success: response.ok,
        timing,
        details: { status: response.status, statusText: response.statusText },
      };
    } catch (err: unknown) {
      const error = err as AppwriteError;
      const timing = Date.now() - startTime;
      return {
        success: false,
        timing,
        error: error.message || 'Unknown error',
        retryCount: error.retryCount || 0,
      };
    }
  }

  /**
   * Test account service
   * Tests account.get() - should fail with 401 (no session) if working
   */
  async testAccountService(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      await this.testWithRetry(async () => {
        return await account.get();
      });

      // If we reach here, account.get() succeeded, which is unexpected
      const timing = Date.now() - startTime;
      return {
        success: false,
        timing,
        error: 'Account service returned user data unexpectedly (should be 401)',
      };
    } catch (err: unknown) {
      const error = err as AppwriteError;
      const timing = Date.now() - startTime;

      // 401 is expected (no session)
      if (error.code === 401) {
        return {
          success: true,
          timing,
          details: { expected401: true },
        };
      }

      // Other errors indicate connectivity issues
      return {
        success: false,
        timing,
        error: error.message || 'Account service error',
        retryCount: error.retryCount || 0,
      };
    }
  }

  /**
   * Test database service
   * Tests databases.list() with server SDK
   */
  async testDatabaseService(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const result = await this.testWithRetry(async () => {
        return await serverDatabases.list();
      });

      const timing = Date.now() - startTime;
      return {
        success: true,
        timing,
        details: { databaseCount: result.databases?.length || 0 },
      };
    } catch (err: unknown) {
      const error = err as AppwriteError;
      const timing = Date.now() - startTime;
      return {
        success: false,
        timing,
        error: error.message || 'Database service error',
        retryCount: error.retryCount || 0,
      };
    }
  }

  /**
   * Test storage service
   * Tests storage.listBuckets() with server SDK
   */
  async testStorageService(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const result = await this.testWithRetry(async () => {
        return await serverStorage.listBuckets();
      });

      const timing = Date.now() - startTime;
      return {
        success: true,
        timing,
        details: { bucketCount: result.buckets?.length || 0 },
      };
    } catch (err: unknown) {
      const error = err as AppwriteError;
      const timing = Date.now() - startTime;
      return {
        success: false,
        timing,
        error: error.message || 'Storage service error',
        retryCount: error.retryCount || 0,
      };
    }
  }

  /**
   * Helper method for retry logic with exponential backoff
   */
  private async testWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await operation();
      } catch (err: unknown) {
        const error = err as AppwriteError;
        lastError = error;
        const errorWithRetry = error as { retryCount?: number };
        errorWithRetry.retryCount = i + 1;

        if (i < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Run full connectivity test suite
   */
  async runFullConnectivityTest(): Promise<ConnectivityReport> {
    console.log('🔌 Running Appwrite connectivity tests...');

    const results = {
      endpoint: await this.testEndpointReachability(),
      account: await this.testAccountService(),
      database: await this.testDatabaseService(),
      storage: await this.testStorageService(),
    };

    const successfulTests = Object.values(results).filter((r) => r.success).length;
    const totalTests = Object.keys(results).length;
    const failedTests = totalTests - successfulTests;
    const overallHealth = Math.round((successfulTests / totalTests) * 100);

    const recommendations: string[] = [];

    if (!results.endpoint.success) {
      recommendations.push('Check Appwrite endpoint URL and network connectivity');
      recommendations.push('Verify NEXT_PUBLIC_APPWRITE_ENDPOINT environment variable');
    }

    if (!results.account.success) {
      recommendations.push('Account service may be down or misconfigured');
    }

    if (!results.database.success) {
      recommendations.push('Check APPWRITE_API_KEY and database permissions');
      recommendations.push('Verify database exists in Appwrite console');
    }

    if (!results.storage.success) {
      recommendations.push('Check APPWRITE_API_KEY and storage permissions');
      recommendations.push('Verify storage buckets exist in Appwrite console');
    }

    return {
      endpoint: appwriteConfig.endpoint,
      timestamp: new Date().toISOString(),
      tests: results,
      summary: {
        totalTests,
        successfulTests,
        failedTests,
        overallHealth,
      },
      recommendations,
    };
  }

  /**
   * Get formatted connectivity report
   */
  async getConnectivityReport(): Promise<ConnectivityReport> {
    return await this.runFullConnectivityTest();
  }
}

/**
 * Singleton instance for easy importing
 */
export const connectivityTester = new ConnectivityTester();
