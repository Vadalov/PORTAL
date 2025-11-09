# Frontend Architecture

<cite>
**Referenced Files in This Document**   
- [PageLayout.tsx](file://src/components/layouts/PageLayout.tsx)
- [useFormMutation.ts](file://src/hooks/useFormMutation.ts)
- [GoogleAnalytics.tsx](file://src/components/analytics/GoogleAnalytics.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
- [api-cache.ts](file://src/lib/api-cache.ts)
- [useApiCache.ts](file://src/hooks/useApiCache.ts)
- [providers.tsx](file://src/app/providers.tsx)
- [format.ts](file://src/lib/utils/format.ts)
- [pdf-strings.ts](file://src/lib/constants/pdf-strings.ts)
- [tailwind.config.js](file://tailwind.config.js)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction

This document provides comprehensive architectural documentation for the frontend component of PORTAL, a system designed for Turkish non-profit organizations. The frontend is built using Next.js with the App Router pattern, leveraging React Server Components for optimized rendering. The architecture emphasizes reusable UI components, effective state management, robust form handling, and internationalization support for Turkish language.

## Project Structure

The frontend project follows a well-organized structure based on functional and technical domains. The core application resides in the `src/app` directory using the Next.js App Router pattern, with server components and API routes. Reusable UI components are organized in `src/components` with a logical grouping by feature and utility. Shared logic and utilities are located in `src/lib`, while custom hooks are isolated in `src/hooks`. The structure supports scalability and maintainability through clear separation of concerns.

```mermaid
graph TB
subgraph "App Router"
A["src/app"]
A1["src/app/(dashboard)"]
A2["src/app/api"]
A3["src/app/login"]
end
subgraph "Components"
B["src/components"]
B1["src/components/layouts"]
B2["src/components/ui"]
B3["src/components/forms"]
end
subgraph "Logic"
C["src/lib"]
C1["src/lib/api"]
C2["src/lib/validations"]
C3["src/lib/utils"]
end
subgraph "Hooks"
D["src/hooks"]
D1["src/hooks/useApiCache"]
D2["src/hooks/useFormMutation"]
end
A --> B
A --> C
A --> D
C --> D
```

**Diagram sources**

- [app](file://src/app)
- [components](file://src/components)
- [lib](file://src/lib)
- [hooks](file://src/hooks)

**Section sources**

- [src](file://src)

## Core Components

The frontend architecture is built around several core components that provide the foundation for the application's functionality. The PageLayout component standardizes page structure across the application with consistent headers, actions, and responsive design. Form components leverage React Hook Form for efficient form state management with Zod validation. The analytics components integrate Google Analytics and Web Vitals tracking for performance monitoring. UI components follow a design system approach with reusable primitives.

**Section sources**

- [PageLayout.tsx](file://src/components/layouts/PageLayout.tsx)
- [GoogleAnalytics.tsx](file://src/components/analytics/GoogleAnalytics.tsx)
- [form.tsx](file://src/components/ui/form.tsx)

## Architecture Overview

The frontend architecture follows a modern React application pattern with Next.js App Router, utilizing both server and client components strategically. Server components handle data fetching and initial rendering, while client components manage interactive elements and state. The architecture implements a layered approach with clear separation between presentation, state management, and data access layers.

```mermaid
graph TD
A[API Routes] --> B[Server Components]
B --> C[Data Fetching]
C --> D[TanStack Query]
D --> E[Server State]
F[Zustand] --> G[Global State]
H[React Hook Form] --> I[Form State]
J[Tailwind CSS] --> K[Styling]
L[Zod] --> M[Validation]
B --> N[Client Components]
N --> O[UI Components]
O --> P[User Interaction]
P --> Q[State Updates]
Q --> E
Q --> G
Q --> I
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#f96,stroke:#333
style D fill:#6f9,stroke:#333
style E fill:#6f9,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#6f9,stroke:#333
style H fill:#6f9,stroke:#333
style I fill:#6f9,stroke:#333
style J fill:#9cf,stroke:#333
style K fill:#9cf,stroke:#333
style L fill:#cf9,stroke:#333
style M fill:#cf9,stroke:#333
style N fill:#bbf,stroke:#333
style O fill:#ffc,stroke:#333
style P fill:#ffc,stroke:#333
style Q fill:#f96,stroke:#333
```

**Diagram sources**

- [app](file://src/app)
- [api](file://src/app/api)
- [components](file://src/components)
- [lib](file://src/lib)

## Detailed Component Analysis

### Page Layout Component

The PageLayout component provides a consistent structure for all pages in the application, implementing responsive design patterns and accessibility features. It includes motion animations for improved user experience and supports customizable actions and badges.

```mermaid
classDiagram
class PageLayout {
+children : ReactNode
+title : string
+description : string
+icon : ReactComponent
+badge : BadgeProps
+actions : ReactNode
+showBackButton : boolean
+className : string
}
PageLayout --> Badge : "contains"
PageLayout --> Button : "contains"
PageLayout --> motion.div : "uses animation"
PageLayout --> cn : "uses utility"
```

**Diagram sources**

- [PageLayout.tsx](file://src/components/layouts/PageLayout.tsx#L9-L90)

**Section sources**

- [PageLayout.tsx](file://src/components/layouts/PageLayout.tsx#L9-L90)

### Form Management System

The form management system is built on React Hook Form with Zod validation, providing an efficient and type-safe approach to form handling. The useFormMutation hook standardizes form submissions with automatic query invalidation and user feedback.

```mermaid
sequenceDiagram
participant Form as Form Component
participant Hook as useFormMutation
participant Query as QueryClient
participant Toast as Toast System
participant API as API Endpoint
Form->>Hook : mutate(variables)
Hook->>API : mutationFn(variables)
alt Success
API-->>Hook : Success Response
Hook->>Query : invalidateQueries(queryKey)
Hook->>Toast : Show success message
Hook-->>Form : Success
else Error
API-->>Hook : Error Response
Hook->>Toast : Show error message
Hook->>Console : Log error
Hook-->>Form : Error
end
```

**Diagram sources**

- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L9-L102)
- [form.tsx](file://src/components/ui/form.tsx)

**Section sources**

- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L9-L102)
- [form.tsx](file://src/components/ui/form.tsx)

### State Management Architecture

The state management architecture combines Zustand for global application state and TanStack Query for server state management. This hybrid approach provides optimal performance and data consistency across the application.

```mermaid
graph TD
A[Zustand Store] --> B[Global State]
C[TanStack Query] --> D[Server State]
D --> E[Query Cache]
E --> F[Persistent Cache]
G[API Routes] --> H[Data Fetching]
H --> D
I[User Actions] --> A
I --> D
J[Cache Invalidation] --> E
K[Prefetching] --> E
style A fill:#6f9,stroke:#333
style B fill:#6f9,stroke:#333
style C fill:#6f9,stroke:#333
style D fill:#6f9,stroke:#333
style E fill:#6f9,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#f9f,stroke:#333
style H fill:#f96,stroke:#333
style I fill:#ffc,stroke:#333
style J fill:#f96,stroke:#333
style K fill:#f96,stroke:#333
```

**Diagram sources**

- [useApiCache.ts](file://src/hooks/useApiCache.ts)
- [api-cache.ts](file://src/lib/api-cache.ts)
- [providers.tsx](file://src/app/providers.tsx)

**Section sources**

- [useApiCache.ts](file://src/hooks/useApiCache.ts)
- [api-cache.ts](file://src/lib/api-cache.ts)
- [providers.tsx](file://src/app/providers.tsx)

## Dependency Analysis

The frontend architecture has well-defined dependencies between components and libraries. The application relies on Next.js for routing and server components, React for UI rendering, and various specialized libraries for specific functionality.

```mermaid
graph TD
A[Next.js] --> B[App Router]
A --> C[Server Components]
A --> D[API Routes]
E[React] --> F[React Hook Form]
E --> G[Zustand]
H[TanStack Query] --> I[Data Fetching]
J[Tailwind CSS] --> K[Styling]
L[Zod] --> M[Validation]
B --> N[Page Routing]
C --> O[Data Fetching]
D --> P[API Endpoints]
F --> Q[Form State]
G --> R[Global State]
I --> S[Server State]
K --> T[Responsive Design]
M --> U[Type Safety]
style A fill:#66f,stroke:#333
style B fill:#bbf,stroke:#333
style C fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#66f,stroke:#333
style F fill:#6f9,stroke:#333
style G fill:#6f9,stroke:#333
style H fill:#66f,stroke:#333
style I fill:#6f9,stroke:#333
style J fill:#66f,stroke:#333
style K fill:#9cf,stroke:#333
style L fill:#66f,stroke:#333
style M fill:#cf9,stroke:#333
style N fill:#ffc,stroke:#333
style O fill:#ffc,stroke:#333
style P fill:#ffc,stroke:#333
style Q fill:#ffc,stroke:#333
style R fill:#ffc,stroke:#333
style S fill:#ffc,stroke:#333
style T fill:#ffc,stroke:#333
style U fill:#ffc,stroke:#333
```

**Diagram sources**

- [package.json](file://package.json)
- [tailwind.config.js](file://tailwind.config.js)
- [tsconfig.json](file://tsconfig.json)

**Section sources**

- [package.json](file://package.json)

## Performance Considerations

The application implements several performance optimization techniques, including code splitting, lazy loading, and aggressive caching strategies. The use of React Server Components reduces client-side JavaScript payload, while TanStack Query provides intelligent data caching and background refetching.

```mermaid
flowchart TD
Start([Application Load]) --> CodeSplitting["Code Splitting"]
CodeSplitting --> LazyLoading["Lazy Loading Components"]
LazyLoading --> ServerComponents["Render Server Components"]
ServerComponents --> DataFetching["Fetch Data on Server"]
DataFetching --> CacheCheck["Check Cache First"]
CacheCheck --> CacheHit{"Cache Hit?"}
CacheHit --> |Yes| ReturnCached["Return Cached Data"]
CacheHit --> |No| FetchAPI["Fetch from API"]
FetchAPI --> StoreCache["Store in Cache"]
StoreCache --> ReturnData["Return Data"]
ReturnCached --> End([Render UI])
ReturnData --> End
End --> ClientHydration["Hydrate Client Components"]
ClientHydration --> Interactive["Interactive UI"]
```

**Diagram sources**

- [api-cache.ts](file://src/lib/api-cache.ts)
- [useApiCache.ts](file://src/hooks/useApiCache.ts)
- [performance.ts](file://src/lib/performance.ts)

**Section sources**

- [api-cache.ts](file://src/lib/api-cache.ts)
- [useApiCache.ts](file://src/hooks/useApiCache.ts)
- [performance.ts](file://src/lib/performance.ts)

## Troubleshooting Guide

The application includes several debugging and troubleshooting utilities to assist with development and production issues. These include development-only debug tools exposed on the window object, comprehensive logging, and cache management utilities.

**Section sources**

- [providers.tsx](file://src/app/providers.tsx#L31-L67)
- [logger.ts](file://src/lib/logger.ts)
- [cache-config.test.ts](file://src/__tests__/lib/cache-config.test.ts)

## Conclusion

The PORTAL frontend architecture demonstrates a modern, well-structured approach to building React applications with Next.js. By leveraging the App Router pattern, React Server Components, and a thoughtful combination of state management solutions, the application achieves excellent performance and developer experience. The consistent use of reusable components, proper form handling, and internationalization support for Turkish language make it well-suited for its target non-profit organization users. The architecture balances innovation with practicality, providing a solid foundation for future growth and maintenance.
