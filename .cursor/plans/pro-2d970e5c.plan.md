<!-- 2d970e5c-330f-4603-b44a-d3d1a6491082 954a9fd0-e32c-4b74-b80c-679855bddb19 -->

# API ve Entegrasyon Onarımı Planı

1. Konfigürasyon & Altyapı Hazırlığı

- `src/lib/convex/server.ts` için kimlik aktarım stratejisini netleştir
- Çevresel değişkenleri doğrula, eksik anahtarları belgeleyerek varsayılan/fallback gereksinimlerini çıkar

2. Next API Route Düzeltmeleri

- `src/app/api/**/route.ts` dosyalarında eksik `POST/PUT/DELETE` exportlarını ekle
- Handler’lara CSRF kontrolü ve oturum kimliği geçişini ekle
- Kumbara gibi özel route’larda Convex çağrılarının hata yönetimini güçlendir

3. Convex Köprü Katmanı Revizyonu

- `src/lib/convex/api.ts` update/create/remove çağrılarını Convex fonksiyonlarının beklediği argüman yapısına göre düzelt
- TC kimlik güvenliği gerektiren çağrılar için kimlik/rol bilgisi iletilmesini sağla
- Parametre ve ayar API’lerini gerçek Convex fonksiyonlarına bağla

4. UI Veri Entegrasyonu & UX İyileştirmeleri

- Mock veri kullanan sayfaları (Burs, Fon, Ortak vb.) gerçek API çağrılarına geçir
- `VirtualizedDataTable` için erişilebilirlik/mobil destek ekle
- Kumbara harita bileşeninde API anahtarı yoksa graceful fallback uygula

5. Test & CI Sıkılaştırması

- Vitest’te başarısız testleri gider ya da mockları güncelle
- `.github/workflows/ci.yml` içinde lint/typecheck adımlarındaki `continue-on-error` bayraklarını kaldır
- Güvenlik ve regression testleri için ek vaka/komutları güncelle
