# Performance Optimization

<cite>
**Referenced Files in This Document**   
- [api-cache.ts](file://src/lib/api-cache.ts)
- [useApiCache.ts](file://src/hooks/useApiCache.ts)
- [http-cache.ts](file://src/lib/http-cache.ts)
- [virtualized-data-table.tsx](file://src/components/ui/virtualized-data-table.tsx)
- [suspense-boundary.tsx](file://src/components/ui/suspense-boundary.tsx)
- [web-vitals.ts](file://src/lib/performance/web-vitals.ts)
- [performance.ts](file://src/lib/performance.ts)
- [performance-monitor.tsx](file://src/lib/performance-monitor.tsx)
- [WebVitalsTracker.tsx](file://src/components/analytics/WebVitalsTracker.tsx)
- [storage.ts](file://convex/storage.ts)
- [providers.tsx](file://src/app/providers.tsx)
</cite>

## Table of Contents

1. [Client-Side Caching with TanStack Query](#client-side-caching-with-tanstack-query)
2. [API Response Caching and HTTP Headers](#api-response-caching-and-http-headers)
3. [Convex Query Optimization](#convex-query-optimization)
4. [Virtualized Data Tables for Large Datasets](#virtualized-data-tables-for-large-datasets)
5. [Suspense Boundaries and Loading States](#suspense-boundaries-and-loading-states)
6. [Image Optimization and File Handling](#image-optimization-and-file-handling)
7. [Code Splitting and Lazy Loading](#code-splitting-and-lazy-loading)
8. [Web Vitals Tracking and Performance Monitoring](#web-vitals-tracking-and-performance-monitoring)
9. [Performance Metrics and Optimization Strategies](#performance-metrics-and-optimization-strategies)

## Client-Side Caching with TanStack Query

The PORTAL application implements a comprehensive client-side caching strategy using TanStack Query (formerly React Query) to minimize redundant API calls and improve perceived performance. The caching system is built around custom hooks that provide optimized caching strategies for different data types.

The implementation uses a multi-layered caching approach with both in-memory React Query cache and persistent browser storage. The `useCachedQuery` hook automatically applies appropriate cache strategies based on the data type being queried, with configurable stale times and garbage collection periods. Cache keys are generated deterministically from endpoints and parameters to ensure consistency.

Cache invalidation is handled automatically through the `useCachedMutation` hook, which invalidates related caches when mutations occur. This ensures data consistency while maintaining optimal performance. The system also supports prefetching with `usePrefetchWithCache`, which checks the persistent cache before making network requests, further reducing latency.

**Section sources**

- [useApiCache.ts](file://src/hooks/useApiCache.ts#L1-L365)
- [api-cache.ts](file://src/lib/api-cache.ts#L1-L381)

## API Response Caching and HTTP Headers

PORTAL implements server-side API response caching through strategic HTTP cache headers that enable browser and CDN caching. The `http-cache.ts` module provides utilities for setting appropriate cache headers on API responses based on route patterns and data characteristics.

The system uses a configuration-based approach with predefined cache profiles for different types of data:

- **NO_CACHE**: For sensitive or user-specific data with `no-store` and `private` directives
- **PRIVATE**: For user-specific data with short caching duration
- **PUBLIC_SHORT**: For frequently changing data with ETag support
- **PUBLIC_STANDARD**: For moderately changing data with standard cache duration
- **PUBLIC_LONG**: For rarely changing data with extended cache duration
- **IMMUTABLE**: For static resources that never change
- **REVALIDATE**: For real-time data that must revalidate but can serve stale content

The `getCacheConfigForRoute` function automatically applies appropriate cache configurations based on URL patterns, ensuring that endpoints like `/api/beneficiaries` and `/api/donations` receive short cache durations, while static resources benefit from longer caching periods. ETags are generated for appropriate responses to enable efficient conditional requests.

**Section sources**

- [http-cache.ts](file://src/lib/http-cache.ts#L1-L261)

## Convex Query Optimization

The application leverages Convex as its backend-as-a-service platform, implementing optimized query patterns for efficient data retrieval. Convex queries are designed with pagination and filtering capabilities to handle large datasets efficiently.

The query implementation follows best practices with proper indexing on frequently queried fields and search indexes for text-based searches. The `list` query pattern includes skip and take parameters for pagination, preventing excessive data loading. Convex's real-time capabilities are used judiciously, with real-time updates enabled only for critical components to avoid unnecessary network overhead.

File operations are optimized through Convex's file storage system, with direct upload URL generation and efficient download URL retrieval. The `generateUploadUrl` and `getFileUrl` functions in `storage.ts` provide secure, optimized file operations with proper error handling and logging.

**Section sources**

- [storage.ts](file://convex/storage.ts#L1-L52)
- [TECHNICAL_DEEP_DIVE.md](file://TECHNICAL_DEEP_DIVE.md#L71-L165)

## Virtualized Data Tables for Large Datasets

PORTAL implements virtualized data tables to efficiently handle large datasets with minimal memory usage and smooth scrolling performance. The `VirtualizedDataTable` component uses windowing techniques to render only visible rows, significantly reducing the DOM size and memory footprint.

The virtualization strategy calculates visible items based on scroll position, container height, and row height, rendering only the necessary rows plus a small buffer for smooth scrolling. The implementation uses `transform: translateY` for positioning, leveraging GPU acceleration for smooth performance. The `will-change: transform` CSS property is applied to optimize rendering.

The component supports various performance-enhancing features:

- Memoized scroll handlers using `useCallback`
- Optimized row rendering with React.memo
- Hardware-accelerated scrolling
- Efficient pagination controls
- Search functionality with debounced input

This approach enables the application to handle datasets with 10,000+ records while maintaining smooth scrolling and minimal memory usage, as evidenced by the 95% reduction in memory consumption for data table scrolling.

**Section sources**

- [virtualized-data-table.tsx](file://src/components/ui/virtualized-data-table.tsx#L1-L309)

## Suspense Boundaries and Loading States

The application implements a sophisticated loading state management system using React Suspense and custom suspense boundaries. The `SuspenseBoundary` component provides a consistent loading experience across the application with configurable loading variants (spinner, dots, pulse, bars, ripple).

The implementation wraps critical components with suspense boundaries to handle asynchronous operations gracefully. The `FallbackWrapper` component manages the loading state, capturing focus before suspension and restoring it upon resume to maintain accessibility. Performance metrics are logged for suspension duration, with warnings for suspensions exceeding 5 seconds.

In the application providers, suspense is used to manage the hydration process, showing a loading spinner until the application is fully hydrated. This prevents hydration mismatches and provides immediate feedback to users during the initial load.

**Section sources**

- [suspense-boundary.tsx](file://src/components/ui/suspense-boundary.tsx#L1-L116)
- [providers.tsx](file://src/app/providers.tsx#L69-L128)

## Image Optimization and File Handling

PORTAL implements comprehensive image and file optimization strategies to reduce bandwidth usage and improve load times. The file upload system integrates with Convex's file storage, providing secure and efficient file operations.

The `DocumentsManager` component implements drag-and-drop file upload with visual feedback, supporting image and PDF files. File validation is performed client-side to ensure appropriate file types and sizes before upload. The system enforces file size limits and validates file types to prevent oversized or potentially harmful files.

Image optimization is achieved through responsive image handling and appropriate file format selection. The application leverages modern image formats when available and implements lazy loading for images below the fold. The file upload API endpoints handle both upload URL generation and download URL retrieval with proper error handling and logging.

**Section sources**

- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L141-L187)
- [route.ts](file://src/app/api/upload/route.ts#L1-L125)
- [storage.ts](file://convex/storage.ts#L1-L52)

## Code Splitting and Lazy Loading

The application implements route-based code splitting and component-level lazy loading to optimize bundle size and improve initial load performance. The `lazyLoadComponent` utility function wraps dynamic imports with React.lazy and Suspense, enabling code splitting at the component level.

This approach results in a 30% reduction in bundle size by loading only the code required for the current route. Critical components are prioritized in the initial bundle, while less frequently used features are loaded on demand. The implementation uses React's built-in code splitting capabilities with proper error boundaries to handle loading failures gracefully.

The lazy loading strategy is combined with prefetching for anticipated navigation, improving perceived performance when users navigate between related views. This balanced approach ensures fast initial loads while maintaining responsiveness during navigation.

**Section sources**

- [performance.ts](file://src/lib/performance.ts#L87-L126)

## Web Vitals Tracking and Performance Monitoring

PORTAL includes comprehensive performance monitoring with Web Vitals tracking to measure and optimize user experience. The `WebVitalsTracker` component implements client-side tracking of Core Web Vitals metrics including LCP, FID, CLS, FCP, TTFB, and INP.

The tracking system uses the web-vitals library to collect performance data and sends it to multiple destinations:

- Console logging in development mode
- Google Analytics 4 with custom event mapping
- Sentry metrics for error tracking
- Custom analytics endpoint with keepalive requests

The `trackWebVitals` function registers listeners for each vital metric, categorizing performance as "good," "needs-improvement," or "poor" based on established thresholds. This data is used to identify performance bottlenecks and measure the impact of optimizations.

Additional performance monitoring is provided by the `PerformanceMonitor` class, which tracks custom metrics like route transition times, modal open times, and scroll performance. This comprehensive monitoring approach enables data-driven optimization decisions.

**Section sources**

- [WebVitalsTracker.tsx](file://src/components/analytics/WebVitalsTracker.tsx#L1-L17)
- [web-vitals.ts](file://src/lib/performance/web-vitals.ts#L1-L164)
- [performance-monitor.tsx](file://src/lib/performance-monitor.tsx#L1-L54)

## Performance Metrics and Optimization Strategies

The PORTAL application has achieved significant performance improvements through a combination of optimization strategies. Key metrics show substantial enhancements across various performance dimensions:

- **Page Transitions**: 67% faster navigation between views
- **Modal Animations**: 25% smoother animation performance
- **DataTable Scroll**: 95% reduction in memory usage
- **Scroll Performance**: 80% smoother scrolling experience
- **API Calls**: 60% reduction in network requests
- **Bundle Size**: 30% smaller overall bundle

These improvements were achieved through a comprehensive set of technical optimizations:

- GPU hardware acceleration using `transform: translateZ`
- RequestAnimationFrame for scroll optimization
- Virtual scrolling for large datasets (10,000+ records)
- React memoization to prevent unnecessary re-renders
- Smart API caching with LRU and TTL strategies
- Route-based code splitting
- Memory management and garbage collection optimization

The performance monitoring system continuously tracks these metrics, enabling ongoing optimization and ensuring that performance remains a priority throughout the application lifecycle.

**Section sources**

- [IMPROVEMENTS_SUMMARY.md](file://IMPROVEMENTS_SUMMARY.md#L84-L106)
- [performance.test.ts](file://src/__tests__/lib/performance.test.ts#L1-L48)
- [performance.ts](file://src/lib/performance.ts#L1-L42)
