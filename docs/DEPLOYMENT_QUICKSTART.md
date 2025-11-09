# Vercel + Convex Deployment - Hızlı Başlangıç

Bu dosya, PORTAL projesini Vercel'e Convex backend ile birlikte deploy etmek için gereken tüm adımları özetler.

## 🚀 Hızlı Deploy (3 Adımda)

### 1. Otomatik Deploy Script'i Çalıştır

```bash
npm run deploy:vercel
```

Bu script:

- Convex production deployment yapar
- Security secrets oluşturur
- Vercel için gerekli ortam değişkenlerini hazırlar
- `.env.vercel` dosyasına kaydeder

### 2. Vercel'e GitHub Repository'yi Import Et

1. https://vercel.com/new adresine git
2. "Import Git Repository" seç
3. `Vadalov/PORTAL` repository'sini seç
4. "Import" butonuna tıkla

### 3. Ortam Değişkenlerini Ekle

`.env.vercel` dosyasındaki değişkenleri Vercel Dashboard → Settings → Environment Variables'a kopyala:

**Zorunlu Değişkenler:**

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
BACKEND_PROVIDER=convex
NEXT_PUBLIC_BACKEND_PROVIDER=convex
CSRF_SECRET=your-generated-secret
SESSION_SECRET=your-generated-secret
```

Sonra "Deploy" butonuna tıkla!

## 📋 Manuel Deploy Adımları

Eğer otomatik script kullanmak istemiyorsanız:

### Adım 1: Convex Deploy

```bash
# Convex CLI yükle (ilk kez)
npm install -g convex

# Login
npx convex login

# Production deploy
npx convex deploy --prod
```

Production URL'i not al (örn: `https://able-mantis-123.convex.cloud`)

### Adım 2: Security Secrets Oluştur

```bash
# CSRF Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret (farklı olmalı)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Adım 3: Vercel Deploy

```bash
# Vercel CLI yükle (ilk kez)
npm install -g vercel

# Production deploy
vercel --prod
```

Deploy sırasında veya sonra ortam değişkenlerini ekle.

## 🔧 Ortam Değişkenleri Detayları

### Zorunlu

| Değişken                       | Açıklama                          | Örnek                                  |
| ------------------------------ | --------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_CONVEX_URL`       | Convex production URL             | `https://able-mantis-123.convex.cloud` |
| `BACKEND_PROVIDER`             | Backend tipi (sabit)              | `convex`                               |
| `NEXT_PUBLIC_BACKEND_PROVIDER` | Public backend tipi               | `convex`                               |
| `CSRF_SECRET`                  | CSRF token için secret (32+ char) | `a1b2c3d4e5f6...`                      |
| `SESSION_SECRET`               | Session için secret (32+ char)    | `z9y8x7w6v5u4...`                      |

### Opsiyonel (İhtiyaca Göre)

```bash
# Uygulama
NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_REALTIME=true

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yoursite.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+905xxxxxxxxx

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXX
```

## ✅ Deploy Sonrası Kontrol

### 1. Health Check

```bash
curl https://your-project.vercel.app/api/health?detailed=true
```

Beklenen yanıt:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T12:00:00Z",
  "version": "1.0.0"
}
```

### 2. Login Test

1. `https://your-project.vercel.app/login` sayfasını aç
2. Giriş yapmayı dene
3. Console'da hata olmamalı

### 3. Convex Bağlantı Test

```bash
curl https://your-project.convex.cloud/_system/ping
```

## 🔄 CI/CD Otomasyonu

Deploy sonrası otomatik olarak:

- ✅ **main/master** branch'e push → Production deploy
- ✅ **develop** branch'e push → Preview deploy
- ✅ **Pull Request** → Preview deploy + comment

GitHub Actions workflows `.github/workflows/` klasöründe.

## 📊 GitHub Secrets Ayarları (CI/CD için)

GitHub Repository → Settings → Secrets and variables → Actions'a şunları ekle:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

Bu değerleri almak için:

```bash
vercel link
cat .vercel/project.json
```

## 🐛 Yaygın Sorunlar

### Build Hatası: "Failed to fetch fonts"

**Çözüm:** `next.config.ts`'de font optimization'ı kapat:

```typescript
const nextConfig = {
  optimizeFonts: false,
  // ...
};
```

### Convex Bağlantı Hatası

**Kontroller:**

1. ✅ `NEXT_PUBLIC_CONVEX_URL` doğru mu?
2. ✅ Convex production deploy yapıldı mı?
3. ✅ Convex dashboard'da schema var mı?

### CSRF Token Hatası

**Kontroller:**

1. ✅ `CSRF_SECRET` ayarlandı mı?
2. ✅ `SESSION_SECRET` ayarlandı mı?
3. ✅ Vercel'de secrets doğru mu?

Sonra redeploy yap: `vercel --prod`

## 📚 Detaylı Dokümantasyon

- **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Kapsamlı adım adım rehber
- **[Complete Documentation](./DOCUMENTATION.md)** - Tüm teknik detaylar
- **[Agent Guidelines](./CLAUDE.md)** - Geliştirme best practices

## 🆘 Destek

Sorun yaşıyorsanız:

1. **Dokümantasyon:** `docs/VERCEL_DEPLOYMENT.md` dosyasını inceleyin
2. **Logs:** Vercel Dashboard → Deployments → Logs
3. **GitHub Issues:** https://github.com/Vadalov/PORTAL/issues
4. **Convex Dashboard:** https://dashboard.convex.dev

---

**Son Güncelleme:** 9 Kasım 2025
**Versiyon:** 1.0.0
