# Dernek Yönetim Sistemi - Ürün Belirtim Dokümanı (PRD)

## 1. GENEL BAKIŞ

**Ürün Adı:** Dernek Yönetim Sistemi (Association Management System)
**Platform:** Web Tabanlı SaaS
**Teknoloji:** Next.js 16, React 19, Appwrite, TypeScript, Tailwind CSS
**Durum:** MVP - Tamamlandı / Genişletme Aşamasında
**Son Güncelleme:** 2025-10-29

---

## 2. AMAÇ

Türk sivil toplum örgütlerinin (dernekler) operasyonlarını modern, merkezi bir platform üzerinden yönetmek:
- Bağış ve donasyonlar
- İhtiyaç sahipleri yönetimi
- Burs programları
- Mali raporlama
- İç iletişim ve görev yönetimi
- Ortak/sponsor yönetimi

---

## 3. KAPSAMESİ

### 3.1 Mevcut Modüller
1. **Ana Sayfa (Dashboard)** ✅
   - Sistem durumu özeti
   - Temel istatistikler
   - Hızlı erişim kartları
   - Son aktiviteler

2. **Bağış Yönetimi** ⚙️
   - Bağış kaydı ve takibi
   - Bağışçı veri tabanı
   - Makbuz yönetimi
   - Dönem raporları
   - Kumbara takibi (Geliştirme)

3. **Yardım Yönetimi** ⚙️
   - İhtiyaç sahipleri veri tabanı
   - Yardım başvuruları
   - Yardım dağıtım takibi
   - Nakit vezne (Geliştirme)
   - Yardım listeleri

4. **Burs Programları** ⚙️
   - Öğrenci kayıtları
   - Burs başvuruları
   - Yetim öğrenci sponsorluğu
   - Ödeme takibi

5. **Mali Yönetim** ⚙️
   - Gelir/gider kayıtları
   - Finansal raporlar
   - Bütçe yönetimi
   - Dashboard analitiği

6. **İçerik & İletişim** ⚙️
   - İç mesajlaşma
   - Toplu mesaj gönderimi
   - Duyurular

7. **Operasyonel** ⚙️
   - Görev yönetimi (Kanban board)
   - Toplantı takvimi
   - İş ortağı yönetimi

---

## 4. KULLANICILAR VE ROLLER

### 4.1 Roller
| Rol | Tanım | Sayı |
|-----|-------|------|
| **SUPER_ADMIN** | Sistem yöneticisi | 1 |
| **ADMIN** | Kurum yöneticisi | 2-3 |
| **MANAGER** | Modül sorumlusu | 5-10 |
| **MEMBER** | Aktif üye | 20-50 |
| **VOLUNTEER** | Gönüllü | 10-30 |
| **VIEWER** | Görüntüleyici | Unlimited |

### 4.2 Kullanıcı Türleri
- **Kurum İç Kullanıcılar:** Çalışanlar, gönüllüler
- **Harici Kullanıcılar:** Bağışçılar, ihtiyaç sahipleri (gelecek)

---

## 5. ÖZELLİKLER

### 5.1 Temel Özellikler ✅
- [x] Kullanıcı kimlik doğrulaması (Appwrite)
- [x] Rol tabanlı erişim kontrolü (RBAC)
- [x] Veri tabanlı arayüz (DataTable)
- [x] Sayfalandırma ve arama
- [x] Responsive tasarım
- [x] Dark mode desteği
- [x] PDF/CSV dışa aktarma
- [x] Form validasyonu (Zod)
- [x] XSS/SQL injection koruması
- [x] CSRF token koruma

### 5.2 Gelişmiş Özellikler 🔄
- [ ] Raporlama ve analitiği
- [ ] Gelişmiş filtreleme
- [ ] Toplu işlem yönetimi
- [ ] SMS/Email entegrasyonu
- [ ] QR kod desteği
- [ ] Dosya yönetimi (fotoğraf, belge)
- [ ] İkinci faktör doğrulama (2FA)
- [ ] Denetim günlüğü

---

## 6. TEKNIK SPESIFIKASYONLAR

### 6.1 Stack
```
Frontend:   Next.js 16, React 19, TypeScript
Styling:    Tailwind CSS v4, shadcn/ui
State:      Zustand + Immer
Data Fetch: TanStack Query v5
Forms:      React Hook Form + Zod
UI Library: Radix UI, Lucide Icons
Animation:  Framer Motion
Backend:    Appwrite (BaaS)
Auth:       Appwrite Sessions + HttpOnly Cookies
Testing:    Vitest + Playwright
```

### 6.2 Veritabanı
**Platform:** Appwrite Cloud
**Koleksiyonlar:**
- users, beneficiaries, donations
- aid_requests, aid_applications, scholarships
- tasks, meetings, messages
- finance_records, parameters
- orphans, sponsors, campaigns

### 6.3 Depolama (Storage)
- `documents` - Belgeler
- `receipts` - Makbuzlar
- `photos` - Fotoğraflar
- `reports` - Raporlar

---

## 7. MODERNIZASYON & IYILEŞTIRMELER

### 7.1 Yeni Bileşenler
✅ **PageLayout** - Standart sayfa düzeni
✅ **DataTable** - Yeniden kullanılabilir tablo
✅ **StatCard** - İstatistik kartı
✅ **PlaceholderPage** - Gelişme aşaması placeholder

### 7.2 Standardizasyon
✅ Tüm sayfalar aynı başlık yapısı
✅ Tutarlı renk sistemi
✅ Birleşik tipografi
✅ Standart animasyonlar
✅ Responsive tasarım

### 7.3 Kod Kalitesi
- %30-40 kod azaltma (bileşen reuse)
- %100 TypeScript type safety
- Full dark mode desteği
- WCAG 2.1 AA erişilebilirlik
- Sentry hata takibi

---

## 8. KULLANICı AKIŞI

### 8.1 Giriş Akışı
```
1. Giriş sayfası → Kimlik doğrulama
2. HttpOnly cookie ile oturum saklanır
3. CSRF token doğrulaması
4. Dashboard'a yönlendirme
```

### 8.2 Veri Yönetimi Akışı
```
Listele → Ara → Filtrele → Sayfalandır →
  → Düzenle/Sil/Dışa Aktar → Raporla
```

### 8.3 Form Akışı
```
1. Form görüntüle
2. Zod validation ile doğrula
3. Sanitize et (XSS koruması)
4. Backend'e gönder
5. Sonuç göster (toast)
6. Listeyi güncelle
```

---

## 9. PERFORMANS HEDEFLERİ

| Metrik | Hedef | Durum |
|--------|-------|-------|
| FCP | < 1.5s | ✅ |
| LCP | < 2.5s | ✅ |
| CLS | < 0.1 | ✅ |
| TTI | < 3s | ✅ |
| Bundle | < 400KB | ✅ |
| Lighthouse | 85+ | ⏳ |

---

## 10. GÜVENLIK

### 10.1 Kimlik & Yetkilendirme
- Appwrite Sessions (HttpOnly)
- 5 giriş denemesi / 15 dakika kilit
- CSRF token doğrulama
- Rol tabanlı izinler (RBAC)
- API key yönetimi

### 10.2 Veri Koruması
- XSS koruması (DOMPurify)
- SQL injection koruması
- HTTPS şifrelemesi
- Veri sanitizasyonu
- Güvenli dosya yükleme

### 10.3 Denetim
- Sentry error tracking
- İşlem günlükleri
- Giriş kayıtları
- Veri değişiklik takibi

---

## 11. YÖNETIM & BAKIMI

### 11.1 Günlük
- Sistem durumu kontrolü
- Hata loglarını inceleme
- Yedekleme doğrulaması

### 11.2 Haftalık
- Performans analizi
- Güvenlik güncellemeleri
- Kullanıcı destek

### 11.3 Aylık
- Mali raporlar
- Kullanıcı feedback
- Roadmap güncelleme

---

## 12. TASLAK YAYIN PLANI

### **Phase 1: MVP** ✅ (Tamamlandı)
- Temel modüller
- Kullanıcı yönetimi
- Raporlama
- Deployment

### **Phase 2: Modernizasyon** ✅ (Tamamlandı)
- Bileşen standartlaştırması
- UI/UX iyileştirme
- Kod temizleme
- Dokümantasyon

### **Phase 3: Gelişmiş Özellikler** 🔄 (Ocak 2025)
- API Raporlama
- SMS/Email integrasyonu
- Gelişmiş filtreleme
- Dosya yönetimi
- 2FA

### **Phase 4: Ölçeklenme** (Q2 2025)
- Mobil uygulama
- Offline mod
- Multi-tenant desteği
- Performans optimizasyonu

---

## 13. MODÜL TASLAK SÜRELERİ

| Modül | Başlama | Tamamlama | Durum |
|-------|---------|-----------|-------|
| Kumbara Takibi | Ocak 2025 | Mart 2025 | 📋 |
| Finans Raporları | Ocak 2025 | Nisan 2025 | 📋 |
| Öğrenci Yönetimi | Şubat 2025 | Mart 2025 | 📋 |
| Mali Dashboard | Şubat 2025 | Nisan 2025 | 📋 |
| Partner Yönetimi | Mart 2025 | Nisan 2025 | 📋 |
| Mobil Uygulama | Nisan 2025 | Haziran 2025 | 📋 |

---

## 14. METRIKLER

### 14.1 Kullanım
- **Aktif Kullanıcılar:** 30-80/ay
- **Veri Boyutu:** ~500MB
- **Depolama:** 1-5GB
- **İşlem:** 1000-5000/ay

### 14.2 Sistem
- **Uptime:** 99.5%+
- **Response Time:** < 500ms
- **Error Rate:** < 0.1%
- **Yedek:** Günlük

---

## 15. BÜTÇE & KAYNAKLAR

### 15.1 Tim
- 1 Backend Developer
- 1 Frontend Developer
- 1 DevOps/Infra
- 1 Product Manager
- 1 QA Engineer

### 15.2 Altyapı
- Appwrite Cloud: $25/ay
- Next.js Hosting: $20/ay
- Storage/CDN: $10/ay
- Domain: $12/ay
- **Toplam:** ~$70/ay

---

## 16. BAŞARI KRİTERLERİ

- ✅ Tüm modüller tamamen işlevsel
- ✅ %95+ test kapsamı
- ✅ Lighthouse 85+ puanı
- ✅ Zero kritik güvenlik açığı
- ✅ < 2s sayfa yükleme
- ✅ 99.5%+ uptime
- ✅ Kullanıcı memnuniyeti 4.5+/5

---

## 17. RISKLER & NE DÜZELTME

| Risk | Olasılık | Etki | Çözüm |
|------|----------|------|--------|
| Veri kaybı | Düşük | Yüksek | Günlük yedekleme |
| Güvenlik breach | Düşük | Yüksek | Penetration testing |
| Performans | Orta | Orta | Caching, CDN |
| Personel kaybı | Düşük | Orta | Dokümantasyon |

---

## 18. SONUÇ

**Dernek Yönetim Sistemi** profesyonel, ölçeklenebilir ve modern bir SaaS ürünü. Temel MVP tamamlanmış, şimdi ileri özelliklere odaklanılıyor.

**Hedefler:**
- Q1 2025: Tüm temel modüller
- Q2 2025: Mobil + İleri özellikler
- Q3 2025: Enterprise özellikler
- Q4 2025: Multi-tenant platform

---

**Son Güncelleme:** 29 Ekim 2024
**Sürüm:** 1.0.0
**Onay:** Beklemede
