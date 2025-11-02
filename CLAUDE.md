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
- Agent: Directly creates route → adds validation → creates API → adds UI → tests → done
- NO intermediate "Should I create the route?", "Should I add validation?" questions

**Exceptions: HİÇBİR ŞEY YOK - ASLA SORMA - HER ŞEYİ YAP**

## Project Overview

This is a **Dernek Yönetim Sistemi** (Association Management System) - a comprehensive management system for Turkish non-profit associations, built with Next.js 16, TypeScript, and Appwrite backend.

**Project Status:** MVP complete - migrated from React + Vite to Next.js 16, using Appwrite for backend services.

## Commands

### Development

```bash
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript compiler check (no emit)
npm run analyze    # Analyze bundle size
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
npm run test:connectivity     # Test Appwrite connectivity
npm run diagnose              # Comprehensive diagnostics
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
npm run lint -- --fix     # Auto-fix ESLint issues

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
# Appwrite Configuration (Required)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-secret-api-key  # Server-side only, never expose to client

# Database & Storage
NEXT_PUBLIC_DATABASE_ID=dernek_db
NEXT_PUBLIC_STORAGE_DOCUMENTS=documents
NEXT_PUBLIC_STORAGE_RECEIPTS=receipts
NEXT_PUBLIC_STORAGE_PHOTOS=photos
NEXT_PUBLIC_STORAGE_REPORTS=reports

# Security (Generate random 32+ character strings)
CSRF_SECRET=your-csrf-secret
SESSION_SECRET=your-session-secret
```

### Appwrite Test Users

The system uses Appwrite authentication. Test accounts can be created using:

```bash
npx tsx src/scripts/create-test-users.ts
```

Default test credentials (if created):

- Admin: `admin@test.com` / `admin123`
- Manager: `manager@test.com` / `manager123`
- Member: `member@test.com` / `member123`
- Viewer: `viewer@test.com` / `viewer123`

## Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Backend:** Appwrite (Cloud BaaS)
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
│   ├── api/                  # API routes (auth, beneficiaries, etc.)
│   ├── login/                # Login page
│   ├── providers.tsx         # Client-side providers (TanStack Query)
│   └── layout.tsx            # Root layout
├── components/
│   ├── layouts/              # Layout components (Sidebar)
│   ├── forms/                # Form components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── appwrite-api.ts  # Appwrite API wrapper
│   │   └── mock-api.ts      # Mock API (fallback for development)
│   ├── appwrite/
│   │   ├── client.ts        # Client SDK (browser, 'use client')
│   │   ├── server.ts        # Server SDK (API routes, Node.js)
│   │   ├── config.ts        # Shared configuration
│   │   └── permissions.ts   # Appwrite permission helpers
│   ├── validations/         # Zod schemas (beneficiary, task, etc.)
│   ├── csrf.ts              # CSRF protection
│   ├── security.ts          # Security utilities
│   ├── sanitization.ts      # Input sanitization (XSS, SQL injection)
│   ├── performance.ts       # Performance monitoring
│   └── utils.ts             # Utility functions (cn, etc.)
├── stores/
│   └── authStore.ts          # Zustand auth store (Appwrite integration)
├── types/
│   ├── auth.ts               # Auth types, UserRole, Permission, ROLE_PERMISSIONS
│   ├── beneficiary.ts        # Beneficiary types
│   ├── collections.ts        # Appwrite collection types
│   └── appwrite.ts           # Appwrite-specific types
├── scripts/                  # Database setup & migration scripts
├── __tests__/                # Vitest unit tests
│   ├── lib/                  # Library tests
│   ├── integration/          # Integration tests
│   └── mocks/                # Test mocks
└── middleware.ts             # Auth middleware (Appwrite session checking)
```

### Appwrite Backend Integration

**Critical Architecture Principle:** This project uses **two different Appwrite SDKs** for client and server operations.

#### 1. Client SDK (`appwrite` package)

**File:** `src/lib/appwrite/client.ts`
**Directive:** `'use client'` (required for Next.js App Router)
**Environment:** Browser/React Components
**Authentication:** User sessions (no API key)

**Use Cases:**

- ✅ Client Components (`'use client'`)
- ✅ User authentication (login/logout)
- ✅ Session management
- ✅ User-specific data queries
- ✅ File uploads from browser

**Example:**

```typescript
'use client';
import { account, databases } from '@/lib/appwrite/client';

const user = await account.get();
const data = await databases.listDocuments(DB_ID, COLLECTION_ID);
```

#### 2. Server SDK (`node-appwrite` package)

**File:** `src/lib/appwrite/server.ts`
**Environment:** Server Components/API Routes
**Authentication:** API Key (admin permissions)

**Use Cases:**

- ✅ Server Components (no 'use client')
- ✅ API Routes (`/app/api/*`)
- ✅ Server Actions
- ✅ Admin operations (user management)
- ✅ Bulk operations

**Example:**

```typescript
import { serverDatabases, serverUsers } from '@/lib/appwrite/server';

const users = await serverUsers.list();
const data = await serverDatabases.listDocuments(DB_ID, COLLECTION_ID);
```

#### Security Model

| Aspect                 | Client SDK  | Server SDK  |
| ---------------------- | ----------- | ----------- |
| **Permissions**        | User-level  | Admin-level |
| **API Key**            | ❌ Not used | ✅ Required |
| **Exposed to Browser** | ✅ Yes      | ❌ No       |

⚠️ **Never import server SDK in client components!** This will expose your API key.

#### Common Mistakes to Avoid

```typescript
// ❌ WRONG: Using server SDK in client component
'use client';
import { serverDatabases } from '@/lib/appwrite/server'; // ERROR!

// ✅ CORRECT: Using client SDK in client component
('use client');
import { databases } from '@/lib/appwrite/client';

// ✅ CORRECT: Using server SDK in server component or API route
import { serverDatabases } from '@/lib/appwrite/server';
```

### Authentication & Authorization

**Implementation:** Appwrite authentication with HttpOnly cookies and CSRF protection

1. **Login Flow:**
   - Client calls `/api/auth/login` API route
   - Server creates Appwrite session using Server SDK
   - Session stored in HttpOnly cookie (secure)
   - CSRF token validation on all mutations
   - Rate limiting: 5 attempts, 15-minute lockout

2. **Auth Store** (`src/stores/authStore.ts`):
   - Zustand store with persist middleware
   - Stores user info (not session token) in localStorage
   - Session token kept in HttpOnly cookie
   - Integrates with Appwrite via API routes

3. **Authorization:**
   - Role-based permissions defined in `src/types/auth.ts`
   - 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
   - ~30 granular permissions (donations, beneficiaries, users, etc.)
   - `ROLE_PERMISSIONS` maps each role to specific permissions
   - Helper methods: `hasPermission()`, `hasRole()`, `hasAnyPermission()`, `hasAllPermissions()`

4. **Route Protection:**
   - Dashboard routes in `(dashboard)` route group
   - Middleware checks Appwrite session cookie
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

- Primary: `src/lib/api/appwrite-api.ts` (Appwrite integration)
- Fallback: `src/lib/api/mock-api.ts` (development/testing)
- Returns `ApiResponse<T>` with data/error structure
- Supports pagination, search, filtering via Appwrite queries

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
  "@/data/*": ["./src/data/*"]
}
```

## Appwrite Database Structure

**Database ID:** `dernek_db` (configured in `.env.local`)

**Collections:**

- `users` - User accounts and profiles
- `beneficiaries` - İhtiyaç sahipleri (beneficiaries)
- `donations` - Bağışlar (donations)
- `aid_requests` - Yardım talepleri
- `aid_applications` - Yardım başvuruları
- `scholarships` - Burslar (scholarships)
- `parameters` - System parameters
- `tasks` - Görevler (tasks)
- `meetings` - Toplantılar (meetings)
- `messages` - Mesajlar (messages)
- `finance_records` - Finans kayıtları
- `orphans` - Yetimler
- `sponsors` - Sponsorlar
- `campaigns` - Kampanyalar

**Storage Buckets:**

- `documents` - General documents
- `receipts` - Donation receipts (makbuzlar)
- `photos` - Photos and images
- `reports` - Generated reports

**Setup Scripts:**

```bash
# Automated setup
npm run appwrite:setup          # Interactive setup wizard
npm run appwrite:deploy:quick   # Quick deployment script

# Manual operations
npx tsx src/scripts/test-appwrite-connection.ts  # Test connection
npx tsx src/scripts/create-test-users.ts         # Create test users
npx tsx src/scripts/migrate-to-appwrite.ts       # Migrate data
```

## Module Organization

**Sidebar Navigation** (`src/components/layouts/Sidebar.tsx`):
The application is organized into modules, each with subpages:

- Ana Sayfa (Home) - Dashboard
- Bağışlar (Donations) - List, Reports, Piggy Bank
- Yardımlar (Aid) - Beneficiaries, Applications, Lists, Cash Vault
- Burslar (Scholarships) - Students, Applications, Orphans
- Fonlar (Funds) - Income/Expense, Reports
- Mesajlar (Messages) - Internal, Bulk
- İşler (Tasks) - Tasks, Meetings
- Partnerler (Partners) - List
- Kullanıcılar (Users)
- Ayarlar (Settings)

## Important Development Notes

1. **Language:** Application is in Turkish - maintain Turkish naming for routes, UI text, and user-facing strings
2. **Client Components:** Most components use `'use client'` directive due to Zustand and TanStack Query
3. **TypeScript:** Strict mode enabled - maintain type safety
4. **Styling:** Uses Tailwind CSS v4 with @tailwindcss/postcss
5. **Appwrite SDK Selection:** Always use correct SDK (client.ts vs server.ts) - see Appwrite Backend Integration section
6. **Environment Variables:** Never commit `.env.local` - keep API keys secure
7. **CSRF Protection:** All mutations require CSRF tokens from `/api/csrf`
8. **Rate Limiting:** API routes have rate limiting configured (see `src/lib/rate-limit.ts` and `src/lib/rate-limit-config.ts`)
9. **File Uploads:** Use Appwrite Storage buckets with proper permissions (see `src/lib/appwrite/storage.ts`)
10. **Input Sanitization:** All user inputs must be sanitized using functions from `src/lib/sanitization.ts`
11. **Validation:** Use Zod schemas from `src/lib/validations/` for all form validations
12. **Error Monitoring:** Sentry is configured for both client and server - errors are automatically tracked
13. **SDK Guard:** Use `src/lib/appwrite/sdk-guard.ts` for runtime checks to prevent SDK misuse

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
3. Add API methods in `src/lib/api/appwrite-api.ts`
4. Create Zustand store if needed in `src/stores/[module]Store.ts`
5. Add navigation link in `src/components/layouts/Sidebar.tsx`
6. Add permission checks using `hasPermission()` helper

### Adding a New API Endpoint

1. Create API route in `src/app/api/[endpoint]/route.ts`
2. Use server SDK: `import { serverDatabases } from '@/lib/appwrite/server'`
3. Add CSRF protection for mutations
4. Add rate limiting if needed
5. Return standardized `ApiResponse<T>` format
6. Add error handling with Sentry

### Adding a New Form

1. Create Zod schema in `src/lib/validations/`
2. Create form component with React Hook Form
3. Add sanitization for all inputs
4. Add CSRF token to submission
5. Use TanStack Query for submission mutations
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
- Add API endpoints
- Create database collections/fields
- Update UI components
- Fix linting/type errors
- Add comments and improve code quality
- Create migration scripts
- Update configurations (tsconfig, tailwind, etc.)

**ASSUME & DOCUMENT (Use Best Judgment):**

- API response formats → Use existing patterns
- Component structure → Follow shadcn/ui patterns
- State management → Use Zustand with immer pattern
- Validation → Use Zod schemas with Turkish-specific rules
- Styling → Use Tailwind CSS with existing color scheme
- Naming conventions → Use Turkish for UI, English for code
- Error handling → Use Sentry + toast notifications
- File organization → Follow existing src/ structure

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
