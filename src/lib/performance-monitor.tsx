// Performance Monitoring System
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createLogger } from './logger';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // Custom metrics
  routeTransitionTime?: number;
  modalOpenTime?: number;
  scrollPerformance?: number;
  memoryUsage?: number;

  // Navigation timing
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
  route?: string;
}

interface PerformanceMonitorProps {
  enableWebVitals?: boolean;
  enableCustomMetrics?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  routeName?: string;
}

export function PerformanceMonitor({
  enableWebVitals = true,
  enableCustomMetrics = true,
  onMetrics,
  routeName = 'unknown',
}: PerformanceMonitorProps) {
  const routeStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enableWebVitals) return;
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return;
    }

    type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        onMetrics?.({ lcp: lastEntry.startTime, route: routeName });
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const firstInputEntry = entry as PerformanceEventTiming;
        const fid = firstInputEntry.processingStart - firstInputEntry.startTime;
        onMetrics?.({ fid, route: routeName });
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as LayoutShiftEntry;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      onMetrics?.({ cls: clsValue, route: routeName });
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [enableWebVitals, onMetrics, routeName]);

  // Route transition timing
  useEffect(() => {
    if (!enableCustomMetrics) return;

    if (typeof performance === 'undefined' || !performance.now) {
      return undefined;
    }

    routeStartTime.current = performance.now();

    return () => {
      if (routeStartTime.current !== null) {
        const endTime = performance.now();
        const routeTransitionTime = endTime - routeStartTime.current;
        onMetrics?.({ routeTransitionTime, route: routeName });
      }
    };
  }, [routeName, enableCustomMetrics, onMetrics]);

  return null;
}

// Custom hooks for performance tracking
export const usePerformanceTracking = () => {
  const trackModalOpen = useCallback(() => {
    return typeof performance !== 'undefined' ? performance.now() : 0;
  }, []);

  const trackModalClose = useCallback((startTime: number) => {
    if (typeof performance === 'undefined') {
      return 0;
    }
    return performance.now() - startTime;
  }, []);

  const trackScrollPerformance = useCallback((callback: () => void) => {
    if (typeof performance === 'undefined') {
      callback();
      return 0;
    }
    const startTime = performance.now();
    callback();
    return performance.now() - startTime;
  }, []);

  type PerformanceWithMemory = Performance & {
    memory?: {
      usedJSHeapSize: number;
    };
  };

  const getMemoryUsage = useCallback(() => {
    if (typeof performance === 'undefined') {
      return null;
    }
    const performanceWithMemory = performance as PerformanceWithMemory;
    return performanceWithMemory.memory?.usedJSHeapSize ?? null;
  }, []);

  return {
    trackModalOpen,
    trackModalClose,
    trackScrollPerformance,
    getMemoryUsage,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (routeName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({});
  const { trackModalOpen, trackModalClose, getMemoryUsage } = usePerformanceTracking();

  const trackRouteTransition = useCallback(() => {
    if (typeof performance === 'undefined') {
      return () => {};
    }
    const startTime = performance.now();
    return () => {
      const routeTransitionTime = performance.now() - startTime;
      metricsRef.current.routeTransitionTime = routeTransitionTime;
      metricsRef.current.route = routeName;
    };
  }, [routeName]);

  const trackModalPerformance = useCallback(() => {
    const startTime = trackModalOpen();
    return () => {
      const modalOpenTime = trackModalClose(startTime);
      metricsRef.current.modalOpenTime = modalOpenTime;
    };
  }, [trackModalOpen, trackModalClose]);

  const updateMemoryUsage = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    if (typeof memoryUsage === 'number') {
      metricsRef.current.memoryUsage = memoryUsage;
    }
  }, [getMemoryUsage]);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  return {
    trackRouteTransition,
    trackModalPerformance,
    updateMemoryUsage,
    getMetrics,
  };
};

// Performance boundary component
interface PerformanceBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface PerformanceBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class PerformanceBoundary extends React.Component<
  PerformanceBoundaryProps,
  PerformanceBoundaryState
> {
  constructor(props: PerformanceBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance Boundary Error:', error, errorInfo);

    // Track performance errors
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('performance-error');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Bir sorun oluştu</h2>
            <p className="text-slate-600 mb-4">Sayfa yüklenirken beklenmeyen bir hata oldu.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// FPS Monitor for real-time performance tracking
export const useFPSMonitor = (enabled = true) => {
  const fpsRef = useRef<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    if (typeof performance === 'undefined') {
      return undefined;
    }

    lastTimeRef.current = performance.now();

    const measureFPS = () => {
      frameCountRef.current++;

      const currentTime = performance.now();
      if (currentTime - lastTimeRef.current >= 1000) {
        fpsRef.current = Math.round(
          (frameCountRef.current * 1000) / (currentTime - lastTimeRef.current)
        );
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  const getFPS = useCallback(() => {
    return fpsRef.current;
  }, []);

  const isGoodPerformance = useCallback(() => {
    return fpsRef.current >= 55; // Good performance threshold
  }, []);

  return {
    getFPS,
    isGoodPerformance,
  };
};

// Performance optimized console logger
const perfLogger = createLogger('performance');

type PerfLogContext = Record<string, unknown> | undefined;

export const perfLog = {
  info: (message: string, context?: PerfLogContext) => {
    if (process.env.NODE_ENV === 'development') {
      perfLogger.debug(message, context);
    }
  },

  warn: (message: string, context?: PerfLogContext) => {
    perfLogger.warn(message, context);
  },

  error: (message: string, context?: PerfLogContext) => {
    perfLogger.error(message, undefined, context);
  },
};
