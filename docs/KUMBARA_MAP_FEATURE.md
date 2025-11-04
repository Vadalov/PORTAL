# Kumbara Harita Özelliği Dokümantasyonu

## Genel Bakış

Kumbara bağış formuna interaktif harita özelliği eklendi. Bu özellik sayesinde kullanıcılar:
- Kumbara konumunu harita üzerinde görsel olarak seçebilir
- Toplama rotası oluşturabilir
- Haritaya tıklayarak rota noktaları ekleyebilir
- Adres arayabilir
- Mevcut konumlarını alabilir

## Özellikler

### 🗺️ İnteraktif Harita
- Google Maps entegrasyonu
- Haritaya tıklayarak rota noktaları ekleme
- Çoklu rota noktası desteği
- Otomatik rota çizimi
- Mevcut konum alma
- Adres arama

### 📍 Konum Yönetimi
- Koordinat bilgisi kaydetme (lat, lng)
- Adres bilgisi otomatik alma
- Rota noktalarını listeleme
- Rota bilgilerini kaydetme (mesafe, süre)

### 💾 Veri Saklama
- `location_coordinates`: Kumbara konum koordinatları
- `location_address`: Kumbara adres bilgisi
- `route_points`: Rota noktaları dizisi
- `route_distance`: Rota mesafesi (km)
- `route_duration`: Rota süresi (dakika)

## Kullanım

### 1. Google Maps API Anahtarı

`.env.local` dosyanıza aşağıdaki satırı ekleyin:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

API anahtarını Google Cloud Console'dan alabilirsiniz:
- https://console.cloud.google.com/
- Maps JavaScript API'yi etkinleştirin
- Places API'yi etkinleştirin

### 2. Kumbara Oluşturma

1. `/bagis/kumbara` sayfasına gidin
2. "Yeni Kumbara" butonuna tıklayın
3. Formdaki "🗺️ Harita ve Konum" bölümünü bulun
4. Haritayı kullanarak konum ve rota oluşturun:
   - Haritaya tıklayarak nokta ekleyin
   - En az 2 nokta eklediğinizde rota otomatik çizilir
   - Adres arama kutusunu kullanabilirsiniz
   - "Mevcut Konum" butonu ile GPS'inizden konum alabilirsiniz
5. Formu kaydedin

## Teknik Detaylar

### Bileşenler

#### 1. MapLocationPicker
**Dosya:** `src/components/kumbara/MapLocationPicker.tsx`

- Google Maps API'yi dinamik olarak yükler
- Harita tıklama eventlerini dinler
- Directions API ile rota çizimi
- Geocoding API ile adres çözümleme

#### 2. KumbaraForm Güncellemesi
**Dosya:** `src/components/kumbara/KumbaraForm.tsx`

- MapLocationPicker bileşenini entegre eder
- Konum ve rota değişikliklerini form state'ine kaydeder
- Zod validation ile veri doğrulama

#### 3. API Route Güncellemesi
**Dosya:** `src/app/api/kumbara/route.ts`

- Konum ve rota verilerini doğrular
- Veritabanına kaydeder
- QR kod üretiminde kullanır

#### 4. Validation Schema
**Dosya:** `src/lib/validations/kumbara.ts`

Yeni alanlar eklendi:
```typescript
location_coordinates?: { lat: number; lng: number }
location_address?: string
route_points?: Array<{ lat: number; lng: number; address?: string }>
route_distance?: number
route_duration?: number
```

### API Endpoints

#### POST /api/kumbara

Yeni kumbara oluştururken gönderilen veri:

```json
{
  "donor_name": "...",
  "donor_phone": "...",
  "amount": 100,
  "currency": "TRY",
  "kumbara_location": "...",
  "kumbara_institution": "...",
  "collection_date": "2024-01-01T00:00:00.000Z",
  "location_coordinates": {
    "lat": 41.0082,
    "lng": 28.9784
  },
  "location_address": "İstanbul, Türkiye",
  "route_points": [
    { "lat": 41.0082, "lng": 28.9784, "address": "..." },
    { "lat": 41.0123, "lng": 28.9876, "address": "..." }
  ],
  "route_distance": 5.2,
  "route_duration": 15
}
```

## Özelleştirme

### Harita Ayarları

`MapLocationPicker.tsx` dosyasında değiştirebileceğiniz ayarlar:

```typescript
// Varsayılan merkez (İstanbul)
const defaultCenter = { lat: 41.0082, lng: 28.9784 };

// Harita zoom seviyesi
zoom: 13,

// Rota çizimi rengi ve kalınlığı
polylineOptions: {
  strokeColor: '#3B82F6',
  strokeWeight: 4,
  strokeOpacity: 0.8,
}
```

### Rota Hesaplama

`calculateAndDisplayRoute` fonksiyonunda:
- Travel mode (DRIVING, WALKING, TRANSIT)
- Optimize waypoints
- Directions renderer ayarları

## Güvenlik

- API anahtarı `NEXT_PUBLIC_` ile başlamalı (client-side'da kullanılır)
- API anahtarını Google Cloud Console'da domain'e kısıtlayın
- Rate limiting konfigürasyonu mevcut

## Troubleshooting

### Harita Yüklenmiyor
- API anahtarını kontrol edin
- Google Cloud Console'da API'lerin etkinleştirildiğini doğrulayın
- Browser console'da hata mesajlarını kontrol edin

### Konum Alınamıyor
- HTTPS kullanıldığından emin olun
- Tarayıcı izinlerini kontrol edin
- navigator.geolocation desteğini kontrol edin

### Build Hataları
- @googlemaps/js-api-loader paketinin yüklü olduğundan emin olun
- TypeScript tiplerinin doğru olduğunu kontrol edin

## Performans

- Harita sadece ihtiyaç duyulduğunda yüklenir
- Script tag ile async loading
- Lazy initialization
- Memoization kullanımı

## Gelecek Geliştirmeler

Planlanan özellikler:
- [ ] Kumbara konumlarını kaydetme (reuse locations)
- [ ] Favori rotalar
- [ ] Rota optimizasyonu algoritması
- [ ] Geofencing desteği
- [ ] Kumbara toplama takvimi entegrasyonu
- [ ] Harita üzerinde mevcut kumbara gösterimi
- [ ] Offline harita desteği

## Sürüm Geçmişi

### v1.0.0 (2024-11-04)
- İlk sürüm
- Google Maps entegrasyonu
- İnteraktif rota oluşturma
- Adres arama
- Mevcut konum alma
- Form entegrasyonu
- API doğrulama

## Katkıda Bulunma

1. Feature branch oluşturun: `git checkout -b feature/kumbara-map`
2. Değişikliklerinizi commit edin: `git commit -m "feat: add new map feature"`
3. Branch'inizi push edin: `git push origin feature/kumbara-map`
4. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
