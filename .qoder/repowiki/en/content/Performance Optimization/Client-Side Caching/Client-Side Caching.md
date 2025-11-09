# Client-Side Caching

<cite>
**Referenced Files in This Document**   
- [api-cache.ts](file://src/lib/api-cache.ts)
- [useApiCache.ts](file://src/hooks/useApiCache.ts)
- [cache-config.ts](file://src/lib/cache-config.ts)
- [persistent-cache.ts](file://src/lib/persistent-cache.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [SmartCache Implementation](#smartcache-implementation)
3. [useCachedQuery Hook](#usecachedquery-hook)
4. [Cache Configuration Strategy](#cache-configuration-strategy)
5. [Cache Key Generation and Prefetching](#cache-key-generation-and-prefetching)
6. [Integration with TanStack Query](#integration-with-tanstack-query)
7. [Performance Monitoring and Troubleshooting](#performance-monitoring-and-troubleshooting)

## Introduction

The PORTAL application implements a sophisticated client-side caching system to optimize performance, reduce API calls, and enhance user experience. The caching architecture combines in-memory caching with persistent storage, utilizing the SmartCache class for advanced cache management and the useCachedQuery hook for seamless integration with React Query. This document details the implementation of these components, their configuration strategies, and best practices for effective cache utilization.

## SmartCache Implementation

The SmartCache class provides a robust foundation for client-side caching with LRU eviction, TTL-based expiration, and automatic garbage collection. This implementation ensures optimal memory usage while maintaining data freshness.

```mermaid
classDiagram
class SmartCache~T~ {
-cache : Map~string, CacheEntry~T~~
-config : CacheConfig
-stats : {hits : number, misses : number}
-gcTimer : NodeJS.Timeout
+get(key : string) : T | null
+set(key : string, data : T, ttl? : number) : void
+delete(key : string) : void
+clear() : void
+size() : number
+getStats() : {hits : number, misses : number, hitRate : number}
-evictLRU() : void
-startGarbageCollection() : void
-garbageCollect() : void
+destroy() : void
}
class CacheEntry~T~ {
+data : T
+timestamp : number
+expiresAt : number
+accessCount : number
+lastAccessed : number
}
class CacheConfig {
+ttl : number
+maxSize : number
+staleWhileRevalidate : boolean
+gcInterval : number
}
SmartCache~T~ --> CacheEntry~T~ : "contains"
SmartCache~T~ --> CacheConfig : "uses"
```

**Diagram sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L30-L143)

**Section sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L30-L143)

## useCachedQuery Hook

The useCachedQuery hook integrates React Query with custom caching logic, providing a seamless interface for data fetching with intelligent cache management. This hook serves as the primary interface for components to access cached data.

```mermaid
sequenceDiagram
participant Component as "React Component"
participant Hook as "useCachedQuery"
participant SmartCache as "SmartCache"
participant API as "API Endpoint"
Component->>Hook : Call useCachedQuery with endpoint and params
Hook->>SmartCache : Generate cache key
Hook->>SmartCache : Check for cached data
alt Data in cache
SmartCache-->>Hook : Return cached data
Hook-->>Component : Return data from cache
else Data not in cache
Hook->>API : Fetch fresh data
API-->>Hook : Return API response
Hook->>SmartCache : Store response in cache
Hook-->>Component : Return fetched data
end
```

**Diagram sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L197-L252)
- [useApiCache.ts](file://src/hooks/useApiCache.ts#L163-L176)

**Section sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L197-L252)
- [useApiCache.ts](file://src/hooks/useApiCache.ts#L163-L176)

## Cache Configuration Strategy

The caching system employs a strategic configuration approach for different data types, with specific TTLs and size limits tailored to each entity's characteristics and usage patterns.

```mermaid
flowchart TD
A[Cache Configuration] --> B[beneficiaries]
A --> C[donations]
A --> D[tasks]
A --> E[meetings]
A --> F[default]
B --> G["TTL: 5 minutes<br/>Max Size: 100<br/>GC Interval: 2 minutes"]
C --> H["TTL: 3 minutes<br/>Max Size: 50<br/>GC Interval: 2 minutes"]
D --> I["TTL: 2 minutes<br/>Max Size: 75<br/>GC Interval: 1 minute"]
E --> J["TTL: 1 minute<br/>Max Size: 30<br/>GC Interval: 1 minute"]
F --> K["TTL: 2 minutes<br/>Max Size: 50<br/>GC Interval: 2 minutes"]
```

**Diagram sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L146-L177)

**Section sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L146-L177)

## Cache Key Generation and Prefetching

The caching system implements intelligent cache key generation and prefetching mechanisms to optimize data retrieval and improve application responsiveness.

```mermaid
sequenceDiagram
participant Component as "React Component"
participant Hook as "usePrefetchWithCache"
participant PersistentCache as "PersistentCache"
participant SmartCache as "SmartCache"
participant API as "API Endpoint"
Component->>Hook : Call prefetch with endpoint and params
Hook->>PersistentCache : Generate cache key
Hook->>PersistentCache : Check for persistent cache
alt Data in persistent cache
PersistentCache-->>Hook : Return cached data
Hook->>SmartCache : Update in-memory cache
Hook->>ReactQuery : Update query cache
else Data not in persistent cache
Hook->>API : Fetch data with priority
API-->>Hook : Return API response
Hook->>SmartCache : Store in SmartCache
Hook->>PersistentCache : Store in persistent cache
Hook->>ReactQuery : Update query cache
end
```

**Diagram sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L250-L318)
- [useApiCache.ts](file://src/hooks/useApiCache.ts#L211-L247)

**Section sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L191-L194)
- [api-cache.ts](file://src/lib/api-cache.ts#L250-L318)
- [useApiCache.ts](file://src/hooks/useApiCache.ts#L211-L247)

## Integration with TanStack Query

The caching system seamlessly integrates with TanStack Query, implementing a stale-while-revalidate strategy to provide immediate data access while ensuring data freshness.

```mermaid
flowchart LR
A[React Component] --> B[useCachedQuery]
B --> C{Data in Cache?}
C --> |Yes| D[Return Stale Data]
C --> |No| E[Fetch Fresh Data]
D --> F[Background Revalidation]
E --> G[Store in Cache]
G --> H[Return Fresh Data]
F --> G
```

**Diagram sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L197-L252)
- [cache-config.ts](file://src/lib/cache-config.ts#L61-L181)

**Section sources**

- [api-cache.ts](file://src/lib/api-cache.ts#L197-L252)
- [cache-config.ts](file://src/lib/cache-config.ts#L61-L181)

## Performance Monitoring and Troubleshooting

The caching system includes comprehensive performance monitoring and troubleshooting capabilities to ensure optimal operation and facilitate debugging.

```mermaid
classDiagram
class CacheMetrics {
+hits : number
+misses : number
+sets : number
+deletes : number
+errors : number
}
class useCacheMetrics {
+getQueryCacheStats()
+getPersistentCacheMetrics()
+getCacheSize()
+clearAllCaches()
+clearEntityCache()
+cleanup()
+exportCache()
}
class useInvalidateCache {
+invalidateEndpoint()
+invalidatePattern()
}
useCacheMetrics --> CacheMetrics : "returns"
useInvalidateCache --> SmartCache : "clears"
useInvalidateCache --> ReactQuery : "invalidates"
```

**Diagram sources**

- [persistent-cache.ts](file://src/lib/persistent-cache.ts#L39-L45)
- [useApiCache.ts](file://src/hooks/useApiCache.ts#L252-L308)
- [api-cache.ts](file://src/lib/api-cache.ts#L322-L333)

**Section sources**

- [persistent-cache.ts](file://src/lib/persistent-cache.ts#L30-L453)
- [useApiCache.ts](file://src/hooks/useApiCache.ts#L252-L308)
- [api-cache.ts](file://src/lib/api-cache.ts#L322-L377)
