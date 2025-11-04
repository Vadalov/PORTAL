# PORTAL - Turkish Non-Profit Association Management System

**PORTAL** is a comprehensive Turkish non-profit association management system (Dernek Yönetim Sistemi) built with Next.js 16, TypeScript, and Convex backend.

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## 🏗️ Architecture

- **Frontend**: Next.js 16 with TypeScript
- **Backend**: Convex (Real-time database & API)
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation

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

For detailed production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick Start:**
1. Set up environment variables (see `.env.production.example`)
2. Deploy Convex backend: `npx convex deploy --prod`
3. Run pre-deployment checks: `./scripts/pre-deploy-check.sh`
4. Build and deploy to your platform
5. Run post-deployment verification: `./scripts/post-deploy-check.sh https://your-domain.com`

**Supported Platforms:**
- **Vercel** (recommended for Next.js)
- **Railway** (nixpacks.toml included)
- **Netlify**
- **Self-hosted** (Docker/standalone mode)

**Documentation:**
- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Convex Deployment](./docs/CONVEX_DEPLOYMENT.md) - Backend deployment guide
- [Security Guide](./docs/SECURITY.md) - Security configuration
- [Runbook](./docs/RUNBOOK.md) - Troubleshooting and operations

## 📚 Documentation

- **API Documentation**: Available at `/api/docs`
- **Component Storybook**: Run `npm run storybook`
- **Database Schema**: See `convex/schema.ts`

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
