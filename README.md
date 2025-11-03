# 🏛️ Dernek Yönetim Sistemi - Next.js

Modern, kapsamlı kar amacı gütmeyen dernekler için yönetim sistemi. **Next.js 16 + React 19 + TypeScript + Tailwind CSS + Convex Backend** ile geliştirilmiştir.

[![CI Pipeline](https://github.com/Vadalov/PORTAL/actions/workflows/ci.yml/badge.svg)](https://github.com/Vadalov/PORTAL/actions/workflows/ci.yml)
[![Code Quality](https://github.com/Vadalov/PORTAL/actions/workflows/code-quality.yml/badge.svg)](https://github.com/Vadalov/PORTAL/actions/workflows/code-quality.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Proje Durumu

**✅ MVP TAMAMLANDI** - Temel özellikler çalışır durumda!

Bu proje, orijinal React + Vite projesinden Next.js 16'ya taşınmıştır. **Convex backend** kullanmaktadır.

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 22+
- npm 10+

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Tarayıcıda aç
# http://localhost:3000
```

### Test Hesapları

| Rol     | Email            | Şifre      |
| ------- | ---------------- | ---------- |
| Admin   | admin@test.com   | admin123   |
| Manager | manager@test.com | manager123 |
| Member  | member@test.com  | member123  |
| Viewer  | viewer@test.com  | viewer123  |

---

---

## 🗄️ Convex Backend

Bu proje **Convex** backend kullanmaktadır. Appwrite artık kaldırılmıştır.

### Convex Backend Kurulumu

**📚 Detaylı Kurulum Rehberi**: [docs/CONVEX_MCP_SETUP.md](./docs/CONVEX_MCP_SETUP.md)

### Hızlı Başlangıç

```bash
# 1. Environment değişkenlerini ayarla
# .env.local dosyasında NEXT_PUBLIC_CONVEX_URL olmalı
# Örnek: NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# 2. Convex MCP bağlantısını test et
npm run convex:test-mcp

# 3. Convex fonksiyonlarını deploy et (development)
npm run convex:dev

# 4. Production deploy
npm run convex:deploy

# 5. Migration test
npm run tsx scripts/test-convex-migration.ts
```

### MCP Server Kurulumu

Convex MCP server'ı Cursor/Claude'ya eklemek için:

```bash
# Setup script'i çalıştır
chmod +x setup-mcp-convex.sh
./setup-mcp-convex.sh
```

Detaylı bilgi için: [docs/CONVEX_MCP_SETUP.md](./docs/CONVEX_MCP_SETUP.md)

### Convex Dashboard

- **Dashboard**: https://dashboard.convex.dev/d/fleet-octopus-839
- **Deployment URL**: https://fleet-octopus-839.convex.cloud

---

## Diagnostic Tools

This project includes comprehensive diagnostic tools to help with configuration, connectivity, and testing.

### Available Commands

- **`npm run test:mock-api`** - Tests mock backend implementation including schema validation and functional API testing.
- **`npm run health:check`** - Checks the health endpoint with detailed diagnostics.
- **`npm run convex:test-mcp`** - Tests Convex MCP connection.
- **`npm run tsx scripts/test-convex-migration.ts`** - Tests Convex migration and connectivity.

### When to Use Each Tool

- **Before starting development:** Ensure your environment is properly set up with `NEXT_PUBLIC_CONVEX_URL`.
- **When mock data seems incorrect:** Run `npm run test:mock-api` to verify schema parity and API functionality.
- **For Convex connectivity:** Use `npm run convex:test-mcp` to test Convex connection.
- **After configuration changes:** Run `npm run health:check` to verify everything is working.

---

## Scripts

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run type checking
npm run type-check
```

### Testing Scripts

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run test coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Error boundary tests
npm run test:error-boundaries

# Loading state tests
npm run test:loading-states

# Suspense boundary tests
npm run test:suspense

# Run all boundary tests
npm run test:all-boundaries
```

### Diagnostic Scripts

```bash
# Validate environment configuration
npm run validate:config

# Test Appwrite connectivity
npm run test:connectivity

# Test mock API
npm run test:mock-api

# Run comprehensive diagnostics
npm run diagnose

# Check health endpoint
npm run health:check
```

### Setup Scripts

```bash
# Test Convex migration
npx tsx scripts/test-convex-migration.ts

# Create test users
npx tsx scripts/create-test-users.ts

# Convex MCP connection test
npm run convex:test-mcp

# Convex development mode (auto-deploy)
npm run convex:dev

# Convex production deploy
npm run convex:deploy
```

---

## ✨ Tamamlanan Özellikler

- ✅ Authentication (Convex-based)
- ✅ Dashboard with Real Metrics
- ✅ İhtiyaç Sahipleri (Liste + Detay + Ekle/Düzenle)
- ✅ Bağışlar (Liste + Ekle/Düzenle + Dosya Yükleme)
- ✅ Görevler (Kanban Board)
- ✅ Toplantılar (Calendar View)
- ✅ Mesajlar (Toplu + Kurum İçi)
- ✅ Parametreler (Sistem Parametreleri)
- ✅ Sidebar Navigation
- ✅ Database Collections & Storage
- ✅ File Upload (Makbuz/Resimler)
- ✅ Form Validations (Zod)
- ✅ CRUD Operations
- ✅ Global Search (Cmd+K)
- ✅ Notifications System
- ✅ Real-time Currency Rates
- ✅ Message Statistics
- ✅ Error Monitoring (Sentry)
- ✅ Settings Management (System-wide configuration)
- ✅ User Management (CRUD with role-based permissions)

---

## 📁 Proje Yapısı

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/api/            # Mock API
├── stores/             # Zustand stores
├── data/mock/          # Mock JSON data
└── types/              # TypeScript types
```

---

## 🛠️ Teknoloji Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- shadcn/ui, Radix UI
- Zustand, TanStack Query
- Convex Backend (BaaS)

---

## 🛡️ Error Handling & Loading States

This project implements comprehensive error handling and loading state management to ensure a robust user experience.

### Error Boundaries

- **Route-level error boundaries** (`error.tsx`) - Catch errors in specific route segments
- **Global error boundary** (`global-error.tsx`) - Last line of defense for critical errors
- **Component-level error boundaries** - Granular error isolation around components
- **Hydration error detection** - Automatic recovery from server/client mismatches
- **Sentry integration** - Error reporting and monitoring

### Loading States

- **LoadingOverlay component** - 5 variants (spinner, dots, pulse, bars, ripple) with accessibility
- **Auth initialization loading** - Prevents dashboard access until authentication is verified
- **Hydration loading** - Smooth state restoration from localStorage
- **Page navigation loading** - Consistent loading during route transitions
- **Accessibility features** - Screen reader support, motion-reduce compliance

### Suspense Boundaries

- **React Suspense integration** - Handle lazy-loaded components and code splitting
- **SuspenseBoundary component** - Unified wrapper for Suspense + ErrorBoundary
- **Lazy loading patterns** - Route-based and component-based code splitting
- **Performance optimization** - Bundle size monitoring and loading strategies

### Documentation

- [Error Boundary Testing Guide](docs/ERROR-BOUNDARY-TESTING-GUIDE.md)
- [Loading States Guide](docs/LOADING-STATES-GUIDE.md)
- [Suspense Boundaries Guide](docs/SUSPENSE-BOUNDARIES-GUIDE.md)

---

## 📋 Logging

Projede merkezi bir logger sistemi kullanılıyor. Tüm log'lar Sentry'ye otomatik gönderiliyor.

### Kullanım

```typescript
import logger from '@/lib/logger';

// Info log
logger.info('User action', { userId: '123', action: 'login' });

// Error log
logger.error('Database error', error, { query: 'SELECT *' });

// Warning log
logger.warn('Rate limit approaching', { remaining: 5 });

// Debug log (sadece development'ta görünür)
logger.debug('Debug info', { data });
```

### Environment Variables

```bash
# Sentry DSN (production logging için)
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Log level (optional, default: info)
LOG_LEVEL=debug # development
LOG_LEVEL=warn  # production
```

### Best Practices

1. **Sensitive Data:** Password, token, API key gibi bilgileri asla loglama
2. **Context:** Her log'a context bilgisi ekle (endpoint, userId, vb.)
3. **Error Objects:** Error'ları ikinci parametre olarak geç
4. **Production:** Production'da sadece warn/error/fatal logla
5. **Development:** Development'ta debug log'ları kullan

### Log Levels

- `debug`: Geliştirme sırasında detaylı bilgi
- `info`: Normal operasyonlar
- `warn`: Uyarılar (rate limit, deprecated API vb.)
- `error`: Hatalar (Sentry'ye gönderilir)
- `fatal`: Kritik hatalar (Sentry'ye gönderilir)

---

## 📦 Dependencies & SDK Usage

### Convex Backend Architecture

Bu proje **Convex** backend kullanmaktadır. Appwrite artık kaldırılmıştır.

| Component | Location | Purpose |
| --------- | -------- | ------- |
| Convex Client | `src/lib/convex/client.ts` | Client-side Convex React client |
| Convex Server | `src/lib/convex/server.ts` | Server-side Convex HTTP client |
| Convex API | `src/lib/convex/api.ts` | API wrapper helpers |
| Convex Functions | `convex/*.ts` | Serverless functions |

---

### 1️⃣ Client-side (React Components)

**📁 File:** `src/lib/convex/client.ts`  
**🌐 Environment:** Browser/React Components  
**Use Cases:**

- ✅ Client Components (`'use client'`)
- ✅ Real-time queries with `useQuery`
- ✅ Mutations with `useMutation`

**Example:**

```typescript
'use client';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const beneficiaries = useQuery(api.beneficiaries.list);
```

---

### 2️⃣ Server-side (API Routes)

**📁 File:** `src/lib/convex/server.ts`  
**🖥️ Environment:** Server Components/API Routes  
**Use Cases:**

- ✅ API Routes (`/app/api/*`)
- ✅ Server Components
- ✅ Server Actions

**Example:**

```typescript
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

const users = await convexHttp.query(api.users.list);
```

---

### 🔧 Environment Variables

**Required:**

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

See `.env.example` for complete configuration.

---

### 📚 Related Documentation

- [Convex Documentation](https://docs.convex.dev/)
- [Convex React Integration](https://docs.convex.dev/client/react)
- [Convex HTTP API](https://docs.convex.dev/http-api)
- [Next.js 13+ App Router](https://nextjs.org/docs/app)
- Project Files:
  - `src/lib/convex/client.ts` - Convex React client
  - `src/lib/convex/server.ts` - Convex HTTP client
  - `src/lib/convex/api.ts` - API helpers
  - `convex/*.ts` - Convex functions

---

## 👥 User Management

### Features

**User CRUD Operations:**

- Create new users with role assignment
- Edit user details (name, role, avatar, status)
- Delete users (with confirmation)
- Toggle user status (active/inactive)

**Role-Based Access Control:**

- 6 roles: SUPER_ADMIN, ADMIN, MANAGER, MEMBER, VIEWER, VOLUNTEER
- Permission display (read-only, based on ROLE_PERMISSIONS)
- Current user can't create users with higher role
- Can't delete or deactivate self

**Search & Filters:**

- Search by name or email
- Filter by role (All, SUPER_ADMIN, ADMIN, etc.)
- Filter by status (All, Active, Inactive)
- Pagination (20 users per page)

**Permissions Required:**

- `USERS_READ` - View user list
- `USERS_CREATE` - Create new users
- `USERS_UPDATE` - Edit users and toggle status
- `USERS_DELETE` - Delete users

**Usage:**

```typescript
import { appwriteApi } from '@/lib/api';

// Get users with filters
const { data } = await appwriteApi.users.getUsers({
  page: 1,
  limit: 20,
  search: 'john',
  filters: {
    role: 'ADMIN',
    isActive: true,
  },
});

// Create user
await appwriteApi.users.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'MEMBER',
  isActive: true,
});

// Update user
await appwriteApi.users.updateUser(userId, {
  role: 'MANAGER',
  isActive: false,
});

// Delete user
await appwriteApi.users.deleteUser(userId);
```

**Role Permissions:**

| Role        | Description           | Key Permissions                                   |
| ----------- | --------------------- | ------------------------------------------------- |
| SUPER_ADMIN | Full system access    | All permissions                                   |
| ADMIN       | Administrative access | Most permissions (can't manage super admins)      |
| MANAGER     | Business operations   | CRUD on beneficiaries, donations, tasks, meetings |
| MEMBER      | Standard user         | Read most, create/update own items                |
| VIEWER      | Read-only access      | Read-only permissions                             |
| VOLUNTEER   | Limited access        | Limited create/read permissions                   |

**Validation:**

- Name: 2-100 characters, required
- Email: Valid email format, required, unique
- Role: One of 6 valid roles, required
- Avatar: Valid URL, optional
- Status: Boolean, default true

**Security:**

- Email field disabled in edit mode (can't change email)
- Role-based UI (buttons hidden if no permission)
- Self-protection (can't delete/deactivate self)
- Permission checks on both client and server

---

## ⌨️ Keyboard Shortcuts

| Shortcut           | Action                  |
| ------------------ | ----------------------- |
| `Cmd+K` / `Ctrl+K` | Open global search      |
| `Esc`              | Close dialogs/modals    |
| `Arrow Up/Down`    | Navigate search results |
| `Enter`            | Select search result    |
| `Tab`              | Navigate form fields    |
| `Shift+Tab`        | Navigate backwards      |

---

## 🔄 Mock Backend

Mock data kullanılıyor. Gerçek backend için `src/lib/api/mock-api.ts` dosyasını düzenleyin.

---

## 📊 Production Readiness

### Quality Metrics

- **TypeScript Errors:** 0 ✅
- **Linter Errors:** 0 ✅
- **Unit Tests:** 79 tests passing ✅
- **E2E Tests:** 25+ tests passing ✅
- **Code Coverage:** Good ✅
- **Bundle Size:** Optimized ✅

### Performance

- **Lighthouse Performance:** > 90 (Target)
- **Lighthouse Accessibility:** > 95 (Target)
- **First Contentful Paint:** < 1.8s (Target)
- **Time to Interactive:** < 3.8s (Target)

### Security

- ✅ HTTPS (production)
- ✅ CSRF Protection
- ✅ Input Sanitization (XSS prevention)
- ✅ Rate Limiting
- ✅ File Upload Security
- ✅ Environment Validation
- ✅ Error Monitoring (Sentry)
- ✅ Audit Logging

### Documentation

- ✅ README.md
- ✅ CHANGELOG.md
- ✅ SECURITY.md
- ✅ TESTING-CHECKLIST.md
- ✅ IMPLEMENTATION-STATUS.md
- ✅ SENTRY-SETUP.md
- ✅ Production Build Guide
- ✅ Lighthouse Audit Guide

### Deployment

See `docs/PRODUCTION-BUILD-GUIDE.md` for detailed deployment instructions.

**Quick Deploy:**

```bash
# Build
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod
```

---

## 🔒 Form Validation & Sanitization

### Validation Schema

Projede **Zod** tabanlı comprehensive validation schema kullanılıyor:

- **Lokasyon:** `/src/lib/validations/beneficiary.ts`
- **100+ alan** validasyonu
- **Conditional validation** (TC Kimlik + Mernis, yaş + medeni durum)
- **Helper validators** (TC algoritma, telefon, email, tarih)

**Örnek Kullanım:**

```typescript
import { beneficiarySchema } from '@/lib/validations/beneficiary';

const result = beneficiarySchema.safeParse(formData);
if (!result.success) {
  console.error(result.error.issues);
}
```

### Sanitization

Güvenlik için **15+ sanitization fonksiyonu** mevcut:

- **Lokasyon:** `/src/lib/sanitization.ts`
- **XSS Prevention:** HTML sanitization (DOMPurify)
- **SQL Injection Prevention:** Query sanitization
- **TC Kimlik:** Algoritma kontrolü
- **Telefon:** Türk telefon formatı (+90 5XX XXX XX XX)
- **Email:** Format validation ve lowercase

**Örnek Kullanım:**

```typescript
import { sanitizeTcNo, sanitizePhone, sanitizeEmail } from '@/lib/sanitization';

const cleanTc = sanitizeTcNo('10000000146');
const cleanPhone = sanitizePhone('0555 123 45 67'); // +905551234567
const cleanEmail = sanitizeEmail('  USER@EXAMPLE.COM  '); // user@example.com
```

### Form Submission Flow

```
User Input → Validation (Zod) → Sanitization → API Call → Database
```

1. **Client-side validation:** React Hook Form + Zod
2. **Client-side sanitization:** Pre-submit sanitization
3. **Server-side sanitization:** API layer guard
4. **Database:** Clean, validated data

---

## 🧪 Testing

### Unit Tests (Vitest)

**Lokasyon:** `/src/__tests__/`

```bash
# Tüm testleri çalıştır
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Test Dosyaları:**

- `lib/sanitization.test.ts` - Sanitization testleri (79 test)
- `lib/beneficiary-validation.test.ts` - Validation testleri (20+ test)
- `integration/beneficiary-sanitization.test.ts` - Integration testleri (15+ test)

### E2E Tests (Playwright)

**Lokasyon:** `/e2e/`

```bash
# Tüm E2E testleri
npm run test:e2e

# Headed mode (browser görünür)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Specific file
npx playwright test beneficiary-edit.spec.ts
```

**Test Dosyaları:**

- `beneficiaries.spec.ts` - Beneficiary list testleri
- `beneficiary-edit.spec.ts` - Edit flow testleri (10 test)
- `auth.spec.ts` - Authentication testleri

### Test Coverage

**Mevcut Coverage:**

- ✅ **Unit Tests:** 100+ test passing
- ✅ **E2E Tests:** 35+ test passing
- ✅ **Sanitization:** %100 coverage
- ✅ **Validation:** Comprehensive coverage
- ✅ **Integration:** Sanitization + Validation pipeline

### Boundary Testing

**Error Boundary Testing:**

- **Manual:** Navigate to `/test-error-boundary` (development only)
- **Automated:** `npm run test:error-boundaries`
- **Documentation:** [`docs/ERROR-BOUNDARY-TESTING-GUIDE.md`](docs/ERROR-BOUNDARY-TESTING-GUIDE.md)

**Loading State Testing:**

- **Manual:** Navigate to `/test-loading-states` (development only)
- **Automated:** `npm run test:loading-states`
- **Documentation:** [`docs/LOADING-STATES-GUIDE.md`](docs/LOADING-STATES-GUIDE.md)

**Suspense Boundary Testing:**

- **Automated:** `npm run test:suspense`
- **Documentation:** [`docs/SUSPENSE-BOUNDARIES-GUIDE.md`](docs/SUSPENSE-BOUNDARIES-GUIDE.md)

**All Boundary Tests:**

- **Run all:** `npm run test:all-boundaries`

---

## 🔐 Security Features

### 8-Layer Security System

1. **Input Sanitization:** 15+ sanitization functions
2. **XSS Protection:** HTML sanitization (DOMPurify)
3. **SQL Injection Protection:** Query sanitization
4. **CSRF Protection:** Token-based
5. **Rate Limiting:** API abuse prevention
6. **File Upload Security:** Type, size, name validation
7. **Environment Validation:** Zod-based config check
8. **Error Monitoring:** Sentry integration

### Validation Rules

**TC Kimlik No:**

- 11 hane
- İlk hane 0 olamaz
- Algoritma kontrolü (10. ve 11. hane checksum)

**Telefon:**

- Türk mobil format: +90 5XX XXX XX XX
- Sabit hat kabul edilmez
- Otomatik format düzeltme

**Email:**

- RFC 5322 compliant
- Lowercase conversion
- Trim whitespace

**Conditional Validation:**

- TC Kimlik varsa Mernis kontrolü zorunlu
- 18 yaş altı evli olamaz
- Kronik hastalık varsa detay zorunlu
- Engellilik varsa detay zorunlu

---

## 📚 API Documentation

### Beneficiary API

**Base URL:** `/api/beneficiaries`

**Endpoints:**

```typescript
// Get all beneficiaries
GET /api/beneficiaries?page=1&limit=10&search=query

// Get single beneficiary
GET /api/beneficiaries/:id

// Create beneficiary
POST /api/beneficiaries
Body: BeneficiaryFormData (validated + sanitized)

// Update beneficiary
PUT /api/beneficiaries/:id
Body: Partial<BeneficiaryFormData> (validated + sanitized)

// Delete beneficiary
DELETE /api/beneficiaries/:id
```

**Response Format:**

```typescript
interface AppwriteResponse<T> {
  data: T | null;
  error: string | null;
  total?: number;
}
```

**Error Handling:**

Tüm API error'ları user-friendly Türkçe mesajlara çevrilir:

```typescript
import { formatErrorMessage } from '@/lib/errors';

try {
  await api.beneficiaries.updateBeneficiary(id, data);
} catch (error) {
  const userMessage = formatErrorMessage(error);
  toast.error(userMessage);
}
```

---

## Development

### Best Practices

- **Run validation before committing:** Always run `npm run validate:config` to ensure your environment configuration is correct before pushing changes.
- **Test connectivity after setup changes:** If you modify Appwrite settings, use `npm run test:connectivity` to verify everything is working.
- **Diagnose issues proactively:** When encountering any configuration or connectivity issues, start with `npm run diagnose` for a comprehensive check.

### Workflow

1. **Setup:** Clone repo, run `npm install`, copy `.env.example` to `.env.local`
2. **Validate:** Run `npm run validate:config` to check configuration
3. **Develop:** Make changes, run tests with `npm run test`
4. **Test Connectivity:** If using Convex, run `npm run convex:test-mcp`
5. **Build:** Run `npm run build` and test with `npm start`
6. **Deploy:** Use your deployment pipeline

### Development Tools

**Test Pages (Development Only):**

- `/test-error-boundary` - Error boundary testing interface
- `/test-loading-states` - Loading state testing interface

**Debug Utilities (Development Only):**

- `window.__ERROR_SIMULATOR__` - Programmatic error simulation
- `window.__LOADING_STATE_TESTER__` - Loading state testing utilities
- `window.__LAST_ERROR__` - Last error caught by route boundary

---

## 🔧 Common Issues

**1. Quick Diagnostic Commands (at top of section):**

```bash
# First, run comprehensive diagnostics
npm run diagnose

# For specific issues:
npm run validate:config      # Configuration problems
npm run test:connectivity    # Appwrite connection issues
npm run test:full-system     # Complete system validation
npm run test:browsers        # Browser compatibility issues
```

**2. Critical Issues (High Priority):**

**Beyaz Ekran (White Screen) - CRITICAL**

- **Symptoms:** Page doesn't load, white screen, or partial render
- **Quick Fix:**
  ```bash
  # Clear storage and reload
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
  ```
- **Root Causes:**
  1. Hydration mismatch (Zustand persist + localStorage)
  2. Error boundary caught critical error
  3. JavaScript error blocking render
  4. Browser extension interference
- **Diagnostic Steps:**
  1. Open browser console (F12) and check for errors
  2. Check `window.__LAST_ERROR__` for caught errors
  3. Test in Incognito mode (disable extensions)
  4. Run `npm run test:full-system` to validate setup
- **Detailed Guide:** [`docs/ERROR-BOUNDARY-TESTING-GUIDE.md`](docs/ERROR-BOUNDARY-TESTING-GUIDE.md)
- **Related Issues:** Hydration Mismatch, Browser Extensions

**Application Not Starting - CRITICAL**

- **Symptoms:** `npm run dev` fails or crashes immediately
- **Quick Fix:**
  ```bash
  # Clean install
  rm -rf .next node_modules package-lock.json
  npm install
  npm run dev
  ```
- **Root Causes:**
  1. Missing `.env.local` file
  2. Corrupted node_modules
  3. Port 3000 already in use
  4. TypeScript compilation errors
- **Diagnostic Steps:**
  1. Check if `.env.local` exists: `ls -la .env.local`
  2. Validate configuration: `npm run validate:config`
  3. Check port availability: `lsof -i :3000`
  4. Run type check: `npm run typecheck`
- **Detailed Guide:** [`docs/CONFIGURATION-TROUBLESHOOTING.md`](docs/CONFIGURATION-TROUBLESHOOTING.md)

**3. Configuration Issues:**

**Environment Variables Missing**

- **Symptoms:** "MISSING_ENV_VARIABLES" error, Appwrite connection fails
- **Quick Fix:**
  ```bash
  cp .env.example .env.local
  # Edit .env.local with your values
  npm run validate:config
  ```
- **Required Variables:**
  - `NEXT_PUBLIC_BACKEND_PROVIDER` (convex or mock)
  - `NEXT_PUBLIC_CONVEX_URL` (if using Convex)
- **Validation:** `npm run validate:config` checks all required variables
- **Detailed Guide:** [`docs/CONFIGURATION-TROUBLESHOOTING.md`](docs/CONFIGURATION-TROUBLESHOOTING.md)

**Convex Connection Failed**

- **Symptoms:** API calls fail, "Cannot connect to Convex" errors
- **Quick Fix:**

  ```bash
  # Test connectivity
  npm run test:connectivity

  # Or use mock backend
  # In .env.local:
  NEXT_PUBLIC_BACKEND_PROVIDER=mock
  ```

- **Common Causes:**
  1. Invalid endpoint URL (must end with /v1)
  2. Wrong project ID
  3. Network/firewall blocking connection
  4. CORS not configured in Appwrite console
- **Diagnostic Steps:**
  1. Run `npm run test:connectivity` for detailed report
  2. Check Appwrite console → Settings → Platforms
  3. Add `http://localhost:3000` to allowed platforms
  4. Verify endpoint is reachable: `curl <endpoint>/health`
- **Detailed Guide:** [`docs/CONVEX_MCP_SETUP.md`](docs/CONVEX_MCP_SETUP.md)

**4. Runtime Issues:**

**Loading State Stuck**

- **Symptoms:** Loading overlay never disappears, infinite spinner
- **Quick Fix:**
  ```javascript
  // In browser console:
  useAuthStore.getState()._hasHydrated; // Should be true
  useAuthStore.getState().isInitialized; // Should be true
  ```
- **Root Causes:**
  1. Hydration not completing (`_hasHydrated` stuck at false)
  2. Auth initialization failed
  3. Infinite loading condition
- **Diagnostic Steps:**
  1. Check browser console for errors
  2. Verify `_hasHydrated` state in Zustand store
  3. Check network tab for failed API calls
  4. Run `npm run test:loading-states` to validate
- **Detailed Guide:** [`docs/LOADING-STATES-GUIDE.md`](docs/LOADING-STATES-GUIDE.md)

**Hydration Mismatch Errors**

- **Symptoms:** Console warnings about "Text content does not match", "Hydration failed"
- **Quick Fix:**
  ```bash
  # Clear storage
  localStorage.clear()
  # Reload page
  ```
- **Root Causes:**
  1. localStorage used during render (server/client mismatch)
  2. Date.now() or Math.random() in render
  3. Browser extensions modifying DOM
  4. Conditional rendering based on client-only APIs
- **Prevention:** Project uses `skipHydration: true` in `src/stores/authStore.ts`
- **Diagnostic Steps:**
  1. Test in Incognito mode (disable extensions)
  2. Check console for specific component causing mismatch
  3. Run `npm run debug:hydration` for detailed analysis
- **Detailed Guide:** [`docs/TROUBLESHOOTING.md#hydration-mismatch-debug`](docs/TROUBLESHOOTING.md#hydration-mismatch-debug)

**Auth Redirect Loop**

- **Symptoms:** Infinite redirects between login and dashboard
- **Quick Fix:**
  ```bash
  # Clear auth state
  localStorage.removeItem('auth-store')
  localStorage.removeItem('auth-session')
  # Reload
  ```
- **Root Cause:** Auth initialization runs before hydration completes
- **Solution:** Project checks both `isInitialized` and `_hasHydrated` before redirect
- **Code Reference:** `src/app/page.tsx` and `src/app/(dashboard)/layout.tsx`

**5. Browser-Specific Issues:**

**Chrome Issues**

- **React DevTools Interference:** Disable during hydration testing
- **Service Worker Caching:** Clear in DevTools → Application → Service Workers
- **Extension Conflicts:** Test in Incognito mode

**Firefox Issues**

- **Stricter CSP:** May block inline scripts (check console)
- **localStorage Timing:** May need small delay after writes
- **CSS Animation Performance:** Use `will-change` property
- **Solution:** CSP configured in `next.config.ts` for Firefox compatibility

**Safari Issues**

- **iOS Hydration Timing:** Different JavaScript execution timing
- **localStorage Quota:** 5MB limit (stricter than other browsers)
- **Viewport Height:** Use `dvh` units instead of `vh` for iOS
- **Touch Events:** Requires explicit touch event handlers
- **Testing:** Run `npm run test:browsers` to validate Safari compatibility

**6. Build & Deployment Issues:**

**Production Build Fails**

- **Symptoms:** `npm run build` exits with errors
- **Quick Fix:**
  ```bash
  # Check TypeScript errors
  npm run typecheck
  # Check linting
  npm run lint
  # Clean and rebuild
  rm -rf .next && npm run build
  ```
- **Common Causes:**
  1. TypeScript errors
  2. ESLint errors
  3. Missing environment variables
  4. Out of memory (increase Node memory)
- **Diagnostic:** Run `npm run test:prod-enhanced` for comprehensive validation

**Large Bundle Size**

- **Symptoms:** Slow page load, bundle > 1MB
- **Quick Fix:**
  ```bash
  # Analyze bundle
  ANALYZE=true npm run build
  # Opens bundle analyzer in browser
  ```
- **Solutions:**
  1. Remove unused dependencies
  2. Use dynamic imports for large components
  3. Enable code splitting (already configured)
  4. Optimize images with next/image
- **Target:** Total bundle < 500KB (gzipped)

**Slow Performance**

- **Symptoms:** TTI > 5s, low Lighthouse score
- **Quick Fix:**
  ```bash
  # Run Lighthouse audit
  npm run test:prod-enhanced
  ```
- **Common Issues:**
  1. Too much JavaScript on initial load
  2. No code splitting
  3. Blocking resources
  4. Large images
- **Solutions:**
  1. Implement lazy loading with Suspense
  2. Optimize images
  3. Defer non-critical JavaScript
  4. Use font-display: swap
- **Targets:** FCP < 1.8s, LCP < 2.5s, TTI < 3.8s, CLS < 0.1

**7. Testing Issues:**

**E2E Tests Failing**

- **Symptoms:** Playwright tests fail, timeouts
- **Quick Fix:**
  ```bash
  # Run in headed mode to see what's happening
  npx playwright test --headed
  # Or debug mode
  npx playwright test --debug
  ```
- **Common Causes:**
  1. Timing issues (elements not ready)
  2. Missing test data
  3. Environment variables not set in CI
- **Solution:** Add explicit waits, verify test data exists

**Unit Tests Failing After Updates**

- **Symptoms:** Tests pass locally but fail in CI
- **Quick Fix:**
  ```bash
  # Run tests with coverage
  npm run test:coverage
  # Check which tests are failing
  ```
- **Common Causes:**
  1. localStorage not mocked
  2. Zustand persist not mocked
  3. Timing differences
- **Solution:** Update test setup in `src/__tests__/setup.ts`

**8. Cache & Dependency Issues:**

**Peer Dependency Warnings**

- **Symptoms:** npm install shows peer dependency warnings
- **Quick Fix:**
  ```bash
  npm install --legacy-peer-deps
  ```
- **Root Cause:** Some packages haven't updated peerDependencies for React 19
- **Solution:** Project uses `overrides` in `package.json` to force React 19
- **Verification:** `npm ls react react-dom` should show 19.2.0

**Cache Issues**

- **Symptoms:** Unexpected behavior, old code running
- **Quick Fix:**
  ```bash
  # Clear Next.js cache
  rm -rf .next
  # Or full clean
  npm run clean:all
  ```
- **When to Use:**
  1. After updating dependencies
  2. After changing next.config.ts
  3. When seeing stale code
  4. Before production build

**9. Quick Reference Table:**

| Symptom             | Quick Command                    | Detailed Section         |
| ------------------- | -------------------------------- | ------------------------ |
| White screen        | `localStorage.clear()` + reload  | Beyaz Ekran              |
| App won't start     | `npm run clean:all`              | Application Not Starting |
| Missing env vars    | `npm run validate:config`        | Environment Variables    |
| Convex connection   | `npm run convex:test-mcp`        | Convex Connection        |
| Loading stuck       | Check `_hasHydrated` in console  | Loading State Stuck      |
| Hydration error     | Test in Incognito mode           | Hydration Mismatch       |
| Redirect loop       | Clear auth storage               | Auth Redirect Loop       |
| Build fails         | `npm run typecheck`              | Production Build Fails   |
| Large bundle        | `ANALYZE=true npm run build`     | Large Bundle Size        |
| Slow performance    | `npm run test:prod-enhanced`     | Slow Performance         |
| Tests failing       | `npx playwright test --headed`   | E2E Tests Failing        |
| Peer warnings       | `npm install --legacy-peer-deps` | Peer Dependency Warnings |
| Cache issues        | `rm -rf .next`                   | Cache Issues             |

**10. Getting Help:**

If issues persist after trying solutions above:

1. **Run Full Diagnostics:**

   ```bash
   npm run diagnose
   ```

   This generates a comprehensive report you can share.

2. **Check Detailed Guides:**
   - [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Comprehensive troubleshooting
   - [Configuration Troubleshooting](docs/CONFIGURATION-TROUBLESHOOTING.md) - Setup issues
   - [Error Boundary Testing](docs/ERROR-BOUNDARY-TESTING-GUIDE.md) - Error handling
   - [Loading States Guide](docs/LOADING-STATES-GUIDE.md) - Loading issues
   - [Convex Setup](docs/CONVEX_MCP_SETUP.md) - Backend configuration
   - [Migration Notes](MIGRATION_NOTES.md) - Appwrite'dan Convex'e geçiş
   - [Removed Appwrite](REMOVED_APPWRITE.md) - Kaldırılan Appwrite detayları

3. **Collect Debug Information:**
   - Browser console errors (F12)
   - Network tab (failed requests)
   - `window.__LAST_ERROR__` (if white screen)
   - Output of `npm run diagnose`
   - Browser and OS version

---

**⚡ Version:** 1.0.0
**📅 Last Updated:** 29 Ekim 2025
**🚀 Status:** Production Ready
