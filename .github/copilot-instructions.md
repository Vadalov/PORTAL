# Copilot Coding Agent Instructions - PORTAL

## Repository Overview

**PORTAL** is a comprehensive Turkish non-profit association management system (Dernek Yönetim Sistemi) built with Next.js 16, TypeScript, and Appwrite backend. The system manages beneficiaries, donations, scholarships, tasks, meetings, and internal communications with full role-based access control.

- **Type**: Full-stack web application (Next.js 16 App Router)
- **Scale**: ~45,000 lines of code, 1,182+ npm packages
- **Languages**: TypeScript (strict mode), Turkish UI text
- **Framework**: Next.js 16 with React 19 (RC), Appwrite BaaS backend
- **Key Dependencies**: Zustand, TanStack Query, Zod v4, shadcn/ui, Tailwind CSS v4

## Critical Architecture Principles

### Dual Appwrite SDK Architecture ⚠️

This is the **#1 mistake** developers make. The project uses TWO different Appwrite SDKs:

```typescript
// ✅ CLIENT SDK - Browser/React Components
// File: src/lib/appwrite/client.ts
import { databases } from '@/lib/appwrite/client'; // 'use client' required

// ✅ SERVER SDK - Server Components/API Routes
// File: src/lib/appwrite/server.ts
import { serverDatabases } from '@/lib/appwrite/server'; // Server-side only

// ❌ NEVER mix them - exposes API key to browser!
```

**Rule**: If you see `'use client'` directive, use `client.ts`. Otherwise, use `server.ts`.

### Turkish Context Requirements

- **UI Text**: Always Turkish (e.g., "Kaydet", not "Save")
- **Routes**: Turkish naming (`/yardim/ihtiyac-sahipleri`, not `/help/beneficiaries`)
- **Phone Format**: +90 5XX XXX XX XX (Turkish mobile only)
- **TC Kimlik No**: 11 digits with algorithm validation (see `src/lib/sanitization.ts`)
- **Currency**: Turkish Lira (₺)
- **Dates**: DD.MM.YYYY format in UI

## Build & Validation Commands

### Prerequisites

- **Node.js**: 20+ (verified in CI)
- **npm**: 10+
- **Environment**: `.env.local` file required (copy from `.env.example`)

### Command Sequence (CRITICAL ORDER)

**Initial Setup** (first time or after `npm clean:all`):

```bash
# 1. Install dependencies (2-3 minutes)
npm install

# 2. Create environment file
cp .env.example .env.local
# Edit .env.local - set NEXT_PUBLIC_BACKEND_PROVIDER=mock for local dev

# 3. Validate setup
npm run validate:config
```

**Development Workflow**:

```bash
# Start dev server (port 3000, auto-kills existing process)
npm run dev

# Type check (ALWAYS run before committing - takes ~30s)
npm run typecheck

# Lint check (ALWAYS run before committing - takes ~20s)
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run unit tests (Vitest - takes ~12s for 165 tests)
npm run test:run

# Run tests in watch mode
npm test
```

**Build Process** (⚠️ Network required for Google Fonts):

```bash
# Production build (takes 2-4 minutes, requires internet access)
npm run build

# Build will FAIL in restricted networks due to Google Fonts
# Fonts needed: Inter, Montserrat, Poppins (from src/app/layout.tsx)
```

**Known Build Issues**:

- **Google Fonts**: Build requires access to `fonts.googleapis.com`. Will fail in airgapped/restricted environments.
- **Workaround**: Use local fonts or mock the font imports for offline builds.

### Pre-Commit Validation

**ALWAYS run these in order before creating a PR**:

```bash
npm run typecheck  # Must pass with 0 errors
npm run lint       # Must pass with 0 errors
npm run test:run   # 146+ tests should pass (19 may fail due to mock issues)
```

### CI Pipeline Commands

The CI runs these steps (see `.github/workflows/ci.yml`):

1. `npm ci --dry-run` - Verify package-lock.json sync
2. `npm ci` - Clean install
3. `npm run lint` - ESLint (continue-on-error: true)
4. `npm run typecheck` - TypeScript check (continue-on-error: true)
5. `npm run test:run` - Unit tests
6. `npm run test:coverage` - Coverage report
7. `npm run build` - Production build with mock env vars

**Mock Environment Variables for CI**:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=test-project-id
NEXT_PUBLIC_DATABASE_ID=test-db
# Storage bucket IDs
NEXT_PUBLIC_STORAGE_DOCUMENTS=documents
NEXT_PUBLIC_STORAGE_RECEIPTS=receipts
NEXT_PUBLIC_STORAGE_PHOTOS=photos
NEXT_PUBLIC_STORAGE_REPORTS=reports
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

**Boundary Tests**:

```bash
npm run test:error-boundaries   # Error boundary testing
npm run test:loading-states     # Loading state testing
npm run test:suspense          # Suspense boundary testing
npm run test:all-boundaries    # All boundary tests
```

**Current Test Status**:

- 165 total unit tests: 146 passing, 19 failing (mock API issues, not blocking)
- 25+ E2E tests passing
- 100% sanitization coverage

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
├── package.json               # Scripts, dependencies (1,182 packages)
├── tsconfig.json             # TypeScript config (strict mode, paths)
├── next.config.ts            # Next.js config (security headers, Sentry)
├── vitest.config.ts          # Vitest test configuration
├── playwright.config.cts     # Playwright E2E configuration
├── eslint.config.mjs         # ESLint v9 flat config
├── .env.example              # Environment template (COPY TO .env.local)
├── .prettierrc.json          # Prettier formatting config
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
│   ├── appwrite/
│   │   ├── client.ts       # CLIENT SDK ('use client' directive)
│   │   ├── server.ts       # SERVER SDK (API key, admin access)
│   │   ├── config.ts       # Shared configuration
│   │   ├── permissions.ts  # Appwrite permission helpers
│   │   ├── sdk-guard.ts    # Runtime SDK validation
│   │   └── storage.ts      # File upload utilities
│   ├── api/
│   │   ├── appwrite-api.ts # Main API layer (uses client SDK)
│   │   ├── appwrite-server-api.ts # Server API layer
│   │   ├── mock-api.ts     # Mock backend (development fallback)
│   │   └── route-helpers.ts # API route utilities
│   ├── validations/        # Zod schemas (1,144 lines)
│   │   ├── beneficiary.ts  # 502 lines, 100+ fields, Turkish validation
│   │   ├── message.ts      # 246 lines
│   │   ├── task.ts         # 202 lines
│   │   └── meeting.ts      # 194 lines
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
│   ├── beneficiary.ts     # Beneficiary types
│   ├── collections.ts     # Appwrite collection types
│   └── appwrite.ts        # Appwrite-specific types
│
├── __tests__/             # Vitest unit tests
│   ├── lib/              # Library tests (sanitization, validation)
│   ├── integration/      # Integration tests
│   └── mocks/            # Test mocks and fixtures
│
├── middleware.ts          # Next.js middleware (auth checking)
└── scripts/              # Utility scripts (27 scripts)
    ├── setup-appwrite.ts        # Appwrite setup wizard
    ├── test-connectivity.ts     # Connection testing
    ├── validate-config.ts       # Config validation
    ├── diagnose-appwrite.ts     # Diagnostics
    └── [21 more scripts...]     # Testing, migration, deployment
```

### Important Configuration Details

**Path Aliases** (tsconfig.json):

```typescript
"@/*" -> "./src/*"
"@/components/*" -> "./src/components/*"
"@/lib/*" -> "./src/lib/*"
"@/stores/*" -> "./src/stores/*"
"@/types/*" -> "./src/types/*"
```

**Excluded from TypeScript Checking**:

- `scripts/**` (excluded in tsconfig.json)
- `e2e/**` (Playwright tests)
- `node_modules`

**Test Exclusions** (vitest.config.ts):

- E2E tests (`e2e/**`)
- Node modules
- Coverage excludes: `__tests__/`, `*.d.ts`, config files

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
import { appwriteApi } from '@/lib/api/appwrite-api';

// Query
const { data, error, isLoading } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => appwriteApi.beneficiaries.getBeneficiaries(),
});

// Mutation
const mutation = useMutation({
  mutationFn: appwriteApi.beneficiaries.createBeneficiary,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
  },
});
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

1. **Auth Store Tests Failing** (19 tests):
   - **Symptom**: "Cannot read properties of undefined (reading 'expire')"
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

When encountering issues, run these in order:

```bash
# 1. Comprehensive diagnostics
npm run diagnose

# 2. Configuration validation
npm run validate:config

# 3. Connectivity testing (if using Appwrite)
npm run test:connectivity

# 4. Full system test
npm run test:full-system

# 5. Browser compatibility
npm run test:browsers
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

Configured in `.husky/`:

- ESLint with auto-fix
- Prettier formatting
- TypeScript type check
- Tests for changed files

## Performance Considerations

### Bundle Optimization

- Code splitting: Configured in `next.config.ts`
- Dynamic imports: Use for large components
- Image optimization: Next.js Image component with WebP/AVIF
- Font optimization: Google Fonts with display=swap

### Build Artifacts

- `.next/` directory: ~100-200MB after build
- Excludes: Listed in `.gitignore`
- Output mode: `standalone` (Docker-optimized)

## Summary Checklist for Agents

Before starting work on this repository, ensure you:

- [ ] Understand the **dual SDK architecture** (client.ts vs server.ts)
- [ ] Know Turkish context requirements (phone, TC Kimlik, currency)
- [ ] Have run `npm install` and created `.env.local` from template
- [ ] Have validated your setup with `npm run validate:config`
- [ ] Always run `npm run typecheck` and `npm run lint` before committing
- [ ] Sanitize all user inputs using functions from `src/lib/sanitization.ts`
- [ ] Use Zod schemas from `src/lib/validations/` for form validation
- [ ] Include CSRF tokens for all mutation API calls
- [ ] Check permissions using ROLE_PERMISSIONS before showing UI elements
- [ ] Write tests for new features (unit + E2E)
- [ ] Test builds locally before pushing (but expect Google Fonts issues in CI)

**Trust these instructions**: They are comprehensive and tested. Only search for additional information if something is unclear or appears incorrect.
