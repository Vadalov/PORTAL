'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConvexProvider } from 'convex/react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { createOptimizedQueryClient, cacheUtils } from '@/lib/cache-config';
import { persistentCache } from '@/lib/persistent-cache';
import { convex, shouldUseConvex } from '@/lib/convex/client';

import { SuspenseBoundary } from '@/components/ui/suspense-boundary';

// TypeScript interfaces for window objects
interface WindowWithDebug extends Window {
  __AUTH_STORE__?: typeof useAuthStore;
  __QUERY_CLIENT__?: QueryClient;
  __CACHE__?: typeof persistentCache;
  __CACHE_UTILS__?: typeof cacheUtils;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createOptimizedQueryClient());

  const [mounted] = useState(true);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const initializeAuth = useAuthStore((state) => state?.initializeAuth);

  // Initialize debug utilities (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Expose to window for manual debugging (safe)
      if (typeof window !== 'undefined') {
        const windowWithDebug = window as WindowWithDebug;
        windowWithDebug.__AUTH_STORE__ = useAuthStore;
        windowWithDebug.__QUERY_CLIENT__ = queryClient;
        windowWithDebug.__CACHE__ = persistentCache;
        windowWithDebug.__CACHE_UTILS__ = cacheUtils;
      }
    }
  }, [queryClient]);

  // Periodic cache cleanup
  useEffect(() => {
    // Clean up expired cache entries every 5 minutes
    const cleanupInterval = setInterval(
      async () => {
        const cleaned = await persistentCache.cleanup();
        if (cleaned > 0 && process.env.NODE_ENV === 'development') {
          // Cleanup logged by persistent cache
        }
      },
      5 * 60 * 1000
    );

    return () => clearInterval(cleanupInterval);
  }, []);

  // Wait for both mounted and hydration complete before initializing auth
  useEffect(() => {
    if (mounted && hasHydrated && initializeAuth) {
      // Initialize auth when ready
      initializeAuth();
    }
  }, [mounted, hasHydrated, initializeAuth]);

  // Show loading spinner until hydration complete (prevents hydration mismatch)
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Uygulama yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Render with or without Convex depending on availability
  // Type guard: ensure convex is not null before using it
  if (shouldUseConvex() && convex !== null) {
    // TypeScript now knows convex is not null in this block
    return (
      <ConvexProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          <SuspenseBoundary
            loadingVariant="pulse"
            fullscreen={true}
            loadingText="Uygulama yükleniyor..."
            onSuspend={() => {
              // Suspended state
            }}
            onResume={() => {
              // Resumed state
            }}
          >
            {children}
          </SuspenseBoundary>
          <Toaster position="top-right" richColors />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ConvexProvider>
    );
  }

  // Render without Convex (e.g., during build or when not configured)
  return (
    <QueryClientProvider client={queryClient}>
      <SuspenseBoundary
        loadingVariant="pulse"
        fullscreen={true}
        loadingText="Uygulama yükleniyor..."
        onSuspend={() => {
          // Suspended state
        }}
        onResume={() => {
          // Resumed state
        }}
      >
        {children}
      </SuspenseBoundary>
      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
