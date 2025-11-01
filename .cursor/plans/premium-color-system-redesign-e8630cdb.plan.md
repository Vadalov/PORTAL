<!-- e8630cdb-83c0-4c72-b58a-0a2cd9f31981 6a3a7a5a-9138-4438-a2c0-689d62218bfc -->
# Full Project Modernization & Consistency Overhaul

## Current Setup Verification

- shadcn/ui structure: Yes (`src/components/ui`, aliases set in components.json)
- Tailwind CSS: v4 with CSS-first `@theme inline` in `src/app/globals.css`
- TypeScript: Strict mode enabled in `tsconfig.json`
- Component default path: `src/components/ui` (from components.json alias `"ui": "@/components/ui"`). Keep using this; add all reusable UI here for discoverability and consistency.

## High-level Approach

1) Systematic audit → 2) Design system finalize → 3) Component standardize → 4) Layout/Nav unify → 5) Forms & validation modernize → 6) State & data patterns unify → 7) Performance & a11y pass → 8) Consistency QA

## 1. Repository Audit & Cleanup

- Identify unused/duplicate components, styles, and utilities
- Remove hard-coded colors; replace with design tokens
- Replace inline styles and duplicate className patterns with utilities or UI components

## 2. Design System Finalization

- Adopt premium corporate palette (cool neutrals + brand primary) already applied in `globals.css`
- Unify shadows, radii, spacing via tokens; expose helpers in docs
- Typography hierarchy with heading/body tokens

## 3. UI Component Standardization (shadcn/ui + Radix)

- Centralize reusable primitives in `src/components/ui` (buttons, inputs, cards, tables, dialogs, popovers, tooltips, tabs, sidebar, loaders)
- Align props, variants (`variant`, `size`) and class contracts using `cn` and CVA
- Replace ad-hoc components with standardized UI counterparts

## 4. Layout & Navigation

- Single app layout with consistent header/sidebar/footer
- Shared page shell (breadcrumbs, page title, actions area)
- Responsive grid and spacing rules applied consistently

## 5. Forms & Validation

- Consolidate on `react-hook-form + zod`
- Shared form field components with error/help text, labels, and a11y attributes
- CSRF + sanitization integration kept intact

## 6. State & Data Patterns

- Keep Zustand for auth; unify feature stores where needed
- Data fetching via TanStack Query: consistent query keys, staleTimes, error handling (toasts)

## 7. Performance & Accessibility

- Lazy/dynamic imports for heavy modules
- Memoization of expensive lists/tables
- Ensure WCAG AA contrast, proper labels/aria, focus states

## 8. Consistency Rules

- Colors via CSS variables; no hard-coded hex/grays
- Shadows/radii/spacing from tokens only
- Motion via framer-motion; remove legacy effects
- Icons via Lucide/Tabler consistently

## 9. Dependency Hygiene

- Keep Tailwind v4, shadcn/ui, framer-motion, RHF, zod
- Ensure React 19 compatibility overrides for framer-motion remain stable

## 10. Testing & QA

- Update unit tests for refactored primitives
- Playwright smoke tests: navigation, forms, tables, modals
- Visual review across key pages (Dashboard, Beneficiaries, Donations, Settings)

## Key Files to Update

- `src/app/globals.css` (tokens, utilities)
- `src/app/(dashboard)/layout.tsx` (shell, header, sidebar, background)
- `src/components/ui/*` (button, input, card, table, dialog, popover, tabs, sidebar, loaders)
- Feature pages under `src/app/(dashboard)/**` (apply standardized layouts/components)
- Forms under `src/components/forms/**` (RHF + zod unified fields)

## Deliverables

- Consistent UI across all pages
- Unified components in `src/components/ui`
- Cleaned up styles and imports
- Documented patterns in docs/ (usage examples, tokens)

### To-dos

- [ ] Update background colors in globals.css - replace pure white with soft warm grays
- [ ] Enhance border colors for better visibility and depth
- [ ] Update card and surface colors with subtle gradients
- [ ] Increase background pattern and gradient visibility in layout.tsx
- [ ] Improve sidebar color scheme for better contrast
- [ ] Enhance header and navigation styling
- [ ] Audit and update all components using hard-coded colors
- [ ] Test color contrast ratios and visual hierarchy