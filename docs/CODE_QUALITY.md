# 📊 Kod Kalitesi Kontrol Sistemi

Bu proje, kod kalitesini sağlamak için GitHub Actions tabanlı otomatik kontrol sistemleri kullanır.

## 🎯 Genel Bakış

Proje aşağıdaki kod kalitesi kontrol mekanizmalarını içerir:

### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

Her push ve pull request için otomatik olarak çalışır:

- ✅ **ESLint** - Kod standartları ve en iyi pratikler kontrolü
- ✅ **TypeScript** - Tip güvenliği kontrolü
- ✅ **Unit & Integration Tests** - Otomatik test çalıştırma ve kapsam raporu
- ✅ **Build** - Uygulamanın başarıyla derlendiğinden emin olma
- ✅ **Security Audit** - Güvenlik açığı taraması

### 2. **PR Checks** (`.github/workflows/pr-checks.yml`)

Pull request'ler için ekstra kalite kontrolleri:

- 📝 **Semantic PR Title** - Commit mesaj standartları (feat, fix, docs, vb.)
- 📏 **PR Size Labeler** - PR boyutuna göre otomatik etiketleme
- 🔍 **Code Review Checks**:
  - console.log kullanımı tespiti
  - TODO/FIXME yorumları tespiti
  - Büyük dosya uyarıları (>500 satır)
- 📦 **Dependency Changes** - package.json değişiklikleri takibi
- 📊 **Test Coverage** - Kod kapsam raporu
- 🏗️ **Build Verification** - PR'ın build edilebilirliği kontrolü

### 3. **Code Quality Metrics** (`.github/workflows/code-quality.yml`)

Haftalık ve push bazlı kalite metrikleri:

- 📈 **Code Statistics** - Satır sayısı, dosya sayısı, test oranı
- 🔄 **Duplicate Code Detection** - Kopya kod tespiti (jscpd)
- 📦 **Bundle Size Analysis** - Build boyutu analizi
- 🔒 **TypeScript Strict Mode** - Tip hatalarını sayma
- 📚 **Unused Dependencies** - Kullanılmayan paket tespiti (depcheck)

### 4. **Pre-commit Hooks** (Husky + lint-staged)

Her commit öncesi otomatik olarak çalışır:

- 🔧 **ESLint Auto-fix** - Otomatik düzeltme
- 💅 **Prettier** - Kod formatlama
- ✔️ **Type Check** - TypeScript kontrolü
- 🧪 **Tests** - İlgili testlerin çalıştırılması

## 📋 Mevcut Durum (Tespit Edilen Sorunlar)

### ESLint Hataları

**687 problem** (448 hata, 239 uyarı):

#### Ana Sorunlar:

1. **`@typescript-eslint/no-explicit-any`** (en yaygın)
   - Çok sayıda `any` tip kullanımı
   - Özellikle script dosyalarında ve test dosyalarında

2. **`@typescript-eslint/no-unused-vars`**
   - Kullanılmayan değişkenler
   - Özellikle import edilen ancak kullanılmayan fonksiyonlar

3. **`@typescript-eslint/no-require-imports`**
   - CommonJS `require()` kullanımı
   - Script dosyalarında modern import'a geçilmeli

#### Öncelikli Düzeltme Alanları:

```
/scripts/*.ts        - 120+ hata
/src/lib/testing/*.ts - 80+ hata
/src/components/*.tsx - 60+ hata
```

### TypeScript Hataları

**200+ tip hatası** tespit edildi:

#### Ana Kategoriler:

1. **Module Import Hataları**
   - MSW server setup sorunları
   - Test dosyalarında tip eksiklikleri

2. **Type Compatibility**
   - react-hook-form resolver tip uyumsuzlukları
   - Props tip uyumsuzlukları

3. **Missing Properties**
   - API response tiplerinde eksik property'ler
   - Component props'larında eksik özellikler

### Test Hataları

**13 başarısız test**:

#### Başarısız Test Kategorileri:

1. **Beneficiary Sanitization** (5 test)
   - TC Kimlik No validasyonu
   - Telefon formatı sanitizasyonu
   - Form data validasyonu

2. **Mock API Tests** (6 test)
   - CRUD operasyon testleri
   - Mernis kontrolü testleri

3. **Utils & AuthStore** (2 test)
   - className merge fonksiyonu
   - Rate limiting testi

## 🛠️ Kurulum ve Kullanım

### Yerel Geliştirme

```bash
# Tüm kontrolleri çalıştır
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run test:run      # Testler
npm run build         # Build kontrolü

# Otomatik düzeltme
npm run lint -- --fix

# Pre-commit hook'ları test et
git add .
git commit -m "test"  # Hook'lar otomatik çalışacak
```

### GitHub Actions

Workflow'lar otomatik olarak çalışır. Manuel tetiklemek için:

```bash
# CI Pipeline'ı tetikle
git push origin <branch-name>

# Veya GitHub UI'dan "Actions" sekmesinden "Run workflow"
```

## 📊 Kalite Metrikleri Hedefleri

| Metrik                  | Mevcut     | Hedef |
| ----------------------- | ---------- | ----- |
| **ESLint Hataları**     | 448        | < 50  |
| **TypeScript Hataları** | 200+       | 0     |
| **Test Coverage**       | ~80%       | > 85% |
| **Başarısız Testler**   | 13         | 0     |
| **Kod Tekrarı**         | Bilinmiyor | < 5%  |

## 🎯 Düzeltme Planı

### Faz 1: Kritik Hatalar (Öncelik: Yüksek)

- [ ] TypeScript hatalarını düzelt
- [ ] Başarısız testleri düzelt
- [ ] Build hatalarını gider

### Faz 2: Kod Kalitesi (Öncelik: Orta)

- [ ] `any` tiplerini kaldır
- [ ] Kullanılmayan değişkenleri temizle
- [ ] ESLint uyarılarını gider

### Faz 3: Optimizasyon (Öncelik: Düşük)

- [ ] Kod tekrarını azalt
- [ ] Bundle size optimizasyonu
- [ ] Kullanılmayan bağımlılıkları kaldır

## 📝 Katkıda Bulunma

Pull request göndermeden önce:

1. ✅ Tüm testlerin geçtiğinden emin olun
2. ✅ ESLint hatalarını düzeltin
3. ✅ TypeScript hatası olmadığından emin olun
4. ✅ Pre-commit hook'ların geçtiğini doğrulayın
5. ✅ Semantic commit mesajları kullanın:
   - `feat:` - Yeni özellik
   - `fix:` - Hata düzeltmesi
   - `docs:` - Dokümantasyon
   - `refactor:` - Refactoring
   - `test:` - Test eklemeleri/düzeltmeleri
   - `chore:` - Bakım işleri

## 🔗 İlgili Dökümanlar

- [CLAUDE.md](../CLAUDE.md) - Proje geliştirme kılavuzu
- [README.md](../README.md) - Proje ana dokümantasyonu
- [Testing Guide](./TESTING.md) - Test yazma kılavuzu (yakında)

## 🤝 Destek

Sorularınız için:

- GitHub Issues kullanın
- Pull request gönderin
- Proje yöneticileri ile iletişime geçin
