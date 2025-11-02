/**
 * Hydration Error Detection and Logging Utility
 *
 * Detects and logs React 19 hydration errors with detailed information
 * about mismatches between server and client rendering.
 *
 * Usage: Call HydrationLogger.init() in your root provider or layout
 */

type HydrationError = {
  timestamp: Date;
  message: string;
  componentStack?: string;
  serverHTML?: string;
  clientHTML?: string;
  possibleCauses: string[];
};

class HydrationLoggerClass {
  private errors: HydrationError[] = [];
  private isInitialized = false;
  private originalConsoleError: typeof console.error;

  constructor() {
    this.originalConsoleError = console.error.bind(console);
  }

  /**
   * Initialize the hydration logger (development only)
   */
  init() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    if (this.isInitialized) {
      console.warn('⚠️ HydrationLogger already initialized');
      return;
    }

    this.isInitialized = true;
    this.interceptConsoleError();
    this.detectHydrationErrors();

    console.log('🔍 HydrationLogger initialized');

    // Expose to window for manual debugging
    if (typeof window !== 'undefined') {
      (window as any).__HYDRATION_LOGGER__ = this;
    }
  }

  /**
   * Intercept console.error to catch hydration errors
   */
  private interceptConsoleError() {
    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';

      // Detect hydration-related errors
      if (
        errorMessage.includes('Hydration failed') ||
        errorMessage.includes('Text content does not match') ||
        errorMessage.includes('There was an error while hydrating') ||
        errorMessage.includes('Minified React error')
      ) {
        this.handleHydrationError(args);
      }

      // Call original console.error
      this.originalConsoleError(...args);
    };
  }

  /**
   * Handle detected hydration errors
   */
  private handleHydrationError(args: any[]) {
    const errorMessage = args[0]?.toString() || '';
    const componentStack = args.find((arg: any) => typeof arg === 'string' && arg.includes('at '));

    const error: HydrationError = {
      timestamp: new Date(),
      message: errorMessage,
      componentStack,
      possibleCauses: this.identifyPossibleCauses(errorMessage),
    };

    this.errors.push(error);
    this.logHydrationMismatch(error);
  }

  /**
   * Detect hydration errors by monitoring DOM
   */
  private detectHydrationErrors() {
    if (typeof window === 'undefined') return;

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      const errorMessage = event.message || '';

      if (
        errorMessage.includes('hydration') ||
        errorMessage.includes('Hydration') ||
        errorMessage.includes('mismatch')
      ) {
        console.error('🚨 Hydration Error Detected:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
      }
    });

    // Monitor for hydration warnings
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Check for React hydration attributes
            if (element.hasAttribute('data-reactroot') || element.hasAttribute('data-reactid')) {
              console.log('🔄 React hydration detected on:', element.tagName);
            }
          }
        });
      });
    });

    // Start observing after a short delay to catch hydration issues
    setTimeout(() => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, 100);
  }

  /**
   * Log detailed hydration mismatch information
   */
  private logHydrationMismatch(error: HydrationError) {
    console.group('🚨 HYDRATION ERROR DETECTED');
    console.error('Message:', error.message);
    console.error('Timestamp:', error.timestamp.toISOString());

    if (error.componentStack) {
      console.error('Component Stack:', error.componentStack);
    }

    if (error.possibleCauses.length > 0) {
      console.warn('🔍 Possible Causes:');
      error.possibleCauses.forEach((cause, index) => {
        console.warn(`  ${index + 1}. ${cause}`);
      });
    }

    console.warn('💡 Debugging Tips:');
    console.warn(
      '  1. Check if you are using Date.now(), Math.random(), or localStorage in render'
    );
    console.warn('  2. Use useEffect() for client-only code');
    console.warn('  3. Add suppressHydrationWarning to the problematic element');
    console.warn('  4. Test in incognito mode to rule out browser extensions');
    console.warn('  5. Check if Zustand persist middleware is properly configured');

    console.groupEnd();
  }

  /**
   * Identify possible causes based on error message
   */
  private identifyPossibleCauses(errorMessage: string): string[] {
    const causes: string[] = [];

    if (errorMessage.includes('Text content does not match')) {
      causes.push('Text content mismatch between server and client');
      causes.push('Using Date.now() or Math.random() during render');
      causes.push('Browser extensions modifying DOM (Grammarly, ColorZilla, etc.)');
      causes.push('Incorrect useEffect usage');
    }

    if (errorMessage.includes('Hydration failed')) {
      causes.push('DOM structure mismatch between server and client');
      causes.push('Conditional rendering based on client-only values');
      causes.push('localStorage or sessionStorage accessed during render');
      causes.push('Zustand persist middleware not properly hydrated');
    }

    if (errorMessage.includes('expected server HTML to contain')) {
      causes.push('Missing element in server-rendered HTML');
      causes.push('Dynamic content not matching server render');
    }

    // Generic causes
    if (causes.length === 0) {
      causes.push('Client-side state not matching server state');
      causes.push('Asynchronous data loading during render');
      causes.push('Browser-specific behavior or extensions');
    }

    return causes;
  }

  /**
   * Get all recorded hydration errors
   */
  getErrors(): HydrationError[] {
    return this.errors;
  }

  /**
   * Generate a comprehensive report of all hydration errors
   */
  getHydrationReport() {
    return {
      totalErrors: this.errors.length,
      errors: this.errors.map((error) => ({
        timestamp: error.timestamp.toISOString(),
        message: error.message,
        possibleCauses: error.possibleCauses,
        componentStack: error.componentStack,
      })),
      summary: {
        hasErrors: this.errors.length > 0,
        firstError: this.errors[0]?.timestamp.toISOString(),
        lastError: this.errors[this.errors.length - 1]?.timestamp.toISOString(),
        mostCommonCauses: this.getMostCommonCauses(),
      },
    };
  }

  /**
   * Get most common causes across all errors
   */
  private getMostCommonCauses(): string[] {
    const causeCounts = new Map<string, number>();

    this.errors.forEach((error) => {
      error.possibleCauses.forEach((cause) => {
        causeCounts.set(cause, (causeCounts.get(cause) || 0) + 1);
      });
    });

    return Array.from(causeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cause]) => cause);
  }

  /**
   * Clear all recorded errors
   */
  clearErrors() {
    this.errors = [];
    console.log('🗑️ Hydration errors cleared');
  }
}

// Singleton instance
export const HydrationLogger = new HydrationLoggerClass();
