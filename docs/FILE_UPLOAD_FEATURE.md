# Dosya Yükleme Özelliği - Dokümantasyon

## Genel Bakış

Kumbara sistemine kapsamlı dosya yükleme özelliği eklendi. Bu özellik ile kullanıcılar:
- Makbuz belgelerini yükleyebilir
- Kumbara fotoğrafları ekleyebilir
- Toplama raporları yükleyebilir
- Drag & drop ile dosya seçebilir
- Dosyaları önizleyebilir
- Yüklenen belgeleri listede görebilir

## Özellikler

### 🖼️ Dosya Yükleme
- **Desteklenen Formatlar**: Resimler (JPG, PNG, WebP) ve PDF
- **Maksimum Boyut**: 10MB
- **Drag & Drop**: Sürükle-bırak desteği
- **Güvenlik**: Dosya validasyonu ve sanitizasyon
- **Önizleme**: Resim dosyaları için anında önizleme

### 📎 Belge Yönetimi
- Her kumbara için birden fazla belge
- Belge listesi görüntüleme
- Belge ikonları (resim, PDF, diğer)
- Yüklenme durumu gösterimi

### 💾 Backend Entegrasyon
- API endpoint: `/api/storage/upload`
- CSRF korunması
- Dosya türü ve boyut kontrolü
- Sanitized filename
- Bucket-based storage (receipts, reports, avatars)

## Kullanım

### 1. Kumbara Oluştururken Dosya Yükleme

1. `/bagis/kumbara` sayfasına gidin
2. "Yeni Kumbara" butonuna tıklayın
3. Formu doldurun
4. "📎 Makbuz ve Belgeler" bölümünü bulun
5. Dosyayı sürükleyin veya tıklayarak seçin
6. Desteklenen formatlar:
   - Resimler: JPG, PNG, WebP
   - Belgeler: PDF
7. Maksimum 10MB

### 2. Liste Görünümü

- Yüklenen belgeleri "Belgeler" sütununda görebilirsiniz
- Paperclip ikonu ile belge varlığı gösterilir
- "Belge var" linkine tıklayarak önizleme yapabilirsiniz (yakında)

## Teknik Detaylar

### Bileşenler

#### 1. FileUpload
**Dosya:** `src/components/ui/file-upload.tsx`

Özellikler:
- Drag & drop desteği
- Dosya validasyonu
- Güvenli dosya adı oluşturma
- Resim önizleme
- Progress bar (simülasyon)
- Hata yönetimi
- XSS korunması

#### 2. KumbaraForm Güncellemesi
**Dosya:** `src/components/kumbara/KumbaraForm.tsx`

- FileUpload bileşeni entegre edildi
- Dosya seçimi handler'ı eklendi
- Form submit'te dosya yükleme işlemi
- CSRF token ile güvenlik

#### 3. KumbaraList Güncellemesi
**Dosya:** `src/components/kumbara/KumbaraList.tsx`

- "Belgeler" sütunu eklendi
- receipt_file_id alanı desteklenir
- Belge durumu gösterimi
- Paperclip ikonu

### API Endpoint

#### POST /api/storage/upload

**İstek:**
```
Content-Type: multipart/form-data

FormData:
- file: File (zorunlu)
- bucket: string (opsiyonel, varsayılan: reports)
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "fileId": "file_1701234567890_abc123",
    "fileUrl": "/api/storage/files/file_1701234567890_abc123",
    "bucketId": "receipts",
    "fileName": "kumbara-makbuzu.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf"
  },
  "message": "Dosya başarıyla yüklendi"
}
```

**Hata Yanıtları:**

```json
// 400 - Geçersiz içerik türü
{
  "success": false,
  "error": "Geçersiz içerik türü"
}
```

```json
// 400 - Dosya yok
{
  "success": false,
  "error": "Dosya zorunludur"
}
```

```json
// 500 - Yükleme hatası
{
  "success": false,
  "error": "Yükleme işlemi başarısız"
}
```

### Validasyon

#### Dosya Doğrulama (src/lib/sanitization.ts)

```typescript
validateFile(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}) => {
  // Boyut kontrolü
  // MIME türü kontrolü
  // Uzantı kontrolü
  // Dosya adı sanitizasyonu
  // Double extension kontrolü
  // Suspicious filename kontrolü
}
```

#### Kumbara Validation (src/lib/validations/kumbara.ts)

```typescript
receipt_file_id: z.string().optional()
```

### Veri Akışı

1. **Kullanıcı dosya seçer**
   - FileUpload bileşeni dosyayı alır
   - Validasyon yapar
   - Preview oluşturur

2. **Form submit edilir**
   - FileUpload onFileSelect callback'i çağırır
   - KumbaraForm dosyayı state'e kaydeder
   - onSubmit fonksiyonu çağrılır

3. **Dosya yüklenir**
   - FormData oluşturulur
   - CSRF token alınır
   - /api/storage/upload endpoint'ine POST
   - fileId alınır

4. **Kumbara kaydedilir**
   - fileId ile kumbara oluşturulur
   - receipt_file_id alanı kullanılır
   - QR kod oluşturulur

5. **Liste güncellenir**
   - Query invalidation
   - receipt_file_id gösterilir

## Güvenlik

### Dosya Validasyonu
- **MIME Type Kontrolü**: Sadece izin verilen türler
- **Dosya Boyutu**: Maksimum 10MB
- **Çift Uzantı**: .pdf.exe gibi engellenir
- **Dosya Adı**: Sanitized, 255 karakter sınırı
- **İçerik Kontrolü**: MIME type ve gerçek içerik uyumu

### Upload Güvenliği
- **CSRF Korunması**: Tüm mutation'lar korunur
- **Rate Limiting**: API endpoint korunması
- **Sanitization**: Dosya adı temizleme
- **Error Handling**: Güvenli hata mesajları

## Özelleştirme

### FileUpload Props

```typescript
<FileUpload
  onFileSelect={handleFileSelect}
  accept="image/*,.pdf"
  maxSize={10}
  placeholder="Makbuz seçin"
  disabled={false}
  allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
  allowedExtensions={['jpg', 'png', 'pdf']}
/>
```

### Desteklenen Bucket'lar

```typescript
const STORAGE_BUCKETS = {
  REPORTS: 'reports',
  RECEIPTS: 'receipts',
  AVATARS: 'avatars',
} as const;
```

## Mevcut Sınırlamalar

1. **Storage**: Şu anda mock storage (gerçek upload yok)
2. **Önizleme**: PDF önizleme yok
3. **Çoklu Dosya**: Tek dosya sınırı
4. **İndirme**: Henüz implement edilmedi

## Gelecek Geliştirmeler

- [ ] Gerçek storage implementasyonu (Convex/S3/Cloudinary)
- [ ] PDF önizleme
- [ ] Çoklu dosya desteği
- [ ] Dosya indirme endpoint'i
- [ ] Dosya silme işlemi
- [ ] Thumbnail oluşturma
- [ ] Dosya boyutu optimizasyonu
- [ ] Virus tarama entegrasyonu
- [ ] Dosya geçmişi ve versiyonlama
- [ ] Toplu dosya yükleme
- [ ] Resim editör (crop, resize)

## Sürüm Geçmişi

### v1.0.0 (2024-11-04)
- İlk sürüm
- FileUpload bileşeni
- KumbaraForm entegrasyonu
- API endpoint (mock)
- Liste görünümü
- Drag & drop desteği
- Dosya validasyonu
- CSRF korunması

## Build Durumu

✅ Build başarılı
✅ TypeScript hataları çözüldü
✅ Tüm bileşenler çalışır durumda

## Troubleshooting

### Dosya Yüklenmiyor
- Dosya boyutunu kontrol edin (< 10MB)
- Desteklenen formatlar: JPG, PNG, WebP, PDF
- Network bağlantısını kontrol edin
- Console'da hata mesajlarını kontrol edin

### Validation Hatası
- Dosya türü geçerli değil
- Dosya adı geçersiz karakterler içeriyor
- Çift uzantı (ör: .pdf.exe)

### CSRF Hatası
- Session'ın geçerli olduğundan emin olun
- Sayfayı yenileyin
- Login olun

## Performance

- **Lazy Loading**: FileUpload sadece gerektiğinde yüklenir
- **Preview Optimization**: Resimler optimize edilir
- **Validation**: Client-side'da hızlı validasyon
- **Progress**: Smooth progress bar animasyonu

## Browser Desteği

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Katkıda Bulunma

Bu özelliği geliştirirken:
1. Security-first yaklaşımı
2. UX optimizasyonu
3. Type safety
4. Error handling
5. Accessibility

Aklınıza gelen başka özellik var mı? 🚀
