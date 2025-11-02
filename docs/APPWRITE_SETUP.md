# Appwrite Backend Setup Guide

Bu belge, Appwrite backend'ini kurmak ve test etmek için gerekli adımları açıklar.

## 1. Environment Variables

`.env.local` dosyasında Appwrite konfigürasyonu zaten yapılmıştır:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://selam-appwrite-8154f2-38-242-208-4.traefik.me/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68fee9220016ba9acb1b
APPWRITE_API_KEY=standard_15c951817a62a9bed5e62ee9fd23e9cd3e063f2a62638aa07f9ca7df31172742bf56949444d6ce1b1fb7ce73d2db7e3227e65ba0141faed6534f8329aec21e776e2eceb40dc6f1aeeb44a4e8244d3faf9c59149e756ad55f76775fb735210c8eaca92916103a741e6f161a87efc8857b06c8fe29ae40dd401e09781913d298c1
```

## 1.1: Validating Configuration

To ensure your Appwrite configuration is correct, use the validation script:

```bash
npm run validate:config
```

This script checks:

- Required environment variables are present
- Appwrite endpoint URL format is valid (must end with /v1)
- Project ID format (alphanumeric)
- API key format and length

Example successful output:

```
🔍 Validating Appwrite Configuration...
✅ NEXT_PUBLIC_APPWRITE_ENDPOINT: Valid URL format
✅ NEXT_PUBLIC_APPWRITE_PROJECT_ID: Valid project ID format
✅ APPWRITE_API_KEY: Valid API key format
🎉 All validations passed!
```

Example with errors:

```
🔍 Validating Appwrite Configuration...
❌ NEXT_PUBLIC_APPWRITE_ENDPOINT: Invalid URL format - must end with /v1
❌ APPWRITE_API_KEY: Missing required variable
💡 Suggestions:
   - Check your .env.local file
   - Ensure endpoint URL ends with /v1
```

Common validation errors:

- **Invalid endpoint**: Ensure URL ends with `/v1`
- **Missing API key**: Generate API key in Appwrite console
- **Invalid project ID**: Check project ID in Appwrite dashboard

## 2. Collections Setup

Database ve collections zaten oluşturulmuştur:

```bash
npx tsx scripts/setup-appwrite.ts
```

## 2.1: Testing Connectivity

After setting up collections, test your Appwrite connectivity:

```bash
npm run test:connectivity
```

This script tests:

- Endpoint reachability
- Account service connectivity
- Database service access
- Storage service access

Example successful output:

```
🔌 Testing Appwrite Connectivity...
✅ Endpoint Service (125ms)
✅ Account Service (89ms)
✅ Database Service (156ms)
✅ Storage Service (94ms)
📊 Connectivity Test Results
Overall Health: 100%
Tests: 4/4 passed
```

Example with failures:

```
🔌 Testing Appwrite Connectivity...
❌ Endpoint Service: Connection timeout
❌ Account Service: DNS resolution failed
📊 Connectivity Test Results
Overall Health: 0%
Tests: 0/4 passed
💡 Recommendations:
   • Check network connectivity
   • Verify Appwrite server is running
   • Check firewall settings
```

Troubleshooting connectivity issues:

- **Connection timeout**: Check if Appwrite server is running and accessible
- **DNS resolution failed**: Verify endpoint URL is correct
- **401 Unauthorized**: Check API key permissions
- **CORS errors**: Add your domain to Appwrite console

## 3. Test Users Creation

### Appwrite Console'dan Manuel Olarak:

1. Appwrite Console'u açın: http://selam-appwrite-8154f2-38-242-208-4.traefik.me/
2. **Auth** → **Users** seçin
3. **New User** butonuna tıklayın
4. Her user için şu bilgileri girin:

#### Admin User

- **Email:** admin@test.com
- **Password:** admin123
- **Name:** Admin User
- **Labels:** admin

#### Manager User

- **Email:** manager@test.com
- **Password:** manager123
- **Name:** Manager User
- **Labels:** manager

#### Member User

- **Email:** member@test.com
- **Password:** member123
- **Name:** Member User
- **Labels:** member

#### Viewer User

- **Email:** viewer@test.com
- **Password:** viewer123
- **Name:** Viewer User
- **Labels:** viewer

## 4. Application Config

### Development Mode (Mock Backend)

Mock backend'i kullanmak için `src/app/api/auth/login/route.ts` dosyasında:

```typescript
const USE_MOCK_AUTH = true; // Mock authentication'ı etkinleştir
```

### Production Mode (Appwrite Backend)

Gerçek Appwrite backend'ini kullanmak için:

```typescript
const USE_MOCK_AUTH = false; // Mock authentication'ı devre dışı bırak
```

## 5. Login Testing

Login sayfasına gidin: http://localhost:3000/login

Aşağıdaki kimlik bilgileriyle test edin:

- admin@test.com / admin123
- manager@test.com / manager123
- member@test.com / member123
- viewer@test.com / viewer123

## 6. Troubleshooting

### Configuration Issues

If you encounter configuration problems, run comprehensive diagnostics:

```bash
npm run diagnose
```

This provides a complete health check of your Appwrite setup, including configuration validation, connectivity tests, and recommendations.

### Mock Backend Issues

When using mock backend (`BACKEND_PROVIDER=mock`), test the mock API:

```bash
npm run test:mock-api
```

This validates that mock data matches Appwrite schema and tests API functionality.

### SDK Usage Issues

If you see SDK guard warnings like "Client SDK used in server context", it means you're importing the wrong SDK:

- Use `@/lib/appwrite/client` in client components (React components)
- Use `@/lib/appwrite/server` in API routes and server components

The SDK guard will log warnings to help you identify and fix these issues.

### SDK Version Uyarısı

```
Warning: The current SDK is built for Appwrite 1.8.0. However, the current Appwrite server version is 1.6.1.
```

Bu uyarı görmezden gelebilirsiniz. SDK compatibility issues yoktur.

### Session Ayarları

Session timeout: **24 hours** (src/app/api/auth/login/route.ts)

```typescript
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours
```

### CORS Configuration

Eğer CORS hatası alırsanız, Appwrite Settings'de "Web API" domainini kontrol edin.

## 7. Collections Referans

| Collection           | Açıklama             | Ana Alanlar                           |
| -------------------- | -------------------- | ------------------------------------- |
| **users**            | Sistem kullanıcıları | name, email, role, isActive, labels   |
| **beneficiaries**    | İhtiyaç sahipleri    | firstName, lastName, category, status |
| **donations**        | Bağışlar             | donor_name, amount, status            |
| **tasks**            | İşler/Görevler       | title, status, assigned_to            |
| **meetings**         | Toplantılar          | title, meeting_date, organizer        |
| **messages**         | Mesajlar             | subject, message_type, sender         |
| **aid_applications** | Yardım başvuruları   | applicant_name, stage, status         |
| **parameters**       | Sistem parametreleri | category, name_tr, value              |

## 8. Storage Buckets

| Bucket        | Açıklama    | Max Size |
| ------------- | ----------- | -------- |
| **documents** | Belgeler    | 100 MB   |
| **receipts**  | Makbuzlar   | 100 MB   |
| **photos**    | Fotoğraflar | 100 MB   |
| **reports**   | Raporlar    | 100 MB   |

Allowed file types: jpg, jpeg, png, pdf, doc, docx, xls, xlsx, txt

## 9. API Routes

### Auth Endpoints

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Kullanıcı çıkışı (TBD)
- `GET /api/csrf` - CSRF token alma

### CSRF Protection

Tüm POST istekleri CSRF token gerektirir:

```typescript
// Client side
const csrfResponse = await fetch('/api/csrf');
const csrfData = await csrfResponse.json();

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'x-csrf-token': csrfData.token,
  },
  body: JSON.stringify({ email, password }),
});
```

## 10. Next Steps

1. ✅ Backend setup (Appwrite collections & storage)
2. ✅ Test users creation
3. 🔄 Mock API → Real API migration
4. 🔄 Middleware updates
5. 🔄 Full E2E testing

## 11. Useful Commands

```bash
# Setup Appwrite backend
npx tsx scripts/setup-appwrite.ts

# Create test users (if script works)
npx tsx scripts/create-test-users.ts

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

# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

## Diagnostic Tools

This project includes comprehensive diagnostic tools to help you troubleshoot Appwrite configuration and connectivity issues:

### Configuration Validation (`npm run validate:config`)

- **When to use**: After setting up environment variables or when encountering configuration errors
- **What it checks**: Environment variable presence, format validation (URLs, UUIDs, API keys)
- **How to interpret**:
  - ✅ Green checks: All validations passed
  - ❌ Red errors: Critical issues that prevent Appwrite from working
  - ⚠️ Yellow warnings: Non-critical issues or best practices
- **Common solutions**:
  - Missing variables: Copy from `.env.example` to `.env.local`
  - Invalid URL: Ensure endpoint ends with `/v1`
  - Invalid API key: Regenerate in Appwrite console

### Connectivity Testing (`npm run test:connectivity`)

- **When to use**: After initial setup or when API calls fail
- **What it tests**: Network connectivity to Appwrite services (endpoint, account, database, storage)
- **How to interpret**:
  - Timing information shows response speed
  - Failed tests indicate specific service issues
  - Overall health score provides quick assessment
- **Common solutions**:
  - Connection timeout: Check Appwrite server status
  - DNS failures: Verify endpoint URL
  - 401 errors: Check API key permissions

### Mock API Testing (`npm run test:mock-api`)

- **When to use**: When using mock backend or developing offline
- **What it tests**: Schema compliance and functional API behavior
- **How to interpret**:
  - Schema validation: Ensures mock data matches real Appwrite collections
  - Functional tests: Verifies CRUD operations work correctly
- **Common solutions**:
  - Schema mismatches: Update mock data to match collection schemas
  - Test failures: Fix mock API implementation

### Comprehensive Diagnostics (`npm run diagnose`)

- **When to use**: First step when encountering any Appwrite-related issues
- **What it covers**: All of the above plus health checks and SDK usage validation
- **How to interpret**:
  - Overall health score (0-100)
  - Prioritized list of issues and recommendations
  - Quick fix commands
- **Common solutions**: Follow the prioritized recommendations in the report

### Health Endpoint (`npm run health:check`)

- **When to use**: For automated monitoring or quick status checks
- **What it provides**: Real-time health status with detailed diagnostics
- **How to interpret**: JSON response with validation, connectivity, and config status

## 12. Documentation Links

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite SDK Reference](https://appwrite.io/docs/sdks)
- [Next.js 16 Guide](https://nextjs.org/docs)
- [Configuration Troubleshooting Guide](docs/CONFIGURATION-TROUBLESHOOTING.md)
- [Validation Utility Documentation](src/lib/appwrite/validation.ts)
