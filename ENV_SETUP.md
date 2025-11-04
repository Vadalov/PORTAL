# Environment Variables Setup Guide

## 📁 Dosya Yapısı

### Development (Local)
- **`.env.local`** - Development için (git'e commit edilmez)
- **`.env.example`** - Template dosya (git'e commit edilir)

### Production
- **`.env.production`** - Production için (git'e commit edilmez)
- **`.env.production.example`** - Template dosya (git'e commit edilir)

## 🔧 Development Environment (.env.local)

```env
# Backend Provider (convex kullan)
NEXT_PUBLIC_BACKEND_PROVIDER=convex

# Convex Development URL (npx convex dev ile otomatik oluşur)
CONVEX_DEPLOYMENT=dev:fleet-octopus-839
NEXT_PUBLIC_CONVEX_URL=https://fleet-octopus-839.convex.cloud

# Optional: Development için mock kullanmak isterseniz
# NEXT_PUBLIC_BACKEND_PROVIDER=mock
```

## 🚀 Production Environment (.env.production)

```env
# Backend Provider (her zaman convex olmalı)
NEXT_PUBLIC_BACKEND_PROVIDER=convex

# Convex Production URL
NEXT_PUBLIC_CONVEX_URL=https://exuberant-ant-264.convex.cloud

# Sentry Error Monitoring (Opsiyonel ama önerilir)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Security Secrets (ZORUNLU - Production için)
# Generate with: openssl rand -base64 32
CSRF_SECRET=your-generated-csrf-secret-32-chars-minimum
SESSION_SECRET=your-generated-session-secret-32-chars-minimum

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional: Email Configuration
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-password
# SMTP_FROM=noreply@yourdomain.com

# Optional: SMS Configuration (Twilio)
# TWILIO_ACCOUNT_SID=your-account-sid
# TWILIO_AUTH_TOKEN=your-auth-token
# TWILIO_PHONE_NUMBER=+905551234567

# Optional: Rate Limiting (defaults provided)
# RATE_LIMIT_MAX_REQUESTS=100
# RATE_LIMIT_WINDOW_MS=900000

# Optional: File Upload Limits
# MAX_FILE_SIZE=10485760
# MAX_FILES_PER_UPLOAD=5

# Optional: Feature Flags
# NEXT_PUBLIC_ENABLE_REALTIME=true
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## 📝 Adım Adım Kurulum

### 1. Development Setup

```bash
# .env.local dosyasını oluştur (zaten var)
# Convex dev'i başlat - URL otomatik eklenir
npx convex dev

# .env.local dosyası şöyle olacak:
# NEXT_PUBLIC_BACKEND_PROVIDER=convex
# CONVEX_DEPLOYMENT=dev:fleet-octopus-839
# NEXT_PUBLIC_CONVEX_URL=https://fleet-octopus-839.convex.cloud
```

### 2. Production Setup

```bash
# 1. .env.production.example'ı kopyala
cp .env.production.example .env.production

# 2. Gerekli değerleri doldur
# - NEXT_PUBLIC_CONVEX_URL: https://exuberant-ant-264.convex.cloud
# - CSRF_SECRET: openssl rand -base64 32
# - SESSION_SECRET: openssl rand -base64 32
# - Sentry DSN (opsiyonel)

# 3. Production secrets oluştur
openssl rand -base64 32  # CSRF_SECRET için
openssl rand -base64 32  # SESSION_SECRET için
```

## 🔐 Security Secrets Oluşturma

### OpenSSL ile:
```bash
openssl rand -base64 32
```

### Node.js ile:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## ✅ Doğrulama

### Development için:
```bash
# .env.local dosyasını kontrol et
cat .env.local

# Convex URL'in doğru olduğunu kontrol et
echo $NEXT_PUBLIC_CONVEX_URL
```

### Production için:
```bash
# Pre-deployment check script'i çalıştır
./scripts/pre-deploy-check.sh
```

## 📊 Mevcut Durum

### Development (.env.local)
- ✅ `NEXT_PUBLIC_BACKEND_PROVIDER=convex`
- ✅ `NEXT_PUBLIC_CONVEX_URL=https://fleet-octopus-839.convex.cloud`
- ✅ Convex dev deployment aktif

### Production
- ✅ Production URL: `https://exuberant-ant-264.convex.cloud`
- ⚠️ `.env.production` dosyası oluşturulmalı
- ⚠️ Security secrets generate edilmeli

## 🚨 Önemli Notlar

1. **`.env.local` ve `.env.production` git'e commit edilmez** (`.gitignore`'da)
2. **`.env.example` ve `.env.production.example` commit edilir** (template olarak)
3. **Production secrets'ları asla paylaşmayın**
4. **Her deployment platform'unda (Vercel, Railway, vb.) environment variables'ı manuel olarak ayarlayın**

## 🔄 Platform-Specific Setup

### Vercel
1. Project Settings > Environment Variables
2. Production, Preview, Development için ayrı ayrı ekle
3. `NEXT_PUBLIC_*` değişkenleri otomatik olarak client-side'da kullanılabilir

### Railway
1. Project > Variables
2. Environment variables ekle
3. Production deployment için otomatik kullanılır

### Netlify
1. Site Settings > Environment Variables
2. Production ve branch-specific değişkenler ekle

## 📚 Daha Fazla Bilgi

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detaylı deployment rehberi
- [docs/SECURITY.md](./docs/SECURITY.md) - Security configuration
- [docs/CONVEX_DEPLOYMENT.md](./docs/CONVEX_DEPLOYMENT.md) - Convex setup

