# Hızlı Başlangıç Rehberi

## 1️⃣ KURULUM

### Gereksinimler
- Node.js 18+
- npm 9+
- Git

### Adımlar
```bash
# Projeyi klonla
git clone https://github.com/kafkasder-gi/PORTAL.git
cd PORTAL

# Bağımlılıkları yükle
npm install

# .env.local oluştur (Appwrite bilgileri ekle)
cp .env.example .env.local

# Geliştirme sunucusu başlat
npm run dev
```

**Sonuç:** http://localhost:3000

---

## 2️⃣ GIRIŞ

**Test Hesabı:**
- Email: `admin@test.com`
- Şifre: `admin123`

**Roller:**
- Super Admin (Tüm sistem)
- Admin (Kurum yönetimi)
- Manager (Modül sorumlusu)
- Member (Aktif üye)
- Viewer (Görüntüleyici)

---

## 3️⃣ ANA MODÜLLERİ

### 📊 Dashboard
- Sistem durumu
- Temel istatistikler
- Hızlı erişim

### 💝 Bağış Yönetimi
- Bağış kaydı
- Donör veri tabanı
- Makbuzlar
- Raporlar

### 👥 İhtiyaç Sahipleri
- Kayıt ve düzenleme
- İhtiyaç talebi
- Yardım dağıtım
- Dosyalar

### 🎓 Burs Programları
- Öğrenci kaydı
- Başvurular
- Yetim sponsorluğu
- Ödeme takibi

### 💰 Mali Yönetim
- Gelir/gider
- Raporlar
- Analitik
- Bütçe

### 📝 Diğer
- İç mesajlaşma
- Görev yönetimi
- Toplantı takvimi
- İş ortakları

---

## 4️⃣ GENEL ÖZELLIKLER

✅ **Arama & Filtreleme** - Veri bul hızlı
✅ **Sayfalandırma** - 20 kayıt/sayfa
✅ **Dışa Aktarma** - CSV/Excel
✅ **Responsive** - Mobile/Tablet/Desktop
✅ **Dark Mode** - Göz rahatı

---

## 5️⃣ YAYGIN GÖREVLER

### Yeni Bağış Ekle
```
Bağışlar → Yeni Bağış → Form Doldur → Kaydet
```

### İhtiyaç Sahibi Ara
```
İhtiyaç Sahipleri → Ara (İsim/TC No) → Sonuç
```

### Rapor Dışa Aktar
```
Bağışlar → Dışa Aktar → CSV İndir
```

### Kullanıcı Ekle
```
Admin → Kullanıcılar → Yeni Ekle → Rol Seç
```

---

## 6️⃣ SORUN GİDERME

### Giriş Yapamıyorum
- Email doğru mu?
- Şifreyi kontrol et
- Caps Lock kapalı mı?
- Appwrite bağlantısı var mı?

### Sayfa yükleme slow
- Cache temizle (Ctrl+Shift+Del)
- DevTools Network sekmesini kontrol et
- Tarayıcıyı yenile

### Veri kaydedilmiyor
- Hataları kontrol et (Console)
- Form validasyonunu kontrol et
- İzinleri kontrol et

### Dark mode çalışmıyor
- localStorage temizle
- Sayfa yenile
- Tarayıcı settings kontrol et

---

## 7️⃣ KIŞISELLEŞTIRME

### Renk Değiştir
Edit `src/app/globals.css`:
```css
--brand-primary: #1358B8;  /* Değiştir */
--brand-secondary: #10B981;
```

### Başlık Değiştir
Edit `src/app/(dashboard)/layout.tsx`:
```tsx
<h1>Yeni Başlık</h1>
```

### Logo Ekle
Fotoğraf ekle: `public/logo.png`

---

## 8️⃣ GELİŞTİRME KOMUTLARI

```bash
# Geliştirme
npm run dev

# Build
npm run build

# Production
npm start

# Testler
npm test
npm run e2e

# TypeScript kontrol
npm run typecheck

# Lint
npm run lint
```

---

## 9️⃣ DOSYA YAPISI

```
src/
├── app/              # Next.js sayfalar
├── components/       # React bileşenleri
├── lib/              # Yardımcı fonksiyonlar
├── stores/           # Zustand state
├── types/            # TypeScript türleri
├── hooks/            # Custom hooks
└── styles/           # Global CSS
```

---

## 🔟 DOKÜMANTASYON

📄 **PRD.md** - Ürün belirtimi
📄 **MODERNIZATION_SUMMARY.md** - Modernizasyon detayları
📄 **COMPONENT_GUIDE.md** - Bileşen rehberi
📄 **PHASE_2_COMPLETE.md** - İyileştirmeler

---

## ❓ SIKÇA SORULAN

**S: Verileri nerede tutuluyor?**
C: Appwrite Cloud veritabanında (cloud.appwrite.io)

**S: Offline çalışır mı?**
C: Şimdilik hayır, ama planlı (2025 Q2)

**S: Mobil uygulama var mı?**
C: Responsive web var, native app planlanıyor

**S: Kaç kullanıcı destekler?**
C: Appwrite limitine kadar (unlimited)

**S: Veri yedekleme otomatik mi?**
C: Evet, Appwrite günlük yedekler alır

---

## 📞 DESTEK

**GitHub Issues:** github.com/kafkasder-gi/PORTAL/issues
**Email:** admin@dernek-sistemi.com
**Discord:** [Bağlantı]

---

**Son Güncelleme:** 29 Ekim 2024
**Sürüm:** 1.0.0
