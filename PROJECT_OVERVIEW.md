# 📋 PORTAL - Dernek Yönetim Sistemi - Kapsamlı Proje İncelemesi

**Proje Adı:** PORTAL (Dernek Yönetim Sistemi)  
**Versiyon:** 0.1.0  
**Durum:** MVP Tamamlandı - Aktif Geliştirme  
**Kod Satırı:** ~45,000 LOC  
**Test Sayısı:** 146+ Unit Tests + E2E Tests

---

## 🎯 Proje Özeti

PORTAL, Türk dernekleri (non-profit organizations) için geliştirilmiş kapsamlı bir yönetim sistemidir. Modern web teknolojileri kullanarak, derneklerin üyeleri, bağışlar, yardım programları, burslar ve operasyonel süreçlerini yönetmesini sağlar.

### Temel Özellikler

- 👥 **Kullanıcı Yönetimi**: 6 farklı rol ile rol tabanlı erişim kontrolü (RBAC)
- 🤝 **İhtiyaç Sahipleri**: Detaylı kayıt, aile bilgileri, yardım geçmişi
- 💰 **Bağış Yönetimi**: Bağış kayıtları, kampanyalar, kumbara sistemi
- 📚 **Burs Sistemi**: Öğrenci başvuruları, yetim burs, takip
- 📝 **Görev Yönetimi**: Kanban tarzı görev panoları
- 📅 **Toplantı Yönetimi**: Planlama, kararlar, aksiyon maddeleri
- 💬 **İletişim**: Kurum içi mesajlaşma, toplu bildirimler
- 📊 **Raporlama**: Finansal ve operasyonel raporlar
- 🗂️ **Dosya Yönetimi**: Belge yükleme ve depolama
- 🔐 **Güvenlik**: CSRF koruması, input sanitization, rate limiting

---

## 🏗️ Teknoloji Yığını

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend

- **BaaS**: Convex (Real-time Database & API)
- **Collections**: 15+ (users, beneficiaries, donations, scholarships, tasks, meetings, messages, etc.)
- **Authentication**: Session-based with JWT
- **File Storage**: Convex File Storage

### Testing & Monitoring

- **Unit Tests**: Vitest (146+ tests)
- **E2E Tests**: Playwright
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics 4
- **Performance**: Vercel Speed Insights

---

## 📁 Proje Yapısı

```
PORTAL/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard routes
│   │   ├── api/                # API routes
│   │   ├── login/              # Authentication
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── forms/              # Form components
│   │   ├── tables/             # Table components
│   │   ├── layouts/            # Layout components
│   │   └── [feature]/          # Feature-specific components
│   ├── lib/                    # Utilities & services
│   │   ├── convex/             # Convex client/server
│   │   ├── api/                # API client
│   │   ├── auth/               # Authentication
│   │   ├── security.ts         # Security utilities
│   │   ├── sanitization.ts     # Input sanitization
│   │   ├── validations/        # Zod schemas
│   │   └── [service]/          # Other services
│   ├── types/                  # TypeScript types
│   │   ├── database.ts         # Database types
│   │   ├── permissions.ts      # Permission types
│   │   └── [domain].ts         # Domain types
│   ├── stores/                 # Zustand stores
│   ├── hooks/                  # Custom React hooks
│   ├── config/                 # Configuration
│   └── __tests__/              # Unit tests
├── convex/                     # Convex backend
│   ├── schema.ts               # Database schema
│   ├── auth.ts                 # Auth functions
│   ├── beneficiaries.ts        # Beneficiary functions
│   ├── donations.ts            # Donation functions
│   ├── scholarships.ts         # Scholarship functions
│   ├── tasks.ts                # Task functions
│   ├── meetings.ts             # Meeting functions
│   ├── messages.ts             # Message functions
│   └── [collection].ts         # Other collections
├── e2e/                        # E2E tests (Playwright)
├── docs/                       # Documentation
├── scripts/                    # Build & deployment scripts
└── [config files]              # tsconfig, eslint, prettier, etc.
```

---

## 📊 Veritabanı Şeması (15+ Collections)

### Temel Koleksiyonlar

1. **users** - Kullanıcı hesapları, roller, izinler
2. **beneficiaries** - İhtiyaç sahipleri, kişisel bilgiler, aile verileri
3. **donations** - Bağış kayıtları, kampanyalar
4. **scholarships** - Burs başvuruları, öğrenci bilgileri
5. **tasks** - Görevler, kanban panoları
6. **meetings** - Toplantılar, kararlar, aksiyon maddeleri
7. **messages** - İç mesajlaşma, bildirimler
8. **aid_applications** - Yardım başvuruları
9. **finance_records** - Finansal kayıtlar
10. **bank_accounts** - Banka hesapları
11. **documents** - Dosya yönetimi
12. **partners** - İş ortakları
13. **consents** - KVKK/GDPR onayları
14. **dependents** - Bağımlılar
15. **system_settings** - Sistem ayarları

---

## 🔐 Güvenlik Mimarisi

### Kimlik Doğrulama & Yetkilendirme

- Session-based authentication
- HttpOnly cookies
- CSRF token protection
- Role-based access control (RBAC)
- 6 user roles: Admin, Manager, Staff, Volunteer, Donor, Viewer

### Veri Güvenliği

- TC Kimlik hashing (Turkish ID)
- Input sanitization (XSS prevention)
- Rate limiting
- KVKK/GDPR compliance
- Encrypted sensitive data

### API Security

- X-CSRF-Token header validation
- Request throttling
- Input validation with Zod
- Error handling & logging

---

## 🧪 Test Stratejisi

### Unit Tests (Vitest)

- 146+ tests
- Component testing
- Utility function testing
- Hook testing
- API client testing

### E2E Tests (Playwright)

- Authentication flows
- Beneficiary management
- Donation tracking
- User management
- Search functionality

### Coverage Areas

- Critical business logic
- Security functions
- Data validation
- API integration
- User workflows

---

## 🚀 Deployment & DevOps

### Deployment Platform

- **Primary**: Vercel (Next.js optimized)
- **Backend**: Convex Cloud
- **Database**: Convex (serverless)

### CI/CD Pipeline

- Pre-commit hooks (Husky)
- Automated testing
- Type checking (TypeScript)
- Linting (ESLint v9)
- Formatting (Prettier)

### Environment Management

- `.env.local` for local development
- GitHub Secrets for production
- Vercel environment variables
- Convex deployment configuration

---

## 📈 Performans Optimizasyonları

- Virtual scrolling for large lists
- API response caching
- HTTP caching strategies
- Lazy loading components
- Image optimization
- Code splitting
- Bundle analysis
- Performance monitoring (Sentry)

---

## 🔄 Geliştirme Workflow

### Komutlar

```bash
npm run dev              # Dev server (auto-port cleanup)
npm run build            # Production build
npm run typecheck        # TypeScript validation
npm run lint             # ESLint check
npm run test:run         # Run tests once
npm run test             # Watch mode
npm run e2e              # Playwright E2E tests
npm run convex:dev       # Convex dev server
```

### Pre-Commit Validation

- TypeScript type checking (0 errors required)
- ESLint linting (0 errors required)
- 146+ tests must pass

---

## 📚 Önemli Dosyalar & Modüller

### Konfigürasyon

- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `vitest.config.ts` - Vitest configuration
- `playwright.config.cts` - Playwright configuration

### Temel Modüller

- `src/lib/convex/client.ts` - Convex React client
- `src/lib/convex/server.ts` - Convex server client
- `src/lib/security.ts` - Security utilities
- `src/lib/sanitization.ts` - Input sanitization
- `src/config/navigation.ts` - Navigation configuration
- `src/types/permissions.ts` - Permission definitions

---

## 🎓 Geliştirici Rehberi

### Başlamadan Önce Bilmeniz Gerekenler

1. Next.js 16 App Router pattern
2. Convex BaaS architecture
3. TypeScript strict mode
4. Zod validation schemas
5. React Hook Form usage
6. Zustand state management
7. Turkish localization (₺, DD.MM.YYYY, +90)
8. RBAC permission system
9. TC Kimlik security requirements
10. CSRF protection implementation

### Kod Stilleri

- camelCase for functions/variables
- PascalCase for components/types
- 'use client' for React components
- Path aliases (@/components, @/lib, @/types)
- No console.log (use logger)
- Turkish UI text
- Strict TypeScript mode

---

## 📞 İletişim & Destek

Proje hakkında sorularınız için:

- Dokümantasyon: `docs/DOCUMENTATION.md`
- Agent Rehberi: `docs/CLAUDE.md`
- Copilot Talimatları: `.github/copilot-instructions.md`
