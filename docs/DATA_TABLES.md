# Convex Database Tables

Bu dokümantasyon, Convex veritabanındaki tüm tabloları ve yapılarını açıklar.

## Tablolar Özeti

| Tablo Adı | Açıklama | Index Sayısı |
|-----------|----------|--------------|
| `users` | Kullanıcılar | 2 |
| `beneficiaries` | Yardım alan kişiler | 3 |
| `donations` | Bağışlar | 3 |
| `finance_records` | Mali kayıtlar | 3 |
| `tasks` | Görevler | 3 |
| `meetings` | Toplantılar | 3 |
| `messages` | Mesajlar | 2 |
| `aid_applications` | Yardım başvuruları | 3 |
| `parameters` | Sistem parametreleri | 2 |
| `files` | Dosya metadata'sı | 3 |

## Detaylı Tablo Yapıları

### 1. users
**Açıklama**: Sistem kullanıcıları

**Alanlar**:
- `name` (string, required) - Kullanıcı adı
- `email` (string, required) - Email adresi
- `role` (string, required) - Kullanıcı rolü
- `avatar` (string, optional) - Avatar URL
- `isActive` (boolean, required) - Aktif durumu
- `labels` (string[], optional) - Etiketler
- `createdAt` (string, optional) - Oluşturulma tarihi
- `lastLogin` (string, optional) - Son giriş tarihi
- `passwordHash` (string, optional) - Şifre hash'i

**Indexler**:
- `by_email` - Email adresine göre arama
- `by_role` - Role göre arama

---

### 2. beneficiaries
**Açıklama**: Yardım alan kişiler ve aileler

**Alanlar**:
- `name` (string, required) - Ad Soyad
- `tc_no` (string, required) - TC Kimlik No
- `phone` (string, required) - Telefon
- `email` (string, optional) - Email
- `address` (string, required) - Adres
- `city` (string, required) - Şehir
- `district` (string, required) - İlçe
- `neighborhood` (string, required) - Mahalle
- `family_size` (number, required) - Aile büyüklüğü
- `status` (enum, required) - Durum: TASLAK, AKTIF, PASIF, SILINDI
- `birth_date` (string, optional) - Doğum tarihi
- `gender` (string, optional) - Cinsiyet
- `marital_status` (string, optional) - Medeni durum
- `children_count` (number, optional) - Çocuk sayısı
- `orphan_children_count` (number, optional) - Yetim çocuk sayısı
- `elderly_count` (number, optional) - Yaşlı sayısı
- `disabled_count` (number, optional) - Engelli sayısı
- `income_level` (string, optional) - Gelir seviyesi
- `has_debt` (boolean, optional) - Borç durumu
- `housing_type` (string, optional) - Konut tipi
- `health_status` (string, optional) - Sağlık durumu
- `has_chronic_illness` (boolean, optional) - Kronik hastalık
- `has_disability` (boolean, optional) - Engellilik durumu
- `totalAidAmount` (number, optional) - Toplam yardım miktarı
- `approval_status` (enum, optional) - Onay durumu: pending, approved, rejected
- `approved_by` (string, optional) - Onaylayan
- `approved_at` (string, optional) - Onay tarihi
- ... ve daha fazlası

**Indexler**:
- `by_tc_no` - TC Kimlik No'ya göre arama
- `by_status` - Duruma göre arama
- `by_city` - Şehre göre arama

---

### 3. donations
**Açıklama**: Bağış kayıtları

**Alanlar**:
- `donor_name` (string, required) - Bağışçı adı
- `donor_phone` (string, required) - Bağışçı telefonu
- `donor_email` (string, optional) - Bağışçı email'i
- `amount` (number, required) - Miktar
- `currency` (enum, required) - Para birimi: TRY, USD, EUR
- `donation_type` (string, required) - Bağış tipi
- `payment_method` (string, required) - Ödeme yöntemi
- `donation_purpose` (string, required) - Bağış amacı
- `receipt_number` (string, required) - Makbuz numarası
- `receipt_file_id` (string, optional) - Makbuz dosya ID'si
- `status` (enum, required) - Durum: pending, completed, cancelled
- `notes` (string, optional) - Notlar
- `is_kumbara` (boolean, optional) - Kumbara bağışı mı?
- `kumbara_location` (string, optional) - Kumbara konumu
- `collection_date` (string, optional) - Toplama tarihi
- `location_coordinates` (object, optional) - Konum koordinatları
- `location_address` (string, optional) - Konum adresi

**Indexler**:
- `by_status` - Duruma göre arama
- `by_donor_email` - Bağışçı email'ine göre arama
- `by_receipt_number` - Makbuz numarasına göre arama
- `by_is_kumbara` - Kumbara bağışlarına göre arama
- `by_kumbara_location` - Kumbara konumuna göre arama

---

### 4. finance_records
**Açıklama**: Mali kayıtlar (gelir/gider)

**Alanlar**:
- `record_type` (enum, required) - Kayıt tipi: income, expense
- `category` (string, required) - Kategori
- `amount` (number, required) - Miktar
- `currency` (enum, required) - Para birimi: TRY, USD, EUR
- `description` (string, required) - Açıklama
- `transaction_date` (string, required) - İşlem tarihi
- `payment_method` (string, optional) - Ödeme yöntemi
- `receipt_number` (string, optional) - Makbuz numarası
- `receipt_file_id` (string, optional) - Makbuz dosya ID'si
- `related_to` (string, optional) - İlişkili kayıt
- `created_by` (id<users>, required) - Oluşturan kullanıcı
- `approved_by` (id<users>, optional) - Onaylayan kullanıcı
- `status` (enum, required) - Durum: pending, approved, rejected

**Indexler**:
- `by_record_type` - Kayıt tipine göre arama
- `by_status` - Duruma göre arama
- `by_created_by` - Oluşturana göre arama

---

### 5. tasks
**Açıklama**: Görevler ve yapılacaklar

**Alanlar**:
- `title` (string, required) - Görev başlığı
- `description` (string, optional) - Açıklama
- `assigned_to` (id<users>, optional) - Atanan kullanıcı
- `created_by` (id<users>, required) - Oluşturan kullanıcı
- `priority` (enum, required) - Öncelik: low, normal, high, urgent
- `status` (enum, required) - Durum: pending, in_progress, completed, cancelled
- `due_date` (string, optional) - Bitiş tarihi
- `completed_at` (string, optional) - Tamamlanma tarihi
- `category` (string, optional) - Kategori
- `tags` (string[], optional) - Etiketler
- `is_read` (boolean, required) - Okundu mu?

**Indexler**:
- `by_assigned_to` - Atanan kullanıcıya göre arama
- `by_status` - Duruma göre arama
- `by_created_by` - Oluşturana göre arama

---

### 6. meetings
**Açıklama**: Toplantılar

**Alanlar**:
- `title` (string, required) - Toplantı başlığı
- `description` (string, optional) - Açıklama
- `meeting_date` (string, required) - Toplantı tarihi
- `location` (string, optional) - Konum
- `organizer` (id<users>, required) - Organizatör
- `participants` (id<users>[], required) - Katılımcılar
- `status` (enum, required) - Durum: scheduled, ongoing, completed, cancelled
- `meeting_type` (enum, required) - Toplantı tipi: general, committee, board, other
- `agenda` (string, optional) - Gündem
- `notes` (string, optional) - Notlar

**Indexler**:
- `by_organizer` - Organizatöre göre arama
- `by_status` - Duruma göre arama
- `by_meeting_date` - Tarihe göre arama

---

### 7. messages
**Açıklama**: Mesajlar (SMS, Email, Internal)

**Alanlar**:
- `message_type` (enum, required) - Mesaj tipi: sms, email, internal
- `sender` (id<users>, required) - Gönderen
- `recipients` (id<users>[], required) - Alıcılar
- `subject` (string, optional) - Konu
- `content` (string, required) - İçerik
- `sent_at` (string, optional) - Gönderilme tarihi
- `status` (enum, required) - Durum: draft, sent, failed
- `is_bulk` (boolean, required) - Toplu mesaj mı?
- `template_id` (string, optional) - Şablon ID'si

**Indexler**:
- `by_sender` - Gönderene göre arama
- `by_status` - Duruma göre arama

---

### 8. aid_applications
**Açıklama**: Yardım başvuruları

**Alanlar**:
- `application_date` (string, required) - Başvuru tarihi
- `applicant_type` (enum, required) - Başvuran tipi: person, organization, partner
- `applicant_name` (string, required) - Başvuran adı
- `beneficiary_id` (id<beneficiaries>, optional) - Yardım alan kişi
- `one_time_aid` (number, optional) - Tek seferlik yardım
- `regular_financial_aid` (number, optional) - Düzenli mali yardım
- `regular_food_aid` (number, optional) - Düzenli gıda yardımı
- `in_kind_aid` (number, optional) - Ayni yardım
- `service_referral` (number, optional) - Hizmet yönlendirmesi
- `stage` (enum, required) - Aşama: draft, under_review, approved, ongoing, completed
- `status` (enum, required) - Durum: open, closed
- `description` (string, optional) - Açıklama
- `notes` (string, optional) - Notlar
- `priority` (enum, optional) - Öncelik: low, normal, high, urgent
- `processed_by` (id<users>, optional) - İşleyen kullanıcı
- `processed_at` (string, optional) - İşlenme tarihi
- `approved_by` (id<users>, optional) - Onaylayan kullanıcı
- `approved_at` (string, optional) - Onay tarihi
- `completed_at` (string, optional) - Tamamlanma tarihi

**Indexler**:
- `by_beneficiary` - Yardım alan kişiye göre arama
- `by_stage` - Aşamaya göre arama
- `by_status` - Duruma göre arama

---

### 9. parameters
**Açıklama**: Sistem parametreleri (çoklu dil desteği)

**Alanlar**:
- `category` (string, required) - Kategori
- `name_tr` (string, required) - Türkçe ad
- `name_en` (string, optional) - İngilizce ad
- `name_ar` (string, optional) - Arapça ad
- `name_ru` (string, optional) - Rusça ad
- `name_fr` (string, optional) - Fransızca ad
- `value` (string, required) - Değer
- `order` (number, required) - Sıralama
- `is_active` (boolean, required) - Aktif mi?

**Indexler**:
- `by_category` - Kategoriye göre arama
- `by_value` - Değere göre arama

---

### 10. files
**Açıklama**: Dosya metadata'sı (Convex fileStorage ile entegre)

**Alanlar**:
- `fileName` (string, required) - Dosya adı
- `fileSize` (number, required) - Dosya boyutu (bytes)
- `fileType` (string, required) - Dosya tipi (MIME type)
- `bucket` (string, required) - Bucket adı (receipts, reports, avatars)
- `storageId` (id<_storage>, required) - Convex fileStorage ID
- `uploadedBy` (id<users>, optional) - Yükleyen kullanıcı
- `uploadedAt` (string, required) - Yükleme tarihi

**Indexler**:
- `by_storage_id` - Storage ID'ye göre arama
- `by_bucket` - Bucket'a göre arama
- `by_uploaded_by` - Yükleyene göre arama

---

## İlişkiler

### Foreign Key İlişkileri

- `aid_applications.beneficiary_id` → `beneficiaries._id`
- `aid_applications.approved_by` → `users._id`
- `aid_applications.processed_by` → `users._id`
- `finance_records.created_by` → `users._id`
- `finance_records.approved_by` → `users._id`
- `tasks.assigned_to` → `users._id`
- `tasks.created_by` → `users._id`
- `meetings.organizer` → `users._id`
- `meetings.participants[]` → `users._id`
- `messages.sender` → `users._id`
- `messages.recipients[]` → `users._id`
- `files.uploadedBy` → `users._id`
- `files.storageId` → `_storage._id` (Convex fileStorage)

## Index Stratejisi

Tüm tablolarda performans için:
- **Primary Index**: `_creationTime` (otomatik)
- **Status Index**: Durum alanlarına göre filtreleme
- **Foreign Key Index**: İlişkili kayıtlara hızlı erişim
- **Search Index**: Email, TC No, Receipt Number gibi arama alanları

## Veri Bütünlüğü

- **Required Fields**: Tüm kritik alanlar zorunlu
- **Enum Validation**: Durumlar enum ile kontrol edilir
- **Type Safety**: TypeScript ile tip güvenliği
- **Convex Validation**: Schema validation otomatik

## Notlar

1. **files** tablosu yeni eklendi ve Convex fileStorage ile entegre edildi
2. Tüm tarih alanları ISO 8601 formatında string olarak saklanıyor
3. Para birimi ve durum alanları enum ile sınırlandırılmış
4. Soft delete için `status` alanları kullanılıyor (SILINDI, cancelled, vb.)
5. Audit trail için `created_by`, `approved_by`, `processed_by` alanları var

