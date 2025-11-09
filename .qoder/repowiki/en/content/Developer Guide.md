# Developer Guide

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md)
- [package.json](file://package.json)
- [eslint.config.mjs](file://eslint.config.mjs)
- [vitest.config.ts](file://vitest.config.ts)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md)
- [AGENTS.md](file://AGENTS.md)
- [scripts/start-dev.mjs](file://scripts/start-dev.mjs)
- [src/middleware.ts](file://src/middleware.ts)
- [tailwind.config.js](file://tailwind.config.js)
- [convex/auth.ts](file://convex/auth.ts)
- [src/lib/validations/aid-application.ts](file://src/lib/validations/aid-application.ts)
- [src/lib/validations/beneficiary.ts](file://src/lib/validations/beneficiary.ts)
- [src/lib/validations/kumbara.ts](file://src/lib/validations/kumbara.ts)
- [src/lib/validations/meeting.ts](file://src/lib/validations/meeting.ts)
- [src/lib/validations/meetingActionItem.ts](file://src/lib/validations/meetingActionItem.ts)
- [src/lib/validations/message.ts](file://src/lib/validations/message.ts)
- [src/lib/validations/task.ts](file://src/lib/validations/task.ts)
</cite>

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Development Commands](#development-commands)
3. [Coding Conventions and Linting](#coding-conventions-and-linting)
4. [Contribution Guidelines](#contribution-guidelines)
5. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
6. [Testing Best Practices](#testing-best-practices)
7. [Code Documentation Standards](#code-documentation-standards)

## Local Development Setup

To set up the PORTAL development environment locally, follow these step-by-step instructions:

1. **Clone the repository**

   ```bash
   git clone https://github.com/Vadalov/PORTAL.git
   cd PORTAL
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment configuration**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Convex URL and other required environment variables.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   This command runs the custom development script located in `scripts/start-dev.mjs`, which ensures port 3000 is available before launching the Next.js application.

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000` to view the application.

The project requires Node.js version 20.9.0 or higher and npm 9.0.0 or higher, as specified in the `engines` field of `package.json`.

**Section sources**

- [README.md](file://README.md#L9-L18)
- [package.json](file://package.json#L6-L9)
- [scripts/start-dev.mjs](file://scripts/start-dev.mjs)

## Development Commands

The PORTAL project provides a comprehensive set of npm scripts for various development tasks. These commands are defined in the `package.json` file under the `scripts` section.

### Application Lifecycle Commands

```bash
npm run dev        # Start development server
npm run build      # Build application for production
npm run start      # Start production server
```

### Code Quality and Validation

```bash
npm run lint             # Run ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # Perform TypeScript type checking
npm run format           # Format code using Prettier
npm run format:check     # Check formatting without making changes
```

### Testing Commands

```bash
npm run test             # Run unit tests in watch mode
npm run test:run         # Run unit tests once
npm run test:coverage    # Generate test coverage report
npm run e2e              # Run end-to-end tests with Playwright
```

### Deployment and Utility Commands

```bash
npm run deploy:vercel    # Deploy to Vercel with Convex backend
npm run validate:deploy  # Validate deployment configuration
npm run clean:all        # Clean all build artifacts and reinstall dependencies
npm run health:check     # Check application health status
```

These commands support the full development lifecycle from coding to deployment.

**Section sources**

- [package.json](file://package.json#L10-L39)
- [README.md](file://README.md#L111-L131)

## Coding Conventions and Linting

The PORTAL project enforces consistent coding standards through ESLint and Prettier configurations.

### ESLint Configuration

The project uses a custom ESLint configuration defined in `eslint.config.mjs`. Key rules include:

- **TypeScript strictness**: While `no-explicit-any` is set to "warn" during migration, it should be avoided
- **Variable declaration**: `prefer-const` and `no-var` rules enforce modern JavaScript practices
- **Console usage**: `no-console` is set to "warn" but allows `console.warn` and `console.error`
- **Unused variables**: Enforced with error level, ignoring variables prefixed with underscore

The configuration includes special rules for different file types:

- Test files have relaxed console and any usage rules
- Script files have more permissive rules for debugging purposes
- Convex backend files have specific rules enforced by the `@convex-dev/eslint-plugin`

### Prettier Integration

Prettier is configured to automatically format code on save. The formatting rules are applied to:

- TypeScript/JavaScript files
- JSON files
- Markdown files
- YAML configuration files

### Code Style Guidelines

- **Naming conventions**: camelCase for variables and functions, PascalCase for components and types
- **Imports**: Use path aliases (`@/components`, `@/lib`, `@/types`, `@/convex`)
- **Component architecture**: Use 'use client' directive for React components
- **Security practices**: Never use `console.log`; use the logger from `@/lib/logger` instead
- **Turkish localization**: All UI text should be in Turkish with appropriate formatting (₺ currency, DD.MM.YYYY dates, +90 phone format)

Git hooks via Husky automatically run linting and type checking before commits to ensure code quality.

**Section sources**

- [eslint.config.mjs](file://eslint.config.mjs#L1-L105)
- [package.json](file://package.json#L41-L49)
- [AGENTS.md](file://AGENTS.md#L32-L43)

## Contribution Guidelines

To contribute to the PORTAL project, follow these guidelines for code reviews, branching strategy, and pull request workflow.

### Branching Strategy

The project follows a Git branching model with the following conventions:

- `main` or `master` branch: Production-ready code
- `develop` branch: Integration branch for features
- Feature branches: Created from `develop` with descriptive names

### Pull Request Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Implement your changes following coding conventions
4. Run all validation commands:
   ```bash
   npm run typecheck
   npm run lint
   npm run test:run
   ```
5. Commit with conventional commit format
6. Push your branch and create a pull request

### Code Review Requirements

All pull requests must pass the following checks:

- TypeScript type checking with zero errors
- ESLint validation with zero errors
- Unit tests passing (146+ tests expected)
- Appropriate test coverage for new functionality
- Adherence to coding conventions and style guidelines

Pre-commit hooks automatically enforce these requirements using Husky.

### Convex Backend Development

When working with Convex functions:

- Use object syntax with handler property (enforced by `@convex-dev/no-old-registered-function-syntax`)
- Include argument validators (enforced by `@convex-dev/require-args-validator`)
- Do not import from Node runtime files (enforced by `@convex-dev/import-wrong-runtime`)
- Use the generated API from `@/convex/_generated/api` to call functions

**Section sources**

- [AGENTS.md](file://AGENTS.md#L232-L240)
- [AGENTS.md](file://AGENTS.md#L53-L59)
- [eslint.config.mjs](file://eslint.config.mjs#L70-L89)

## Debugging and Troubleshooting

This section provides debugging tips and tools for troubleshooting common issues in the PORTAL application.

### Development Server Issues

If the development server fails to start:

1. Check that port 3000 is not already in use
2. Verify Node.js version meets requirements (>=20.9.0)
3. Ensure all dependencies are installed with `npm install`
4. Clear cache with `npm run clean:all` if issues persist

The `start-dev.mjs` script automatically kills any process using port 3000 before starting the server.

### Environment Configuration Problems

Common issues related to environment variables:

- Ensure `.env.local` file exists and contains all required variables
- Verify `NEXT_PUBLIC_CONVEX_URL` points to a valid Convex deployment
- Check that `CSRF_SECRET` and `SESSION_SECRET` are 32+ characters long
- Confirm all environment variables are properly loaded in the application

### Convex Integration Debugging

For Convex-related issues:

1. Verify Convex CLI is installed: `npm install -g convex`
2. Check authentication: `npx convex login`
3. Test Convex connection: `curl https://your-project.convex.cloud/_system/ping`
4. Validate schema exists in Convex dashboard

### Common Error Scenarios

**CSRF Token Errors:**

- Ensure `CSRF_SECRET` and `SESSION_SECRET` are set in environment variables
- Verify secrets are different from each other
- Check Vercel environment variables if deployed

**Build Failures:**

- Disable font optimization in `next.config.ts` if encountering "Failed to fetch fonts" error
- Clear build cache with `npm run clean:all`
- Check for TypeScript type errors before building

**Authentication Issues:**

- Verify middleware configuration in `src/middleware.ts`
- Check auth implementation in `convex/auth.ts`
- Ensure proper session management and cookie settings

**Section sources**

- [scripts/start-dev.mjs](file://scripts/start-dev.mjs)
- [src/middleware.ts](file://src/middleware.ts)
- [convex/auth.ts](file://convex/auth.ts)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L174-L201)

## Testing Best Practices

The PORTAL project employs a comprehensive testing strategy using Vitest for unit tests and Playwright for end-to-end tests.

### Unit Testing with Vitest

The unit test configuration is defined in `vitest.config.ts` with the following key settings:

- Test environment: jsdom for browser-like environment
- Setup files: `src/__tests__/setup.ts` for global test configuration
- Global variables: Enabled for easier testing
- CSS support: Enabled for component testing
- Test file patterns: Includes `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`

Test files are organized in the `src/__tests__` directory, mirroring the source structure. The project currently has 146+ unit tests with a target of 90%+ code coverage.

### End-to-End Testing with Playwright

E2E tests are located in the `e2e/` directory and cover critical user flows:

- Authentication (`auth.spec.ts`)
- Donation processing (`donations.spec.ts`)
- Notification system (`notifications.spec.ts`)
- Settings management (`settings.spec.ts`)

### Validation Schema Testing

The project includes comprehensive validation schemas using Zod, with corresponding tests for:

- Aid applications (`src/lib/validations/aid-application.ts`)
- Beneficiaries (`src/lib/validations/beneficiary.ts`)
- Kumbara (piggy bank) functionality (`src/lib/validations/kumbara.ts`)
- Meeting management (`src/lib/validations/meeting.ts`)
- Meeting action items (`src/lib/validations/meetingActionItem.ts`)
- Messaging system (`src/lib/validations/message.ts`)
- Task management (`src/lib/validations/task.ts`)

### Testing Commands

```bash
npm run test             # Run tests in watch mode (development)
npm run test:run         # Run tests once (CI/PR validation)
npm run test:coverage    # Generate coverage report
npm run test:ui          # Run Vitest UI for interactive testing
npm run e2e              # Run all end-to-end tests
npm run e2e:ui           # Run Playwright Test UI
```

The test setup includes mocks for Convex API and server handlers to enable isolated unit testing without requiring a live backend connection.

**Section sources**

- [vitest.config.ts](file://vitest.config.ts#L1-L45)
- [AGENTS.md](file://AGENTS.md#L22-L23)
- [src/lib/validations/aid-application.ts](file://src/lib/validations/aid-application.ts)
- [src/lib/validations/beneficiary.ts](file://src/lib/validations/beneficiary.ts)
- [src/lib/validations/kumbara.ts](file://src/lib/validations/kumbara.ts)
- [src/lib/validations/meeting.ts](file://src/lib/validations/meeting.ts)
- [src/lib/validations/meetingActionItem.ts](file://src/lib/validations/meetingActionItem.ts)
- [src/lib/validations/message.ts](file://src/lib/validations/message.ts)
- [src/lib/validations/task.ts](file://src/lib/validations/task.ts)

## Code Documentation Standards

The PORTAL project follows consistent documentation practices to ensure code maintainability and developer onboarding.

### Inline Code Comments

- Use clear, concise comments to explain complex logic
- Document non-obvious decisions and edge cases
- Include TODO comments for known improvements
- Add FIXME comments for known issues that need resolution

### Component Documentation

React components should include JSDoc comments that describe:

- Purpose and functionality
- Props and their types
- Expected behavior and side effects
- Usage examples when applicable

### API and Function Documentation

Convex functions in the `convex/` directory should be documented with:

- Function purpose and use cases
- Parameter descriptions and validation requirements
- Return value specifications
- Error conditions and handling

### Architecture Documentation

The project maintains high-level documentation in markdown files:

- `README.md`: Project overview, quick start, and basic usage
- `DEPLOYMENT_QUICKSTART.md`: Step-by-step deployment instructions
- `AGENTS.md`: Developer guide with architecture overview and conventions
- Comprehensive documentation in the `docs/` directory

### Type Documentation

TypeScript types in the `src/types/` directory should be well-documented:

- Interface and type definitions should include descriptions
- Enum values should have clear documentation
- Complex types should include usage examples

Following these documentation standards ensures that both new developers and experienced contributors can effectively understand and work with the codebase.

**Section sources**

- [README.md](file://README.md)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md)
- [AGENTS.md](file://AGENTS.md)
- [src/types/](file://src/types/)
