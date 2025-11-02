#!/usr/bin/env tsx

/**
 * Multi-Browser Compatibility Testing Script
 * Tests the application across Chrome, Firefox, and Safari browsers
 * using Playwright for automated browser testing.
 */

import { chromium, firefox, webkit, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// CLI argument parsing
const args = process.argv.slice(2);
const options = {
  browser: args.includes('--browser') ? args[args.indexOf('--browser') + 1] : null,
  headed: args.includes('--headed'),
  screenshot: args.includes('--screenshot'),
  performance: args.includes('--performance'),
  'skip-dev-pages': args.includes('--skip-dev-pages'),
};

// Test result interfaces
interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  duration: number;
  message?: string;
  screenshot?: string;
  errors?: string[];
}

interface BrowserTestResults {
  browser: string;
  tests: TestResult[];
  performance?: PerformanceMetrics;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
  };
}

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  tti: number; // Time to Interactive
  cls: number; // Cumulative Layout Shift
  loadTime: number; // Total load time
}

interface CompatibilityReport {
  timestamp: string;
  browsers: BrowserTestResults[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningTests: number;
  };
  browserSpecificIssues: Record<string, string[]>;
}

// Test scenarios
const testScenarios = [
  'initialLoad',
  'authFlow',
  'errorBoundary',
  'loadingState',
  'hydration',
  'navigation',
  ...(options.performance ? ['performance'] : []),
];

// Browser configurations
const browsers = {
  chromium: { name: 'Chrome', launcher: chromium },
  firefox: { name: 'Firefox', launcher: firefox },
  webkit: { name: 'Safari', launcher: webkit },
};

// Main execution
async function main() {
  console.log('🚀 Starting Multi-Browser Compatibility Testing\n');

  const selectedBrowsers = options.browser ? [options.browser] : Object.keys(browsers);
  const results: BrowserTestResults[] = [];

  for (const browserKey of selectedBrowsers) {
    if (!browsers[browserKey as keyof typeof browsers]) {
      console.error(`❌ Unknown browser: ${browserKey}`);
      continue;
    }

    console.log(`🌐 Testing ${browsers[browserKey as keyof typeof browsers].name}...`);
    const browserResults = await testBrowser(browserKey);
    results.push(browserResults);
    console.log(`✅ ${browsers[browserKey as keyof typeof browsers].name} testing completed\n`);
  }

  const report = generateReport(results);
  saveReports(report);

  console.log('📊 Compatibility testing completed!');
  console.log(
    `📈 Results: ${report.summary.passedTests}/${report.summary.totalTests} tests passed`
  );
}

// Test a specific browser
async function testBrowser(browserKey: string): Promise<BrowserTestResults> {
  const browserConfig = browsers[browserKey as keyof typeof browsers];
  const testResults: TestResult[] = [];
  let performanceMetrics: PerformanceMetrics | undefined;

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    browser = await browserConfig.launcher.launch({
      headless: !options.headed,
    });

    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });

    page = await context.newPage();

    // Run each test scenario
    for (const scenario of testScenarios) {
      const startTime = Date.now();
      let result: TestResult;

      try {
        switch (scenario) {
          case 'initialLoad':
            result = await testInitialLoad(page);
            break;
          case 'authFlow':
            result = await testAuthFlow(page);
            break;
          case 'errorBoundary':
            if (options['skip-dev-pages']) continue;
            result = await testErrorBoundary(page);
            break;
          case 'loadingState':
            if (options['skip-dev-pages']) continue;
            result = await testLoadingState(page);
            break;
          case 'hydration':
            result = await testHydration(page);
            break;
          case 'navigation':
            result = await testNavigation(page);
            break;
          case 'performance':
            const perfResult = await testPerformance(page);
            performanceMetrics = perfResult.metrics;
            result = perfResult.testResult;
            break;
          default:
            result = {
              name: scenario,
              status: 'fail',
              duration: 0,
              message: 'Unknown test scenario',
            };
        }
      } catch (error) {
        result = {
          name: scenario,
          status: 'fail',
          duration: Date.now() - startTime,
          message: `Test failed: ${error.message}`,
          errors: [error.message],
        };
      }

      result.duration = Date.now() - startTime;
      testResults.push(result);

      const statusEmoji =
        result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`  ${statusEmoji} ${scenario}: ${result.status} (${result.duration}ms)`);
    }
  } catch (error) {
    console.error(`❌ Browser ${browserKey} failed: ${error.message}`);
    testResults.push({
      name: 'browser-launch',
      status: 'fail',
      duration: 0,
      message: `Failed to launch browser: ${error.message}`,
    });
  } finally {
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }

  const summary = {
    passed: testResults.filter((t) => t.status === 'pass').length,
    failed: testResults.filter((t) => t.status === 'fail').length,
    warnings: testResults.filter((t) => t.status === 'warning').length,
    total: testResults.length,
  };

  return {
    browser: browserConfig.name,
    tests: testResults,
    performance: performanceMetrics,
    summary,
  };
}

// Test scenarios implementation
async function testInitialLoad(page: Page): Promise<TestResult> {
  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000);

    // Verify page renders
    const title = await page.title();
    const hasContent = await page.locator('body').isVisible();

    if (!hasContent) {
      return {
        name: 'initialLoad',
        status: 'fail',
        duration: 0,
        message: 'Page content not visible',
      };
    }

    const screenshot = options.screenshot
      ? await captureScreenshot(page, 'initial-load')
      : undefined;

    return {
      name: 'initialLoad',
      status: errors.length > 0 ? 'warning' : 'pass',
      duration: 0,
      message:
        errors.length > 0 ? `Console errors: ${errors.join(', ')}` : 'Page loaded successfully',
      screenshot,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return { name: 'initialLoad', status: 'fail', duration: 0, message: error.message };
  }
}

async function testAuthFlow(page: Page): Promise<TestResult> {
  try {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for loading overlay to appear
    const loadingOverlay = page.locator('[role="status"]');
    await loadingOverlay.waitFor({ state: 'visible', timeout: 5000 });

    // Wait for redirect or error
    await page.waitForURL(/\/dashboard|\/genel/, { timeout: 10000 });

    // Check if redirected to dashboard
    const url = page.url();
    const isDashboard = url.includes('/dashboard') || url.includes('/genel');

    if (!isDashboard) {
      return {
        name: 'authFlow',
        status: 'fail',
        duration: 0,
        message: 'Not redirected to dashboard',
      };
    }

    // Check localStorage persistence
    const authSession = await page.evaluate(() => localStorage.getItem('auth-session'));
    if (!authSession) {
      return {
        name: 'authFlow',
        status: 'warning',
        duration: 0,
        message: 'Auth session not persisted in localStorage',
      };
    }

    const screenshot = options.screenshot
      ? await captureScreenshot(page, 'auth-success')
      : undefined;

    return {
      name: 'authFlow',
      status: 'pass',
      duration: 0,
      message: 'Auth flow completed successfully',
      screenshot,
    };
  } catch (error) {
    return { name: 'authFlow', status: 'fail', duration: 0, message: error.message };
  }
}

async function testErrorBoundary(page: Page): Promise<TestResult> {
  try {
    await page.goto('http://localhost:3000/test-error-boundary');
    await page.waitForLoadState('networkidle');

    // Trigger error (assuming there's a button to trigger error)
    const errorButton = page
      .locator('button:has-text("Trigger Error")')
      .or(page.locator('[data-trigger-error]'));
    if (await errorButton.isVisible()) {
      await errorButton.click();
    } else {
      // If no button, try to trigger error by evaluating script
      await page.evaluate(() => {
        throw new Error('Test error for boundary');
      });
    }

    // Wait for error boundary to appear
    await page.waitForSelector('text="Bir Hata Oluştu"', { timeout: 5000 });

    // Check for error message
    const errorMessage = await page.locator('text="Bir Hata Oluştu"').isVisible();
    const resetButton = await page.locator('button:has-text("Tekrar Dene")').isVisible();

    if (!errorMessage || !resetButton) {
      return {
        name: 'errorBoundary',
        status: 'fail',
        duration: 0,
        message: 'Error boundary not displayed correctly',
      };
    }

    // Test recovery
    await page.click('button:has-text("Tekrar Dene")');
    await page.waitForTimeout(1000);

    const screenshot = options.screenshot
      ? await captureScreenshot(page, 'error-boundary')
      : undefined;

    return {
      name: 'errorBoundary',
      status: 'pass',
      duration: 0,
      message: 'Error boundary handled error and recovery works',
      screenshot,
    };
  } catch (error) {
    return { name: 'errorBoundary', status: 'fail', duration: 0, message: error.message };
  }
}

async function testLoadingState(page: Page): Promise<TestResult> {
  try {
    await page.goto('http://localhost:3000/test-loading-states');
    await page.waitForLoadState('networkidle');

    // Check all 5 variants are present
    const variants = ['spinner', 'dots', 'pulse', 'bars', 'ripple'];
    let foundVariants = 0;

    for (const variant of variants) {
      const variantElement = page
        .locator(`[data-variant="${variant}"]`)
        .or(page.locator(`.${variant}`));
      if (await variantElement.isVisible()) {
        foundVariants++;
      }
    }

    if (foundVariants < 5) {
      return {
        name: 'loadingState',
        status: 'fail',
        duration: 0,
        message: `Only ${foundVariants}/5 variants found`,
      };
    }

    // Test fullscreen mode
    const fullscreenButton = page
      .locator('button:has-text("Fullscreen")')
      .or(page.locator('[data-fullscreen]'));
    if (await fullscreenButton.isVisible()) {
      await fullscreenButton.click();
      const fullscreenOverlay = page.locator('[role="status"]').locator('..').locator('fixed');
      const isFullscreen = await fullscreenOverlay.isVisible();
      if (!isFullscreen) {
        return {
          name: 'loadingState',
          status: 'warning',
          duration: 0,
          message: 'Fullscreen mode not working',
        };
      }
    }

    // Check accessibility
    const ariaLive = await page.locator('[aria-live="polite"]').count();
    const srOnly = await page.locator('.sr-only:has-text("Yükleniyor")').count();

    const screenshot = options.screenshot
      ? await captureScreenshot(page, 'loading-states')
      : undefined;

    return {
      name: 'loadingState',
      status: 'pass',
      duration: 0,
      message: `All variants rendered, accessibility: aria-live=${ariaLive}, sr-only=${srOnly}`,
      screenshot,
    };
  } catch (error) {
    return { name: 'loadingState', status: 'fail', duration: 0, message: error.message };
  }
}

async function testHydration(page: Page): Promise<TestResult> {
  try {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear());

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Wait for hydration to complete
    await page.waitForTimeout(2000);

    // Check for hydration errors in console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        (msg.text().includes('Hydration') ||
          msg.text().includes('hydration') ||
          msg.text().includes('mismatch'))
      ) {
        errors.push(msg.text());
      }
    });

    // Check if _hasHydrated is true
    const hasHydrated = await page.evaluate(() => {
      // Try to access Zustand store
      try {
        return (window as any).__ZUSTAND_STORE__?.auth?._hasHydrated === true;
      } catch {
        return null; // Can't access directly
      }
    });

    // Wait a bit more for any errors
    await page.waitForTimeout(1000);

    const screenshot = options.screenshot
      ? await captureScreenshot(page, 'hydration-test')
      : undefined;

    if (errors.length > 0) {
      return {
        name: 'hydration',
        status: 'fail',
        duration: 0,
        message: `Hydration errors detected: ${errors.join(', ')}`,
        screenshot,
        errors,
      };
    }

    return {
      name: 'hydration',
      status: 'pass',
      duration: 0,
      message: 'Hydration completed without errors',
      screenshot,
    };
  } catch (error) {
    return { name: 'hydration', status: 'fail', duration: 0, message: error.message };
  }
}

async function testNavigation(page: Page): Promise<TestResult> {
  try {
    await page.goto('http://localhost:3000/genel');
    await page.waitForLoadState('networkidle');

    // Navigate between pages
    const navLinks = page.locator('a[href*="/"]').all();
    const links = await navLinks;

    if (links.length === 0) {
      return {
        name: 'navigation',
        status: 'warning',
        duration: 0,
        message: 'No navigation links found',
      };
    }

    // Click first navigation link
    await links[0].click();
    await page.waitForLoadState('networkidle');

    // Check for Suspense loading states
    const suspenseFallback = page.locator('[data-suspense-fallback]');
    const hasSuspense = await suspenseFallback.isVisible();

    // Check for layout shift (basic check)
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.waitForTimeout(1000);
    const finalHeight = await page.evaluate(() => document.body.scrollHeight);
    const layoutShift = Math.abs(finalHeight - initialHeight);

    const screenshot = options.screenshot ? await captureScreenshot(page, 'navigation') : undefined;

    return {
      name: 'navigation',
      status: 'pass',
      duration: 0,
      message: `Navigation successful, Suspense: ${hasSuspense}, Layout shift: ${layoutShift}px`,
      screenshot,
    };
  } catch (error) {
    return { name: 'navigation', status: 'fail', duration: 0, message: error.message };
  }
}

async function testPerformance(page: Page): Promise<TestResult> {
  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      // Calculate FCP
      const fcp = paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0;

      // Calculate LCP (simplified)
      let lcp = 0;
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // Calculate TTI (simplified - when DOM is interactive)
      const tti = perf.domInteractive - perf.fetchStart;

      // Calculate CLS (simplified - check for layout shifts)
      let cls = 0;
      const layoutShifts = performance.getEntriesByType('layout-shift');
      layoutShifts.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      });

      return {
        fcp,
        lcp,
        tti,
        cls,
        loadTime: perf.loadEventEnd - perf.fetchStart,
      };
    });

    const performanceMetrics: PerformanceMetrics = {
      fcp: Math.round(metrics.fcp),
      lcp: Math.round(metrics.lcp),
      tti: Math.round(metrics.tti),
      cls: Math.round(metrics.cls * 1000) / 1000, // Round to 3 decimal places
      loadTime: Math.round(metrics.loadTime),
    };

    // Evaluate against targets
    const issues: string[] = [];
    if (performanceMetrics.fcp > 1800)
      issues.push(`FCP too slow: ${performanceMetrics.fcp}ms > 1800ms`);
    if (performanceMetrics.lcp > 2500)
      issues.push(`LCP too slow: ${performanceMetrics.lcp}ms > 2500ms`);
    if (performanceMetrics.tti > 3800)
      issues.push(`TTI too slow: ${performanceMetrics.tti}ms > 3800ms`);
    if (performanceMetrics.cls > 0.1) issues.push(`CLS too high: ${performanceMetrics.cls} > 0.1`);

    return {
      name: 'performance',
      status: issues.length > 0 ? 'warning' : 'pass',
      duration: performanceMetrics.loadTime,
      message: `FCP: ${performanceMetrics.fcp}ms, LCP: ${performanceMetrics.lcp}ms, TTI: ${performanceMetrics.tti}ms, CLS: ${performanceMetrics.cls}`,
      errors: issues.length > 0 ? issues : undefined,
    };
  } catch (error) {
    return { name: 'performance', status: 'fail', duration: 0, message: error.message };
  }
}

// Utility functions
async function captureScreenshot(page: Page, name: string): Promise<string> {
  const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(screenshotDir, filename);

  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

function generateReport(results: BrowserTestResults[]): CompatibilityReport {
  const totalTests = results.reduce((sum, r) => sum + r.summary.total, 0);
  const passedTests = results.reduce((sum, r) => sum + r.summary.passed, 0);
  const failedTests = results.reduce((sum, r) => sum + r.summary.failed, 0);
  const warningTests = results.reduce((sum, r) => sum + r.summary.warnings, 0);

  // Collect browser-specific issues
  const browserSpecificIssues: Record<string, string[]> = {};

  results.forEach((result) => {
    const issues: string[] = [];

    // Check for browser-specific patterns in failed tests
    result.tests.forEach((test) => {
      if (test.status === 'fail' || test.status === 'warning') {
        if (test.message?.includes('CSP') || test.message?.includes('Content Security Policy')) {
          issues.push('CSP violations detected');
        }
        if (test.message?.includes('localStorage') && result.browser === 'Firefox') {
          issues.push('Firefox localStorage timing issues');
        }
        if (test.message?.includes('viewport') || test.message?.includes('iOS')) {
          issues.push('Safari iOS viewport issues');
        }
        if (test.message?.includes('Touch') || test.message?.includes('touch')) {
          issues.push('Safari touch event handling');
        }
        if (test.message?.includes('QuotaExceededError')) {
          issues.push('Safari localStorage quota exceeded');
        }
      }
    });

    if (issues.length > 0) {
      browserSpecificIssues[result.browser] = [...new Set(issues)];
    }
  });

  return {
    timestamp: new Date().toISOString(),
    browsers: results,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      warningTests,
    },
    browserSpecificIssues,
  };
}

function saveReports(report: CompatibilityReport) {
  const resultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save JSON report
  const jsonPath = path.join(resultsDir, 'browser-compatibility-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report saved: ${jsonPath}`);

  // Generate HTML report
  const htmlPath = path.join(resultsDir, 'browser-compatibility-report.html');
  const htmlContent = generateHtmlReport(report);
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`🌐 HTML report saved: ${htmlPath}`);
}

function generateHtmlReport(report: CompatibilityReport): string {
  const browserRows = report.browsers
    .map((browser) => {
      const testRows = browser.tests
        .map(
          (test) => `
      <tr>
        <td>${test.name}</td>
        <td class="status-${test.status}">${test.status.toUpperCase()}</td>
        <td>${test.duration}ms</td>
        <td>${test.message || ''}</td>
      </tr>
    `
        )
        .join('');

      const perfRow = browser.performance
        ? `
      <tr>
        <td>Performance</td>
        <td class="status-info">METRICS</td>
        <td>-</td>
        <td>FCP: ${browser.performance.fcp}ms, LCP: ${browser.performance.lcp}ms, TTI: ${browser.performance.tti}ms, CLS: ${browser.performance.cls}</td>
      </tr>
    `
        : '';

      return `
      <h3>${browser.browser}</h3>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          ${testRows}
          ${perfRow}
        </tbody>
      </table>
      <p><strong>Summary:</strong> ${browser.summary.passed}/${browser.summary.total} passed</p>
    `;
    })
    .join('');

  const issuesSection =
    Object.keys(report.browserSpecificIssues).length > 0
      ? `
    <h2>Browser-Specific Issues</h2>
    ${Object.entries(report.browserSpecificIssues)
      .map(
        ([browser, issues]) => `
      <h3>${browser}</h3>
      <ul>
        ${issues.map((issue) => `<li>${issue}</li>`).join('')}
      </ul>
    `
      )
      .join('')}
  `
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Browser Compatibility Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .status-pass { color: green; }
    .status-fail { color: red; }
    .status-warning { color: orange; }
    .status-info { color: blue; }
    .summary { background-color: #e7f3ff; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Browser Compatibility Test Report</h1>
  <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Tests:</strong> ${report.summary.totalTests}</p>
    <p><strong>Passed:</strong> ${report.summary.passedTests}</p>
    <p><strong>Failed:</strong> ${report.summary.failedTests}</p>
    <p><strong>Warnings:</strong> ${report.summary.warningTests}</p>
  </div>
  
  <h2>Test Results by Browser</h2>
  ${browserRows}
  
  ${issuesSection}
</body>
</html>
  `;
}

// Run the tests
main().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
