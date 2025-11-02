/**
 * Comprehensive Environment Variable Validation Utility
 * Provides detailed validation for Appwrite configuration variables
 * Used by health endpoints, CLI tools, and debugging utilities
 */

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface ValidationResult {
  variable: string;
  isValid: boolean;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
}

export interface ValidationReport {
  results: ValidationResult[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    total: number;
  };
  timestamp: string;
}

/**
 * Validate all required environment variables from .env.example
 * Checks presence and format of critical Appwrite configuration variables
 */
export function validateEnvironmentVariables(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Required variables to check
  const requiredVars = [
    { key: 'NEXT_PUBLIC_APPWRITE_ENDPOINT', validator: validateAppwriteEndpoint },
    { key: 'NEXT_PUBLIC_APPWRITE_PROJECT_ID', validator: validateProjectId },
    { key: 'NEXT_PUBLIC_DATABASE_ID', validator: validateDatabaseId },
    { key: 'APPWRITE_API_KEY', validator: validateApiKey },
  ];

  for (const { key, validator } of requiredVars) {
    const value = process.env[key];
    const result = validator(value, key);
    results.push(result);
  }

  return results;
}

/**
 * Validate Appwrite endpoint URL format
 * Must start with http:// or https:// and end with /v1
 */
export function validateAppwriteEndpoint(
  value?: string,
  variableName = 'NEXT_PUBLIC_APPWRITE_ENDPOINT'
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} is not defined`,
      suggestion: `Set ${variableName} to your Appwrite endpoint URL (e.g., https://cloud.appwrite.io/v1)`,
    };
  }

  const trimmed = value.trim();

  // Check if it starts with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} must start with http:// or https://`,
      suggestion: `Add protocol to ${variableName}: https://${trimmed}`,
    };
  }

  // Check if it ends with /v1
  if (!trimmed.endsWith('/v1')) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} must end with /v1 (Appwrite API version)`,
      suggestion: `Append /v1 to ${variableName}: ${trimmed}/v1`,
    };
  }

  // Check for trailing slash before /v1
  if (trimmed.endsWith('//v1')) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: `${variableName} has double slash before /v1`,
      suggestion: `Remove extra slash: ${trimmed.replace('//v1', '/v1')}`,
    };
  }

  return {
    variable: variableName,
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: `${variableName} is valid`,
  };
}

/**
 * Validate Appwrite project ID format
 * Should be alphanumeric, typically 20-24 characters
 */
export function validateProjectId(
  value?: string,
  variableName = 'NEXT_PUBLIC_APPWRITE_PROJECT_ID'
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} is not defined`,
      suggestion: `Set ${variableName} to your Appwrite project ID (found in Appwrite console)`,
    };
  }

  const trimmed = value.trim();

  // Check if it's a placeholder
  if (trimmed === 'your-project-id' || trimmed.includes('placeholder')) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} appears to be a placeholder value`,
      suggestion: `Replace with actual project ID from Appwrite console`,
    };
  }

  // Check length (Appwrite project IDs are 20 characters)
  if (trimmed.length < 20 || trimmed.length > 24) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} should be 20-24 characters long`,
      suggestion: `Check project ID in Appwrite console - it should be 20 characters`,
    };
  }

  // Check alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} should contain only alphanumeric characters`,
      suggestion: `Project ID should only contain letters and numbers`,
    };
  }

  return {
    variable: variableName,
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: `${variableName} is valid`,
  };
}

/**
 * Validate Appwrite API key format
 * Should be a long base64-like string
 */
export function validateApiKey(
  value?: string,
  variableName = 'APPWRITE_API_KEY'
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} is not defined`,
      suggestion: `Set ${variableName} to your Appwrite API key (generate in Appwrite console)`,
    };
  }

  const trimmed = value.trim();

  // Check if it's a placeholder
  if (trimmed === 'your-api-key' || trimmed.includes('placeholder')) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} appears to be a placeholder value`,
      suggestion: `Replace with actual API key from Appwrite console`,
    };
  }

  // Check minimum length (Appwrite API keys are quite long)
  if (trimmed.length < 50) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} seems too short for an Appwrite API key`,
      suggestion: `API keys are typically 50+ characters. Check Appwrite console for correct key`,
    };
  }

  // Check if it looks like base64 (contains = at end, alphanumeric + some symbols)
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(trimmed)) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: `${variableName} does not appear to be a valid base64 string`,
      suggestion: `API keys should be base64 encoded. Regenerate if needed`,
    };
  }

  // Warn if it looks like a test/demo key
  if (trimmed.includes('demo') || trimmed.includes('test') || trimmed.length < 80) {
    return {
      variable: variableName,
      isValid: true,
      severity: ValidationSeverity.WARNING,
      message: `${variableName} may be a test or demo key`,
      suggestion: `For production, use a proper API key with appropriate permissions`,
    };
  }

  return {
    variable: variableName,
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: `${variableName} is valid`,
  };
}

/**
 * Validate database ID format
 * Should be alphanumeric with underscores allowed
 */
export function validateDatabaseId(
  value?: string,
  variableName = 'NEXT_PUBLIC_DATABASE_ID'
): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} is not defined`,
      suggestion: `Set ${variableName} to your Appwrite database ID`,
    };
  }

  const trimmed = value.trim();

  // Check if it's a placeholder
  if (trimmed === 'your-database-id' || trimmed.includes('placeholder')) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} appears to be a placeholder value`,
      suggestion: `Replace with actual database ID from Appwrite console`,
    };
  }

  // Check alphanumeric + underscores
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return {
      variable: variableName,
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: `${variableName} should contain only alphanumeric characters and underscores`,
      suggestion: `Database ID should only contain letters, numbers, and underscores`,
    };
  }

  return {
    variable: variableName,
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: `${variableName} is valid`,
  };
}

/**
 * Generate comprehensive validation report
 * Runs all validation functions and aggregates results
 */
export function getValidationReport(): ValidationReport {
  const results = validateEnvironmentVariables();
  const summary = {
    errors: results.filter((r) => r.severity === ValidationSeverity.ERROR).length,
    warnings: results.filter((r) => r.severity === ValidationSeverity.WARNING).length,
    infos: results.filter((r) => r.severity === ValidationSeverity.INFO).length,
    total: results.length,
  };

  return {
    results,
    summary,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Print validation report to console with colors and emojis
 * Groups by severity and includes quick fix suggestions
 */
export function printValidationReport(report: ValidationReport = getValidationReport()): void {
  console.log('🔍 Environment Variable Validation Report');
  console.log('==========================================');

  if (report.summary.errors > 0) {
    console.log(`❌ Errors: ${report.summary.errors}`);
    report.results
      .filter((r) => r.severity === ValidationSeverity.ERROR)
      .forEach((r) => {
        console.log(`  • ${r.message}`);
        if (r.suggestion) console.log(`    💡 ${r.suggestion}`);
      });
  }

  if (report.summary.warnings > 0) {
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    report.results
      .filter((r) => r.severity === ValidationSeverity.WARNING)
      .forEach((r) => {
        console.log(`  • ${r.message}`);
        if (r.suggestion) console.log(`    💡 ${r.suggestion}`);
      });
  }

  if (report.summary.infos > 0) {
    console.log(`ℹ️  Valid: ${report.summary.infos}`);
    report.results
      .filter((r) => r.severity === ValidationSeverity.INFO)
      .forEach((r) => {
        console.log(`  • ${r.message}`);
      });
  }

  console.log(
    `\n📊 Summary: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.infos} valid`
  );
  console.log(`⏰ Generated at: ${new Date(report.timestamp).toLocaleString()}`);
}
