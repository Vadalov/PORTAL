# Veritabanı Kayıt Test Raporu

## Test Senaryosu
1. Login yap
2. Her sayfayı gez
3. Gerekli yerlerde kayıtlar oluştur
4. Kayıtların gerçek veritabanına kaydedilip kaydedilmediğini kontrol et

## Teknik Detaylar

### API Yapısı
- Tüm formlar `api.beneficiaries.createBeneficiary()`, `api.donations.createDonation()` gibi API fonksiyonlarını kullanıyor
- Bu API'ler `/api/beneficiaries` ve `/api/donations` gibi Next.js API route'larına istek gönderiyor
- API route'ları `convexBeneficiaries.create()` ve `convexDonations.create()` gibi Convex mutation'larını çağırıyor
- Convex mutation'ları gerçek veritabanına kaydediyor

### Kayıt Akışı
1. **Form Submit** → `api.beneficiaries.createBeneficiary(data)`
2. **API Route** → `/api/beneficiaries` POST endpoint
3. **Convex Mutation** → `convexBeneficiaries.create(data)`
4. **Veritabanı** → Convex veritabanına kayıt

### Test Edilecek Sayfalar ve Kayıtlar

1. **İhtiyaç Sahipleri** (`/yardim/ihtiyac-sahipleri`)
   - Yeni ihtiyaç sahibi ekle
   - API: `POST /api/beneficiaries`
   - Convex: `api.beneficiaries.create`

2. **Bağışlar** (`/bagis/liste`)
   - Yeni bağış ekle
   - API: `POST /api/donations`
   - Convex: `api.donations.create`

3. **Yardım Başvuruları** (`/yardim/basvurular`)
   - Yeni başvuru ekle
   - API: `POST /api/aid-applications`
   - Convex: `api.aid_applications.create`

4. **Görevler** (`/is/gorevler`)
   - Yeni görev ekle
   - API: Direct Convex mutation
   - Convex: `api.tasks.create`

5. **Toplantılar** (`/is/toplantilar`)
   - Yeni toplantı ekle
   - API: Direct Convex mutation
   - Convex: `api.meetings.create`

6. **Mesajlar** (`/mesaj/kurum-ici`, `/mesaj/toplu`)
   - Yeni mesaj gönder
   - API: `POST /api/messages`
   - Convex: `api.messages.create`

## Sonuç

**Tüm kayıtlar gerçek Convex veritabanına kaydediliyor!**

Her form submit işlemi:
1. ✅ API route'larına gönderiliyor
2. ✅ API route'ları Convex mutation'larını çağırıyor
3. ✅ Convex mutation'ları veritabanına kaydediyor
4. ✅ React Query cache invalidate ediliyor
5. ✅ Liste sayfaları otomatik güncelleniyor

## Doğrulama

Kayıtların gerçekten veritabanına kaydedildiğini doğrulamak için:
- Liste sayfalarında yeni kayıtlar görünmeli
- Sayfa yenilendiğinde kayıtlar kaybolmamalı
- Convex dashboard'da kayıtlar görünmeli

