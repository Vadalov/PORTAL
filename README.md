# PORTAL - Turkish Non-Profit Association Management System

**PORTAL** is a comprehensive Turkish non-profit association management system (Dernek Yönetim Sistemi) built with Next.js 16, TypeScript, and Convex backend.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vadalov/PORTAL)

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## 🚀 Deploy to Production

**3-Adımda Deployment:**

```bash
# 1. Pre-deployment validation
npm run validate:deploy

# 2. Otomatik Convex + Vercel deployment
npm run deploy:vercel

# 3. Vercel Dashboard'da environment variables ekle ve deploy!
```

📖 **[Deployment Rehberi](./DEPLOYMENT_QUICKSTART.md)** | **[Detaylı Dokümantasyon](./docs/VERCEL_DEPLOYMENT.md)**

## 🏗️ Architecture

- **Frontend**: Next.js 16 with TypeScript
- **Backend**: Convex (Real-time database & API)
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Analytics**: Vercel Analytics + Speed Insights

## 🚀 Features

- 👥 **User Management**: Role-based access control (6 user roles)
- 📋 **Beneficiary Management**: Complete CRUD operations
- 💰 **Donation Tracking**: Financial record management
- 📚 **Scholarship System**: Student applications and tracking
- 📝 **Task Management**: Kanban-style task boards
- 📅 **Meeting Management**: Calendar integration
- 💬 **Internal Messaging**: Organization-wide communication
- 📊 **Reporting**: Comprehensive financial and operational reports

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern React components
- **React Hook Form**: Performant forms
- **Zod**: Runtime type validation

### Backend
- **Convex**: Real-time database and API
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management
- **Sentry**: Error monitoring

### Development
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing
- **ESLint + Prettier**: Code quality
- **Husky**: Git hooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes
│   └── login/             # Authentication
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                   # Utilities & configurations
│   ├── convex/           # Convex client setup
│   ├── api/              # API utilities
│   ├── validations/      # Zod schemas
│   └── utils/            # Helper functions
├── stores/               # Zustand stores
├── types/                # TypeScript definitions
└── __tests__/            # Test files
```

## 🔧 Environment Configuration

Create a `.env.local` file based on `.env.example`:

```env
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your-convex-url
```

## 🚦 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # TypeScript type check

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run e2e              # Run E2E tests

# Utility
npm run validate:config  # Validate configuration
npm run clean:all        # Clean all build artifacts
```

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Full system access |
| **ADMIN** | Administrative functions |
| **MANAGER** | Business operations |
| **MEMBER** | Standard user access |
| **VIEWER** | Read-only access |
| **VOLUNTEER** | Limited functionality |

## 🔐 Security Features

- **CSRF Protection**: All mutations require CSRF tokens
- **Input Sanitization**: XSS and injection prevention
- **Role-Based Access**: Granular permission system
- **Rate Limiting**: API endpoint protection
- **Data Validation**: Client and server-side validation

## 🌍 Turkish Localization

- **UI Language**: Turkish (Türkçe)
- **Phone Format**: +90 5XX XXX XX XX
- **Currency**: Turkish Lira (₺)
- **Date Format**: DD.MM.YYYY
- **TC Kimlik**: 11-digit validation algorithm

## 📊 Testing Strategy

- **Unit Tests**: Vitest with 165+ test cases
- **E2E Tests**: Playwright for critical user flows
- **Coverage**: 90%+ code coverage target
- **Integration**: API and database testing

## 🚀 Deployment

### Production Deployment

#### Hızlı Vercel + Convex Deploy

```bash
# Otomatik deployment scripti (önerilen)
npm run deploy:vercel
```

Bu script:
- ✅ Convex backend'i production'a deploy eder
- ✅ Security secrets oluşturur
- ✅ Vercel ortam değişkenlerini hazırlar
- ✅ Deploy için talimatlar verir

**Manuel Deploy:**

1. **Convex Backend Deploy:**
   ```bash
   npx convex deploy --prod
   ```
   Production URL'i not alın.

2. **Vercel Deploy:**
   ```bash
   vercel --prod
   ```

3. **Ortam Değişkenlerini Ayarlayın:**
   - `NEXT_PUBLIC_CONVEX_URL` - Convex production URL
   - `CSRF_SECRET` - 32+ karakter random secret
   - `SESSION_SECRET` - 32+ karakter random secret

**Detaylı Rehber:**
- 📖 **[Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)** - Adım adım deployment talimatları
- 📖 **[Complete Documentation](./docs/DOCUMENTATION.md)** - Tüm teknik detaylar

**Desteklenen Platformlar:**
- ✅ **Vercel** (önerilen - otomatik CI/CD)
- ✅ **Railway** (nixpacks.toml dahil)
- ✅ **Netlify**
- ✅ **Self-hosted** (Docker/standalone mode)

**Deployment Scriptleri:**
```bash
npm run deploy:vercel    # Otomatik Vercel + Convex deploy
npm run vercel:prod      # Production deploy
npm run vercel:preview   # Preview deploy
npm run convex:deploy    # Sadece Convex deploy
```

**Documentation:**
- [Kapsamlı Dokümantasyon](./docs/DOCUMENTATION.md) - Tüm teknik detaylar ve deployment rehberi

## 📚 Documentation

- **[Kapsamlı Dokümantasyon](./docs/DOCUMENTATION.md)**: Tüm teknik detaylar, API dokümantasyonu, veritabanı şeması ve daha fazlası
- **[Agent Guidelines](./docs/CLAUDE.md)**: AI agent davranış kuralları ve geliştirme rehberi
- **[KVKK/GDPR Uyumluluk](./docs/KVKK_GDPR_COMPLIANCE.md)**: Gizlilik ve veri güvenliği politikaları
- **[Next.js Optimizasyonları](./docs/NEXTJS_OPTIMIZATION.md)**: Performans optimizasyonları ve caching stratejileri
- **Database Schema**: See `convex/schema.ts`
- **Convex Backend**: See `convex/README.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Run linting and type checks
5. Commit with conventional commits format
6. Push and create a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

---

**Built with ❤️ for Turkish non-profit organizations**
