#!/usr/bin/env tsx

/**
 * Comprehensive Appwrite Diagnostics Script
 * One-stop diagnostic tool for all Appwrite configuration and connectivity issues
 * 
 * Usage:
 *   npx tsx scripts/diagnose-appwrite.ts [options]
 *   npm run diagnose [options]
 * 
 * Options:
 *   --json              Output as JSON instead of formatted text
 *   --save <file>       Save report to specified file
 *   --section <name>    Run specific section only (config, connectivity, mock, sdk, health)
 * 
 * Exit Codes:
 *   0: All checks passed or only warnings
 *   1: Critical issues found
 */

import * as dotenv from 'dotenv';
import { getValidationReport, printValidationReport } from '../src/lib/appwrite/validation';
import { connectivityTester } from '../src/lib/appwrite/connectivity-test';
import { mockSchemaValidator } from '../src/lib/testing/mock-schema-validator';
import { mockAPITester } from '../src/lib/testing/mock-api-tester';
import { getConfigStatus } from '../src/lib/appwrite/config';
import { getSDKUsageReport } from '../src/lib/appwrite/sdk-guard';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Parse command line arguments
const args = process.argv.slice(2);
let jsonOutput = false;
let saveFile: string | null = null;
let section: string | null = null;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--json':
      jsonOutput = true;
      break;
    case '--save':
      saveFile = args[i + 1];
      i++; // Skip next arg
      break;
    case '--section':
      section = args[i + 1];
      i++; // Skip next arg
      break;
  }
}

/**
 * Main diagnostics function
 */
async function main() {
  console.log('🔬 Appwrite Comprehensive Diagnostics');
  console.log('=====================================');

  const results: any = {};
  let overallScore = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Section 1: Environment Configuration
  if (!section || section === 'config') {
    console.log('\n📋 Section 1: Environment Configuration');
    
    const configStatus = getConfigStatus();
    results.config = configStatus;
    
    if (!configStatus.isValid) {
      overallScore -= 50;
      issues.push(...configStatus.errors);
      recommendations.push(...configStatus.suggestions.map((s: any) => s.suggestion));
    }
    
    if (configStatus.warnings.length > 0) {
      overallScore -= 10;
      issues.push(...configStatus.warnings);
    }
    
    if (!jsonOutput) {
      printValidationReport();
    }
  }

  // Section 2: Connectivity Tests
  const provider = process.env.BACKEND_PROVIDER || 'appwrite';
  if ((!section || section === 'connectivity') && provider === 'appwrite') {
    console.log('\n🔌 Section 2: Connectivity Tests');
    
    try {
      const connectivityReport = await connectivityTester.getConnectivityReport();
      results.connectivity = connectivityReport;
      
      if (connectivityReport.summary.failedTests > 0) {
        overallScore -= 30;
        issues.push(`Connectivity: ${connectivityReport.summary.failedTests} failed tests`);
        recommendations.push(...connectivityReport.recommendations);
      }
      
      if (!jsonOutput) {
        console.log(`Endpoint: ${connectivityReport.endpoint}`);
        console.log(`Overall Health: ${connectivityReport.summary.overallHealth}%`);
        console.log(`Tests: ${connectivityReport.summary.successfulTests}/${connectivityReport.summary.totalTests} passed`);
      }
    } catch (error: any) {
      overallScore -= 30;
      issues.push(`Connectivity test failed: ${  error.message}`);
    }
  }

  // Section 3: Mock API Tests
  if ((!section || section === 'mock') && provider === 'mock') {
    console.log('\n🧪 Section 3: Mock API Tests');
    
    const schemaReport = mockSchemaValidator.getSchemaValidationReport();
    results.mockSchema = schemaReport;
    
    if (schemaReport.summary.invalidCollections > 0) {
      overallScore -= 20;
      issues.push(`Mock Schema: ${schemaReport.summary.invalidCollections} invalid collections`);
      recommendations.push(...schemaReport.recommendations);
    }
    
    const apiReport = await mockAPITester.runAllTests();
    results.mockAPI = apiReport;
    
    if (apiReport.failed > 0) {
      overallScore -= 20;
      issues.push(`Mock API: ${apiReport.failed} failed tests`);
      recommendations.push(...apiReport.recommendations);
    }
    
    if (!jsonOutput) {
      console.log(`Schema: ${schemaReport.summary.validCollections}/${schemaReport.summary.totalCollections} valid`);
      console.log(`API Tests: ${apiReport.passed}/${apiReport.totalTests} passed`);
    }
  }

  // Section 4: SDK Usage Check
  if (!section || section === 'sdk') {
    console.log('\n🔧 Section 4: SDK Usage Check');
    
    const sdkReport = getSDKUsageReport();
    results.sdk = sdkReport;
    
    if (sdkReport.count > 0) {
      overallScore -= 10;
      issues.push(`SDK: ${sdkReport.count} usage violations`);
      recommendations.push(...sdkReport.suggestions);
    }
    
    if (!jsonOutput) {
      console.log(`Violations: ${sdkReport.count}`);
      sdkReport.violations.forEach((v: any) => console.log(`  - ${v.message}`));
    }
  }

  // Section 5: Health Check
  if (!section || section === 'health') {
    console.log('\n❤️ Section 5: Health Check');
    
    try {
      const response = await fetch('http://localhost:3000/api/health?detailed=true');
      const healthData = await response.json();
      results.health = healthData;
      
      if (!healthData.healthy) {
        overallScore -= 40;
        issues.push('Health check failed');
        if (healthData.recommendations) {
          recommendations.push(...healthData.recommendations);
        }
      }
      
      if (!jsonOutput) {
        console.log(`Status: ${healthData.healthy ? 'Healthy' : 'Unhealthy'}`);
      }
    } catch (error: any) {
      overallScore -= 40;
      issues.push(`Health check error: ${  error.message}`);
    }
  }

  // Generate comprehensive report
  overallScore = Math.max(0, overallScore);
  
  const report = {
    timestamp: new Date().toISOString(),
    overallHealthScore: overallScore,
    issues,
    recommendations: [...new Set(recommendations)], // Remove duplicates
    quickFixCommands: [
      'npm run validate:config',
      'npm run test:connectivity',
      'npm run test:mock-api',
      'npm run diagnose',
      'npm run health:check'
    ],
    documentationLinks: [
      'docs/APPWRITE_SETUP.md',
      'docs/CONFIGURATION-TROUBLESHOOTING.md'
    ],
    results,
    environment: {
      nodeVersion: process.version,
      provider,
      platform: process.platform,
    }
  };

  // Output report
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('\n📊 Overall Report');
    console.log(`Health Score: ${overallScore}/100`);
    console.log(`Issues Found: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log('\nIssues:');
      issues.forEach(issue => console.log(`  ❌ ${issue}`));
    }
    
    if (recommendations.length > 0) {
      console.log('\nRecommendations:');
      recommendations.forEach(rec => console.log(`  💡 ${rec}`));
    }
    
    console.log('\nQuick Fix Commands:');
    report.quickFixCommands.forEach(cmd => console.log(`  • ${cmd}`));
    
    console.log('\nDocumentation:');
    report.documentationLinks.forEach(link => console.log(`  📖 ${link}`));
  }

  // Save report if requested
  if (saveFile) {
    const fs = require('fs');
    fs.writeFileSync(saveFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to ${saveFile}`);
  }

  // Handle exit codes
  const hasCriticalIssues = issues.some((issue: string) => 
    issue.toLowerCase().includes('error') || 
    issue.toLowerCase().includes('failed') || 
    issue.toLowerCase().includes('invalid')
  );
  
  if (hasCriticalIssues) {
    process.exit(1);
  } else if (issues.length > 0) {
    process.exit(0); // Warnings only
  } else {
    process.exit(0); // All good
  }
}

// Run diagnostics
main().catch((error) => {
  console.error('❌ Diagnostics failed:', error.message);
  process.exit(1);
});