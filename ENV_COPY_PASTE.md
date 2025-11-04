# 🚀 Environment Dosyaları - Kopyala Yapıştır

## 📋 Development (.env.local)

```env
NEXT_PUBLIC_BACKEND_PROVIDER=convex

# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=dev:fleet-octopus-839 # team: isa-a2570, project: portal-a60b4

NEXT_PUBLIC_CONVEX_URL=https://fleet-octopus-839.convex.cloud
```

---

## 🚀 Production (.env.production)

```env
# Production Environment Variables
# NEVER commit this file to git

# Backend Provider
NEXT_PUBLIC_BACKEND_PROVIDER=convex

# Convex Production URL
NEXT_PUBLIC_CONVEX_URL=https://exuberant-ant-264.convex.cloud

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
NEXT_PUBLIC_APP_VERSION=1.0.0

# Security Secrets (Generated - Production için)
CSRF_SECRET=UE3v0ApopumrnlmNUR5VjiVAhh0zv30IFRIDsUcAAWY=
SESSION_SECRET=dAFh1LzOfv1UnfyvEdvBsO0SSynSOV7D7fYicmm9sUw=

# Sentry Configuration (Opsiyonel - Eğer Sentry kullanıyorsanız ekleyin)
# NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
# SENTRY_ORG=your-sentry-org
# SENTRY_PROJECT=your-sentry-project

# Optional: Email Configuration (Eğer email göndermek istiyorsanız)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-password
# SMTP_FROM=noreply@yourdomain.com

# Optional: SMS Configuration (Eğer SMS göndermek istiyorsanız - Twilio)
# TWILIO_ACCOUNT_SID=your-account-sid
# TWILIO_AUTH_TOKEN=your-auth-token
# TWILIO_PHONE_NUMBER=+905551234567

# Optional: Rate Limiting (Varsayılan değerler kullanılır)
# RATE_LIMIT_MAX_REQUESTS=100
# RATE_LIMIT_WINDOW_MS=900000

# Optional: File Upload Limits (Varsayılan değerler kullanılır)
# MAX_FILE_SIZE=10485760
# MAX_FILES_PER_UPLOAD=5

# Optional: Feature Flags
# NEXT_PUBLIC_ENABLE_REALTIME=true
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

---

## 🌐 Deployment Platform'ları İçin (Vercel, Railway, Netlify, vb.)

Deployment platform'unuzun dashboard'unda şu environment variables'ları ekleyin:

### Zorunlu Değişkenler:

```env
NEXT_PUBLIC_BACKEND_PROVIDER=convex
NEXT_PUBLIC_CONVEX_URL=https://exuberant-ant-264.convex.cloud
NODE_ENV=production
CSRF_SECRET=UE3v0ApopumrnlmNUR5VjiVAhh0zv30IFRIDsUcAAWY=
SESSION_SECRET=dAFh1LzOfv1UnfyvEdvBsO0SSynSOV7D7fYicmm9sUw=
```

### Opsiyonel Değişkenler (Sentry kullanıyorsanız):

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
```

---

## ✅ Hızlı Kurulum Komutları

### Development için:
```bash
# .env.local dosyasını oluştur
cat > .env.local << 'EOF'
NEXT_PUBLIC_BACKEND_PROVIDER=convex
CONVEX_DEPLOYMENT=dev:fleet-octopus-839
NEXT_PUBLIC_CONVEX_URL=https://fleet-octopus-839.convex.cloud
EOF
```

### Production için:
```bash
# .env.production dosyasını oluştur
cat > .env.production << 'EOF'
NEXT_PUBLIC_BACKEND_PROVIDER=convex
NEXT_PUBLIC_CONVEX_URL=https://exuberant-ant-264.convex.cloud
NODE_ENV=production
CSRF_SECRET=UE3v0ApopumrnlmNUR5VjiVAhh0zv30IFRIDsUcAAWY=
SESSION_SECRET=dAFh1LzOfv1UnfyvEdvBsO0SSynSOV7D7fYicmm9sUw=
EOF
```

---

## 📝 Notlar

1. ✅ **Development**: `.env.local` dosyası hazır ve çalışıyor
2. ✅ **Production**: `.env.production` dosyası hazır, secrets generate edildi
3. ✅ **Convex URLs**: Development ve Production URL'leri ayarlandı
4. ⚠️ **Git**: `.env.local` ve `.env.production` git'e commit edilmez (güvenlik için)
5. 🔐 **Secrets**: Production secrets'ları asla paylaşmayın

---

**Son Güncelleme**: 2025-01-XX

