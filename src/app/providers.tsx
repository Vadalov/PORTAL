'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

import { SuspenseBoundary } from '@/components/ui/suspense-boundary';

// TypeScript interfaces for window objects
interface WindowWithDebug extends Window {
  __AUTH_STORE__?: typeof useAuthStore;
  __QUERY_CLIENT__?: QueryClient;
}

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

  const [mounted] = useState(true);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const initializeAuth = useAuthStore((state) => state?.initializeAuth);

  // Initialize debug utilities (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug mode enabled');

      // Expose to window for manual debugging (safe)
      if (typeof window !== 'undefined') {
        const windowWithDebug = window as WindowWithDebug;
        windowWithDebug.__AUTH_STORE__ = useAuthStore;
        windowWithDebug.__QUERY_CLIENT__ = queryClient;
      }
    }
  }, [queryClient]);

  // Manual rehydration for skipHydration: true
  useEffect(() => {
    useAuthStore.persist.rehydrate();
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
