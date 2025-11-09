import React from 'react';
import { createLogger } from './logger';

const performanceLogger = createLogger('performance-utils');

type WebVitalMetric = {
  name: string;
  value: number;
  id?: string;
  delta?: number;
};

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
    if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
      return;
    }

    this.metrics.set(`${label}-start`, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}-start`);

    if (startTime === undefined) {
      performanceLogger.warn('Missing performance start time', { label });
      return 0;
    }

    if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(`${label}-duration`, duration);

    performanceLogger.debug(`Performance timing for ${label}`, { duration });
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
  if (!metric || typeof metric !== 'object') {
    return;
  }

  if (!('name' in metric) || !('value' in metric)) {
    return;
  }

  const m = metric as WebVitalMetric;
  const formattedValue = Math.round(m.value * 100) / 100;
  const unit = m.name.toLowerCase() === 'cls' ? '' : 'ms';

  performanceLogger.debug(`Web Vital: ${m.name} = ${formattedValue}${unit}`, {
    id: m.id,
    delta: m.delta,
  });
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

  set(key: string, data: unknown, ttl: number = 5 * 60 * 1000): void {
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

    return item.data as T;
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
  fallback: React.ReactNode = React.createElement('div', null, 'Loading...')
) {
  const Component = React.lazy(importFunc);
  type Props = React.ComponentProps<T>;

  const LazyComponent = (props: Props) =>
    React.createElement(
      React.Suspense,
      {
        fallback,
      },
      React.createElement(Component, props)
    );

  LazyComponent.displayName = 'LazyLoadedComponent';

  return LazyComponent;
}
