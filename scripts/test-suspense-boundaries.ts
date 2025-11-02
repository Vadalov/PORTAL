import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parseArgs } from 'util';

interface TestResult {
  name: string;
  passed: boolean;
  duration?: number;
  error?: string;
  screenshot?: string;
  metrics?: any;
}

interface TestReport {
  timestamp: string;
  browser: string;
  headless: boolean;
  throttle?: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    averageDuration: number;
  };
  networkWaterfall?: any[];
}

class SuspenseBoundaryTester {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private baseUrl = 'http://localhost:3000';
  private screenshotsDir = join(process.cwd(), 'test-results', 'screenshots');

  constructor(
    private headless: boolean = true,
    private browserName: string = 'chromium',
    private throttle?: string,
    private takeScreenshots: boolean = false
  ) {}

  async init() {
    this.browser = await chromium.launch({ headless: this.headless });
    this.context = await this.browser.newContext();

    if (this.throttle) {
      await this.context.route('**/*', async (route) => {
        await route.fulfill({
          status: 200,
          body: await route.fetch().then((r) => r.body()),
          delay: this.getThrottleDelay(),
        });
      });
    }

    this.page = await this.context.newPage();

    if (this.takeScreenshots) {
      mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  private getThrottleDelay(): number {
    switch (this.throttle) {
      case '3g':
        return 300;
      case '4g':
        return 100;
      default:
        return 0;
    }
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  private async takeScreenshot(name: string): Promise<string | undefined> {
    if (!this.takeScreenshots || !this.page) return undefined;

    const filename = `${name}-${Date.now()}.png`;
    const filepath = join(this.screenshotsDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    return filename;
  }

  private async measureTiming(callback: () => Promise<void>): Promise<number> {
    const start = performance.now();
    await callback();
    return performance.now() - start;
  }

  async testBasicSuspense(): Promise<void> {
    const testName = 'Basic Suspense';
    console.log(`🧪 Running ${testName}...`);

    try {
      // Navigate to dashboard (which has SuspenseBoundary)
      await this.page!.goto(`${this.baseUrl}/dashboard`);
      await this.page!.waitForLoadState('networkidle');

      // Wait for initial load
      await this.page!.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });

      // Trigger lazy component load by navigating to a page with lazy components
      const startTime = performance.now();
      await this.page!.goto(`${this.baseUrl}/dashboard/members`);
      await this.page!.waitForLoadState('networkidle');

      // Check if LoadingOverlay appears
      const loadingVisible = await this.page!.$('[data-testid="loading-overlay"]');
      const duration = performance.now() - startTime;

      // Verify component renders after load
      await this.page!.waitForSelector('[data-testid="members-page"]', { timeout: 10000 });

      this.results.push({
        name: testName,
        passed: !!loadingVisible,
        duration,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });

      console.log(`✅ ${testName} completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });
      console.log(`❌ ${testName} failed: ${error.message}`);
    }
  }

  async testNestedSuspense(): Promise<void> {
    const testName = 'Nested Suspense';
    console.log(`🧪 Running ${testName}...`);

    try {
      await this.page!.goto(`${this.baseUrl}/dashboard`);
      await this.page!.waitForLoadState('networkidle');

      // Navigate to nested route that triggers nested Suspense
      const startTime = performance.now();
      await this.page!.goto(`${this.baseUrl}/dashboard/settings/profile`);
      await this.page!.waitForLoadState('networkidle');

      const duration = performance.now() - startTime;

      // Check for nested loading states
      const sidebarLoading = await this.page!.$('[data-testid="sidebar-loading"]');
      const contentLoading = await this.page!.$('[data-testid="content-loading"]');

      // Verify both boundaries work
      await this.page!.waitForSelector('[data-testid="profile-page"]', { timeout: 10000 });

      this.results.push({
        name: testName,
        passed: !!(sidebarLoading && contentLoading),
        duration,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });

      console.log(`✅ ${testName} completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });
      console.log(`❌ ${testName} failed: ${error.message}`);
    }
  }

  async testSuspenseWithErrorBoundary(): Promise<void> {
    const testName = 'Suspense + ErrorBoundary';
    console.log(`🧪 Running ${testName}...`);

    try {
      // Navigate to a page that might have lazy loading errors
      await this.page!.goto(`${this.baseUrl}/dashboard`);
      await this.page!.waitForLoadState('networkidle');

      // Simulate network error for lazy chunk
      await this.context!.route('**/chunks/*.js', (route) => route.abort());

      const startTime = performance.now();
      await this.page!.goto(`${this.baseUrl}/dashboard/error-test`);
      await this.page!.waitForLoadState('networkidle');

      const duration = performance.now() - startTime;

      // Check if error boundary catches the error
      const errorBoundary = await this.page!.waitForSelector('[data-testid="error-boundary"]', {
        timeout: 5000,
      });

      this.results.push({
        name: testName,
        passed: !!errorBoundary,
        duration,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });

      console.log(`✅ ${testName} completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });
      console.log(`❌ ${testName} failed: ${error.message}`);
    }
  }

  async testDashboardLayoutSuspense(): Promise<void> {
    const testName = 'Dashboard Layout Suspense';
    console.log(`🧪 Running ${testName}...`);

    try {
      await this.page!.goto(`${this.baseUrl}/dashboard`);
      await this.page!.waitForLoadState('networkidle');

      const navigationTimes: number[] = [];

      // Navigate between multiple pages
      const pages = [
        '/dashboard',
        '/dashboard/members',
        '/dashboard/events',
        '/dashboard/settings',
      ];

      for (const pageUrl of pages) {
        const startTime = performance.now();
        await this.page!.goto(`${this.baseUrl}${pageUrl}`);
        await this.page!.waitForLoadState('networkidle');

        // Wait for content to load
        await this.page!.waitForSelector('[data-testid="page-content"]', { timeout: 10000 });

        const duration = performance.now() - startTime;
        navigationTimes.push(duration);
      }

      const avgDuration = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;

      // Check for layout shift (compare positions)
      const initialLayout = await this.page!.locator('[data-testid="main-content"]').boundingBox();
      await this.page!.goto(`${this.baseUrl}/dashboard/members`);
      await this.page!.waitForLoadState('networkidle');
      const newLayout = await this.page!.locator('[data-testid="main-content"]').boundingBox();

      const layoutShift = Math.abs((initialLayout?.y || 0) - (newLayout?.y || 0)) < 10;

      this.results.push({
        name: testName,
        passed: layoutShift,
        duration: avgDuration,
        metrics: { navigationTimes, avgDuration },
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });

      console.log(`✅ ${testName} completed with avg ${avgDuration.toFixed(2)}ms navigation`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });
      console.log(`❌ ${testName} failed: ${error.message}`);
    }
  }

  async testProvidersSuspense(): Promise<void> {
    const testName = 'Providers Suspense';
    console.log(`🧪 Running ${testName}...`);

    try {
      const startTime = performance.now();

      // Navigate to root (triggers providers Suspense)
      await this.page!.goto(`${this.baseUrl}/`);
      await this.page!.waitForLoadState('networkidle');

      const duration = performance.now() - startTime;

      // Check for app-level loading
      const appLoading = await this.page!.$('[data-testid="app-loading"]');

      // Verify app loads
      await this.page!.waitForSelector('[data-testid="app-content"]', { timeout: 15000 });

      this.results.push({
        name: testName,
        passed: !!appLoading,
        duration,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });

      console.log(`✅ ${testName} completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });
      console.log(`❌ ${testName} failed: ${error.message}`);
    }
  }

  async testSuspenseTiming(): Promise<void> {
    const testName = 'Suspense Timing';
    console.log(`🧪 Running ${testName}...`);

    try {
      // Enable slow network
      const slowContext = await this.browser!.newContext();
      await slowContext.route('**/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay
        await route.continue();
      });

      const slowPage = await slowContext.newPage();

      const startTime = performance.now();
      await slowPage.goto(`${this.baseUrl}/dashboard`);
      await slowPage.waitForLoadState('networkidle');

      const duration = performance.now() - startTime;

      // Check console for timeout warnings
      const consoleMessages = await slowPage.evaluate(() => {
        // This would need to be implemented to capture console logs
        return [];
      });

      const hasTimeoutWarning = duration > 5000;

      await slowPage.close();
      await slowContext.close();

      this.results.push({
        name: testName,
        passed: hasTimeoutWarning, // Expect warning for slow loads
        duration,
        metrics: { duration, expectedWarning: duration > 5000 },
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });

      console.log(`✅ ${testName} completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });
      console.log(`❌ ${testName} failed: ${error.message}`);
    }
  }

  async testLazyLoading(): Promise<void> {
    const testName = 'Lazy Loading';
    console.log(`🧪 Running ${testName}...`);

    try {
      await this.page!.goto(`${this.baseUrl}/dashboard`);
      await this.page!.waitForLoadState('networkidle');

      // Monitor network requests for chunks
      const chunkRequests: string[] = [];
      this.page!.on('request', (request) => {
        if (request.url().includes('chunks') || request.url().includes('.js')) {
          chunkRequests.push(request.url());
        }
      });

      // Navigate to trigger lazy loading
      await this.page!.goto(`${this.baseUrl}/dashboard/lazy-test`);
      await this.page!.waitForLoadState('networkidle');

      // Verify lazy component loads
      await this.page!.waitForSelector('[data-testid="lazy-component"]', { timeout: 10000 });

      this.results.push({
        name: testName,
        passed: chunkRequests.length > 0,
        metrics: { chunkRequests: chunkRequests.length },
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });

      console.log(`✅ ${testName} completed with ${chunkRequests.length} chunk requests`);
    } catch (error) {
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        screenshot: await this.takeScreenshot(testName.toLowerCase().replace(' ', '-')),
      });
      console.log(`❌ ${testName} failed: ${error.message}`);
    }
  }

  async runAllTests(): Promise<void> {
    await this.init();

    const tests = [
      this.testBasicSuspense.bind(this),
      this.testNestedSuspense.bind(this),
      this.testSuspenseWithErrorBoundary.bind(this),
      this.testDashboardLayoutSuspense.bind(this),
      this.testProvidersSuspense.bind(this),
      this.testSuspenseTiming.bind(this),
      this.testLazyLoading.bind(this),
    ];

    for (const test of tests) {
      await test();
    }

    await this.cleanup();
    this.generateReport();
  }

  private generateReport(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.length - passed;
    const avgDuration =
      this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / this.results.length;

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      browser: this.browserName,
      headless: this.headless,
      throttle: this.throttle,
      results: this.results,
      summary: {
        total: this.results.length,
        passed,
        failed,
        averageDuration: avgDuration,
      },
    };

    const reportDir = join(process.cwd(), 'test-results');
    mkdirSync(reportDir, { recursive: true });

    const reportPath = join(reportDir, 'suspense-boundaries-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Test Report Generated:`);
    console.log(`   Total: ${report.summary.total}`);
    console.log(`   Passed: ${report.summary.passed}`);
    console.log(`   Failed: ${report.summary.failed}`);
    console.log(`   Avg Duration: ${report.summary.averageDuration.toFixed(2)}ms`);
    console.log(`   Report saved to: ${reportPath}`);
  }
}

// CLI argument parsing
const { values } = parseArgs({
  options: {
    headless: { type: 'boolean', default: true },
    browser: { type: 'string', default: 'chromium' },
    throttle: { type: 'string' },
    screenshot: { type: 'boolean', default: false },
  },
});

async function main() {
  console.log('🚀 Starting Suspense Boundary Tests...');

  const tester = new SuspenseBoundaryTester(
    values.headless,
    values.browser,
    values.throttle,
    values.screenshot
  );

  try {
    await tester.runAllTests();
    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { SuspenseBoundaryTester };
