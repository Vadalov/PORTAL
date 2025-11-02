#!/usr/bin/env tsx

import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  metrics?: Record<string, any>;
  screenshot?: string;
}

interface TestReport {
  timestamp: string;
  browser: string;
  headless: boolean;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

class LoadingStatesTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private baseUrl = 'http://localhost:3000';

  constructor(
    private browserName: 'chromium' | 'firefox' | 'webkit',
    private headless: boolean,
    private takeScreenshots: boolean,
    private runPerformance: boolean
  ) {}

  async init() {
    this.browser = await { chromium, firefox, webkit }[this.browserName].launch({
      headless: this.headless,
    });
    this.page = await this.browser.newPage();
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  async runTests(): Promise<TestReport> {
    await this.init();

    try {
      // Navigate to test page
      await this.page!.goto(`${this.baseUrl}/test-loading-states`);
      await this.page!.waitForLoadState('networkidle');

      // Test 1: All Variants Render
      await this.testAllVariantsRender();

      // Test 2: Size Variations
      await this.testSizeVariations();

      // Test 3: Fullscreen Mode
      await this.testFullscreenMode();

      // Test 4: Accessibility
      await this.testAccessibility();

      // Test 5: Motion Reduce
      await this.testMotionReduce();

      // Test 6: Auth Loading
      await this.testAuthLoading();

      // Test 7: Hydration Loading
      await this.testHydrationLoading();

      if (this.runPerformance) {
        // Additional performance tests
        await this.testPerformanceMetrics();
      }
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      await this.cleanup();
    }

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      browser: this.browserName,
      headless: this.headless,
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter((r) => r.passed).length,
        failed: this.results.filter((r) => !r.passed).length,
      },
    };

    return report;
  }

  private async testAllVariantsRender() {
    const variants = ['spinner', 'dots', 'pulse', 'bars', 'ripple'];

    for (const variant of variants) {
      try {
        // Select variant in dropdown or trigger
        await this.page!.selectOption('[data-testid="variant-select"]', variant);
        await this.page!.waitForTimeout(500); // Wait for animation

        // Check if variant renders
        const variantElement = await this.page!.locator(`[data-variant="${variant}"]`);
        const isVisible = await variantElement.isVisible();

        let screenshot: string | undefined;
        if (this.takeScreenshots) {
          screenshot = `variant-${variant}.png`;
          await this.page!.screenshot({ path: join('test-results', screenshot) });
        }

        this.results.push({
          name: `Variant Render: ${variant}`,
          passed: isVisible,
          screenshot,
        });
      } catch (error) {
        this.results.push({
          name: `Variant Render: ${variant}`,
          passed: false,
          error: error.message,
        });
      }
    }
  }

  private async testSizeVariations() {
    const sizes = ['sm', 'md', 'lg'];

    for (const size of sizes) {
      try {
        await this.page!.selectOption('[data-testid="size-select"]', size);
        await this.page!.waitForTimeout(500);

        // Check dimensions
        const overlay = await this.page!.locator('.loading-overlay');
        const boundingBox = await overlay.boundingBox();

        // Verify proportional scaling (md is 48px, sm 32px, lg 64px)
        const expectedSizes = { sm: 32, md: 48, lg: 64 };
        const expectedSize = expectedSizes[size];

        this.results.push({
          name: `Size Variation: ${size}`,
          passed: boundingBox?.width === expectedSize,
          metrics: { actualWidth: boundingBox?.width, expectedWidth: expectedSize },
        });
      } catch (error) {
        this.results.push({
          name: `Size Variation: ${size}`,
          passed: false,
          error: error.message,
        });
      }
    }
  }

  private async testFullscreenMode() {
    try {
      await this.page!.check('[data-testid="fullscreen-checkbox"]');
      await this.page!.waitForTimeout(500);

      // Check if overlay covers viewport
      const overlay = await this.page!.locator('.loading-overlay');
      const viewport = this.page!.viewportSize()!;
      const boundingBox = await overlay.boundingBox();

      const coversViewport =
        boundingBox?.width === viewport.width && boundingBox?.height === viewport.height;

      // Check backdrop blur
      const hasBackdropBlur = await overlay.evaluate((el) =>
        window.getComputedStyle(el).backdropFilter.includes('blur')
      );

      this.results.push({
        name: 'Fullscreen Mode',
        passed: coversViewport && hasBackdropBlur,
        metrics: { coversViewport, hasBackdropBlur },
      });
    } catch (error) {
      this.results.push({
        name: 'Fullscreen Mode',
        passed: false,
        error: error.message,
      });
    }
  }

  private async testAccessibility() {
    try {
      const overlay = await this.page!.locator('.loading-overlay');

      // Check role="status"
      const role = await overlay.getAttribute('role');
      const hasRoleStatus = role === 'status';

      // Check aria-live="polite"
      const ariaLive = await overlay.getAttribute('aria-live');
      const hasAriaLivePolite = ariaLive === 'polite';

      // Check screen reader text
      const srText = await overlay.locator('.sr-only').textContent();
      const hasSrText = srText?.includes('Yükleniyor');

      this.results.push({
        name: 'Accessibility',
        passed: hasRoleStatus && hasAriaLivePolite && hasSrText,
        metrics: { hasRoleStatus, hasAriaLivePolite, hasSrText },
      });
    } catch (error) {
      this.results.push({
        name: 'Accessibility',
        passed: false,
        error: error.message,
      });
    }
  }

  private async testMotionReduce() {
    try {
      // Enable prefers-reduced-motion
      await this.page!.emulateMedia({ reducedMotion: 'reduce' });
      await this.page!.waitForTimeout(500);

      // Check if animations are disabled
      const hasMotionReduce = await this.page!.evaluate(() => {
        const overlay = document.querySelector('.loading-overlay');
        return (
          window.getComputedStyle(overlay!).animationName === 'none' ||
          overlay!.classList.contains('motion-reduce')
        );
      });

      this.results.push({
        name: 'Motion Reduce',
        passed: hasMotionReduce,
      });
    } catch (error) {
      this.results.push({
        name: 'Motion Reduce',
        passed: false,
        error: error.message,
      });
    }
  }

  private async testAuthLoading() {
    try {
      // Navigate to dashboard
      await this.page!.goto(`${this.baseUrl}/dashboard`);
      await this.page!.waitForLoadState('networkidle');

      // Check if LoadingOverlay appears
      const loadingOverlay = await this.page!.locator('.loading-overlay');
      const isVisible = await loadingOverlay.isVisible();

      // Wait for auth to complete
      await this.page!.waitForSelector('.loading-overlay', { state: 'hidden', timeout: 10000 });

      // Measure duration
      const startTime = Date.now();
      await this.page!.waitForSelector('.loading-overlay', { state: 'visible' });
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.results.push({
        name: 'Auth Loading',
        passed: isVisible,
        metrics: { duration },
      });
    } catch (error) {
      this.results.push({
        name: 'Auth Loading',
        passed: false,
        error: error.message,
      });
    }
  }

  private async testHydrationLoading() {
    try {
      // Clear localStorage
      await this.page!.evaluate(() => localStorage.clear());

      // Reload page
      await this.page!.reload();
      await this.page!.waitForLoadState('networkidle');

      // Check hydration loading
      const startTime = Date.now();
      await this.page!.waitForFunction(
        () => {
          const store = (window as any).__AUTH_STORE__;
          return store?.getState()._hasHydrated === true;
        },
        { timeout: 10000 }
      );
      const endTime = Date.now();
      const hydrationTime = endTime - startTime;

      this.results.push({
        name: 'Hydration Loading',
        passed: true,
        metrics: { hydrationTime },
      });
    } catch (error) {
      this.results.push({
        name: 'Hydration Loading',
        passed: false,
        error: error.message,
      });
    }
  }

  private async testPerformanceMetrics() {
    try {
      // Measure render time
      const renderTime = await this.page!.evaluate(() => {
        const start = performance.now();
        // Trigger re-render
        const event = new Event('resize');
        window.dispatchEvent(event);
        return performance.now() - start;
      });

      // Measure FPS (simplified)
      const fps = await this.page!.evaluate(() => {
        let frames = 0;
        const start = performance.now();
        return new Promise<number>((resolve) => {
          const measure = () => {
            frames++;
            if (performance.now() - start >= 1000) {
              resolve(frames);
            } else {
              requestAnimationFrame(measure);
            }
          };
          requestAnimationFrame(measure);
        });
      });

      // Memory usage
      const memoryUsage = await this.page!.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return null;
      });

      this.results.push({
        name: 'Performance Metrics',
        passed: renderTime < 16.67 && fps >= 50, // 60fps target
        metrics: { renderTime, fps, memoryUsage },
      });
    } catch (error) {
      this.results.push({
        name: 'Performance Metrics',
        passed: false,
        error: error.message,
      });
    }
  }
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('headless', {
      type: 'boolean',
      default: true,
      description: 'Run in headless mode',
    })
    .option('browser', {
      type: 'string',
      default: 'chromium',
      choices: ['chromium', 'firefox', 'webkit'],
      description: 'Browser to use',
    })
    .option('screenshot', {
      type: 'boolean',
      default: false,
      description: 'Capture screenshots',
    })
    .option('performance', {
      type: 'boolean',
      default: false,
      description: 'Run performance tests',
    })
    .parseSync();

  const tester = new LoadingStatesTester(
    argv.browser as 'chromium' | 'firefox' | 'webkit',
    argv.headless,
    argv.screenshot,
    argv.performance
  );

  console.log(
    `Running loading states tests with ${argv.browser} (${argv.headless ? 'headless' : 'headed'})`
  );

  const report = await tester.runTests();

  // Ensure test-results directory exists
  mkdirSync('test-results', { recursive: true });

  // Write report
  writeFileSync('test-results/loading-states-report.json', JSON.stringify(report, null, 2));

  console.log(`Tests completed. ${report.summary.passed}/${report.summary.total} passed.`);
  console.log('Report saved to test-results/loading-states-report.json');

  process.exit(report.summary.failed > 0 ? 1 : 0);
}

main().catch(console.error);
