# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PORTAL** is a comprehensive Turkish non-profit association management system (Dernek Yönetim Sistemi) built with Next.js 16, TypeScript, and Convex as the backend-as-a-service. The system manages beneficiaries, donations, scholarships, tasks, meetings, and internal communications with full role-based access control.

- **Stack**: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Convex BaaS
- **Scale**: ~45,000 LOC, 146+ unit tests
- **Language Context**: UI is in Turkish, serving Turkish non-profit organizations
- **Key Features**: Beneficiary management, donation tracking (including Kumbara/money box system), scholarship programs, task management, meeting management, internal messaging, financial reporting

## Essential Development Commands

```bash
# Development
npm run dev              # Start dev server (port 3000, auto-kills existing process)
npm run build            # Production build
npm run start            # Start production server

# Code Quality (ALWAYS RUN BEFORE COMMITS)
npm run typecheck        # TypeScript check - MUST pass with 0 errors
npm run lint             # ESLint check - MUST pass with 0 errors
npm run lint:fix         # Auto-fix linting issues

# Testing
npm run test:run         # Run all unit tests once (146+ tests)
npm test                 # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run e2e              # Run E2E tests (Playwright)

# Run a single test file
npx vitest src/__tests__/lib/sanitization.test.ts

# Convex Backend
npx convex dev           # Start Convex development server
npx convex deploy --prod # Deploy Convex to production

# Deployment
npm run validate:deploy  # Pre-deployment validation
npm run deploy:vercel    # Automated Vercel + Convex deployment
```

## Critical Architecture Principles

### 1. Convex Backend-as-a-Service Architecture

**CRITICAL**: This project uses Convex as BaaS, NOT traditional REST APIs. There are TWO separate SDKs:

```typescript
// CLIENT SDK - For React components (browser)
// File: src/lib/convex/client.ts
import { convex } from '@/lib/convex/client';
// Use with 'use client' directive ONLY

// SERVER SDK - For Server Components & API Routes
// File: src/lib/convex/server.ts
import { getConvexHttp } from '@/lib/convex/server';
const convexHttp = getConvexHttp();
```

**Never mix these!** Using client SDK in server components or vice versa will cause build errors.

### 2. Convex Functions Structure

All backend logic lives in `convex/` directory:

```
convex/
├── schema.ts              # Database schema (40+ collections)
├── auth.ts               # Authentication functions
├── beneficiaries.ts      # Beneficiary CRUD (320+ lines)
├── donations.ts          # Donation management + Kumbara tracking
├── scholarships.ts       # Scholarship programs
├── tasks.ts              # Task operations
├── meetings.ts           # Meeting management
├── messages.ts           # Internal messaging
├── users.ts              # User management
└── [15+ more files...]   # Other domain functions
```

Use queries (read) and mutations (write):

```typescript
// In a Server Component or API route
import { api } from '@/convex/_generated/api';
const convexHttp = getConvexHttp();

// Query example
const beneficiaries = await convexHttp.query(api.beneficiaries.list, {
  status: 'AKTIF',
});

// Mutation example
const newBeneficiary = await convexHttp.mutation(api.beneficiaries.create, {
  name: '...',
  tc_no: hashedTc, // Always hash TC numbers!
  // ...
});
```

### 3. Turkish Context Requirements

**CRITICAL**: This system serves Turkish non-profit organizations:

- **UI Language**: Always Turkish (e.g., "Kaydet" not "Save")
- **Routes**: Turkish naming (`/yardim/ihtiyac-sahipleri` not `/help/beneficiaries`)
- **TC Kimlik No**: 11-digit Turkish national ID with validation algorithm
  - **MUST be hashed** before database storage using `hashTcNumber()`
  - **MUST be masked** in UI display (e.g., `123****7890`)
  - See `convex/tc_security.ts` for security functions
- **Phone Format**: +90 5XX XXX XX XX (Turkish mobile only)
- **Currency**: Turkish Lira (₺)
- **Date Format**: DD.MM.YYYY in UI

### 4. Security Requirements (MANDATORY)

**Input Sanitization** - ALWAYS use these before database operations:

```typescript
import {
  sanitizeTcNo, // TC validation + algorithm check
  sanitizePhone, // Turkish phone format
  sanitizeEmail, // Email format + lowercase
  sanitizeHtml, // XSS prevention (DOMPurify)
  sanitizeString, // General string sanitization
} from '@/lib/sanitization';
```

**TC Kimlik No Security** - NEVER store plain TC numbers:

```typescript
// In Convex mutations
import { hashTcNumber, maskTcNumber } from './tc_security';

// Before storing
const hashedTc = await hashTcNumber(ctx, plainTcNo);
await ctx.db.insert('beneficiaries', { tc_no: hashedTc, ... });

// For display
const maskedTc = await maskTcNumber(ctx, plainTcNo); // "123****7890"
```

**CSRF Protection** - All mutation API calls require CSRF token:

```typescript
// Get CSRF token
const response = await fetch('/api/csrf');
const { csrfToken } = await response.json();

// Include in mutations
fetch('/api/beneficiaries', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  body: JSON.stringify(data),
});
```

### 5. Database Schema Key Collections

The Convex schema (`convex/schema.ts`) includes 40+ collections:

**Core Collections:**

- `users` - User accounts (indexed by email, role)
- `beneficiaries` - Aid recipients (indexed by TC, status, city)
- `donations` - Financial contributions + Kumbara tracking
- `scholarships` - Scholarship programs
- `scholarship_applications` - Student applications
- `tasks` - Task management
- `meetings` - Meeting scheduling
- `messages` - Internal messaging
- `files` - File storage metadata
- `aid_applications` - Aid request tracking
- `finance_records` - Financial transactions
- `partners` - Partner organizations
- `consents` - KVKK/GDPR consent records
- `audit_logs` - Audit trail for all critical operations
- `errors` - Error tracking and monitoring

**Always use indexes** for queries:

```typescript
// ✅ FAST - Uses index
const beneficiaries = await ctx.db
  .query('beneficiaries')
  .withIndex('by_status', (q) => q.eq('status', 'AKTIF'))
  .collect();

// ❌ SLOW - Full table scan
const beneficiaries = await ctx.db.query('beneficiaries').collect();
const filtered = beneficiaries.filter((b) => b.status === 'AKTIF');
```

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (dashboard)/         # Protected routes (require auth)
│   │   ├── genel/          # Dashboard home
│   │   ├── yardim/         # Aid management (beneficiaries)
│   │   ├── bagis/          # Donations + Kumbara
│   │   ├── burs/           # Scholarships
│   │   ├── is/             # Tasks + Meetings
│   │   ├── kullanici/      # User management
│   │   └── layout.tsx      # Dashboard layout with sidebar
│   ├── api/                # API routes (use server SDK)
│   ├── login/              # Login page (public)
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components (41 components)
│   ├── forms/              # Form components
│   ├── layouts/            # Layout components
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── convex/             # Convex client & server SDKs
│   ├── api/                # API utilities
│   ├── auth/               # Authentication utilities
│   ├── validations/        # Zod schemas (1000+ lines)
│   ├── sanitization.ts     # Input sanitization (15+ functions)
│   ├── csrf.ts             # CSRF protection
│   ├── rate-limit.ts       # Rate limiting
│   └── utils.ts            # General utilities
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
└── __tests__/              # Vitest unit tests

convex/
├── _generated/             # Auto-generated (NEVER edit)
├── schema.ts               # Database schema (1446 lines)
├── auth.ts                 # Authentication logic
├── beneficiaries.ts        # Beneficiary operations
├── donations.ts            # Donation + Kumbara management
├── scholarships.ts         # Scholarship system
├── tasks.ts                # Task operations
├── meetings.ts             # Meeting management
├── messages.ts             # Messaging system
├── tc_security.ts          # TC Kimlik security (GDPR)
└── [25+ more files]        # Other domain functions
```

**Path Aliases** (use these):

```typescript
"@/*" -> "./src/*"
"@/components/*" -> "./src/components/*"
"@/lib/*" -> "./src/lib/*"
"@/convex/*" -> "./convex/*"
```

## Common Development Patterns

### Forms with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { beneficiarySchema } from '@/lib/validations/beneficiary';
import { sanitizeTcNo, sanitizePhone } from '@/lib/sanitization';

const form = useForm({
  resolver: zodResolver(beneficiarySchema),
  defaultValues: {
    /* ... */
  },
});

// In submit handler
const onSubmit = async (data) => {
  // ALWAYS sanitize before API calls
  const cleanData = {
    tcNo: sanitizeTcNo(data.tcNo),
    phone: sanitizePhone(data.phone),
    // ...
  };
  await createBeneficiary(cleanData);
};
```

### State Management (Zustand)

```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useMyStore = create<Store>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set) => ({
          data: null,
          setData: (data) =>
            set((state) => {
              state.data = data;
            }),
        })),
        { name: 'my-store', skipHydration: true }
      )
    )
  )
);
```

### Permission Checking

```typescript
import { useAuthStore } from '@/stores/authStore';
import { Permission } from '@/types/auth';

// In components
const { hasPermission } = useAuthStore();
const canCreate = hasPermission(Permission.BENEFICIARIES_CREATE);

// 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
// ~30 granular permissions
```

## Common Pitfalls & Solutions

### 1. Convex Client SDK in Server Components

**Error**: `ConvexReactClient throws error during build`
**Solution**: Use server SDK instead:

```typescript
// ❌ WRONG
import { convex } from '@/lib/convex/client';

// ✅ CORRECT
import { getConvexHttp } from '@/lib/convex/server';
```

### 2. Unhashed TC Kimlik Numbers

**Error**: Plain TC numbers in database (GDPR violation)
**Solution**: Always hash before storage:

```typescript
// ❌ WRONG
await ctx.db.insert('beneficiaries', { tc_no: formData.tcNo });

// ✅ CORRECT
const hashedTc = await hashTcNumber(ctx, formData.tcNo);
await ctx.db.insert('beneficiaries', { tc_no: hashedTc });
```

### 3. Missing CSRF Token

**Error**: 403 Forbidden on POST/PUT/DELETE
**Solution**: Include CSRF token in headers:

```typescript
const { csrfToken } = await fetch('/api/csrf').then((r) => r.json());
await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  body: JSON.stringify(data),
});
```

### 4. Console.log in Production

**Error**: Linting errors for `console.log()`
**Solution**: Use logger:

```typescript
// ❌ WRONG
console.log('Debug info');

// ✅ CORRECT
import logger from '@/lib/logger';
logger.info('Debug info');
```

## Adding New Features

### Complete Workflow

1. **Create Convex function** in `convex/[domain].ts`
2. **Add Zod validation** in `src/lib/validations/[domain].ts`
3. **Create API route** in `src/app/api/[domain]/route.ts` (use server SDK)
4. **Add UI components** in `src/components/[domain]/`
5. **Update middleware** if route requires auth (`src/middleware.ts`)
6. **Write tests** in `src/__tests__/` and `e2e/`
7. **Run pre-commit checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm run test:run
   ```

### Adding a New Route

1. Create page: `src/app/(dashboard)/[route]/page.tsx`
2. Add route protection in `src/middleware.ts`:
   ```typescript
   { path: '/your-route', requiredPermission: Permission.YOUR_PERMISSION }
   ```
3. Add permission in `src/types/auth.ts` if needed
4. Add navigation item in sidebar config

## Testing

### Unit Tests (Vitest)

```bash
npm run test:run         # Run all tests
npm test                 # Watch mode
npx vitest path/to/test  # Run specific test
```

### E2E Tests (Playwright)

```bash
npm run e2e              # Full suite
npm run e2e:ui           # Interactive UI
npx playwright test --debug  # Debug mode
```

### Coverage Target

- 90%+ code coverage goal
- 146+ unit tests currently passing

## Environment Variables

Required for development (`.env.local`):

```env
# REQUIRED - Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# REQUIRED for production - Security
CSRF_SECRET=your-32-char-random-secret
SESSION_SECRET=your-32-char-random-secret

# Optional - Features
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key  # For Kumbara locations
SMTP_HOST=smtp.example.com                     # Email notifications
TWILIO_ACCOUNT_SID=your-sid                   # SMS notifications
```

## Deployment

### Convex Backend

```bash
npx convex deploy --prod
# Copy the production URL and set as NEXT_PUBLIC_CONVEX_URL
```

### Vercel (Recommended)

```bash
npm run deploy:vercel  # Automated script
# Or manually:
vercel --prod
```

Set environment variables in Vercel dashboard:

- `NEXT_PUBLIC_CONVEX_URL`
- `CSRF_SECRET`
- `SESSION_SECRET`

## Documentation References

- **[README.md](README.md)**: Quick start, features, deployment overview
- **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**: Complete technical documentation
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)**: Detailed architecture guide (1100+ lines)
- **[docs/KVKK_GDPR_COMPLIANCE.md](docs/KVKK_GDPR_COMPLIANCE.md)**: Privacy compliance, TC security
- **[convex/schema.ts](convex/schema.ts)**: Database schema with JSDoc comments

## Key Reminders

1. **Always sanitize inputs** before database operations
2. **Always hash TC Kimlik numbers** - never store plain text
3. **Use correct Convex SDK** - client for browser, server for SSR/API
4. **Run typecheck + lint** before committing
5. **Include CSRF tokens** in all mutation API calls
6. **Use Turkish language** in all UI text and routes
7. **Check permissions** before showing UI elements or allowing operations
8. **Write tests** for new features (unit + E2E)
9. **Use indexes** in Convex queries for performance
10. **Follow existing patterns** - explore the codebase for examples

## Getting Help

- Check existing code patterns in similar features
- Review Convex functions in `convex/` for backend logic examples
- Check validation schemas in `src/lib/validations/` for form patterns
- Look at existing components in `src/components/` for UI patterns
- Reference `.github/copilot-instructions.md` for comprehensive architecture details
