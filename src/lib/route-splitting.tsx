// Advanced Route-Based Code Splitting System
'use client';

import React, { lazy, Suspense, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from '@/components/ui/skeleton-optimized';
import { CardSkeleton } from '@/components/ui/skeleton-optimized';

// Route configuration for optimal code splitting
export const ROUTE_CONFIG = {
  // High-traffic routes (should load faster)
  highPriority: {
    '/': {
      preload: true,
      priority: 'high',
      chunkName: 'home',
    },
    '/yardim/ihtiyac-sahipleri': {
      preload: true,
      priority: 'high', 
      chunkName: 'beneficiaries',
    },
    '/bagis/liste': {
      preload: true,
      priority: 'high',
      chunkName: 'donations',
    },
  },
  
  // Medium-traffic routes
  mediumPriority: {
    '/is/gorevler': {
      preload: false,
      priority: 'normal',
      chunkName: 'tasks',
    },
    '/is/toplantilar': {
      preload: false,
      priority: 'normal', 
      chunkName: 'meetings',
    },
    '/yardim/basvurular': {
      preload: false,
      priority: 'normal',
      chunkName: 'applications',
    },
  },
  
  // Low-traffic routes (load on demand)
  lowPriority: {
    '/settings': {
      preload: false,
      priority: 'low',
      chunkName: 'settings',
    },
    '/partner/liste': {
      preload: false,
      priority: 'low',
      chunkName: 'partners',
    },
  },
};

// Lazy load heavy components with intelligent preloading
const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  chunkName: string,
  priority: 'high' | 'normal' | 'low' = 'normal'
) => {
  const LazyComponent = lazy(importFunc);
  
  // Enhanced suspense wrapper with optimized loading states
  const LazyComponentWithSuspense = (props: React.ComponentProps<T>) => {
    const router = useRouter();

    // Intelligent preloading based on route priority
    React.useEffect(() => {
      if (priority === 'high') {
        // Preload high-priority routes
        router.prefetch(importFunc.toString());
      }
    }, [router, priority]);

    return (
      <Suspense 
        fallback={
          chunkName === 'beneficiaries' || chunkName === 'donations' ? (
            <TableSkeleton rows={6} columns={4} />
          ) : (
            <CardSkeleton lines={4} />
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  LazyComponentWithSuspense.displayName = `Lazy${chunkName}`;

  return LazyComponentWithSuspense;
};

// Preload manager for intelligent route preloading
class PreloadManager {
  private preloadedChunks = new Set<string>();
  private loadingChunks = new Set<string>();
  private observer?: IntersectionObserver;

  constructor() {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const chunkName = entry.target.getAttribute('data-chunk-name');
            if (chunkName && !this.preloadedChunks.has(chunkName)) {
              this.preloadChunk(chunkName);
            }
          }
        });
      },
      {
        rootMargin: '200px', // Preload when 200px away
        threshold: 0.1,
      }
    );
  }

  async preloadChunk(chunkName: string) {
    if (this.preloadedChunks.has(chunkName) || this.loadingChunks.has(chunkName)) {
      return;
    }

    this.loadingChunks.add(chunkName);

    try {
      // Dynamic import simulation for route components
      const preloadStrategies: Record<string, () => Promise<any>> = {
        beneficiaries: () => import('@/app/(dashboard)/yardim/ihtiyac-sahipleri/page'),
        donations: () => import('@/app/(dashboard)/bagis/liste/page'),
        tasks: () => import('@/app/(dashboard)/is/gorevler/page'),
        meetings: () => import('@/app/(dashboard)/is/toplantilar/page'),
        applications: () => import('@/app/(dashboard)/yardim/basvurular/page'),
        settings: () => import('@/app/(dashboard)/settings/page'),
        partners: () => import('@/app/(dashboard)/partner/liste/page'),
        home: () => import('@/app/page'),
      };

      const preloadFunc = preloadStrategies[chunkName];
      if (preloadFunc) {
        await preloadFunc();
        this.preloadedChunks.add(chunkName);
      }
    } catch (error) {
      console.warn(`Failed to preload chunk: ${chunkName}`, error);
    } finally {
      this.loadingChunks.delete(chunkName);
    }
  }

  observeElement(element: HTMLElement, chunkName: string) {
    if (this.observer) {
      element.setAttribute('data-chunk-name', chunkName);
      this.observer.observe(element);
    }
  }

  // Preload based on user navigation patterns
  preloadOnNavigate(currentPath: string, targetPath: string) {
    const config = { ...ROUTE_CONFIG.highPriority, ...ROUTE_CONFIG.mediumPriority };
    const targetConfig = config[targetPath as keyof typeof config];
    
    if (targetConfig?.preload) {
      setTimeout(() => {
        this.preloadChunk(targetConfig.chunkName);
      }, 100); // Small delay to not block main navigation
    }
  }

  // Batch preload for related routes
  preloadRelatedRoutes(basePath: string) {
    const relatedRoutes = {
      '/yardim': ['beneficiaries', 'applications'],
      '/bagis': ['donations'],
      '/is': ['tasks', 'meetings'],
    };

    const baseKey = Object.keys(relatedRoutes).find(key => basePath.startsWith(key));
    if (baseKey) {
      relatedRoutes[baseKey as keyof typeof relatedRoutes].forEach(chunkName => {
        setTimeout(() => this.preloadChunk(chunkName), Math.random() * 1000);
      });
    }
  }

  getPreloadedChunks() {
    return Array.from(this.preloadedChunks);
  }

  isChunkPreloaded(chunkName: string) {
    return this.preloadedChunks.has(chunkName);
  }
}

// Global preload manager instance
const preloadManager = new PreloadManager();

// Hook for using preload manager
export function usePreloadManager() {
  const router = useRouter();

  const preloadRoute = React.useCallback((path: string) => {
    const config = { ...ROUTE_CONFIG.highPriority, ...ROUTE_CONFIG.mediumPriority };
    const routeConfig = config[path as keyof typeof config];
    
    if (routeConfig) {
      preloadManager.preloadChunk(routeConfig.chunkName);
    }
  }, []);

  const preloadRelated = React.useCallback((path: string) => {
    preloadManager.preloadRelatedRoutes(path);
  }, []);

  const observeNavigation = React.useCallback((currentPath: string, targetPath: string) => {
    preloadManager.preloadOnNavigate(currentPath, targetPath);
  }, []);

  return {
    preloadRoute,
    preloadRelated,
    observeNavigation,
    getPreloadedChunks: () => preloadManager.getPreloadedChunks(),
  };
}

// Enhanced loading component with progressive enhancement
export function ProgressiveLoadingFallback({ 
  type = 'card',
  rows = 4,
  chunkName = 'default'
}: {
  type?: 'card' | 'table' | 'simple';
  rows?: number;
  chunkName?: string;
}) {
  return (
    <div className="animate-in fade-in duration-300">
      {type === 'table' ? (
        <TableSkeleton rows={rows} columns={4} />
      ) : type === 'card' ? (
        <CardSkeleton lines={rows} />
      ) : (
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div 
              key={i} 
              className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"
              style={{
                width: `${Math.random() * 40 + 60}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Performance hint for monitoring */}
      <div 
        data-chunk-name={chunkName}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
}

// Smart route component wrapper
export function SmartRouteWrapper({ 
  children, 
  chunkName, 
  priority = 'normal',
  loadingType = 'card'
}: {
  children: React.ReactNode;
  chunkName: string;
  priority?: 'high' | 'normal' | 'low';
  loadingType?: 'card' | 'table' | 'simple';
}) {
  const { preloadRoute } = usePreloadManager();

  React.useEffect(() => {
    if (priority === 'high') {
      preloadRoute(chunkName);
    }
  }, [chunkName, priority, preloadRoute]);

  return (
    <Suspense fallback={<ProgressiveLoadingFallback type={loadingType} chunkName={chunkName} />}>
      {children}
    </Suspense>
  );
}

// Analytics for code splitting effectiveness
export function useCodeSplittingAnalytics() {
  const [metrics, setMetrics] = React.useState({
    preloadedChunks: 0,
    totalChunks: Object.keys({ ...ROUTE_CONFIG.highPriority, ...ROUTE_CONFIG.mediumPriority, ...ROUTE_CONFIG.lowPriority }).length,
    loadTimes: {} as Record<string, number>,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        preloadedChunks: preloadManager.getPreloadedChunks().length,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const trackLoadTime = React.useCallback((chunkName: string, loadTime: number) => {
    setMetrics(prev => ({
      ...prev,
      loadTimes: {
        ...prev.loadTimes,
        [chunkName]: loadTime,
      },
    }));
  }, []);

  return {
    metrics,
    trackLoadTime,
    isPreloaded: (chunkName: string) => preloadManager.isChunkPreloaded(chunkName),
  };
}

export { preloadManager };
export type { PreloadManager };