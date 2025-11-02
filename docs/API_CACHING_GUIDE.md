# API Caching Guide

This document provides comprehensive guidance on the API caching implementation in PORTAL.

## Table of Contents

1. [Overview](#overview)
2. [Caching Layers](#caching-layers)
3. [Cache Strategies](#cache-strategies)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Debugging and Monitoring](#debugging-and-monitoring)
7. [Configuration](#configuration)

## Overview

The PORTAL application implements a multi-layered caching strategy to improve performance, reduce API calls, and provide offline support. The caching system consists of:

- **TanStack Query (React Query)**: In-memory query caching with automatic invalidation
- **Persistent Cache**: IndexedDB-backed cache for offline support
- **HTTP Cache Headers**: Browser and CDN caching via HTTP headers

## Caching Layers

### 1. TanStack Query Cache (Primary)

TanStack Query provides the primary caching layer with automatic background refetching, optimistic updates, and cache invalidation.

**Features:**

- Automatic background refetching
- Stale-while-revalidate pattern
- Optimistic UI updates
- Automatic garbage collection
- DevTools integration

### 2. Persistent Cache (Secondary)

IndexedDB-backed cache that persists data between sessions and provides offline support.

**Features:**

- Survives page refreshes
- Offline data access
- Automatic expiration
- Metrics tracking
- Fallback to memory cache

### 3. HTTP Cache Headers (Third)

Browser and CDN caching via standard HTTP cache headers.

**Features:**

- CDN caching support
- ETag validation
- Bandwidth optimization
- Browser cache utilization

## Cache Strategies

Different data types have different caching requirements. The system provides predefined strategies:

### Real-Time Data (30 seconds)

- **Use for:** Tasks, Messages
- **Characteristics:** Changes frequently, needs real-time updates
- **Strategy:** Very short cache, refetch on window focus

```typescript
import { useTasksQuery } from '@/hooks/useApiCache';

const { data, isLoading } = useTasksQuery({ userId: '123' });
```

### Short Cache (2 minutes)

- **Use for:** Beneficiaries, Donations, Aid Requests
- **Characteristics:** Moderately dynamic data
- **Strategy:** Short cache with background refetch

```typescript
import { useBeneficiariesQuery } from '@/hooks/useApiCache';

const { data, isLoading } = useBeneficiariesQuery({ page: 1, limit: 20 });
```

### Standard Cache (5 minutes)

- **Use for:** User profiles, Meetings, Statistics
- **Characteristics:** Relatively stable data
- **Strategy:** Standard cache, refetch on reconnect

```typescript
import { useMeetingsQuery } from '@/hooks/useApiCache';

const { data, isLoading } = useMeetingsQuery({ upcoming: true });
```

### Long Cache (30 minutes)

- **Use for:** Parameters, Configuration, Reports
- **Characteristics:** Rarely changes
- **Strategy:** Long cache, minimal refetching

```typescript
import { useParametersQuery } from '@/hooks/useApiCache';

const { data, isLoading } = useParametersQuery('beneficiary_types');
```

### Session Cache (Infinite)

- **Use for:** Current user session
- **Characteristics:** Valid for entire session
- **Strategy:** Cache until logout

```typescript
import { useCurrentUserQuery } from '@/hooks/useApiCache';

const { data: currentUser } = useCurrentUserQuery();
```

## Usage Examples

### Basic Query with Cache

```typescript
import { useCachedQuery } from '@/hooks/useApiCache';
import { CACHE_KEYS } from '@/lib/cache-config';

function MyComponent() {
  const { data, isLoading, error } = useCachedQuery(
    [CACHE_KEYS.BENEFICIARIES, 'list'],
    () => api.beneficiaries.getBeneficiaries(),
    {
      // Optional: Override default strategy
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Mutation with Cache Invalidation

```typescript
import { useCachedMutation } from '@/hooks/useApiCache';
import { CACHE_KEYS } from '@/lib/cache-config';

function CreateBeneficiaryForm() {
  const mutation = useCachedMutation(
    (data) => api.beneficiaries.createBeneficiary(data),
    'BENEFICIARIES', // Automatically invalidates related caches
    {
      onSuccess: (data) => {
        toast.success('Beneficiary created successfully');
      },
    }
  );

  const handleSubmit = (formData) => {
    mutation.mutate(formData);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Prefetching Data

```typescript
import { usePrefetchWithCache } from '@/hooks/useApiCache';
import { CACHE_KEYS } from '@/lib/cache-config';

function Dashboard() {
  // Prefetch data that will likely be needed soon
  usePrefetchWithCache(
    [CACHE_KEYS.STATISTICS],
    () => api.statistics.getDashboardStats(),
    true // enabled
  );

  return <div>{/* Dashboard content */}</div>;
}
```

### Cache Warming on App Start

```typescript
import { useWarmUpCache } from '@/hooks/useApiCache';
import { CACHE_KEYS } from '@/lib/cache-config';

function App() {
  useWarmUpCache([
    {
      key: [CACHE_KEYS.PARAMETERS],
      fetcher: () => api.parameters.getAll(),
      entityType: 'PARAMETERS',
    },
    {
      key: [CACHE_KEYS.AUTH, 'current'],
      fetcher: () => api.auth.getCurrentUser(),
      entityType: 'AUTH',
    },
  ]);

  return <div>{/* App content */}</div>;
}
```

### HTTP Cache Headers in API Routes

```typescript
// app/api/beneficiaries/route.ts
import { createCachedResponse, CACHE_CONFIGS } from '@/lib/http-cache';

export async function GET(request: Request) {
  const data = await fetchBeneficiaries();

  // Return with cache headers
  return createCachedResponse(data, CACHE_CONFIGS.PUBLIC_SHORT);
}
```

### Using Persistent Cache Directly

```typescript
import { persistentCache } from '@/lib/persistent-cache';

// Set value
await persistentCache.set('my-key', data, 5 * 60 * 1000); // 5 minutes

// Get value
const data = await persistentCache.get('my-key');

// Delete value
await persistentCache.delete('my-key');

// Clear all
await persistentCache.clear();
```

## Best Practices

### 1. Choose the Right Cache Strategy

Match the cache duration to your data's change frequency:

- **High frequency changes** → Real-time or Short cache
- **Moderate changes** → Standard cache
- **Rare changes** → Long cache
- **Static data** → Very long cache

### 2. Invalidate Caches on Mutations

Always invalidate related caches when data changes:

```typescript
const mutation = useCachedMutation(
  createBeneficiary,
  'BENEFICIARIES' // Automatically invalidates related caches
);
```

### 3. Use Query Keys Consistently

Organize query keys hierarchically:

```typescript
// Good
[CACHE_KEYS.BENEFICIARIES, 'list', { page: 1 }][(CACHE_KEYS.BENEFICIARIES, 'detail', id)][
  // Bad
  'beneficiary-list-page-1'
][('beneficiary', id)];
```

### 4. Optimize for Offline Experience

Use persistent cache for critical data:

```typescript
// Data will be available offline
usePrefetchWithCache([CACHE_KEYS.BENEFICIARIES], fetchBeneficiaries, true);
```

### 5. Monitor Cache Performance

Use the cache metrics hook:

```typescript
import { useCacheMetrics } from '@/hooks/useApiCache';

function CacheDebugger() {
  const { getQueryCacheStats, getPersistentCacheMetrics } = useCacheMetrics();

  const queryStats = getQueryCacheStats();
  const persistentStats = getPersistentCacheMetrics();

  return (
    <div>
      <h3>Query Cache: {queryStats.totalQueries} queries</h3>
      <h3>Hit Rate: {(persistentStats.hits / (persistentStats.hits + persistentStats.misses) * 100).toFixed(2)}%</h3>
    </div>
  );
}
```

### 6. Handle Stale Data Gracefully

Show stale data while refetching:

```typescript
const { data, isLoading, isRefetching } = useBeneficiariesQuery({});

return (
  <div>
    {isRefetching && <RefreshingIndicator />}
    {data && <DataTable data={data} />}
    {isLoading && !data && <LoadingSpinner />}
  </div>
);
```

## Debugging and Monitoring

### Development Tools

In development mode, cache utilities are exposed on the window object:

```javascript
// In browser console

// View cache metrics
window.__CACHE__.getMetrics();

// Clear all caches
window.__CACHE_UTILS__.clearAll(window.__QUERY_CLIENT__);

// Export cache data
await window.__CACHE__.export();

// View query cache
window.__QUERY_CLIENT__.getQueryCache().getAll();
```

### React Query DevTools

The app includes React Query DevTools for visual cache inspection:

1. Look for the DevTools icon in the bottom corner (development mode)
2. Click to open the panel
3. Inspect queries, mutations, and cache state
4. View query timeline and refetch behavior

### Cache Metrics

Monitor cache performance in your code:

```typescript
import { useCacheMetrics } from '@/hooks/useApiCache';
import { getCacheHitRate } from '@/lib/persistent-cache';

function CacheMonitor() {
  const { getPersistentCacheMetrics, getCacheSize } = useCacheMetrics();

  useEffect(() => {
    const interval = setInterval(async () => {
      const metrics = getPersistentCacheMetrics();
      const size = await getCacheSize();
      const hitRate = getCacheHitRate();

      console.log('Cache Metrics:', {
        hitRate: `${hitRate.toFixed(2)}%`,
        size,
        metrics,
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return null;
}
```

### Automatic Cleanup

The system automatically cleans expired cache entries every 5 minutes. Monitor cleanup in development console:

```
🧹 Cache cleanup: removed 15 expired entries
```

## Configuration

### Customize Cache Durations

Edit `/src/lib/cache-config.ts` to adjust cache times:

```typescript
export const CACHE_TIMES = {
  REAL_TIME: 30 * 1000, // 30 seconds
  SHORT: 2 * 60 * 1000, // 2 minutes
  STANDARD: 5 * 60 * 1000, // 5 minutes (adjust as needed)
  MEDIUM: 10 * 60 * 1000, // 10 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  SESSION: Infinity,
};
```

### Customize Strategies

Modify strategies in `/src/lib/cache-config.ts`:

```typescript
export const CACHE_STRATEGIES = {
  BENEFICIARIES: {
    staleTime: CACHE_TIMES.SHORT,
    gcTime: GC_TIMES.SHORT,
    refetchOnWindowFocus: false, // Change to true for more aggressive refetching
    refetchOnReconnect: true,
  },
  // ... other strategies
};
```

### Disable Persistent Cache

To disable IndexedDB caching and use memory-only:

The persistent cache automatically falls back to memory-only mode if IndexedDB is unavailable. To force memory-only mode, you can modify the initialization logic in `/src/lib/persistent-cache.ts`.

## Performance Impact

Expected improvements with proper caching:

- **API call reduction**: 60-80% fewer requests
- **Page load time**: 30-50% faster on repeat visits
- **Offline capability**: Critical data available offline
- **Network bandwidth**: 50-70% reduction
- **Server load**: 60-80% reduction

## Troubleshooting

### Cache Not Working

1. Check browser console for cache initialization messages
2. Verify IndexedDB is available in your browser
3. Check cache metrics: `window.__CACHE__.getMetrics()`
4. Verify query keys are consistent

### Stale Data Showing

1. Check if `staleTime` is too long for your use case
2. Verify cache invalidation is working after mutations
3. Check if `refetchOnWindowFocus` should be enabled
4. Manually invalidate: `queryClient.invalidateQueries({ queryKey })`

### Memory Issues

1. Reduce `gcTime` values in cache config
2. Run manual cleanup: `await persistentCache.cleanup()`
3. Clear unused caches: `queryClient.removeQueries({ queryKey })`
4. Monitor cache size: `await persistentCache.getSize()`

## Migration Guide

### For Existing useQuery Calls

Replace standard `useQuery` with cached versions:

```typescript
// Before
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: fetchBeneficiaries,
});

// After
import { useBeneficiariesQuery } from '@/hooks/useApiCache';

const { data } = useBeneficiariesQuery({});
```

### For API Routes

Add cache headers to existing routes:

```typescript
// Before
export async function GET() {
  const data = await fetchData();
  return NextResponse.json(data);
}

// After
import { createCachedResponse, CACHE_CONFIGS } from '@/lib/http-cache';

export async function GET() {
  const data = await fetchData();
  return createCachedResponse(data, CACHE_CONFIGS.PUBLIC_STANDARD);
}
```

## Further Reading

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [HTTP Caching - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [IndexedDB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Cache-Control Header - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
