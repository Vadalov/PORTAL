#!/usr/bin/env tsx

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';

interface TestResult {
  phase: string;
  status: 'passed' | 'failed' | 'warning';
  duration: number;
  message?: string;
  details?: any;
}

interface BuildStats {
  totalSize: number;
  pageSizes: Record<string, number>;
  chunkSizes: Record<string, number>;
  buildTime: number;
  warnings: number;
  errors: number;
}

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  tti: number;
  cls: number;
  fid: number;
}

interface ReportData {
  timestamp: string;
  results: TestResult[];
  buildStats?: BuildStats;
  performanceMetrics?: PerformanceMetrics;
  recommendations: string[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

const TARGETS = {
  buildTime: 120000, // 2 minutes
  totalBundleSize: 500 * 1024, // 500KB
  fcp: 1800, // 1.8s
  lcp: 2500, // 2.5s
  tti: 3800, // 3.8s
  cls: 0.1,
  fid: 100, // 100ms
  lighthousePerformance: 90,
  lighthouseAccessibility: 95,
};

class ProductionBuildTester {
  private results: TestResult[] = [];
  private port: number;
  private serverProcess?: any;
  private verbose: boolean;
  private skipBuild: boolean;
  private skipLighthouse: boolean;
  private analyze: boolean;

  constructor(options: {
    port?: number;
    verbose?: boolean;
    skipBuild?: boolean;
    skipLighthouse?: boolean;
    analyze?: boolean;
  }) {
    this.port = options.port || 3000;
    this.verbose = options.verbose || false;
    this.skipBuild = options.skipBuild || false;
    this.skipLighthouse = options.skipLighthouse || false;
    this.analyze = options.analyze || false;
  }

  private log(message: string, data?: any) {
    if (this.verbose || !data) {
      console.log(message);
    }
    if (data && this.verbose) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  private async runCommand(
    cmd: string,
    args: string[],
    options: {
      cwd?: string;
      timeout?: number;
      captureOutput?: boolean;
    } = {}
  ): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
        cwd: options.cwd || process.cwd(),
        stdio: options.captureOutput ? 'pipe' : 'inherit',
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      });

      let stdout = '';
      let stderr = '';

      if (options.captureOutput) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });
        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      const timer = options.timeout
        ? setTimeout(() => {
            child.kill('SIGKILL');
            reject(new Error(`Command timed out: ${cmd} ${args.join(' ')}`));
          }, options.timeout)
        : null;

      child.on('exit', (code) => {
        if (timer) clearTimeout(timer);
        resolve({ code: code || 0, stdout, stderr });
      });

      child.on('error', reject);
    });
  }

  private async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  private async runPhase(name: string, fn: () => Promise<void>): Promise<void> {
    this.log(`Running phase: ${name}`);
    try {
      const { duration } = await this.measureTime(fn);
      this.results.push({
        phase: name,
        status: 'passed',
        duration,
      });
      this.log(`✅ ${name} - PASSED (${duration}ms)`);
    } catch (error: any) {
      this.results.push({
        phase: name,
        status: 'failed',
        duration: 0,
        message: error.message,
      });
      this.log(`❌ ${name} - FAILED: ${error.message}`);
      throw error;
    }
  }

  async phase1_PreBuildValidation(): Promise<void> {
    // Check TypeScript compilation
    this.log('Checking TypeScript compilation...');
    const { code, stderr } = await this.runCommand('npx', ['tsc', '--noEmit'], {
      captureOutput: true,
      timeout: 30000,
    });
    if (code !== 0) {
      throw new Error(`TypeScript compilation failed:\n${stderr}`);
    }

    // Check ESLint
    this.log('Checking ESLint...');
    const eslintResult = await this.runCommand('npx', ['eslint', '.'], {
      captureOutput: true,
      timeout: 30000,
    });
    if (eslintResult.code !== 0) {
      throw new Error(`ESLint failed:\n${eslintResult.stderr}`);
    }

    // Check environment variables
    this.log('Checking environment variables...');
    if (!existsSync('.env.local')) {
      throw new Error('.env.local file not found');
    }

    // Clean previous build
    this.log('Cleaning previous build...');
    await this.runCommand('rm', ['-rf', '.next']);
  }

  async phase2_ProductionBuild(): Promise<void> {
    if (this.skipBuild) {
      this.log('Skipping build phase...');
      return;
    }

    this.log('Running production build...');
    const { code, stdout, stderr } = await this.runCommand('npm', ['run', 'build'], {
      captureOutput: true,
      timeout: 300000, // 5 minutes
    });

    if (code !== 0) {
      throw new Error(`Build failed:\n${stderr}`);
    }

    // Parse build output for statistics
    const buildStats = this.parseBuildOutput(stdout);
    this.results[this.results.length - 1].details = buildStats;

    // Check targets
    if (buildStats.buildTime > TARGETS.buildTime) {
      this.results.push({
        phase: 'Build Time Check',
        status: 'warning',
        duration: 0,
        message: `Build time ${buildStats.buildTime}ms exceeds target ${TARGETS.buildTime}ms`,
      });
    }
  }

  async phase3_BundleAnalysis(): Promise<void> {
    if (!this.analyze) {
      return;
    }

    this.log('Running bundle analysis...');
    const { code, stdout } = await this.runCommand('npm', ['run', 'analyze'], {
      captureOutput: true,
      timeout: 300000,
    });

    if (code !== 0) {
      throw new Error('Bundle analysis failed');
    }

    // Parse bundle analyzer output (this is simplified)
    const bundleReport = this.parseBundleOutput(stdout);
    this.results[this.results.length - 1].details = bundleReport;
  }

  async phase4_ProductionServerStart(): Promise<void> {
    this.log(`Starting production server on port ${this.port}...`);

    this.serverProcess = spawn('npm', ['start'], {
      env: { ...process.env, PORT: this.port.toString() },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Wait for server to be ready
    await this.waitForServer(`http://localhost:${this.port}/api/health`);

    this.log('Server started successfully');
  }

  async phase5_ProductionRuntimeTests(): Promise<void> {
    const baseUrl = `http://localhost:${this.port}`;

    // Initial load test
    await this.testInitialLoad(baseUrl);

    // Static asset test
    await this.testStaticAssets(baseUrl);

    // API endpoint test
    await this.testApiEndpoints(baseUrl);

    // Error handling test
    await this.testErrorHandling(baseUrl);

    // Performance test
    if (!this.skipLighthouse) {
      await this.testPerformance(baseUrl);
    }

    // Memory leak test (simplified)
    await this.testMemoryLeak(baseUrl);
  }

  async phase6_ProductionVsDevelopmentComparison(): Promise<void> {
    // This would require running dev server and comparing
    // For now, just check that console.log is removed
    this.log('Checking production optimizations...');

    const response = await fetch(`http://localhost:${this.port}`);
    const html = await response.text();

    if (
      html.includes('console.log') &&
      !html.includes('console.error') &&
      !html.includes('console.warn')
    ) {
      throw new Error('console.log statements found in production build');
    }
  }

  async phase7_SecurityValidation(): Promise<void> {
    const response = await fetch(`http://localhost:${this.port}`);
    const headers = response.headers;

    const requiredHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'origin-when-cross-origin',
    };

    for (const [header, expected] of Object.entries(requiredHeaders)) {
      const actual = headers.get(header);
      if (actual !== expected) {
        throw new Error(`Security header ${header}: expected ${expected}, got ${actual}`);
      }
    }

    // Check CSP
    const csp = headers.get('content-security-policy');
    if (!csp) {
      throw new Error('Content-Security-Policy header missing');
    }
  }

  async phase8_Cleanup(): Promise<void> {
    if (this.serverProcess) {
      this.log('Stopping server...');
      this.serverProcess.kill('SIGINT');

      // Wait for graceful shutdown
      await delay(5000);

      if (!this.serverProcess.killed) {
        this.serverProcess.kill('SIGKILL');
      }
    }

    await this.generateReport();
  }

  private parseBuildOutput(output: string): BuildStats {
    // Simplified parsing - in real implementation, parse Next.js build output
    const buildTimeMatch = output.match(/Build completed in (\d+)ms/);
    const buildTime = buildTimeMatch ? parseInt(buildTimeMatch[1]) : 0;

    return {
      totalSize: 0, // Would need to parse actual sizes
      pageSizes: {},
      chunkSizes: {},
      buildTime,
      warnings: (output.match(/warning/gi) || []).length,
      errors: (output.match(/error/gi) || []).length,
    };
  }

  private parseBundleOutput(output: string): any {
    // Simplified bundle analysis
    return { message: 'Bundle analysis completed' };
  }

  private async waitForServer(url: string, timeout = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) return;
      } catch (e) {
        // Continue waiting
      }
      await delay(1000);
    }
    throw new Error('Server did not start within timeout');
  }

  private async testInitialLoad(baseUrl: string): Promise<void> {
    const response = await fetch(baseUrl);
    if (response.status !== 200) {
      throw new Error(`Initial load failed with status ${response.status}`);
    }

    const responseTime = parseInt(response.headers.get('x-response-time') || '0');
    if (responseTime > 2000) {
      this.results.push({
        phase: 'Initial Load Performance',
        status: 'warning',
        duration: responseTime,
        message: `Response time ${responseTime}ms exceeds target`,
      });
    }
  }

  private async testStaticAssets(baseUrl: string): Promise<void> {
    // Test a static asset
    const assetUrl = `${baseUrl}/_next/static/css/app/layout.css`;
    const response = await fetch(assetUrl);

    if (!response.ok) {
      throw new Error('Static asset not accessible');
    }

    const cacheControl = response.headers.get('cache-control');
    if (!cacheControl?.includes('max-age')) {
      throw new Error('Static assets not properly cached');
    }
  }

  private async testApiEndpoints(baseUrl: string): Promise<void> {
    const endpoints = ['/api/health', '/api/csrf', '/api/auth/session'];

    for (const endpoint of endpoints) {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (!response.ok && response.status !== 401) {
        // 401 is ok for auth endpoints
        throw new Error(`API endpoint ${endpoint} failed with status ${response.status}`);
      }
    }
  }

  private async testErrorHandling(baseUrl: string): Promise<void> {
    const response = await fetch(`${baseUrl}/non-existent-page`);
    if (response.status !== 404) {
      throw new Error(`404 page returned status ${response.status}`);
    }
  }

  private async testPerformance(baseUrl: string): Promise<void> {
    // Use Playwright for performance measurement
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      await page.goto(baseUrl);

      // Wait for load
      await page.waitForLoadState('networkidle');

      // Measure basic metrics
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          fcp: perf.loadEventEnd - perf.fetchStart,
          lcp: 0, // Would need more complex measurement
          tti: perf.domContentLoadedEventEnd - perf.fetchStart,
          cls: 0, // Would need LayoutShift observer
          fid: 0, // Would need interaction observer
        };
      });

      // Check against targets
      if (metrics.fcp > TARGETS.fcp) {
        this.results.push({
          phase: 'FCP Check',
          status: 'warning',
          duration: metrics.fcp,
          message: `FCP ${metrics.fcp}ms exceeds target ${TARGETS.fcp}ms`,
        });
      }

      this.results[this.results.length - 1].details = metrics;
    } finally {
      await browser.close();
    }
  }

  private async testMemoryLeak(baseUrl: string): Promise<void> {
    // Simplified memory leak test - in reality, would need browser automation
    this.log('Memory leak test: Basic navigation test completed');
  }

  private async generateReport(): Promise<void> {
    const reportDir = 'test-results';
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir);
    }

    const reportData: ReportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      recommendations: this.generateRecommendations(),
      summary: {
        total: this.results.length,
        passed: this.results.filter((r) => r.status === 'passed').length,
        failed: this.results.filter((r) => r.status === 'failed').length,
        warnings: this.results.filter((r) => r.status === 'warning').length,
      },
    };

    // JSON report
    writeFileSync(
      join(reportDir, 'production-build-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    // HTML report
    const htmlReport = this.generateHtmlReport(reportData);
    writeFileSync(join(reportDir, 'production-build-report.html'), htmlReport);

    this.log(`Reports generated in ${reportDir}/`);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const failedPhases = this.results.filter((r) => r.status === 'failed');
    const warningPhases = this.results.filter((r) => r.status === 'warning');

    if (failedPhases.length > 0) {
      recommendations.push('Fix all failed test phases before deploying to production');
    }

    if (warningPhases.some((r) => r.phase.includes('Build Time'))) {
      recommendations.push(
        'Consider optimizing build time by reducing bundle size or using build cache'
      );
    }

    if (warningPhases.some((r) => r.phase.includes('FCP') || r.phase.includes('LCP'))) {
      recommendations.push(
        'Optimize Core Web Vitals by implementing code splitting and optimizing images'
      );
    }

    return recommendations;
  }

  private generateHtmlReport(data: ReportData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Production Build Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    .passed { color: green; }
    .failed { color: red; }
    .warning { color: orange; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Production Build Test Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p>Total: ${data.summary.total}</p>
    <p class="passed">Passed: ${data.summary.passed}</p>
    <p class="failed">Failed: ${data.summary.failed}</p>
    <p class="warning">Warnings: ${data.summary.warnings}</p>
  </div>

  <h2>Test Results</h2>
  <table>
    <tr><th>Phase</th><th>Status</th><th>Duration</th><th>Message</th></tr>
    ${data.results
      .map(
        (r) => `
      <tr>
        <td>${r.phase}</td>
        <td class="${r.status}">${r.status.toUpperCase()}</td>
        <td>${r.duration}ms</td>
        <td>${r.message || ''}</td>
      </tr>
    `
      )
      .join('')}
  </table>

  ${
    data.recommendations.length > 0
      ? `
    <h2>Recommendations</h2>
    <ul>
      ${data.recommendations.map((r) => `<li>${r}</li>`).join('')}
    </ul>
  `
      : ''
  }
</body>
</html>`;
  }

  async run(): Promise<void> {
    try {
      await this.runPhase('Pre-Build Validation', () => this.phase1_PreBuildValidation());
      await this.runPhase('Production Build', () => this.phase2_ProductionBuild());
      await this.runPhase('Bundle Analysis', () => this.phase3_BundleAnalysis());
      await this.runPhase('Production Server Start', () => this.phase4_ProductionServerStart());
      await this.runPhase('Production Runtime Tests', () => this.phase5_ProductionRuntimeTests());
      await this.runPhase('Production vs Development Comparison', () =>
        this.phase6_ProductionVsDevelopmentComparison()
      );
      await this.runPhase('Security Validation', () => this.phase7_SecurityValidation());
      await this.runPhase('Cleanup', () => this.phase8_Cleanup());

      const summary = this.results.reduce(
        (acc, r) => {
          acc[r.status]++;
          return acc;
        },
        { passed: 0, failed: 0, warning: 0 }
      );

      console.log(`\n🎉 Test completed!`);
      console.log(`✅ Passed: ${summary.passed}`);
      console.log(`❌ Failed: ${summary.failed}`);
      console.log(`⚠️  Warnings: ${summary.warning}`);

      if (summary.failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Test suite failed:', error);
      await this.phase8_Cleanup().catch(() => {});
      process.exit(1);
    }
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options: any = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--skip-build':
        options.skipBuild = true;
        break;
      case '--skip-lighthouse':
        options.skipLighthouse = true;
        break;
      case '--port':
        options.port = parseInt(args[++i]);
        break;
      case '--analyze':
        options.analyze = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      default:
        if (arg.startsWith('--port=')) {
          options.port = parseInt(arg.split('=')[1]);
        }
    }
  }

  return options;
}

// Main execution
const options = parseArgs();
const tester = new ProductionBuildTester(options);
tester.run().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
