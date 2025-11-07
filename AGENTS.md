# PORTAL - Turkish Association Management System

## Commands
- **Dev**: `npm run dev` (runs with `npm run convex:dev` in parallel)
- **Build**: `npm run build`
- **Lint**: `npm run lint` / `npm run lint:fix`
- **Type Check**: `npm run typecheck`
- **Test**: `npm run test` (Vitest) / `npm run e2e` (Playwright)
- **Single Test**: `npx vitest src/__tests__/lib/sanitization.test.ts`
- **Convex**: `npm run convex:dev` / `npm run convex:deploy`

## Architecture
- **Frontend**: Next.js 16 App Router + TypeScript (strict mode)
- **Backend**: Convex (real-time DB + API)
- **UI**: Tailwind CSS v4 + shadcn/ui (New York style)
- **State**: Zustand + Immer + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Security**: CSRF protection, input sanitization, role-based permissions

## Code Style Guidelines
- **Language**: Turkish for UI text, English for code/variables
- **Components**: `'use client'` directive for client components
- **Imports**: Path aliases (`@/lib/*`, `@/components/*`, etc.)
- **Database**: All operations via Convex functions (queries/mutations)
- **Validation**: Zod schemas for all forms + input sanitization
- **Error Handling**: Sentry integration + toast notifications
- **Naming**: camelCase for code, kebab-case for routes (Turkish)

See [CLAUDE.md](CLAUDE.md) for detailed agent behavior and autonomous operation guidelines.
