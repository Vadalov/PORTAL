'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

// Debug utilities (development only)
import { HydrationLogger } from '@/lib/debug/hydration-logger';
import { StoreDebugger } from '@/lib/debug/store-debugger';
import { NetworkMonitor } from '@/lib/debug/network-monitor';
import { SuspenseBoundary } from '@/components/ui/suspense-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const initializeAuth = useAuthStore((state) => state?.initializeAuth);

  // Initialize debug utilities (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug mode enabled');

      // Temporarily disabled for E2E testing - can be re-enabled later
      // HydrationLogger.init();
      // StoreDebugger.init(useAuthStore, 'authStore');
      // NetworkMonitor.init();

      // Expose to window for manual debugging (safe)
      if (typeof window !== 'undefined') {
        (window as any).__AUTH_STORE__ = useAuthStore;
        (window as any).__QUERY_CLIENT__ = queryClient;
      }
    }
  }, [queryClient]);

  // Manual rehydration for skipHydration: true
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for both mounted and hydration complete before initializing auth
  useEffect(() => {
    if (mounted && hasHydrated && initializeAuth) {
      // Log store state before initialization
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth Store State:', useAuthStore.getState());
        console.log('💾 LocalStorage auth-session:', localStorage.getItem('auth-session'));
        console.log('🔄 Store hydrated:', useAuthStore.persist?.hasHydrated?.());
      }

      initializeAuth();
    }
  }, [mounted, hasHydrated, initializeAuth]);

  // Show nothing until hydration complete (prevents hydration mismatch)
  if (!hasHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SuspenseBoundary
        loadingVariant="pulse"
        fullscreen={true}
        loadingText="Uygulama yükleniyor..."
        onSuspend={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏸️ [App] Suspended');
          }
        }}
        onResume={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('▶️ [App] Resumed');
          }
        }}
      >
        {children}
      </SuspenseBoundary>
      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
