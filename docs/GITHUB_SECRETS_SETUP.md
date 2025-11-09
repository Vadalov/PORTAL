# 🔐 GitHub Secrets Kurulum Rehberi

## Vercel Credentials Bilgileri

Aşağıdaki bilgileri GitHub repository secrets'a eklemeniz gerekiyor:

```
VERCEL_TOKEN=O8kt0pyb6w7tyeJPSra7V1eZ
VERCEL_PROJECT_ID=prj_RbJu4morCkUWtBy1lCzmR8IjXmuY
VERCEL_ORG_ID=GEgdQAxD3RqU4MBVBloio1lm
```

## 📋 Adım Adım GitHub Secrets Ekleme

### 1. GitHub Repository Settings'e Git

🔗 Direkt link: https://github.com/Vadalov/PORTAL/settings/secrets/actions

veya:

1. https://github.com/Vadalov/PORTAL adresine git
2. **Settings** sekmesine tıkla
3. Sol menüden **Secrets and variables** → **Actions** seç

### 2. Secret Ekle - VERCEL_TOKEN

1. **"New repository secret"** butonuna tıkla
2. **Name** alanına: `VERCEL_TOKEN`
3. **Secret** alanına: `O8kt0pyb6w7tyeJPSra7V1eZ`
4. **"Add secret"** butonuna tıkla

### 3. Secret Ekle - VERCEL_PROJECT_ID

1. **"New repository secret"** butonuna tıkla
2. **Name** alanına: `VERCEL_PROJECT_ID`
3. **Secret** alanına: `prj_RbJu4morCkUWtBy1lCzmR8IjXmuY`
4. **"Add secret"** butonuna tıkla

### 4. Secret Ekle - VERCEL_ORG_ID

1. **"New repository secret"** butonuna tıkla
2. **Name** alanına: `VERCEL_ORG_ID`
3. **Secret** alanına: `GEgdQAxD3RqU4MBVBloio1lm`
4. **"Add secret"** butonuna tıkla

## ✅ Doğrulama

Secrets başarıyla eklendikten sonra şunları göreceksiniz:

```
Repository secrets
├─ VERCEL_TOKEN           Updated X seconds ago
├─ VERCEL_PROJECT_ID      Updated X seconds ago
└─ VERCEL_ORG_ID          Updated X seconds ago
```

## 🚀 GitHub Actions Aktif Olacak

Secrets eklendikten sonra:

### Otomatik Production Deploy

```bash
git add .
git commit -m "feat: vercel deployment setup"
git push origin main
```

→ `.github/workflows/vercel-production.yml` otomatik çalışacak

### Otomatik Preview Deploy (PR'larda)

```bash
git checkout -b feature/test
git push origin feature/test
# GitHub'da PR aç
```

→ `.github/workflows/vercel-preview.yml` otomatik çalışacak

## 🔍 GitHub Actions'ı İzle

Deploy durumunu görmek için:

1. https://github.com/Vadalov/PORTAL/actions
2. Son workflow run'ı seç
3. Log'ları kontrol et

## ⚠️ Önemli Notlar

### Security Best Practices

- ✅ Secrets asla kod içinde saklanmaz
- ✅ GitHub secrets şifrelenmiş olarak saklanır
- ✅ Logs'larda secrets `***` olarak maskelenir
- ⚠️ Secrets'ı asla commit etmeyin!

### Token Yönetimi

- **VERCEL_TOKEN**: Vercel Dashboard'dan oluşturulur
  - Scope: Full Access veya Deploy Hooks
  - Expiration: No expiration (önerilir) veya Custom
  - 🔗 Oluşturmak için: https://vercel.com/account/tokens

### Project ID & Org ID

- **VERCEL_PROJECT_ID**: Her Vercel projesi için unique
- **VERCEL_ORG_ID**: Vercel team veya kişisel hesap ID'si
- Bu değerler public olmayan bir bilgidir, güvende tutun

## 🐛 Sorun Giderme

### "Resource not accessible by integration"

**Sebep:** GitHub Actions permissions yetersiz
**Çözüm:**

1. Repository Settings → Actions → General
2. "Workflow permissions" → "Read and write permissions" seç
3. "Allow GitHub Actions to create and approve pull requests" aktif et

### "Invalid token"

**Sebep:** Token yanlış veya expire olmuş
**Çözüm:**

1. Vercel Dashboard → Settings → Tokens
2. Yeni token oluştur
3. GitHub secrets'ta güncelle

### "Project not found"

**Sebep:** Project ID yanlış veya erişim yok
**Çözüm:**

1. Vercel Dashboard'da project seç
2. Settings → General → Project ID kontrol et
3. GitHub secrets'ta güncelle

## 📞 Ek Destek

- 📖 [GitHub Actions Docs](https://docs.github.com/en/actions)
- 📖 [Vercel Deploy Hooks](https://vercel.com/docs/deployments/deploy-hooks)
- 📖 [PORTAL Deployment Docs](./DEPLOYMENT_QUICKSTART.md)

---

**Hazırlanan:** 9 Kasım 2025
**Repository:** Vadalov/PORTAL
**Next Step:** Secrets ekledikten sonra `git push origin main` yapın! 🚀
