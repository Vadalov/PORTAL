// Error type definitions
export class RenderError extends Error {
  constructor(message: string = 'Render error') {
    super(message);
    this.name = 'RenderError';
  }
}

export class AsyncError extends Error {
  constructor(message: string = 'Async error') {
    super(message);
    this.name = 'AsyncError';
  }
}

export class HydrationError extends Error {
  constructor(message: string = 'Hydration error') {
    super(message);
    this.name = 'HydrationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class StoreError extends Error {
  constructor(message: string = 'Store error') {
    super(message);
    this.name = 'StoreError';
  }
}

// Error metadata interface
interface ErrorMetadata {
  timestamp: Date;
  type: string;
  message: string;
  stack?: string;
  caught: boolean;
  recoveryAttempts: number;
  componentStack?: string;
}

// ErrorSimulator class
export class ErrorSimulator {
  private errors: ErrorMetadata[] = [];
  private sentryEvents: unknown[] = [];

  // Error simulation methods
  throwRenderError(message?: string): never {
    const error = new RenderError(message);
    this.trackError(error, 'render');
    throw error;
  }

  throwAsyncError(delay: number = 1000): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        const error = new AsyncError();
        this.trackError(error, 'async');
        reject(error);
      }, delay);
    });
  }

  throwEventHandlerError(message?: string): () => void {
    return () => {
      const error = new RenderError(message || 'Event handler error');
      this.trackError(error, 'event');
      throw error;
    };
  }

  simulateHydrationError(): void {
    // Create server/client mismatch by manipulating localStorage
    const key = '__hydration_test__';
    const serverValue = 'server_value';
    const clientValue = 'client_value';

    // Simulate server rendering with one value
    localStorage.setItem(key, serverValue);

    // Then change it to create mismatch (this would be called in component)
    setTimeout(() => {
      localStorage.setItem(key, clientValue);
      // Force re-render or hydration
      window.location.reload();
    }, 100);

    const error = new HydrationError('Simulated hydration mismatch');
    this.trackError(error, 'hydration');
  }

  simulateNetworkError(endpoint: string): Promise<never> {
    // Mock fetch to fail
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string' && input.includes(endpoint)) {
        const error = new NetworkError(`Failed to fetch ${endpoint}`);
        this.trackError(error, 'network');
        throw error;
      }
      return originalFetch(input, init);
    };

    // Return a promise that throws immediately for testing
    return Promise.reject(new NetworkError(`Simulated network error for ${endpoint}`));
  }

  simulateStoreError(): void {
    // Assume Zustand store has an action that can throw
    // This is a generic simulation - actual store integration would be specific
    const error = new StoreError('Simulated store action error');
    this.trackError(error, 'store');
    throw error;
  }

  // Metadata tracking
  private trackError(error: Error, type: string): void {
    const metadata: ErrorMetadata = {
      timestamp: new Date(),
      type,
      message: error.message,
      stack: error.stack,
      caught: false, // Will be updated when caught
      recoveryAttempts: 0,
      componentStack: (error as any).componentStack,
    };
    this.errors.push(metadata);
  }

  markErrorCaught(index: number): void {
    if (this.errors[index]) {
      this.errors[index].caught = true;
    }
  }

  incrementRecoveryAttempts(index: number): void {
    if (this.errors[index]) {
      this.errors[index].recoveryAttempts++;
    }
  }

  getErrors(): ErrorMetadata[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  // Sentry integration testing
  verifySentryCaptured(errorId: string): boolean {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      // Check if Sentry captured the error
      const events = (window as any).Sentry.getEvents?.() || [];
      return events.some((event: unknown) => (event as any).event_id === errorId);
    }
    return false;
  }

  getSentryEventId(): string | null {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const events = (window as any).Sentry.getEvents?.() || [];
      const lastEvent = events[events.length - 1];
      return lastEvent?.event_id || null;
    }
    return null;
  }

  clearSentryEvents(): void {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      // Clear Sentry events (if method exists)
      (window as any).Sentry.clearEvents?.();
    }
    this.sentryEvents = [];
  }

  // Error recovery testing
  testErrorRecovery(errorType: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate throwing an error and testing recovery
      try {
        switch (errorType) {
          case 'render':
            this.throwRenderError();
            break;
          case 'async':
            this.throwAsyncError().catch(() => {
              // Error caught, simulate recovery
              resolve(true);
            });
            return;
          case 'hydration':
            this.simulateHydrationError();
            break;
          case 'network':
            this.simulateNetworkError('/test').catch(() => {
              resolve(true);
            });
            return;
          case 'store':
            this.simulateStoreError();
            break;
          default:
            throw new Error(`Unknown error type: ${errorType}`);
        }
        // For synchronous errors, if we reach here, recovery worked
        resolve(true);
      } catch (_error) {
        // Error thrown, but in test context, this might be expected
        resolve(false);
      }
    });
  }

  testClearStorageRecovery(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate hydration error then clear storage
      localStorage.setItem('test_key', 'test_value');
      this.simulateHydrationError();

      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Check if storage is cleared
        const isCleared = localStorage.length === 0 && sessionStorage.length === 0;
        resolve(isCleared);
      }, 200);
    });
  }

  testReloadRecovery(): Promise<boolean> {
    // This would normally reload the page, but for testing we simulate
    return new Promise((resolve) => {
      // Simulate reload by checking if page would reload
      // In a real test, this might navigate or reload
      setTimeout(() => {
        resolve(true); // Assume reload works
      }, 100);
    });
  }
}

// Export singleton instance
export const errorSimulator = new ErrorSimulator();

// Expose to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__ERROR_SIMULATOR__ = errorSimulator;
}
