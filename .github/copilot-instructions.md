# Copilot Coding Agent Instructions - PORTAL

## Repository Overview

**PORTAL** is a comprehensive Turkish non-profit association management system (Dernek Yönetim Sistemi) built with Next.js 16, TypeScript, and Convex backend. The system manages beneficiaries, donations, scholarships, tasks, meetings, and internal communications with full role-based access control.

- **Type**: Full-stack web application (Next.js 16 App Router)
- **Scale**: ~45,000 lines of code, 100+ npm packages
- **Languages**: TypeScript (strict mode), Turkish UI text
- **Framework**: Next.js 16 with React 19, Convex BaaS backend
- **Key Dependencies**: Zustand, TanStack Query, Zod v4, shadcn/ui, Tailwind CSS v4

## Critical Architecture Principles

### Convex Integration Architecture

The project uses **Convex as Backend-as-a-Service (BaaS)** - NOT a traditional REST API. Understanding this is critical:

```typescript
// ✅ CLIENT SDK - Browser/React Components
// File: src/lib/convex/client.ts
import { ConvexReactClient } from 'convex/react';
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// ✅ SERVER SDK - Server Components/API Routes  
// File: src/lib/convex/server.ts
import { ConvexHttpClient } from 'convex/browser';
const convexHttp = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Use Convex functions from convex/ directory
import { api } from '@/convex/_generated/api';
```

**Key Convex Concepts**:

- **Queries** (`convex/*.ts`): Read operations, automatically cached and reactive
- **Mutations** (`convex/*.ts`): Write operations, transactional
- **Schema** (`convex/schema.ts`): Type-safe database schema with indexes
- **No SQL/ORM**: Use Convex's query API (`ctx.db.query()`, `.withIndex()`, `.filter()`)

**Convex Functions Structure** (`convex/` directory):
```
convex/
├── _generated/        # Auto-generated API types (NEVER edit)
├── schema.ts         # Database schema (15+ collections)
├── auth.ts          # Authentication functions
├── beneficiaries.ts # Beneficiary CRUD + TC security
├── donations.ts     # Donation management
├── scholarships.ts  # Scholarship management
├── tasks.ts         # Task operations
├── meetings.ts      # Meeting operations
├── messages.ts      # Messaging system
├── partners.ts      # Partner organizations
├── consents.ts      # KVKK/GDPR consents
├── bank_accounts.ts # Bank account management
├── dependents.ts    # Dependent tracking
├── aid_applications.ts # Aid application tracking
├── finance_records.ts  # Financial transactions
├── documents.ts     # Document/file metadata
├── system_settings.ts  # System configuration
├── storage.ts       # File storage operations
├── tc_security.ts   # TC Kimlik No hashing/masking
└── users.ts         # User management
```

### Turkish Context Requirements

- **UI Text**: Always Turkish (e.g., "Kaydet", not "Save")
- **Routes**: Turkish naming (`/yardim/ihtiyac-sahipleri`, not `/help/beneficiaries`)
- **Phone Format**: +90 5XX XXX XX XX (Turkish mobile only)
- **TC Kimlik No**: 11 digits with algorithm validation (see `src/lib/sanitization.ts`)
- **Currency**: Turkish Lira (₺)
- **Dates**: DD.MM.YYYY format in UI

### TC Kimlik No Security (CRITICAL)

This system implements **GDPR-compliant TC Kimlik No protection**:

**Storage**: TC numbers are **hashed** (SHA-256) before database storage
**Display**: Always **masked** (e.g., `123****7890`) in UI
**Access**: Logged via `tc_security.ts` with user tracking

```typescript
// convex/tc_security.ts
await hashTcNumber(ctx, tcNo);        // Hash before storing
await maskTcNumber(ctx, tcNo);        // Mask for display  
await requireTcNumberAccess(ctx);     // Check permissions
await logTcNumberAccess(ctx, action); // Audit log
```

**NEVER store plain TC numbers** - always use the security functions.

## Build & Validation Commands

### Prerequisites

- **Node.js**: 20+ (verified in CI)
- **npm**: 10+
- **Environment**: `.env.local` file required (copy from `.env.example`)

### Environment Variables

**Required Variables**:

```bash
# Convex Backend (REQUIRED)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
BACKEND_PROVIDER=convex
NEXT_PUBLIC_BACKEND_PROVIDER=convex

# Security (REQUIRED for production)
CSRF_SECRET=your-32-char-random-secret-here
SESSION_SECRET=your-32-char-random-secret-here
```

**Optional Variables**:

```bash
# Application Config
NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com

# SMS / Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+905xxxxxxxxx

# Google Maps (for kumbara locations)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

**Development vs Production**:

- **Development**: Use `.env.local` (not committed)
- **Production**: Set environment variables in deployment platform
- **CI/CD**: Uses mock values (see CI Pipeline section)

### Command Sequence (CRITICAL ORDER)

**Initial Setup** (first time or after `npm clean:all`):

```bash
# 1. Install dependencies (2-3 minutes)
npm install

# 2. Create environment file
cp .env.example .env.local
# Edit .env.local - set NEXT_PUBLIC_CONVEX_URL for your Convex deployment
```

**Development Workflow**:

```bash
# Start dev server (port 3000, auto-kills existing process on port)
npm run dev

# Type check (ALWAYS run before committing - takes ~30s)
npm run typecheck

# Lint check (ALWAYS run before committing - takes ~20s)
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run unit tests (Vitest - ~12s for 165 tests)
npm run test:run

# Run tests in watch mode
npm test

# Run E2E tests (Playwright)
npm run e2e

# Bundle analysis (identify large dependencies)
npm run analyze
```

**Build Process**:

```bash
# Production build (takes 2-4 minutes, requires internet for Google Fonts)
npm run build

# Start production server
npm run start

# Health check (when server running)
npm run health:check
```

**Known Build Issues**:

- **Google Fonts**: Build requires access to `fonts.googleapis.com` for Inter, Montserrat, Poppins fonts
- **Workaround**: Use local fonts or configure font optimization in `next.config.ts` for restricted networks

### Pre-Commit Validation

**ALWAYS run these in order before creating a PR**:

```bash
npm run typecheck  # Must pass with 0 errors
npm run lint       # Must pass with 0 errors
npm run test:run   # Tests should pass (some mock API tests may fail)
```

### CI Pipeline

The CI runs these steps (see `.github/workflows/ci.yml`):

1. `npm ci --dry-run` - Verify package-lock.json sync
2. `npm ci` - Clean install
3. `npm run lint` - ESLint check
4. `npm run typecheck` - TypeScript check
5. `npm run test:run` - Unit tests
6. `npm run test:coverage` - Coverage report
7. `npm run build` - Production build

**Mock Environment Variables for CI**:

```bash
NEXT_PUBLIC_CONVEX_URL=https://convex-hello-world.convex.cloud
NEXT_PUBLIC_NODE_ENV=production
```

### Testing Strategy

**Unit Tests (Vitest)**:

```bash
npm run test        # Watch mode
npm run test:run    # Run once
npm run test:ui     # Visual UI
npm run test:coverage  # Coverage report

# Run specific test file
npx vitest src/__tests__/lib/sanitization.test.ts
```

**E2E Tests (Playwright)**:

```bash
npm run e2e         # Full E2E suite
npm run e2e:ui      # Interactive UI

# Debug specific test
npx playwright test e2e/beneficiaries.spec.ts --headed
npx playwright test --debug
```

## Project Structure & Key Files

### Root Configuration Files

```
/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # Main CI pipeline (lint, test, build)
│   │   ├── pr-checks.yml      # PR validation (semantic titles, size labels)
│   │   └── code-quality.yml   # Weekly quality metrics
│   └── copilot-instructions.md  # This file
├── package.json               # Scripts, dependencies (100+ packages)
├── tsconfig.json             # TypeScript config (strict mode, paths)
├── next.config.ts            # Next.js config (security headers, Sentry)
├── vitest.config.ts          # Vitest test configuration
├── playwright.config.cts     # Playwright E2E configuration
├── eslint.config.mjs         # ESLint v9 flat config
├── .env.example              # Environment template (COPY TO .env.local)
├── .prettierrc.json          # Prettier formatting config
├── nixpacks.toml             # Railway/Render deployment config
└── .gitignore                # Excludes: .next/, node_modules/, .env.local
```

### Source Code Structure

```
src/
├── app/                       # Next.js 16 App Router
│   ├── (dashboard)/          # Protected route group (middleware-protected)
│   │   ├── genel/           # Dashboard (default after login)
│   │   ├── yardim/          # Aid management (beneficiaries)
│   │   ├── bagis/           # Donations
│   │   ├── kullanici/       # User management
│   │   └── layout.tsx       # Dashboard layout with sidebar
│   ├── api/                 # API routes (all use server SDK)
│   │   ├── auth/           # Authentication endpoints
│   │   ├── beneficiaries/  # Beneficiary CRUD
│   │   ├── csrf/           # CSRF token generation
│   │   └── health/         # Health check endpoint
│   ├── login/              # Login page (public)
│   ├── layout.tsx          # Root layout (fonts, providers)
│   └── page.tsx            # Root redirect logic
│
├── components/
│   ├── ui/                 # shadcn/ui components (41 components)
│   ├── layouts/            # Layout components (Sidebar, Header)
│   └── forms/              # Form components (BeneficiaryForm, etc.)
│
├── lib/
│   ├── convex/
│   │   ├── client.ts       # CLIENT SDK ('use client' directive)
│   │   ├── server.ts       # SERVER SDK (API routes, admin access)
│   │   ├── api.ts          # Generated API functions
│   │   └── config.ts       # Shared configuration
│   ├── api/
│   │   ├── convex-api.ts   # Main API layer (uses Convex)
│   │   ├── mock-api.ts     # Mock backend (development fallback)
│   │   └── route-helpers.ts # API route utilities
│   ├── validations/        # Zod schemas (1,000+ lines)
│   │   ├── beneficiary.ts  # 498 lines, 100+ fields, Turkish validation
│   │   ├── aid-application.ts # Aid application validation
│   │   ├── kumbara.ts      # Kumbara/donation box validation
│   │   ├── message.ts      # Message validation
│   │   ├── task.ts         # Task validation
│   │   └── meeting.ts      # Meeting validation
│   ├── sanitization.ts     # 15+ sanitization functions (XSS, SQL injection)
│   ├── csrf.ts            # CSRF protection
│   ├── rate-limit.ts      # Rate limiting middleware
│   ├── logger.ts          # Sentry-integrated logging
│   ├── errors.ts          # Error formatting utilities
│   └── utils.ts           # Utilities (cn, formatters)
│
├── stores/                 # Zustand state management
│   └── authStore.ts       # Auth store (persist, devtools, immer)
│
├── types/                  # TypeScript type definitions
│   ├── auth.ts            # UserRole, Permission, ROLE_PERMISSIONS
│   ├── beneficiary.ts     # Beneficiary types (30+ enums)
│   ├── collections.ts     # Convex collection types
│   └── [other types...]   # Additional type definitions
│
├── __tests__/             # Vitest unit tests
│   ├── lib/              # Library tests (sanitization, validation)
│   ├── integration/      # Integration tests
│   └── mocks/            # Test mocks and fixtures
│
├── middleware.ts          # Next.js middleware (auth checking, 200+ lines)
└── scripts/              # Utility scripts
    └── start-dev.mjs     # Dev server with port cleanup
```

### Convex Backend Structure

```
convex/
├── _generated/              # Auto-generated (DO NOT EDIT)
│   ├── api.d.ts            # Type-safe API definitions
│   ├── api.js              # Runtime API
│   ├── dataModel.d.ts      # Database types
│   └── server.d.ts         # Server types
├── schema.ts               # Database schema (15+ collections)
├── auth.ts                 # Authentication logic
├── beneficiaries.ts        # Beneficiary CRUD (320+ lines)
├── donations.ts            # Donation management (kumbara included)
├── scholarships.ts         # Scholarship system
├── tasks.ts                # Task operations
├── meetings.ts             # Meeting management
├── messages.ts             # Messaging system
├── partners.ts             # Partner organization management
├── consents.ts             # KVKK/GDPR consent tracking
├── bank_accounts.ts        # Bank account operations
├── dependents.ts           # Dependent/family member tracking
├── aid_applications.ts     # Aid application workflow
├── finance_records.ts      # Financial transaction tracking
├── documents.ts            # Document metadata management
├── system_settings.ts      # System configuration
├── storage.ts              # File storage operations
├── tc_security.ts          # TC Kimlik No security (GDPR)
└── users.ts                # User management
```

### Important Configuration Details

**Path Aliases** (tsconfig.json):

```typescript
"@/*" -> "./src/*"
"@/components/*" -> "./src/components/*"
"@/lib/*" -> "./src/lib/*"
"@/stores/*" -> "./src/stores/*"
"@/types/*" -> "./src/types/*"
"@/convex/*" -> "./convex/*"
```

**Excluded from TypeScript Checking**:

- `scripts/**` (excluded in tsconfig.json)
- `e2e/**` (Playwright tests)
- `node_modules`

**Test Exclusions** (vitest.config.ts):

- E2E tests (`e2e/**`)
- Node modules
- Coverage excludes: `__tests__/`, `*.d.ts`, config files

## Domain Model & Data Flow

### Core Collections (Convex Schema)

The system uses 15+ main collections:

1. **users** - User accounts (indexed by email, role)
2. **beneficiaries** - Aid recipients (indexed by TC, status, city)
3. **donations** - Financial contributions (includes kumbara tracking)
4. **scholarships** - Student scholarship programs
5. **scholarship_applications** - Scholarship application tracking
6. **scholarship_payments** - Scholarship payment records
7. **tasks** - Task management
8. **meetings** - Meeting scheduling
9. **messages** - Internal messaging
10. **files** - File storage metadata and tracking
11. **aid_applications** - Aid request tracking
12. **finance_records** - Financial transactions
13. **partners** - Partner organizations
14. **consents** - KVKK/GDPR consent records
15. **bank_accounts** - Bank account management
16. **dependents** - Dependent/family member tracking
17. **system_settings** - System configuration parameters

### Route-to-Collection Mapping

Understanding URL → Database mapping is crucial:

```
/yardim/ihtiyac-sahipleri → beneficiaries collection
/yardim/basvurular        → aid_applications collection
/bagis/liste              → donations collection
/bagis/kumbara            → donations collection (kumbara tracking)
/burs/ogrenciler          → scholarships collection
/burs/basvurular          → scholarship_applications collection
/is/gorevler              → tasks collection
/is/toplantilar           → meetings collection
/mesaj/kurum-ici          → messages collection
/fon/gelir-gider          → finance_records collection
/partner/liste            → partners collection
/kullanici                → users collection
```

### Data Access Patterns

**Reading Data** (Queries):
```typescript
// With index (FAST)
const beneficiaries = await ctx.db
  .query('beneficiaries')
  .withIndex('by_status', (q) => q.eq('status', 'AKTIF'))
  .collect();

// With search filter
const filtered = beneficiaries.filter(b => 
  b.name.toLowerCase().includes(search.toLowerCase())
);
```

**Writing Data** (Mutations):
```typescript
// Hash TC before storing
const hashedTc = await hashTcNumber(ctx, tcNo);
const id = await ctx.db.insert('beneficiaries', {
  name,
  tc_no: hashedTc, // NEVER store plain TC
  status: 'TASLAK',
  // ...
});
```

## Common Development Patterns

### State Management (Zustand)

Always use this pattern for Zustand stores:

```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useMyStore = create<Store>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // state
          data: null,
          // actions
          setData: (data) =>
            set((state) => {
              state.data = data; // Immer allows direct mutation
            }),
        })),
        { name: 'my-store' }
      )
    )
  )
);
```

### Forms (React Hook Form + Zod)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { beneficiarySchema } from '@/lib/validations/beneficiary';

const form = useForm({
  resolver: zodResolver(beneficiarySchema),
  defaultValues: {
    /* ... */
  },
});

// In submit handler, sanitize inputs
import { sanitizeTcNo, sanitizePhone } from '@/lib/sanitization';
const cleanData = {
  tcNo: sanitizeTcNo(formData.tcNo),
  phone: sanitizePhone(formData.phone),
  // ...
};
```

### API Calls (TanStack Query)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/convex/_generated/api';
import { convexQuery } from '@convex-dev/react-query';

// Query
const { data, error, isLoading } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => convexQuery(api.beneficiaries.getAll)(),
});

// Mutation
const mutation = useMutation({
  mutationFn: convexMutation(api.beneficiaries.create),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
  },
});
```

### Server-Side Data Fetching

For Server Components and API routes:

```typescript
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

// In API route or Server Component
const convexHttp = getConvexHttp();
const beneficiaries = await convexHttp.query(api.beneficiaries.list, {
  status: 'AKTIF',
  limit: 50,
});
```

### Middleware Authentication Flow

The middleware (`src/middleware.ts`) enforces a sophisticated auth system:

1. **Public Routes**: `/login`, `/api/csrf`, `/_next`, `/favicon.ico`
2. **Protected Routes**: All dashboard routes (`/genel`, `/yardim`, `/bagis`, etc.)
3. **Permission Checks**: Each route requires specific permissions
4. **Role Override**: `SUPER_ADMIN` bypasses all permission checks

**Route Protection Example**:
```typescript
// From middleware.ts
{ path: '/yardim/ihtiyac-sahipleri', requiredPermission: Permission.BENEFICIARIES_READ }
{ path: '/kullanici', requiredPermission: Permission.USERS_READ }
{ path: '/ayarlar', requiredRole: UserRole.ADMIN }
```

### Permission Checking

```typescript
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/lib/permissions';

const { user } = useAuthStore();
const canCreate = hasPermission(user?.role, 'BENEFICIARIES_CREATE');

// Or use store method
const canCreate = useAuthStore((state) => state.hasPermission('BENEFICIARIES_CREATE'));
```

## Security & Validation Requirements

### Input Sanitization (MANDATORY)

**ALWAYS sanitize user inputs** using `src/lib/sanitization.ts`:

```typescript
import {
  sanitizeTcNo, // TC Kimlik validation + algorithm check
  sanitizePhone, // Turkish phone format +90 5XX XXX XX XX
  sanitizeEmail, // Email format + lowercase
  sanitizeHtml, // XSS prevention (DOMPurify)
  sanitizeString, // General string sanitization
} from '@/lib/sanitization';
```

### Validation Pipeline

```
User Input → Zod Schema → Sanitization → API Call → Database
```

1. **Client-side**: React Hook Form + Zod validation
2. **Pre-submit**: Sanitization functions
3. **Server-side**: Re-validate + re-sanitize in API routes
4. **Database**: Clean, validated data only

### CSRF Protection

All mutation API calls require CSRF token:

```typescript
// Get CSRF token
const response = await fetch('/api/csrf');
const { csrfToken } = await response.json();

// Include in mutations
fetch('/api/beneficiaries', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

### Role-Based Access Control

6 roles defined in `src/types/auth.ts`:

- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `MANAGER` - Business operations
- `MEMBER` - Standard user
- `VIEWER` - Read-only access
- `VOLUNTEER` - Limited access

~30 granular permissions (e.g., `BENEFICIARIES_CREATE`, `USERS_DELETE`)

## Known Issues & Workarounds

### Build Issues

1. **Google Fonts Network Failure**:
   - **Symptom**: Build fails with "Failed to fetch `Inter` from Google Fonts"
   - **Cause**: Restricted network access to `fonts.googleapis.com`
   - **Workaround**: Use local fonts or skip font optimization in offline environments

2. **Package Lock Sync**:
   - **Symptom**: CI fails with "package.json and package-lock.json are out of sync"
   - **Fix**: Run `npm install` locally and commit updated `package-lock.json`

### Test Issues

1. **Auth Store Tests**:
   - **Symptom**: Some tests may fail with "Cannot read properties of undefined"
   - **Cause**: Mock API not fully compatible with test expectations
   - **Status**: Non-blocking, doesn't affect functionality

2. **Rate Limiting Tests**:
   - **Symptom**: Expected Turkish error message, got English
   - **Cause**: Mock API returns different error messages
   - **Status**: Minor, actual rate limiting works correctly

### Runtime Issues

1. **Hydration Warnings**:
   - **Cause**: Zustand persist reading from localStorage during SSR
   - **Solution**: Use `skipHydration: true` in store config (already implemented)

2. **Loading State Stuck**:
   - **Check**: `useAuthStore.getState()._hasHydrated` should be `true`
   - **Fix**: Clear localStorage and reload if stuck

## Diagnostic Commands

When encountering issues:

```bash
# Clean build artifacts and caches
npm run clean

# Full clean reinstall
npm run clean:all

# Health check (when dev server running)
npm run health:check

# Clean temporary test output files
npm run clean:temp
```

## CI/CD Pipeline

### GitHub Actions Workflows

1. **ci.yml** (Main CI Pipeline):
   - Triggers: Push to main/master/develop, PRs, claude/\*\* branches
   - Steps: lockfile verify → lint → typecheck → test → build → security audit
   - Runtime: ~5-8 minutes

2. **pr-checks.yml** (PR Validation):
   - Semantic PR title check (feat/fix/docs/etc.)
   - PR size labeling (xs/s/m/l/xl)
   - Code review checks (console.log, TODO, file sizes)
   - Dependency change detection
   - Test coverage reporting

3. **code-quality.yml** (Weekly Quality Metrics):
   - Code statistics
   - Duplicate code detection
   - Bundle size analysis

### Pre-commit Hooks (Husky)

Configured in `.husky/pre-commit`:

- **lint-staged**: ESLint + Prettier for staged files
- **TypeScript check**: `npm run typecheck` (must pass)
- **Tests**: Currently disabled (run in CI instead)

**Pre-commit workflow**:
1. Stage your changes: `git add .`
2. Commit: `git commit -m "feat: your message"`
3. Hook runs automatically:
   - Formats code with Prettier
   - Fixes linting issues with ESLint
   - Runs TypeScript type check
   - Blocks commit if typecheck fails

## Common Pitfalls & Solutions

### 1. Convex Client Initialization Errors

**Symptom**: `ConvexReactClient` throws error during build or SSR

**Cause**: Client SDK used in Server Component or invalid CONVEX_URL

**Solution**:
```typescript
// ❌ WRONG - Client SDK in Server Component
import { convex } from '@/lib/convex/client'; // 'use client' only!

// ✅ CORRECT - Server SDK in Server Component
import { getConvexHttp } from '@/lib/convex/server';
const convex = getConvexHttp();
```

### 2. TC Kimlik No Not Hashed

**Symptom**: Plain TC numbers stored in database

**Cause**: Forgot to use `hashTcNumber()` before insert/update

**Solution**:
```typescript
// ❌ WRONG - Plain TC stored
await ctx.db.insert('beneficiaries', { tc_no: formData.tcNo });

// ✅ CORRECT - Hash before storing
const hashedTc = await hashTcNumber(ctx, formData.tcNo);
await ctx.db.insert('beneficiaries', { tc_no: hashedTc });
```

### 3. Middleware Redirect Loop

**Symptom**: Infinite redirects between `/login` and dashboard

**Cause**: Session not properly initialized or auth state mismatch

**Solution**:
- Check `useAuthStore.getState()._hasHydrated === true`
- Clear localStorage: `localStorage.clear()`
- Verify CSRF token is being sent in login request

### 4. Turkish Characters in URLs

**Symptom**: Route not found with Turkish characters (ı, ş, ğ, etc.)

**Cause**: URL encoding issues with Turkish characters

**Solution**:
```typescript
// ✅ Use ASCII-compatible slugs or encode properly
const slug = encodeURIComponent('ihtiyaç-sahipleri');
router.push(`/yardim/${slug}`);
```

### 5. Zustand Hydration Warnings

**Symptom**: "Text content did not match" hydration errors

**Cause**: Persisted state read during SSR

**Solution**: Already implemented with `skipHydration: true`, but if you see it:
```typescript
// Add this to your store
const useStore = create(
  persist(
    // ... your store
    { name: 'store-name', skipHydration: true }
  )
);
```

### 6. Permission Denied Errors

**Symptom**: User sees "Permission Denied" on routes they should access

**Cause**: Role permissions not properly configured

**Solution**:
- Check `ROLE_PERMISSIONS` in `src/types/auth.ts`
- Verify middleware route rules in `src/middleware.ts`
- Use `SUPER_ADMIN` role for testing (bypasses all checks)

### 7. Missing CSRF Token

**Symptom**: 403 Forbidden on POST/PUT/DELETE requests

**Cause**: CSRF token not included in request headers

**Solution**:
```typescript
// ✅ Always fetch CSRF token before mutations
const csrfRes = await fetch('/api/csrf');
const { csrfToken } = await csrfRes.json();

await fetch('/api/beneficiaries', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken },
  body: JSON.stringify(data)
});
```

### 8. Console.log in Production

**Symptom**: Linting errors for `console.log()`

**Cause**: ESLint rule `no-console` is enabled

**Solution**:
```typescript
// ❌ WRONG - console.log blocked
console.log('Debug info');

// ✅ CORRECT - Use logger
import logger from '@/lib/logger';
logger.info('Debug info');

// ✅ CORRECT - For errors only
console.error('Error:', error); // Allowed
```

## Performance Considerations

### Bundle Optimization

- Code splitting: Configured in `next.config.ts`
- Dynamic imports: Use for large components
- Image optimization: Next.js Image component with WebP/AVIF
- Font optimization: Google Fonts with display=swap

### Convex Query Optimization

**Use Indexes for Fast Queries**:
```typescript
// ❌ SLOW - Full table scan
const users = await ctx.db.query('users').collect();
const filtered = users.filter(u => u.role === 'ADMIN');

// ✅ FAST - Index-based query
const admins = await ctx.db
  .query('users')
  .withIndex('by_role', (q) => q.eq('role', 'ADMIN'))
  .collect();
```

**Limit Results**:
```typescript
// ✅ Paginate large datasets
const beneficiaries = await ctx.db
  .query('beneficiaries')
  .order('desc')
  .paginate(args.paginationOpts); // Use Convex pagination
```

**Avoid N+1 Queries**:
```typescript
// ❌ BAD - N+1 queries
const tasks = await ctx.db.query('tasks').collect();
for (const task of tasks) {
  task.assignee = await ctx.db.get(task.assigneeId); // N queries!
}

// ✅ GOOD - Batch fetch
const tasks = await ctx.db.query('tasks').collect();
const assigneeIds = [...new Set(tasks.map(t => t.assigneeId))];
const assignees = await Promise.all(assigneeIds.map(id => ctx.db.get(id)));
const assigneeMap = Object.fromEntries(assignees.map(a => [a._id, a]));
tasks.forEach(t => t.assignee = assigneeMap[t.assigneeId]);
```

### Build Artifacts

- `.next/` directory: ~100-200MB after build
- Excludes: Listed in `.gitignore`
- Output mode: `standalone` (Docker-optimized)

## Deployment Guide

### Convex Deployment

**Initial Setup**:
```bash
# 1. Install Convex CLI
npm install -g convex

# 2. Login to Convex
npx convex login

# 3. Create new project (first time only)
npx convex dev
```

**Production Deployment**:
```bash
# 1. Deploy Convex backend
npx convex deploy --prod

# 2. Copy the production URL
# Output: Deployed to: https://your-app.convex.cloud

# 3. Set in environment variables
NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud
```

### Next.js Deployment

**Vercel (Recommended)**:
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_CONVEX_URL
# - CSRF_SECRET
# - SESSION_SECRET
```

**Railway/Render (Alternative)**:

The project includes `nixpacks.toml` configuration for easy deployment on Railway or Render:

```bash
# Railway deployment
railway up

# Render deployment
# 1. Connect your GitHub repo
# 2. Render auto-detects nixpacks.toml
# 3. Set environment variables in dashboard
```

**nixpacks.toml configuration**:
- Node.js 20 with npm 9
- Automatic build command: `npm run build`
- Start command: `npm run start`
- Production optimizations enabled

**Docker Deployment**:

Currently, there is no Dockerfile in the repository. For Docker deployment, create a Dockerfile with Next.js standalone output:

```dockerfile
# Dockerfile (create this file for Docker deployment)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Note**: Ensure `output: 'standalone'` is set in `next.config.ts` for Docker deployment.

**Environment Variables for Production**:
- Set `NEXT_PUBLIC_CONVEX_URL` to production Convex URL
- Generate secure secrets for `CSRF_SECRET` and `SESSION_SECRET`
- Never commit `.env.local` or `.env.production`

### Health Checks

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T12:00:00Z",
  "version": "1.0.0"
}
```

**Detailed Check**: `GET /api/health?detailed=true`

**Monitoring**:
- Use Sentry for error tracking (already integrated)
- Monitor Convex dashboard for query performance
- Set up uptime monitoring (e.g., UptimeRobot, Pingdom)

## Summary Checklist for Agents

Before starting work on this repository, ensure you:

- [ ] Understand the **dual SDK architecture** (client.ts vs server.ts)
- [ ] Know Turkish context requirements (phone, TC Kimlik, currency)
- [ ] Have run `npm install` and created `.env.local` from template
- [ ] Always run `npm run typecheck` and `npm run lint` before committing
- [ ] Sanitize all user inputs using functions from `src/lib/sanitization.ts`
- [ ] Use Zod schemas from `src/lib/validations/` for form validation
- [ ] Include CSRF tokens for all mutation API calls
- [ ] Check permissions using ROLE_PERMISSIONS before showing UI elements
- [ ] Write tests for new features (unit + E2E)
- [ ] Test builds locally before pushing (but expect Google Fonts issues in CI)

### Quick Reference: Common Tasks

**Adding a new feature**:
1. Create Convex function in `convex/[domain].ts`
2. Add Zod validation schema in `src/lib/validations/[domain].ts`
3. Create API route in `src/app/api/[domain]/route.ts`
4. Add UI components in `src/components/[domain]/`
5. Update middleware if new route requires auth
6. Write tests in `src/__tests__/` and `e2e/`

**Modifying database schema**:
1. Update `convex/schema.ts`
2. Add indexes for frequently queried fields
3. Update TypeScript types in `src/types/`
4. Run `npx convex dev` to sync schema
5. Test queries use correct indexes

**Adding new route**:
1. Create page in `src/app/(dashboard)/[route]/page.tsx`
2. Add route protection in `src/middleware.ts`
3. Add permission in `src/types/auth.ts` if needed
4. Update navigation in `src/config/navigation.ts` (navigation modules array)
5. Add Turkish route names and descriptions
6. Assign appropriate icon from lucide-react
7. Categorize route (core/management/reports/settings)

**Security checklist**:
- [ ] TC numbers are hashed before storage
- [ ] User inputs are sanitized
- [ ] CSRF token included in mutations
- [ ] Permissions checked before data access
- [ ] Sensitive data masked in logs

**Trust these instructions**: They are comprehensive and tested. Only search for additional information if something is unclear or appears incorrect.
