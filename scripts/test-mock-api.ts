/**
 * CLI Mock API Testing Script
 * Tests mock API schema and functionality
 * Usage: npx tsx scripts/test-mock-api.ts [options]
 */

import { mockSchemaValidator } from '@/lib/testing/mock-schema-validator';
import { mockAPITester } from '@/lib/testing/mock-api-tester';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

interface CLIOptions {
  json: boolean;
  schemaOnly: boolean;
  functionalOnly: boolean;
  verbose: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  return {
    json: args.includes('--json'),
    schemaOnly: args.includes('--schema-only'),
    functionalOnly: args.includes('--functional-only'),
    verbose: args.includes('--verbose'),
  };
}

function printHeader() {
  console.log(`${colors.cyan}${colors.bold}🧪 Testing Mock API...${colors.reset}`);
  console.log('');
}

function printProgress(message: string) {
  console.log(`${colors.blue}⏳ ${message}${colors.reset}`);
}

function printSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function printError(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function printWarning(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function printInfo(message: string) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

async function runSchemaValidation(
  options: CLIOptions
): Promise<{ report: any; hasErrors: boolean }> {
  printProgress('Running schema validation...');
  const results = mockSchemaValidator.validateAllSchemas();
  const report = mockSchemaValidator.getSchemaValidationReport();

  if (options.json) {
    return { report, hasErrors: report.summary.invalidCollections > 0 };
  }

  console.log(`${colors.bold}📋 Schema Validation Results:${colors.reset}`);
  console.log('');

  Object.values(results).forEach((result) => {
    const status = result.isValid
      ? `${colors.green}✅ Valid${colors.reset}`
      : `${colors.red}❌ Invalid${colors.reset}`;
    console.log(`${colors.bold}${result.collection}:${colors.reset} ${status}`);

    if (!result.isValid) {
      if (result.missingFields.length > 0) {
        console.log(
          `  ${colors.red}Missing fields: ${result.missingFields.join(', ')}${colors.reset}`
        );
      }
      if (result.extraFields.length > 0) {
        console.log(
          `  ${colors.yellow}Extra fields: ${result.extraFields.join(', ')}${colors.reset}`
        );
      }
      result.mismatches.forEach((mismatch) => {
        console.log(
          `  ${colors.red}Field '${mismatch.field}': expected ${mismatch.expectedType}, got ${mismatch.actualType}${colors.reset}`
        );
        if (options.verbose && mismatch.suggestion) {
          console.log(`    ${colors.cyan}Suggestion: ${mismatch.suggestion}${colors.reset}`);
        }
      });
    } else if (options.verbose) {
      console.log(
        `  ${colors.green}All ${result.fieldsChecked} fields validated successfully${colors.reset}`
      );
    }
    console.log('');
  });

  if (report.recommendations.length > 0) {
    console.log(`${colors.bold}💡 Recommendations:${colors.reset}`);
    report.recommendations.forEach((rec) => console.log(`  • ${rec}`));
    console.log('');
  }

  return { report, hasErrors: report.summary.invalidCollections > 0 };
}

async function runFunctionalTests(
  options: CLIOptions
): Promise<{ report: any; hasErrors: boolean }> {
  printProgress('Running functional API tests...');
  const report = await mockAPITester.runAllTests();

  if (options.json) {
    return { report, hasErrors: report.failed > 0 };
  }

  console.log(`${colors.bold}🔧 Functional Test Results:${colors.reset}`);
  console.log('');

  report.results.forEach((result) => {
    const status = result.passed
      ? `${colors.green}✅ PASS${colors.reset}`
      : `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`${status} ${result.testName}`);
    if (!result.passed) {
      console.log(`    ${colors.red}${result.message}${colors.reset}`);
    } else if (options.verbose) {
      console.log(`    ${colors.green}${result.message}${colors.reset}`);
      if (result.duration) {
        console.log(`    ${colors.blue}Duration: ${result.duration}ms${colors.reset}`);
      }
    }
  });

  console.log('');
  console.log(`${colors.bold}📊 Summary:${colors.reset}`);
  console.log(`  Total: ${report.totalTests}`);
  console.log(`  ${colors.green}Passed: ${report.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${report.failed}${colors.reset}`);

  if (report.recommendations.length > 0) {
    console.log('');
    console.log(`${colors.bold}💡 Recommendations:${colors.reset}`);
    report.recommendations.forEach((rec) => console.log(`  • ${rec}`));
  }

  console.log('');
  return { report, hasErrors: report.failed > 0 };
}

async function main() {
  const options = parseArgs();

  if (!options.json) {
    printHeader();
  }

  let schemaErrors = false;
  let functionalErrors = false;
  let schemaReport: any = null;
  let functionalReport: any = null;

  if (!options.functionalOnly) {
    const result = await runSchemaValidation(options);
    schemaReport = result.report;
    schemaErrors = result.hasErrors;
  }

  if (!options.schemaOnly) {
    const result = await runFunctionalTests(options);
    functionalReport = result.report;
    functionalErrors = result.hasErrors;
  }

  if (options.json) {
    const output = {
      timestamp: new Date().toISOString(),
      schema: schemaReport,
      functional: functionalReport,
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    const totalErrors = (schemaErrors ? 1 : 0) + (functionalErrors ? 1 : 0);
    if (totalErrors === 0) {
      printSuccess('All tests passed!');
    } else {
      printError(`${totalErrors} test section(s) had errors.`);
    }
  }

  // Exit codes
  if (schemaErrors && functionalErrors) {
    process.exit(1); // Both failed
  } else if (schemaErrors) {
    process.exit(2); // Schema failed
  } else if (functionalErrors) {
    process.exit(1); // Functional failed
  } else {
    process.exit(0); // All passed
  }
}

// Export for programmatic use
export async function testMockAPI(options: Partial<CLIOptions> = {}): Promise<{
  schemaReport: any;
  functionalReport: any;
  hasErrors: boolean;
}> {
  const defaultOptions: CLIOptions = {
    json: false,
    schemaOnly: false,
    functionalOnly: false,
    verbose: false,
    ...options,
  };

  let schemaReport = null;
  let functionalReport = null;
  let hasErrors = false;

  if (!defaultOptions.functionalOnly) {
    const result = await runSchemaValidation(defaultOptions);
    schemaReport = result.report;
    hasErrors = hasErrors || result.hasErrors;
  }

  if (!defaultOptions.schemaOnly) {
    const result = await runFunctionalTests(defaultOptions);
    functionalReport = result.report;
    hasErrors = hasErrors || result.hasErrors;
  }

  return { schemaReport, functionalReport, hasErrors };
}

// Run main if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}
