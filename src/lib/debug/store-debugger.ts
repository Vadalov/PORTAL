/**
 * Zustand Store State Debugging Utility
 *
 * Tracks Zustand store hydration lifecycle and helps debug
 * state mismatches between server and client.
 *
 * Usage: Call StoreDebugger.init(useAuthStore) in your root provider
 */

import type { StoreApi, UseBoundStore } from 'zustand';

type StoreState = {
  [key: string]: unknown;
};

type HydrationTiming = {
  startTime: number;
  endTime?: number;
  duration?: number;
};

class StoreDebuggerClass {
  private stores: Map<string, UseBoundStore<StoreApi<unknown>>> = new Map();
  private hydrationTimings: Map<string, HydrationTiming> = new Map();
  private isInitialized = false;

  /**
   * Initialize the store debugger (development only)
   */
  init<T extends StoreState>(store: UseBoundStore<StoreApi<T>>, storeName: string = 'authStore') {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    if (this.isInitialized && this.stores.has(storeName)) {
      console.warn(`⚠️ StoreDebugger already initialized for ${storeName}`);
      return;
    }

    this.stores.set(storeName, store);
    this.isInitialized = true;

    console.log(`🔍 StoreDebugger initialized for ${storeName}`);

    // Track hydration timing
    this.trackHydrationTiming(store, storeName);

    // Subscribe to store changes
    this.subscribeToChanges(store, storeName);

    // Log initial state
    this.logStoreState(storeName);

    // Expose to window for manual debugging
    if (typeof window !== 'undefined') {
      (
        window as {
          __STORE_DEBUGGER__?: StoreDebuggerClass;
          __AUTH_STORE__?: UseBoundStore<StoreApi<T>>;
        }
      ).__STORE_DEBUGGER__ = this;
      (
        window as {
          __STORE_DEBUGGER__?: StoreDebuggerClass;
          __AUTH_STORE__?: UseBoundStore<StoreApi<T>>;
        }
      ).__AUTH_STORE__ = store;
    }
  }

  /**
   * Track hydration timing for persist middleware
   */
  private trackHydrationTiming<T extends StoreState>(
    store: UseBoundStore<StoreApi<T>>,
    storeName: string
  ) {
    const persistApi = (store as any).persist;

    if (!persistApi) {
      console.warn(`⚠️ Store ${storeName} does not have persist middleware`);
      return;
    }

    const timing: HydrationTiming = {
      startTime: performance.now(),
    };

    this.hydrationTimings.set(storeName, timing);

    // Check if already hydrated
    if (persistApi.hasHydrated && persistApi.hasHydrated()) {
      timing.endTime = performance.now();
      timing.duration = timing.endTime - timing.startTime;
      console.log(`⚡ ${storeName} already hydrated (${timing.duration.toFixed(2)}ms)`);
      return;
    }

    // Wait for hydration
    const checkHydration = setInterval(() => {
      if (persistApi.hasHydrated && persistApi.hasHydrated()) {
        timing.endTime = performance.now();
        timing.duration = timing.endTime - timing.startTime;
        console.log(`⚡ ${storeName} hydration completed (${timing.duration.toFixed(2)}ms)`);
        clearInterval(checkHydration);
      }
    }, 10);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkHydration);
      if (!timing.endTime) {
        console.error(`❌ ${storeName} hydration timeout (>5000ms)`);
      }
    }, 5000);
  }

  /**
   * Subscribe to store changes for debugging
   */
  private subscribeToChanges<T extends StoreState>(
    store: UseBoundStore<StoreApi<T>>,
    storeName: string
  ) {
    store.subscribe((state, prevState) => {
      console.log(`🔄 ${storeName} state changed:`, {
        prev: prevState,
        current: state,
        diff: this.getStateDiff(prevState, state),
      });
    });
  }

  /**
   * Get difference between two states
   */
  private getStateDiff(prevState: StoreState, currentState: StoreState): Record<string, unknown> {
    const diff: Record<string, unknown> = {};

    Object.keys(currentState).forEach((key) => {
      if (prevState[key] !== currentState[key]) {
        diff[key] = {
          prev: prevState[key],
          current: currentState[key],
        };
      }
    });

    return diff;
  }

  /**
   * Log current store state
   */
  logStoreState(storeName: string = 'authStore') {
    const store = this.stores.get(storeName);

    if (!store) {
      console.error(`❌ Store ${storeName} not found`);
      return;
    }

    const state = store.getState();
    const persistApi = (store as unknown as { persist?: unknown }).persist;

    console.group(`🔐 ${storeName} State`);

    console.log('Current State:', state);

    if (persistApi) {
      console.log('Hydrated:', (persistApi as any).hasHydrated?.() ?? 'unknown');
    }

    // Log localStorage
    if (typeof window !== 'undefined') {
      try {
        const localStorageKey = `${storeName}`;
        const storedValue = localStorage.getItem(localStorageKey);

        if (storedValue) {
          console.log('LocalStorage:', JSON.parse(storedValue));
        } else {
          console.warn('⚠️ No data in localStorage');
        }

        // Also check for auth-session
        const sessionValue = localStorage.getItem('auth-session');
        if (sessionValue) {
          console.log('Auth Session:', JSON.parse(sessionValue));
        }
      } catch (_error) {
        console.error('❌ Failed to read localStorage:', _error);
      }
    }

    console.groupEnd();
  }

  /**
   * Detect mismatch between server state and hydrated state
   */
  detectStoreMismatch(storeName: string = 'authStore') {
    const store = this.stores.get(storeName);

    if (!store) {
      console.error(`❌ Store ${storeName} not found`);
      return;
    }

    const currentState = store.getState();

    // Get default state (server-side state)
    const defaultState = this.getDefaultState(storeName);

    if (!defaultState) {
      console.warn('⚠️ Could not determine default state');
      return;
    }

    const mismatches: string[] = [];

    Object.keys(currentState as object).forEach((key) => {
      if (defaultState[key] !== undefined && (currentState as any)[key] !== defaultState[key]) {
        mismatches.push(key);
      }
    });

    if (mismatches.length > 0) {
      console.group('🚨 Store Mismatch Detected');
      console.error('Mismatched fields:', mismatches);

      mismatches.forEach((key) => {
        console.error(`  ${key}:`, {
          default: defaultState[key],
          current: (currentState as any)[key],
        });
      });

      console.warn('💡 This may cause hydration errors');
      console.groupEnd();
    } else {
      console.log('✅ No store mismatch detected');
    }
  }

  /**
   * Get default (initial) state for a store
   */
  private getDefaultState(storeName: string): StoreState | null {
    // This is a simplified version - in real implementation,
    // you would need to store the initial state when the store is created
    if (storeName === 'authStore') {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
        isInitialized: false,
        isLoading: false,
        error: null,
      };
    }

    return null;
  }

  /**
   * Get hydration timing for a store
   */
  getHydrationTiming(storeName: string = 'authStore'): HydrationTiming | undefined {
    return this.hydrationTimings.get(storeName);
  }

  /**
   * Clear localStorage and reload
   */
  clearStorageAndReload() {
    if (typeof window === 'undefined') return;

    console.warn('🗑️ Clearing all storage and reloading...');

    localStorage.clear();
    sessionStorage.clear();

    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  /**
   * Generate comprehensive store report
   */
  getStoreReport(storeName: string = 'authStore') {
    const store = this.stores.get(storeName);

    if (!store) {
      return { error: `Store ${storeName} not found` };
    }

    const state = store.getState();
    const persistApi = (store as unknown as { persist?: unknown }).persist;
    const timing = this.hydrationTimings.get(storeName);

    let localStorageData: unknown = null;
    let sessionData: unknown = null;

    if (typeof window !== 'undefined') {
      try {
        const storedValue = localStorage.getItem(storeName);
        if (storedValue) {
          localStorageData = JSON.parse(storedValue);
        }

        const sessionValue = localStorage.getItem('auth-session');
        if (sessionValue) {
          sessionData = JSON.parse(sessionValue);
        }
      } catch (_error) {
        // Ignore
      }
    }

    return {
      storeName,
      currentState: state,
      hydrated: (persistApi as any)?.hasHydrated?.() ?? 'unknown',
      timing: timing
        ? {
            duration: timing.duration,
            completed: !!timing.endTime,
          }
        : null,
      localStorage: localStorageData,
      sessionStorage: sessionData,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test store hydration manually
   */
  async testHydration(storeName: string = 'authStore') {
    const store = this.stores.get(storeName);

    if (!store) {
      console.error(`❌ Store ${storeName} not found`);
      return;
    }

    const persistApi = (store as any).persist;

    if (!persistApi || !persistApi.rehydrate) {
      console.error('❌ Store does not have persist.rehydrate()');
      return;
    }

    console.log('🔄 Testing hydration...');

    const startTime = performance.now();

    try {
      await persistApi.rehydrate();
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`✅ Hydration test successful (${duration.toFixed(2)}ms)`);
      this.logStoreState(storeName);
    } catch (error) {
      console.error('❌ Hydration test failed:', error);
    }
  }
}

// Singleton instance
export const StoreDebugger = new StoreDebuggerClass();
