#!/usr/bin/env tsx

/**
 * CLI Configuration Validation Script
 * Validates Appwrite environment configuration
 * Usage: npx tsx scripts/validate-config.ts [--json] [--strict] [--fix]
 */

import * as dotenv from 'dotenv';
import { getValidationReport, printValidationReport } from '@/lib/appwrite/validation';
import { getConfigStatus } from '@/lib/appwrite/config';

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
};

// Load environment variables from .env.local
function loadEnvironment() {
  try {
    dotenv.config({ path: '.env.local' });
  } catch (error) {
    console.warn(
      `${colors.yellow}⚠️  Warning: Could not load .env.local file. Using existing environment variables.${colors.reset}`
    );
  }
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    json: args.includes('--json'),
    strict: args.includes('--strict'),
    fix: args.includes('--fix'),
  };
}

// Print config status to console
function printConfigStatus(status: any) {
  console.log('\n📋 Configuration Status:');
  console.log(
    `  Valid: ${status.isValid ? `${colors.green}✅ Yes${colors.reset}` : `${colors.red}❌ No${colors.reset}`}`
  );
  if (status.warnings && status.warnings.length > 0) {
    console.log(`  Warnings: ${status.warnings.length}`);
    status.warnings.forEach((warning: string) =>
      console.log(`    ${colors.yellow}⚠️  ${warning}${colors.reset}`)
    );
  }
  if (status.errors && status.errors.length > 0) {
    console.log(`  Errors: ${status.errors.length}`);
    status.errors.forEach((error: string) =>
      console.log(`    ${colors.red}❌ ${error}${colors.reset}`)
    );
  }
  if (status.suggestions && status.suggestions.length > 0) {
    console.log('  Suggestions:');
    status.suggestions.forEach((suggestion: string) => console.log(`    💡 ${suggestion}`));
  }
}

// Print summary with pass/fail count
function printSummary(report: any) {
  const passes = report.summary.infos;
  const warnings = report.summary.warnings;
  const errors = report.summary.errors;
  const total = report.summary.total;

  console.log('\n📊 Summary:');
  console.log(`  ${colors.green}✅ Passes: ${passes}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
  console.log(`  ${colors.red}❌ Errors: ${errors}${colors.reset}`);
  console.log(`  Total Validations: ${total}`);

  if (errors === 0 && warnings === 0) {
    console.log(`${colors.green}🎉 All validations passed!${colors.reset}`);
  } else if (errors === 0) {
    console.log(`${colors.yellow}⚠️  Validations passed with warnings.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Validations failed with errors.${colors.reset}`);
  }

  console.log('\n🔗 For help with common issues, see: docs/CONFIGURATION-TROUBLESHOOTING.md');
}

// Handle --fix option (future enhancement)
function handleFix(report: any) {
  console.log('\n🔧 Fix mode is not yet implemented. Please manually apply suggestions above.');
  // Future: Add interactive prompts to fix issues
}

// Main function
async function main() {
  loadEnvironment();
  const { json, strict, fix } = parseArgs();

  console.log('🔍 Validating Appwrite Configuration...');

  const report = getValidationReport();
  const configStatus = getConfigStatus();

  if (json) {
    console.log(JSON.stringify({ report, configStatus }, null, 2));
  } else {
    printValidationReport(report);
    printConfigStatus(configStatus);
    printSummary(report);

    if (fix) {
      handleFix(report);
    }
  }

  // Determine exit code
  const hasErrors = report.summary.errors > 0;
  const hasWarnings = report.summary.warnings > 0;

  if (strict && hasErrors) {
    process.exit(1);
  } else if (hasErrors) {
    process.exit(1); // Exit with error if there are errors, regardless of strict mode
  } else {
    process.exit(0); // Exit successfully if no errors
  }
}

// Exported function for programmatic use
export function validateConfig() {
  loadEnvironment();
  return {
    report: getValidationReport(),
    configStatus: getConfigStatus(),
  };
}

// Run main if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}❌ Error running validation: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}
