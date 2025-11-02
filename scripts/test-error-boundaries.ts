#!/usr/bin/env tsx

import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
  screenshot?: string;
  consoleLogs?: string[];
}

const BASE_URL = 'http://localhost:3000';
const TEST_PAGE = '/test-error-boundary';
const RESULTS_DIR = 'test-results';
const REPORT_FILE = join(RESULTS_DIR, 'error-boundary-report.json');

async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let headless = true;
  let browserName = 'chromium';
  let takeScreenshots = false;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--headless':
        headless = true;
        break;
      case '--no-headless':
        headless = false;
        break;
      case '--browser':
        browserName = args[++i];
        break;
      case '--screenshot':
        takeScreenshots = true;
        break;
      case '--verbose':
        verbose = true;
        break;
    }
  }

  const browserType =
    browserName === 'firefox' ? firefox : browserName === 'webkit' ? webkit : chromium;

  console.log(
    `🚀 Starting error boundary tests with ${browserName} (${headless ? 'headless' : 'headed'})`
  );

  const browser = await browserType.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    const log = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(log);
    if (verbose) console.log(log);
  });

  const results: TestResult[] = [];

  try {
    console.log('📄 Navigating to test page...');
    await page.goto(`${BASE_URL}${TEST_PAGE}`);
    await page.waitForSelector('text=Error Boundary Test Page');

    // Test 1: Render Error
    results.push(await testRenderError(page, takeScreenshots, consoleLogs.slice()));

    // Test 2: Async Error
    results.push(await testAsyncError(page, takeScreenshots, consoleLogs.slice()));

    // Test 3: Event Handler Error (should not be caught by boundary)
    results.push(await testEventHandlerError(page, takeScreenshots, consoleLogs.slice()));

    // Test 4: Hydration Error
    results.push(await testHydrationError(page, takeScreenshots, consoleLogs.slice()));

    // Test 5: Network Error
    results.push(await testNetworkError(page, takeScreenshots, consoleLogs.slice()));

    // Test 6: Zustand Error
    results.push(await testZustandError(page, takeScreenshots, consoleLogs.slice()));

    // Test 7: Error with Digest
    results.push(await testErrorWithDigest(page, takeScreenshots, consoleLogs.slice()));

    // Test 8: Sentry Integration
    results.push(await testSentryIntegration(page, takeScreenshots, consoleLogs.slice()));
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  } finally {
    await browser.close();
  }

  // Generate report
  mkdirSync(RESULTS_DIR, { recursive: true });
  const report = {
    timestamp: new Date().toISOString(),
    browser: browserName,
    headless,
    results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
    },
  };

  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`📊 Report saved to ${REPORT_FILE}`);

  const { passed, failed } = report.summary;
  console.log(`✅ ${passed} passed, ❌ ${failed} failed`);

  process.exit(failed > 0 ? 1 : 0);
}

async function testRenderError(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Render Error';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    await page.click('text=Throw Render Error');
    await page.waitForSelector('text=Bir Hata Oluştu', { timeout: 5000 });

    const errorText = await page.locator('h1').textContent();
    if (!errorText?.includes('Bir Hata Oluştu')) {
      throw new Error('Error boundary did not display expected message');
    }

    // Test recovery
    await page.click('text=Tekrar Dene');
    await page.waitForSelector('text=Error Boundary Test Page', { timeout: 5000 });

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'render-error-recovery')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Error caught by boundary and recovery successful',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'render-error-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function testAsyncError(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Async Error';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    await page.click('text=Throw Async Error');
    await page.waitForSelector('text=Bir Hata Oluştu', { timeout: 10000 });

    const errorText = await page.locator('h1').textContent();
    if (!errorText?.includes('Bir Hata Oluştu')) {
      throw new Error('Error boundary did not catch async error');
    }

    // Test recovery
    await page.click('text=Tekrar Dene');
    await page.waitForSelector('text=Error Boundary Test Page', { timeout: 5000 });

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'async-error-recovery')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Async error caught by boundary and recovery successful',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'async-error-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function testEventHandlerError(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Event Handler Error';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    // Event handler errors are not caught by React error boundaries
    // This should NOT show the error boundary
    await page.click('text=Throw Event Handler Error');

    // Wait a bit and check that error boundary is NOT shown
    await page.waitForTimeout(2000);

    const errorBoundaryVisible = await page.locator('text=Bir Hata Oluştu').isVisible();
    if (errorBoundaryVisible) {
      throw new Error('Event handler error was unexpectedly caught by boundary');
    }

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'event-handler-error')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Event handler error correctly not caught by boundary (as expected)',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'event-handler-error-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function testHydrationError(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Hydration Error';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    // Set localStorage to trigger hydration error
    await page.evaluate(() => {
      localStorage.setItem('hydration-test', Date.now().toString());
    });

    // Reload to trigger hydration error
    await page.reload();
    await page.waitForSelector('text=Hydration Hatası', { timeout: 10000 });

    const errorText = await page.locator('h1').textContent();
    if (!errorText?.includes('Hydration Hatası')) {
      throw new Error('Hydration error boundary did not display');
    }

    // Check if clear storage button is present
    const clearButton = await page.locator('text=Clear Storage & Reload').isVisible();
    if (!clearButton) {
      throw new Error('Clear storage button not found');
    }

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'hydration-error')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Hydration error detected and clear storage option provided',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'hydration-error-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function testNetworkError(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Network Error';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    await page.click('text=Throw Network Error');
    await page.waitForSelector('text=Bir Hata Oluştu', { timeout: 10000 });

    const errorText = await page.locator('h1').textContent();
    if (!errorText?.includes('Bir Hata Oluştu')) {
      throw new Error('Network error not caught by boundary');
    }

    // Test recovery
    await page.click('text=Tekrar Dene');
    await page.waitForSelector('text=Error Boundary Test Page', { timeout: 5000 });

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'network-error-recovery')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Network error caught by boundary and recovery successful',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'network-error-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function testZustandError(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Zustand Error';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    await page.click('text=Throw Zustand Error');
    await page.waitForSelector('text=Bir Hata Oluştu', { timeout: 10000 });

    const errorText = await page.locator('h1').textContent();
    if (!errorText?.includes('Bir Hata Oluştu')) {
      throw new Error('Zustand error not caught by boundary');
    }

    // Test recovery
    await page.click('text=Tekrar Dene');
    await page.waitForSelector('text=Error Boundary Test Page', { timeout: 5000 });

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'zustand-error-recovery')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Zustand error caught by boundary and recovery successful',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'zustand-error-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function testErrorWithDigest(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Error with Digest';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    await page.click('text=Throw Error with Digest');
    await page.waitForSelector('text=Bir Hata Oluştu', { timeout: 5000 });

    const errorText = await page.locator('h1').textContent();
    if (!errorText?.includes('Bir Hata Oluştu')) {
      throw new Error('Error with digest not caught by boundary');
    }

    // Check if digest is displayed
    const digestText = await page.textContent('text=Hata Kodu:');
    if (!digestText) {
      throw new Error('Error digest not displayed');
    }

    // Test recovery
    await page.click('text=Tekrar Dene');
    await page.waitForSelector('text=Error Boundary Test Page', { timeout: 5000 });

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'digest-error-recovery')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Error with digest caught and displayed correctly',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'digest-error-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function testSentryIntegration(
  page: Page,
  takeScreenshot: boolean,
  logs: string[]
): Promise<TestResult> {
  const name = 'Sentry Integration';
  const start = Date.now();

  try {
    console.log(`🧪 Running ${name} test...`);
    // Check if Sentry is available
    const sentryAvailable = await page.evaluate(() => !!(window as any).Sentry);

    if (!sentryAvailable) {
      return {
        name,
        passed: false,
        message: 'Sentry not available in test environment',
        duration: Date.now() - start,
        consoleLogs: logs,
      };
    }

    // Trigger an error to test Sentry capture
    await page.click('text=Throw Render Error');
    await page.waitForSelector('text=Bir Hata Oluştu', { timeout: 5000 });

    // Wait a bit for Sentry to process
    await page.waitForTimeout(1000);

    // Check if error was tracked in window.__LAST_ERROR__
    const lastError = await page.evaluate(() => (window as any).__LAST_ERROR__);

    if (!lastError) {
      throw new Error('Error not tracked in window.__LAST_ERROR__');
    }

    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'sentry-integration')
      : undefined;

    return {
      name,
      passed: true,
      message: 'Sentry integration working - error tracked',
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  } catch (error) {
    const screenshot = takeScreenshot
      ? await captureScreenshot(page, 'sentry-integration-fail')
      : undefined;
    return {
      name,
      passed: false,
      message: (error as Error).message,
      duration: Date.now() - start,
      screenshot,
      consoleLogs: logs,
    };
  }
}

async function captureScreenshot(page: Page, name: string): Promise<string> {
  const filename = `${name}-${Date.now()}.png`;
  const filepath = join(RESULTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

main().catch(console.error);
