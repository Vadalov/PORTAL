# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Behavior & Autonomy

**IMPORTANT: Autonomous Operation Mode**

This project is configured for maximum autonomous operation. When working on this codebase:

1. **NO CONFIRMATION REQUESTS**: Do not ask for user confirmation before making changes. Execute tasks directly and completely.

2. **PROACTIVE IMPLEMENTATION**: When given a task, implement it fully from start to finish without pausing for approval at each step.

3. **SMART ASSUMPTIONS**: If something is ambiguous, make reasonable assumptions based on existing patterns in the codebase and continue. Document assumptions in comments.

4. **AUTO-COMPLETE WORKFLOWS**: Complete entire workflows automatically:
   - Install dependencies if needed
   - Create files, update configurations
   - Run tests and fix errors
   - Build and verify

5. **NO PLAN MODE**: Skip plan mode unless explicitly requested. Go directly to implementation.

6. **ZERO QUESTIONS**: NEVER ASK QUESTIONS. JUST DO EVERYTHING. NO EXCEPTIONS.

7. **ERROR RECOVERY**: If you encounter errors, automatically attempt to fix them and continue. Document what was fixed.

8. **BATCH OPERATIONS**: When multiple related tasks are needed, complete them all in sequence without asking permission between steps.

**Example Workflow:**

- User: "Add a new donations report feature"
- Agent: Directly creates route → adds validation → creates Convex mutation → adds API → adds UI → tests → done
- NO intermediate "Should I create the route?", "Should I add validation?" questions

**Exceptions: HİÇBİR ŞEY YOK - ASLA SORMA - HER ŞEYİ YAP**

## Project Overview

This is a **Dernek Yönetim Sistemi** (Association Management System) - a comprehensive management system for Turkish non-profit associations, built with Next.js 16, TypeScript, and Convex backend.

**Project Status:** MVP complete - migrated from React + Vite to Next.js 16, using Convex for real-time backend services.

## Commands

### Development

```bash
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
npm run lint:fix   # Auto-fix ESLint issues
npm run typecheck  # TypeScript compiler check (no emit)
npm run analyze    # Analyze bundle size
```

### Convex Backend

```bash
npm run convex:dev     # Start Convex development server (runs in parallel with dev)
npm run convex:deploy  # Deploy Convex backend to production
```

### Testing

```bash
# Unit/Integration tests (Vitest)
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage report

# Run specific test file
npx vitest src/__tests__/lib/sanitization.test.ts

# E2E tests (Playwright)
npm run e2e          # Run E2E tests (builds & starts server first)
npm run e2e:ui       # Run E2E tests with UI

# Run specific E2E test
npx playwright test e2e/beneficiaries.spec.ts
npx playwright test --headed  # Run with visible browser
npx playwright test --debug   # Run in debug mode

# Boundary tests
npm run test:error-boundaries    # Test error boundary behavior
npm run test:loading-states      # Test loading state rendering
npm run test:suspense            # Test suspense boundaries
npm run test:all-boundaries      # Run all boundary tests
```

### Diagnostic & System Testing

```bash
# Configuration & connectivity
npm run validate:config       # Validate environment variables
npm run health:check          # Check API health endpoint

# System testing
npm run test:full-system      # Complete system validation
npm run test:browsers         # Browser compatibility tests
npm run test:prod             # Test production build
npm run test:prod-enhanced    # Enhanced production testing
npm run test:integration      # Full integration test suite
npm run test:all              # All tests (unit + E2E + boundaries + integration)

# Debugging
npm run debug:hydration       # Debug hydration issues
npm run clean                 # Clean .next cache
npm run clean:all             # Clean everything and reinstall
```

### Code Quality Checks

```bash
# Run all quality checks
npm run lint              # ESLint code linting
npm run typecheck         # TypeScript type checking
npm run test:run          # Run all tests
npm run build             # Production build check

# Auto-fix issues
npm run lint:fix          # Auto-fix ESLint issues

# Pre-commit hooks (automatically runs on git commit)
# - ESLint with auto-fix
# - Prettier formatting
# - TypeScript type check
# - Tests for changed files

# GitHub Actions workflows (automatically run on push/PR)
# See .github/workflows/ for CI/CD configurations
# - ci.yml: Main CI pipeline (lint, typecheck, test, build, security)
# - pr-checks.yml: PR-specific checks (semantic PR, size, code review)
# - code-quality.yml: Weekly quality metrics (stats, duplicates, bundle size)
```

**📊 For detailed code quality documentation, see [docs/CODE_QUALITY.md](docs/CODE_QUALITY.md)**

### Environment Setup

Create a `.env.local` file with the following variables:

```bash
# Convex Configuration (Required)
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
```

### Test Users

The system uses Convex authentication with session-based auth. Test accounts can be created via:

```bash
npx tsx src/scripts/create-test-users.ts
```

Or manually through the application UI.

Default test credentials (if created):

- Admin: `admin@test.com` / `admin123`
- Manager: `manager@test.com` / `manager123`
- Member: `member@test.com` / `member123`
- Viewer: `viewer@test.com` / `viewer123`

## Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Backend:** Convex (Real-time database & API)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui (New York style)
- **State Management:** Zustand with Immer, Persist, and DevTools middlewares
- **Data Fetching:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Zod v4 validation
- **UI Components:** Radix UI primitives via shadcn/ui
- **Icons:** Lucide React
- **Notifications:** Sonner (toast library)
- **Error Monitoring:** Sentry
- **Testing:** Vitest (unit/integration) + Playwright (E2E)

### Project Structure

```
src/
├── app/                       # Next.js App Router
│   ├── (dashboard)/          # Dashboard route group (protected)
│   ├── api/                  # API routes (auth, health check, etc.)
│   ├── login/                # Login page
│   ├── providers.tsx         # Client-side providers (TanStack Query)
│   └── layout.tsx            # Root layout
├── components/
│   ├── layouts/              # Layout components (Sidebar)
│   ├── forms/                # Form components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── convex/
│   │   ├── client.ts        # Convex React client ('use client')
│   │   ├── server.ts        # Convex HTTP client (server/API routes)
│   │   └── api.ts           # Generated Convex API types
│   ├── api/
│   │   ├── convex-api-client.ts  # Convex API client wrapper
│   │   └── index.ts              # API exports
│   ├── validations/         # Zod schemas (beneficiary, task, etc.)
│   ├── auth/                # Authentication utilities
│   ├── sanitization.ts      # Input sanitization (XSS, SQL injection)
│   ├── security.ts          # Security utilities
│   ├── csrf.ts              # CSRF protection
│   ├── performance.ts       # Performance monitoring
│   └── utils.ts             # Utility functions (cn, etc.)
├── stores/
│   └── authStore.ts          # Zustand auth store (Convex integration)
├── types/
│   ├── auth.ts               # Auth types, UserRole, Permission, ROLE_PERMISSIONS
│   ├── beneficiary.ts        # Beneficiary types
│   ├── collections.ts        # Convex table types
│   └── convex.ts             # Convex-specific types
├── __tests__/                # Vitest unit tests
│   ├── lib/                  # Library tests
│   ├── integration/          # Integration tests
│   └── mocks/                # Test mocks
└── middleware.ts             # Auth middleware (session checking)

convex/                       # Convex backend directory
├── schema.ts                 # Database schema (tables, indexes)
├── auth.ts                   # Authentication configuration
├── storage.ts                # File storage configuration
├── _generated/               # Generated TypeScript types (DO NOT EDIT)
└── *.ts                      # Convex functions (mutations, queries, actions)
```

### Convex Backend Integration

**Critical Architecture Principle:** Convex is a full-stack TypeScript framework with automatic API generation. All database operations go through Convex functions.

#### 1. Client-Side Usage (React Components)

**File:** `src/lib/convex/client.ts`
**Directive:** `'use client'` (required for Next.js App Router)
**Client:** `ConvexReactClient`

**Use Cases:**
- ✅ Client Components (`'use client'`)
- ✅ Real-time queries with automatic subscriptions
- ✅ Mutations (create, update, delete)
- ✅ File uploads via Convex storage

**Example:**

```typescript
'use client';
import { useMutation } from 'convex/react';
import { api } from '@/convex/api';

const MyComponent = () => {
  const createBeneficiary = useMutation(api.beneficiaries.create);

  const handleSubmit = async (data) => {
    await createBeneficiary(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

#### 2. Server-Side Usage (API Routes)

**File:** `src/lib/convex/server.ts`
**Client:** `ConvexHttpClient`
**Use Cases:**
- ✅ API Routes (`/app/api/*`)
- ✅ Server Actions
- ✅ Admin operations
- ✅ Bulk operations

**Example:**

```typescript
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/api';

const convex = getConvexHttp();
await convex.mutation(api.donations.create, donationData);
```

#### 3. Convex Functions Directory

**Location:** `convex/*.ts`
**Purpose:** Database schema, queries, mutations, and actions

**Types of Convex Functions:**

- **Queries** (`convex/beneficiaries.ts`):
  ```typescript
  export const getById = query(async (ctx, id) => {
    return await ctx.db.get('beneficiaries', id);
  });
  ```

- **Mutations** (`convex/beneficiaries.ts`):
  ```typescript
  export const create = mutation(async (ctx, data) => {
    const id = await ctx.db.insert('beneficiaries', data);
    return id;
  });
  ```

- **Actions** (for external API calls):
  ```typescript
  export const sendEmail = action(async (ctx, emailData) => {
    // Call external services
  });
  ```

**Generated Types:**
- `convex/_generated/api.d.ts` - Contains all function type definitions
- `convex/_generated/dataModel.d.ts` - Database schema types
- **DO NOT EDIT** - These are auto-generated by Convex

### Authentication & Authorization

**Implementation:** Convex authentication with session-based auth

1. **Login Flow:**
   - Client calls Convex `auth` mutation
   - Convex creates session using standard auth
   - Session token stored (Convex handles this automatically)
   - Middleware validates session on protected routes

2. **Auth Store** (`src/stores/authStore.ts`):
   - Zustand store with persist middleware
   - Stores user info in localStorage
   - Integrates with Convex auth API

3. **Authorization:**
   - Role-based permissions defined in `src/types/auth.ts`
   - 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
   - ~30 granular permissions (donations, beneficiaries, users, etc.)
   - `ROLE_PERMISSIONS` maps each role to specific permissions
   - Helper methods: `hasPermission()`, `hasRole()`, `hasAnyPermission()`, `hasAllPermissions()`

4. **Route Protection:**
   - Dashboard routes in `(dashboard)` route group
   - Middleware checks Convex session
   - Redirects unauthenticated users to `/login`
   - Shows loading spinner during auth initialization

### State Management

**Zustand Pattern:**

- Store setup: `create()` + `devtools()` + `subscribeWithSelector()` + `persist()` + `immer()`
- State and actions separated in TypeScript interfaces
- Selectors exported for performance optimization
- Uses Immer for immutable state updates

**Example from authStore:**

```typescript
export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // state...
          login: async (email, password) => {
            set((state) => {
              state.isLoading = true;
            });
            // ...
          },
        }))
      )
    )
  )
);
```

### Data Fetching

**TanStack Query Setup:**

- QueryClient configured in `src/app/providers.tsx`
- Default staleTime: 60 seconds
- `refetchOnWindowFocus: false`
- DevTools enabled in development

**API Layer:**

- Primary: Convex (real-time queries, mutations)
- Fallback: `src/lib/api/mock-api.ts` (development/testing)
- Client: `src/lib/api/convex-api-client.ts`
- Returns standardized response structure
- Supports real-time subscriptions

### UI Components (shadcn/ui)

**Configuration:**

- Style: "new-york"
- Base color: neutral
- CSS variables enabled
- Path aliases: `@/components`, `@/lib/utils`, etc.

**Important:** When adding new shadcn components, use:

```bash
npx shadcn@latest add <component-name>
```

### Routing

**App Router Structure:**

- Route groups: `(dashboard)` for protected routes
- Turkish route naming (e.g., `/yardim/ihtiyac-sahipleri`)
- Dynamic routes: `[id]` for detail pages
- Middleware-protected routes

**Main Routes:**

- `/login` - Login page
- `/genel` - Dashboard (default after login)
- `/yardim/ihtiyac-sahipleri` - Beneficiaries list
- `/yardim/ihtiyac-sahipleri/[id]` - Beneficiary detail
- `/bagis/liste` - Donations list
- `/kullanici` - User management
- Many placeholder pages for future features

### Path Aliases

Configured in `tsconfig.json`:

```json
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/stores/*": ["./src/stores/*"],
  "@/types/*": ["./src/types/*"],
  "@/data/*": ["./src/data/*"],
  "@/convex/*": ["./convex/*"]
}
```

## Convex Database Schema

**Schema Location:** `convex/schema.ts`

**Database Tables:**

- `users` - User accounts and profiles
- `beneficiaries` - İhtiyaç sahipleri (beneficiaries)
- `donations` - Bağışlar (donations) with kumbara (piggy bank) tracking
- `aid_applications` - Yardım başvuruları
- `tasks` - Görevler (tasks)
- `meetings` - Toplantılar (meetings)
- `messages` - Mesajlar (messages)
- `parameters` - System parameters
- `finance_records` - Finans kayıtları (income/expense tracking)
- `files` - File metadata (uploaded to Convex storage)

**File Storage:**

Convex provides built-in file storage via `ctx.storage` API:
- Files uploaded to Convex's secure storage
- Metadata stored in `files` table
- Access via signed URLs

**Setup Scripts:**

```bash
# Convex setup
npm run convex:dev     # Interactive Convex development
npm run convex:deploy  # Deploy to production

# Test Convex connection
npx tsx src/scripts/test-convex-connection.ts
```

## Module Organization

**Sidebar Navigation** (`src/components/layouts/Sidebar.tsx`):
The application is organized into modules, each with subpages:

- Ana Sayfa (Home) - Dashboard
- Bağışlar (Donations) - List, Reports, Kumbara tracking
- Yardımlar (Aid) - Beneficiaries, Applications, Lists
- Burslar (Scholarships) - Students, Applications (placeholder)
- Fonlar (Funds) - Income/Expense, Reports (placeholder)
- Mesajlar (Messages) - Internal, Bulk (placeholder)
- İşler (Tasks) - Tasks, Meetings
- Partnerler (Partners) - List (placeholder)
- Kullanıcılar (Users)
- Ayarlar (Settings) (placeholder)

## Important Development Notes

1. **Language:** Application is in Turkish - maintain Turkish naming for routes, UI text, and user-facing strings
2. **Client Components:** Most components use `'use client'` directive due to Zustand and TanStack Query
3. **TypeScript:** Strict mode enabled - maintain type safety
4. **Styling:** Uses Tailwind CSS v4 with @tailwindcss/postcss
5. **Convex Functions:** All database operations must go through Convex functions (queries/mutations)
6. **Real-time:** Convex provides automatic real-time subscriptions - use `useQuery()` instead of manual polling
7. **File Uploads:** Use Convex Storage API via `ctx.storage`
8. **Input Sanitization:** All user inputs must be sanitized using functions from `src/lib/sanitization.ts`
9. **Validation:** Use Zod schemas from `src/lib/validations/` for all form validations
10. **Error Monitoring:** Sentry is configured for both client and server - errors are automatically tracked
11. **Environment Variables:** Use `NEXT_PUBLIC_CONVEX_URL` - Convex URLs are not sensitive
12. **Convex Development:** Always run `npm run convex:dev` alongside `npm run dev` for backend functionality

## Security & Validation

### Input Sanitization

Location: `src/lib/sanitization.ts`

Functions available:

- `sanitizeTcNo()` - Turkish ID validation with algorithm check
- `sanitizePhone()` - Turkish phone format (+90 5XX XXX XX XX)
- `sanitizeEmail()` - Email format validation and lowercase
- `sanitizeHtml()` - XSS prevention using DOMPurify
- Many more specialized sanitizers

### Form Validation

Location: `src/lib/validations/`

All forms use Zod schemas with:

- Turkish-specific validations (TC Kimlik, phone format)
- Conditional validation (age vs marital status)
- Comprehensive field validation (100+ fields for beneficiary)

**Example:**

```typescript
import { beneficiarySchema } from '@/lib/validations/beneficiary';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(beneficiarySchema),
  defaultValues: {
    /* ... */
  },
});
```

## Common Development Workflows

### Adding a New Feature Module

1. Create route in `src/app/(dashboard)/[module-name]/`
2. Add Zod validation schema in `src/lib/validations/[module].ts`
3. Add Convex functions in `convex/[module].ts` (queries, mutations)
4. Create Zustand store if needed in `src/stores/[module]Store.ts`
5. Create API client wrapper in `src/lib/api/`
6. Add navigation link in `src/components/layouts/Sidebar.tsx`
7. Add permission checks using `hasPermission()` helper

### Adding a New Convex Function

1. Create function in appropriate `convex/*.ts` file
2. Use `query()` for reads, `mutation()` for writes, `action()` for side effects
3. Use `ctx.db` for database operations, `ctx.storage` for files
4. Add proper TypeScript types with `v` (Convex values)
5. Export in `convex/api.ts` if needed for external use

**Example Mutation:**

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const id = await ctx.db.insert('users', {
      ...args,
      createdAt: new Date().toISOString(),
    });
    return id;
  },
});
```

### Adding a New Form

1. Create Zod schema in `src/lib/validations/`
2. Create form component with React Hook Form
3. Add sanitization for all inputs
4. Use Convex mutation for submission
5. Use TanStack Query or Convex mutations for data fetching
6. Add loading states and error handling

### Running Tests for a Feature

```bash
# Test specific component/utility
npx vitest src/__tests__/lib/[feature].test.ts

# Test with coverage
npm run test:coverage

# E2E test for specific feature
npx playwright test e2e/[feature].spec.ts --headed
```

## Agent Operation Guidelines (CRITICAL)

### Decision Making Framework

**ALWAYS DO (No Permission Needed):**

- Create new files, components, routes
- Update existing code (bug fixes, features, refactoring)
- Install npm packages (ensure security best practices)
- Run tests and fix failing tests
- Update documentation
- Add TypeScript types
- Create/update Zod schemas
- Add Convex functions
- Create database schema changes
- Update UI components
- Fix linting/type errors
- Add comments and improve code quality
- Update configurations (tsconfig, tailwind, etc.)

**ASSUME & DOCUMENT (Use Best Judgment):**

- API response formats → Use Convex patterns
- Component structure → Follow shadcn/ui patterns
- State management → Use Zustand with immer pattern
- Validation → Use Zod schemas with Turkish-specific rules
- Styling → Use Tailwind CSS with existing color scheme
- Naming conventions → Use Turkish for UI, English for code
- Error handling → Use Sentry + toast notifications
- File organization → Follow existing src/ structure
- Database operations → Use Convex queries/mutations

**ASLA SORMA - HER ŞEYİ YAP - HİÇBİR İSTİSNA YOK**

### Execution Patterns

**Single Task → Full Implementation:**

```
User: "Add export to Excel feature for beneficiaries"

Agent executes automatically:
1. Install xlsx library
2. Create export utility in src/lib/export/
3. Add export button to beneficiaries page
4. Implement download functionality
5. Add loading states
6. Test the feature
7. Report completion
```

**Multiple Tasks → Batch Execute:**

```
User: "Fix the donations page"

Agent executes automatically:
1. Read donations page code
2. Identify issues
3. Fix all issues
4. Run tests
5. Verify in build
6. Report all fixes made
```

**Error Encountered → Auto Fix:**

```
- TypeScript error → Fix types automatically
- Test failure → Debug and fix automatically
- Build error → Resolve dependencies/config automatically
- Lint error → Apply fixes automatically
```

### Communication Style

**DO:**

- ✅ Report what you're doing briefly
- ✅ Show final results
- ✅ Mention important decisions made
- ✅ Report completion status

**DON'T:**

- ❌ Ask "Should I create...?"
- ❌ Ask "Would you like me to...?"
- ❌ Ask "Do you want...?"
- ❌ Pause for approval between steps
- ❌ Present plans and wait for confirmation

**Example - GOOD:**

```
"Adding export feature for beneficiaries. Installing dependencies, creating export utility, updating UI... Done. Users can now export beneficiaries to Excel format."
```

**Example - BAD:**

```
"I can add an export feature. Should I install the xlsx library first? Would you like me to create a new utility file? Where should I place the export button?"
```

### Turkish Context Awareness

When implementing features, automatically apply Turkish-specific rules:

- Phone numbers: +90 5XX XXX XX XX format
- TC Kimlik No: 11 digits with checksum validation
- Currency: Turkish Lira (₺) with proper formatting
- Dates: DD.MM.YYYY format preferred in UI
- UI text: Always in Turkish
- Error messages: Turkish, user-friendly
- Form labels: Turkish with proper capitalization

### Package Installation Policy

When packages are needed:

1. Check package security and reputation automatically
2. Install with `npm install <package>`
3. Update TypeScript types if needed
4. Document usage in code
5. Continue with implementation

No need to ask "Should I install X package?" - just do it if it's a reputable, commonly used package.

### Testing Philosophy

After implementing features:

1. Run relevant tests automatically
2. If tests fail, fix automatically
3. If no tests exist, note it but continue
4. Don't wait for permission to fix test failures

### Summary

**Key Principle:** Trust the agent to make good decisions. The agent knows the codebase patterns, security requirements, and Turkish context. Execute fully and autonomously unless there's a critical risk.