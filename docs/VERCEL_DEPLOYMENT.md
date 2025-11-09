# Vercel + Convex Deployment Rehberi

Bu rehber, PORTAL projesini Vercel'e Convex backend ile birlikte deploy etme sürecini açıklar.

## Ön Gereksinimler

- Vercel hesabı (https://vercel.com)
- Convex hesabı (https://convex.dev)
- GitHub repository'si (projeniz GitHub'da olmalı)
- Node.js 20+ yüklü

## Adım 1: Convex Backend Deploy

### 1.1 Convex CLI Kurulumu

```bash
npm install -g convex
```

### 1.2 Convex'e Giriş

```bash
npx convex login
```

Tarayıcınızda açılan sayfada Convex hesabınıza giriş yapın.

### 1.3 Convex Production Deploy

```bash
# Production ortamına deploy
npx convex deploy --prod

# Deploy tamamlandığında production URL'i göreceksiniz:
# ✓ Deployment complete!
# ✓ https://your-project.convex.cloud
```

**ÖNEMLİ:** Bu URL'i not alın! Vercel ortam değişkenlerinde kullanacaksınız.

### 1.4 Convex Dashboard Kontrolü

https://dashboard.convex.dev adresinden:
- Deployment'ın başarılı olduğunu kontrol edin
- Production URL'i doğrulayın
- Schema'nın doğru yüklendiğini kontrol edin

## Adım 2: Vercel Deploy

### 2.1 Vercel CLI Kurulumu (Opsiyonel)

```bash
npm i -g vercel
```

### 2.2 GitHub ile Vercel Bağlantısı

1. https://vercel.com/new adresine gidin
2. "Import Git Repository" seçin
3. GitHub repository'nizi seçin (Vadalov/PORTAL)
4. "Import" butonuna tıklayın

### 2.3 Proje Ayarları

Vercel proje ayarları ekranında:

**Framework Preset:** Next.js (otomatik seçilecek)
**Root Directory:** `./` (varsayılan)
**Build Command:** `npm run build` (varsayılan)
**Output Directory:** `.next` (varsayılan)

### 2.4 Environment Variables (Ortam Değişkenleri)

Aşağıdaki ortam değişkenlerini ekleyin:

#### Zorunlu Değişkenler

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
BACKEND_PROVIDER=convex
NEXT_PUBLIC_BACKEND_PROVIDER=convex

# Security Secrets (32+ karakter random değerler)
CSRF_SECRET=your-32-character-random-secret-here-csrf
SESSION_SECRET=your-32-character-random-secret-here-session
```

**Random Secret Oluşturma:**
```bash
# Terminal'de çalıştırın:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Bu komutu 2 kez çalıştırıp CSRF_SECRET ve SESSION_SECRET için kullanın.

#### Opsiyonel Değişkenler

```bash
# Uygulama Ayarları
NEXT_PUBLIC_APP_NAME=Dernek Yönetim Sistemi
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yoursite.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+905xxxxxxxxx

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 2.5 Deploy

"Deploy" butonuna tıklayın. Build süreci başlayacak (3-5 dakika).

## Adım 3: Deploy Sonrası Kontrol

### 3.1 Health Check

Deploy tamamlandığında:

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

### 3.2 Convex Bağlantısı Kontrolü

1. Vercel URL'inizi tarayıcıda açın
2. `/login` sayfasına gidin
3. Console'da Convex bağlantı hatası olmamalı

### 3.3 Sentry Hata İzleme (Opsiyonel)

Eğer Sentry kullanıyorsanız:

```bash
# Vercel'e Sentry token'ları ekleyin
SENTRY_AUTH_TOKEN=your-sentry-token
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Adım 4: CI/CD Otomasyonu

### 4.1 GitHub Actions ile Otomatik Deploy

Vercel, GitHub'a her push edildiğinde otomatik deploy yapar:

- **main/master branch:** Production deploy
- **develop branch:** Preview deploy
- **Pull requests:** Preview deploy

### 4.2 Branch Koruma Kuralları

GitHub repository ayarlarından:

1. Settings → Branches
2. "Add rule" → Branch name pattern: `main`
3. Şunları aktif edin:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ CI (GitHub Actions)
   - ✅ Vercel (preview)

## Adım 5: Domain Ayarları (Opsiyonel)

### 5.1 Özel Domain Ekleme

Vercel Dashboard'da:

1. Project Settings → Domains
2. "Add Domain" → `yoursite.com` girin
3. DNS ayarlarını konfigüre edin (A veya CNAME record)

### 5.2 SSL Sertifikası

Vercel otomatik olarak Let's Encrypt SSL sertifikası sağlar (ücretsiz).

## Sorun Giderme

### Build Hatası: "Failed to fetch fonts from Google"

**Çözüm:** Local fonts kullanın veya `next.config.ts`'de font optimization'ı devre dışı bırakın:

```typescript
// next.config.ts
const nextConfig = {
  optimizeFonts: false, // Google Fonts sorunları için
  // ...
};
```

### Convex Bağlantı Hatası

**Kontrol Edin:**
1. `NEXT_PUBLIC_CONVEX_URL` doğru mu?
2. Convex production deploy yapıldı mı?
3. Convex dashboard'da schema yüklü mü?

**Test:**
```bash
curl https://your-project.convex.cloud/_system/ping
```

### CSRF Token Hatası

**Çözüm:**
- `CSRF_SECRET` ve `SESSION_SECRET` ortam değişkenlerini kontrol edin
- Vercel'de secrets ayarlandığından emin olun
- Redeploy yapın

### Rate Limiting Sorunları

Vercel ücretsiz plan limitleri:
- **Execution time:** 10 saniye max
- **Bandwidth:** 100 GB/ay
- **Builds:** 100 build/gün

**Çözüm:** Pro plana geçin veya execution time'ı optimize edin.

## Performans Optimizasyonu

### Edge Network Kullanımı

Vercel otomatik olarak CDN kullanır. Static dosyalar edge'de cache'lenir.

### Veritabanı Query Optimizasyonu

Convex queries'leri index kullanarak optimize edin:

```typescript
// ❌ Yavaş
const users = await ctx.db.query('users').collect();

// ✅ Hızlı
const users = await ctx.db
  .query('users')
  .withIndex('by_role', (q) => q.eq('role', 'ADMIN'))
  .collect();
```

### Image Optimization

Next.js Image component kullanın (otomatik WebP/AVIF):

```tsx
import Image from 'next/image';

<Image
  src="/photo.jpg"
  width={500}
  height={300}
  alt="Açıklama"
  priority // Above the fold için
/>
```

## Monitoring & Analytics

### 1. Vercel Analytics

Vercel Dashboard → Analytics → Enable

### 2. Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```tsx
// src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. Convex Dashboard Monitoring

https://dashboard.convex.dev → Performance metrics

## Güvenlik Best Practices

1. **Environment Secrets:** Asla commit etmeyin
2. **CORS:** `next.config.ts`'de doğru origin ayarlayın
3. **Rate Limiting:** API route'larında rate limit kullanın
4. **CSRF Protection:** Tüm mutations için CSRF token
5. **TC Kimlik Security:** Hash ve masking kullanın

## Backup & Disaster Recovery

### Convex Backup

Convex otomatik backup yapar. Export için:

```bash
npx convex export
```

### Database Rollback

Convex Dashboard → Deployments → Rollback to previous version

## Maliyet Tahmini

### Vercel Ücretsiz Plan
- 100 GB bandwidth
- 100 serverless function executions/gün
- HTTPS + CDN dahil
- **Ücret:** $0/ay

### Vercel Pro Plan
- 1 TB bandwidth
- Unlimited builds
- Team collaboration
- **Ücret:** $20/ay/kullanıcı

### Convex Pricing
- **Free:** 1 GB storage, 1 GB egress
- **Starter:** $25/ay (10 GB storage)
- **Pro:** Custom pricing

## Destek & Kaynaklar

- **Vercel Docs:** https://vercel.com/docs
- **Convex Docs:** https://docs.convex.dev
- **Next.js Docs:** https://nextjs.org/docs
- **GitHub Issues:** https://github.com/Vadalov/PORTAL/issues

---

**Son Güncelleme:** 9 Kasım 2025
**Versiyon:** 1.0.0
