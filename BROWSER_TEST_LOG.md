# Browser Test Log - Veritabanı Kayıt Testi

## Test Kredensiyalleri
- Email: `admin@test.com`
- Password: `admin123`

## Test Senaryosu

### 1. Login Test
- [ ] Login sayfasına git
- [ ] Email ve password doldur
- [ ] Login butonuna tıkla
- [ ] Dashboard'a yönlendirildiğini kontrol et

### 2. İhtiyaç Sahipleri Sayfası
- [ ] `/yardim/ihtiyac-sahipleri` sayfasına git
- [ ] "Yeni İhtiyaç Sahibi" butonuna tıkla
- [ ] Formu doldur:
  - Ad Soyad: "Test İhtiyaç Sahibi"
  - TC No: "98765432109"
  - Telefon: "05559876543"
  - Adres: "Test Adres 456"
  - Şehir: "Ankara"
  - İlçe: "Çankaya"
  - Mahalle: "Test Mahalle 2"
  - Aile Büyüklüğü: 4
- [ ] Formu kaydet
- [ ] Başarı mesajını kontrol et
- [ ] Liste sayfasında yeni kaydın göründüğünü kontrol et
- [ ] Sayfayı yenile ve kaydın hala göründüğünü doğrula

### 3. Bağış Sayfası
- [ ] `/bagis/liste` sayfasına git
- [ ] "Yeni Bağış" butonuna tıkla
- [ ] Formu doldur:
  - Bağışçı Adı: "Test Bağışçı"
  - Email: "bagisci@test.com"
  - Telefon: "05551112233"
  - Tutar: 500
  - Para Birimi: TRY
  - Bağış Türü: "NAKIT"
  - Ödeme Yöntemi: "BANKA_HAVALESI"
- [ ] Formu kaydet
- [ ] Başarı mesajını kontrol et
- [ ] Liste sayfasında yeni bağışın göründüğünü kontrol et
- [ ] Sayfayı yenile ve kaydın hala göründüğünü doğrula

### 4. Yardım Başvurusu
- [ ] `/yardim/basvurular` sayfasına git
- [ ] "Yeni Başvuru" butonuna tıkla
- [ ] Formu doldur ve kaydet
- [ ] Liste sayfasında yeni başvurunun göründüğünü kontrol et

### 5. Görev Oluşturma
- [ ] `/is/gorevler` sayfasına git
- [ ] Yeni görev oluştur
- [ ] Liste sayfasında yeni görevin göründüğünü kontrol et

### 6. Toplantı Oluşturma
- [ ] `/is/toplantilar` sayfasına git
- [ ] Yeni toplantı oluştur
- [ ] Liste sayfasında yeni toplantının göründüğünü kontrol et

## Sonuç Kontrolü

Her kayıt için:
1. ✅ Form submit başarılı mı?
2. ✅ Başarı mesajı gösterildi mi?
3. ✅ Liste sayfasında kayıt görünüyor mu?
4. ✅ Sayfa yenilendiğinde kayıt kaybolmadı mı?
5. ✅ Convex dashboard'da kayıt görünüyor mu?

## Veritabanı Doğrulama

Tüm kayıtlar şu şekilde Convex veritabanına kaydediliyor:
- Component → API Client → Next.js API Route → Convex Mutation → Veritabanı

