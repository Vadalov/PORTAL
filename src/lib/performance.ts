import React from "react";
// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(`${label}-start`, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}-start`);
    if (!startTime) {
      console.warn(`No start time found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(`${label}-duration`, duration);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getMetric(label: string): number | undefined {
    return this.metrics.get(`${label}-duration`);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Web Vitals monitoring
export function reportWebVitals(metric: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric);
  }

  // Send to analytics service in production
  // analytics.track('web_vital', {
  //   name: metric.name,
  //   value: metric.value,
  //   id: metric.id,
  // });
}

// Cache utilities
export class Cache {
  private static instance: Cache;
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set(key: string, data: unknown, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Lazy loading utilities
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType<any>
) {
  const Component = React.lazy(importFunc);

  return (props: React.ComponentProps<T>) => 
    React.createElement(
      React.Suspense,
      {
        fallback: fallback 
          ? React.createElement(fallback) 
          : React.createElement("div", null, "Loading...")
      },
      React.createElement(Component, props)
    );
}
