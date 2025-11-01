# GitHub Copilot Instructions for PORTAL

This is a Turkish non-profit association management system (Dernek Yönetim Sistemi) built with Next.js 16, TypeScript, and Appwrite.

## Critical Rules

### 1. Dual Appwrite SDK Architecture
NEVER mix these two SDKs:

```typescript
// ✅ Client Components ('use client'):
import { databases } from '@/lib/appwrite/client';

// ✅ Server Components/API Routes:
import { serverDatabases } from '@/lib/appwrite/server';

// ❌ NEVER in client components (exposes API key!):
import { serverDatabases } from '@/lib/appwrite/server';
```

### 2. Turkish Context
- UI text: Always Turkish
- Phone: +90 5XX XXX XX XX format
- TC Kimlik No: 11 digits with checksum validation
- Currency: Turkish Lira (₺)
- Dates: DD.MM.YYYY in UI

### 3. State Management
Use Zustand with immer + persist + devtools pattern:

```typescript
export const useStore = create<Store>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set) => ({
          // state + actions
        }))
      )
    )
  )
);
```

### 4. Forms & Validation
- Use React Hook Form + Zod schemas
- Sanitize all inputs using `src/lib/sanitization.ts`
- Validate with schemas from `src/lib/validations/`

### 5. Security
- CSRF tokens for all mutations
- HttpOnly cookies for sessions
- Input sanitization (XSS, SQL injection)
- Sentry error tracking enabled

## Quick Reference

**Routes:** Turkish naming (`/yardim/ihtiyac-sahipleri`)  
**API Layer:** `src/lib/api/appwrite-api.ts`  
**Auth Store:** `src/stores/authStore.ts`  
**Permissions:** Defined in `src/types/auth.ts`

For full documentation, see CLAUDE.md in the root directory.
