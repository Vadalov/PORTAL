# AGENTS.md - Agent Developer Guide

## Quick Commands

```bash
npm run dev              # Start dev server (auto-port cleanup)
npm run build            # Production build
npm run typecheck        # TypeScript validation (REQUIRED before commit)
npm run lint             # ESLint check (REQUIRED before commit)
npm run test:run         # Run tests once (146+ tests expected)
npx vitest src/__tests__/lib/sanitization.test.ts  # Run single test file
npm run test             # Watch mode
npm run e2e              # Playwright E2E tests
```

## Architecture Overview

**Type**: Full-stack Turkish non-profit management system (Next.js 16 + Convex BaaS)
**Frontend**: Next.js 16, React 19, TypeScript (strict mode), Tailwind CSS v4, shadcn/ui
**Backend**: Convex (15+ collections), no SQL/ORM, uses Convex SDK
**State**: Zustand + TanStack Query, React Hook Form + Zod validation
**Testing**: Vitest (unit), Playwright (E2E)

**Key Folders**:

- `src/app/` - Next.js App Router + API routes
- `src/components/` - React components (UI, forms, layouts)
- `src/lib/` - Utilities (convex client/server, validations, sanitization)
- `convex/` - Convex functions (queries, mutations, schema)
- `src/__tests__/` - Unit tests (Vitest)
- `e2e/` - E2E tests (Playwright)

## Code Style & Conventions

**TypeScript**: Strict mode enabled (noImplicitAny: false, strictNullChecks: true)
**Imports**: Path aliases (@/components, @/lib, @/types, @/convex)
**Formatting**: Prettier (auto-format on save), ESLint v9
**Naming**: camelCase (functions, variables), PascalCase (components, types)
**Components**: 'use client' for React components, server functions in api/
**No console.log**: Use logger from @/lib/logger (Sentry-integrated)
**TC Security**: Always hash TC Kimlik before storage (`hashTcNumber()`)
**CSRF**: Include X-CSRF-Token header for all mutations
**Validation**: Use Zod schemas from @/lib/validations/
**Turkish**: All UI text in Turkish (₺, DD.MM.YYYY dates, +90 phone format)

## Convex Integration (Critical)

**Client SDK** (`src/lib/convex/client.ts`): React components, 'use client' required
**Server SDK** (`src/lib/convex/server.ts`): API routes, server components, admin access
**Pattern**: Import `api` from '@/convex/\_generated/api' to call functions
**Collections**: users, beneficiaries, donations, scholarships, tasks, meetings, messages, aid_applications, finance_records, partners, consents, bank_accounts, dependents, documents, system_settings
**No SQL**: Use Convex query API (`ctx.db.query()`, `.withIndex()`, `.filter()`)

## Pre-Commit Validation (MANDATORY)

```bash
npm run typecheck  # Must pass with 0 errors
npm run lint       # Must pass with 0 errors
npm run test:run   # 146+ tests should pass
```

Enforced via Husky pre-commit hooks. See docs/CLAUDE.md for full agent behavior guidelines.

## References

- **docs/CLAUDE.md**: Agent behavior, autonomous operation mode, communication style
- **docs/DOCUMENTATION.md**: Complete technical docs, deployment, database schema
- **.github/copilot-instructions.md**: Comprehensive architecture, common patterns, troubleshooting
