/**
 * SDK Usage Validation Guard
 * Prevents common mistakes of using client SDK on server or vice versa
 *
 * This utility provides runtime checks to ensure Appwrite SDKs are used
 * in the correct environment (browser vs server). It helps catch development
 * errors early and provides warnings for production debugging.
 *
 * @packageDocumentation
 */

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

type SDKViolation = {
  type: 'client' | 'server';
  location?: string;
  message: string;
  timestamp: Date;
};

type SDKUsageReport = {
  violations: SDKViolation[];
  count: number;
  suggestions: string[];
};

/**
 * SDK Guard class for tracking and validating SDK usage
 */
class SDKGuard {
  private violations: SDKViolation[] = [];

  /**
   * Validate that client SDK is used in browser environment
   * @param strict - If true, throws error instead of warning
   * @returns Validation result
   */
  validateClientSDKUsage(strict?: boolean): ValidationResult {
    const isBrowser = typeof window !== 'undefined';
    const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
    const strictMode = strict ?? isProduction;

    if (!isBrowser) {
      const message = 'Client SDK used on server. Use server SDK instead.';
      const violation: SDKViolation = {
        type: 'client',
        message,
        timestamp: new Date(),
      };
      this.violations.push(violation);

      console.warn(`⚠️ ${message}`);

      if (strictMode) {
        throw new Error(message);
      }

      return { isValid: false, errors: [message], warnings: [] };
    }

    return { isValid: true, errors: [], warnings: [] };
  }

  /**
   * Validate that server SDK is used in server environment
   * @param strict - If true, throws error instead of warning
   * @returns Validation result
   */
  validateServerSDKUsage(strict?: boolean): ValidationResult {
    const isServer = typeof window === 'undefined';
    const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
    const strictMode = strict ?? isProduction;

    if (!isServer) {
      const message = 'Server SDK used in browser. Use client SDK instead.';
      const violation: SDKViolation = {
        type: 'server',
        message,
        timestamp: new Date(),
      };
      this.violations.push(violation);

      console.warn(`⚠️ ${message}`);

      if (strictMode) {
        throw new Error(message);
      }

      return { isValid: false, errors: [message], warnings: [] };
    }

    return { isValid: true, errors: [], warnings: [] };
  }

  /**
   * Warn if wrong SDK type is detected for current environment
   * @param sdkType - The SDK type being used
   * @param importPath - Optional import path for better error messages
   */
  warnIfWrongSDK(sdkType: 'client' | 'server', importPath?: string): void {
    const isBrowser = typeof window !== 'undefined';
    const isServer = !isBrowser;

    if (sdkType === 'client' && isServer) {
      const message = `Client SDK imported on server${importPath ? ` from ${importPath}` : ''}. Use server SDK instead.`;
      const violation: SDKViolation = {
        type: 'client',
        location: importPath,
        message,
        timestamp: new Date(),
      };
      this.violations.push(violation);
      console.warn(`⚠️ ${message}`);
    } else if (sdkType === 'server' && isBrowser) {
      const message = `Server SDK imported in browser${importPath ? ` from ${importPath}` : ''}. Use client SDK instead.`;
      const violation: SDKViolation = {
        type: 'server',
        location: importPath,
        message,
        timestamp: new Date(),
      };
      this.violations.push(violation);
      console.warn(`⚠️ ${message}`);
    }
  }

  /**
   * Get comprehensive report of SDK usage violations
   * @returns Report with violations and suggestions
   */
  getSDKUsageReport(): SDKUsageReport {
    const suggestions = this.violations.map((violation) =>
      violation.type === 'client'
        ? 'Use @/lib/appwrite/server instead of client SDK'
        : 'Use @/lib/appwrite/client instead of server SDK'
    );

    return {
      violations: this.violations,
      count: this.violations.length,
      suggestions,
    };
  }

  /**
   * Clear all recorded violations (useful for testing)
   */
  clearViolations(): void {
    this.violations = [];
  }
}

// Singleton instance
const sdkGuard = new SDKGuard();

// Export guard functions for easy use
export const validateClientSDKUsage = (strict?: boolean) => sdkGuard.validateClientSDKUsage(strict);
export const validateServerSDKUsage = (strict?: boolean) => sdkGuard.validateServerSDKUsage(strict);
export const warnIfWrongSDK = (sdkType: 'client' | 'server', importPath?: string) =>
  sdkGuard.warnIfWrongSDK(sdkType, importPath);
export const getSDKUsageReport = () => sdkGuard.getSDKUsageReport();

// Export types for external use
export type { ValidationResult, SDKViolation, SDKUsageReport };

// Export singleton for advanced usage
export { sdkGuard };
