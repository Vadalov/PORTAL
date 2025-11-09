# 🔧 PORTAL - Teknik Derinlemesine İnceleme

---

## 1️⃣ Frontend Mimarisi

### Next.js 16 App Router

- **File-based routing**: `src/app/` dizini otomatik route oluşturur
- **Server/Client Components**: 'use client' ile client-side rendering
- **API Routes**: `src/app/api/` altında backend endpoints
- **Layouts**: Nested layouts ile component reuse

### React 19 & TypeScript

- **Strict Mode**: `noImplicitAny: false`, `strictNullChecks: true`
- **Component Pattern**: Functional components with hooks
- **Type Safety**: Comprehensive type definitions
- **Error Boundaries**: Global error handling

### State Management

```typescript
// Zustand Store Example
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### Form Handling

```typescript
// React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export function MyForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return <form onSubmit={handleSubmit(onSubmit)} />;
}
```

---

## 2️⃣ Backend Mimarisi (Convex)

### Convex BaaS

- **Real-time Database**: Automatic subscriptions
- **Serverless Functions**: Queries & Mutations
- **Type-safe API**: Auto-generated types
- **File Storage**: Built-in file management

### Database Schema Pattern

```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(),
    isActive: v.boolean(),
  })
    .index('by_email', ['email'])
    .index('by_role', ['role'])
    .searchIndex('by_search', {
      searchField: 'name',
      filterFields: ['email'],
    }),
});
```

### Query Pattern

```typescript
// convex/beneficiaries.ts
export const list = query({
  args: { skip: v.number(), take: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('beneficiaries')
      .filter((q) => q.eq(q.field('status'), 'AKTIF'))
      .skip(args.skip)
      .take(args.take)
      .collect();
  },
});
```

### Mutation Pattern

```typescript
export const create = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      isActive: true,
    });
    return id;
  },
});
```

---

## 3️⃣ API Integration

### Convex Client (React Components)

```typescript
// src/lib/convex/client.ts
import { ConvexReactClient } from 'convex/react';

export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

### Using Convex in Components

```typescript
'use client';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function BeneficiaryList() {
  const beneficiaries = useQuery(api.beneficiaries.list, {
    skip: 0,
    take: 10,
  });

  const createBeneficiary = useMutation(api.beneficiaries.create);

  return (
    <div>
      {beneficiaries?.map((b) => (
        <div key={b._id}>{b.name}</div>
      ))}
    </div>
  );
}
```

### Server-side Convex (API Routes)

```typescript
// src/app/api/beneficiaries/route.ts
import { convexHttp } from '@/lib/convex/server';

export async function GET(request: Request) {
  const beneficiaries = await convexHttp.query(api.beneficiaries.list, { skip: 0, take: 10 });
  return Response.json(beneficiaries);
}
```

---

## 4️⃣ Security Implementation

### CSRF Protection

```typescript
// src/lib/csrf.ts
import crypto from 'crypto';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCsrfToken(token: string, stored: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(stored));
}
```

### Input Sanitization

```typescript
// src/lib/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

### TC Kimlik Hashing

```typescript
// src/lib/security.ts
import bcrypt from 'bcryptjs';

export async function hashTcNumber(tcNumber: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(tcNumber, salt);
}

export async function verifyTcNumber(tcNumber: string, hash: string): Promise<boolean> {
  return bcrypt.compare(tcNumber, hash);
}
```

---

## 5️⃣ Permission System

### Permission Types

```typescript
// src/types/permissions.ts
export const MODULE_PERMISSIONS = {
  BENEFICIARIES: 'beneficiaries:read',
  DONATIONS: 'donations:read',
  SCHOLARSHIPS: 'scholarships:read',
  TASKS: 'tasks:read',
  MEETINGS: 'meetings:read',
  MESSAGES: 'messages:read',
  REPORTS: 'reports:read',
  SETTINGS: 'settings:manage',
} as const;

export const SPECIAL_PERMISSIONS = {
  ADMIN: 'admin:all',
  EXPORT: 'data:export',
  DELETE: 'data:delete',
} as const;
```

### Permission Checking

```typescript
// src/lib/auth/permissions.ts
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('admin:all');
}

export function canAccess(userRole: string, requiredPermission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return hasPermission(rolePermissions, requiredPermission);
}
```

---

## 6️⃣ Validation Schemas

### Zod Schema Example

```typescript
// src/lib/validations/beneficiary.ts
import { z } from 'zod';

export const beneficiarySchema = z.object({
  name: z.string().min(1, 'Ad gerekli'),
  tc_no: z.string().regex(/^\d{11}$/, 'Geçerli TC No'),
  phone: z.string().regex(/^\+90\d{10}$/, 'Geçerli telefon'),
  email: z.string().email().optional(),
  address: z.string().min(5),
  city: z.string().min(1),
  district: z.string().min(1),
  family_size: z.number().min(1),
});

export type BeneficiaryInput = z.infer<typeof beneficiarySchema>;
```

---

## 7️⃣ Testing Strategy

### Unit Test Example (Vitest)

```typescript
// src/__tests__/lib/security.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '@/lib/sanitization';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<script>');
  });
});
```

### E2E Test Example (Playwright)

```typescript
// e2e/beneficiaries.spec.ts
import { test, expect } from '@playwright/test';

test('should create beneficiary', async ({ page }) => {
  await page.goto('/yardim/ihtiyac-sahipleri');
  await page.click('button:has-text("Yeni Ekle")');
  await page.fill('input[name="name"]', 'Test User');
  await page.click('button:has-text("Kaydet")');
  await expect(page).toContainText('Test User');
});
```

---

## 8️⃣ Performance Optimization

### Virtual Scrolling

```typescript
// src/components/ui/virtualized-data-table.tsx
export function VirtualizedDataTable({
  data,
  columns,
  rowHeight = 65,
  containerHeight = 600,
}) {
  const itemCount = data.length;
  const visibleCount = Math.ceil(containerHeight / rowHeight);

  return (
    <FixedSizeList
      height={containerHeight}
      itemCount={itemCount}
      itemSize={rowHeight}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### API Caching

```typescript
// src/lib/api-cache.ts
const cache = new Map<string, CacheEntry>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttl: number): void {
  cache.set(key, {
    value,
    expiry: Date.now() + ttl,
  });
}
```

---

## 9️⃣ Logging & Monitoring

### Logger Setup

```typescript
// src/lib/logger.ts
import * as Sentry from '@sentry/nextjs';

export const logger = {
  info: (message: string, data?: any) => {
    console.info(message, data);
  },
  error: (message: string, error?: Error) => {
    Sentry.captureException(error);
    console.error(message, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
  },
};
```

---

## 🔟 Environment Configuration

### Required Environment Variables

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Security
SESSION_SECRET=min-32-chars-secret
CSRF_SECRET=min-32-chars-secret

# Optional: Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA_ID=your-ga-id
```

---

## 📚 Key Patterns & Best Practices

1. **Always use path aliases** (@/components, @/lib, @/types)
2. **Validate all inputs** with Zod schemas
3. **Hash TC Kimlik** before storage
4. **Include CSRF token** in mutations
5. **Use 'use client'** for interactive components
6. **Implement error boundaries** for error handling
7. **Cache API responses** appropriately
8. **Log errors to Sentry** for monitoring
9. **Write tests** for critical logic
10. **Use Turkish localization** for UI text
