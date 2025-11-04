# Convex Veritabanı Şeması

Bu doküman, PORTAL projesinin Convex veritabanı yapısını detaylı olarak açıklar.

## Genel Bakış

Proje **Convex** backend kullanmaktadır. Tüm collection'lar `convex/schema.ts` dosyasında tanımlanmıştır.

## Collections

### 1. users (Kullanıcılar)

Sistem kullanıcılarını saklar.

**Alanlar:**
- `name` (string) - Kullanıcı adı
- `email` (string) - Email adresi
- `role` (string) - Kullanıcı rolü (UserRole enum)
- `avatar` (string, optional) - Profil fotoğrafı URL
- `isActive` (boolean) - Aktif/pasif durumu
- `labels` (array<string>, optional) - Kullanıcı etiketleri
- `createdAt` (string, optional) - Oluşturulma tarihi
- `lastLogin` (string, optional) - Son giriş tarihi
- `passwordHash` (string, optional) - Şifrelenmiş parola

**İndeksler:**
- `by_email` - Email ile arama
- `by_role` - Role göre filtreleme

**Roller:**
- SUPER_ADMIN - Tam yetki
- ADMIN - Yönetici
- MANAGER - Müdür
- MEMBER - Üye
- VIEWER - Görüntüleyici
- VOLUNTEER - Gönüllü

---

### 2. beneficiaries (İhtiyaç Sahipleri)

Yardım alan kişilerin bilgilerini saklar.

**Temel Alanlar:**
- `name` (string) - Ad soyad
- `tc_no` (string) - TC Kimlik No
- `phone` (string) - Telefon numarası
- `email` (string, optional) - Email adresi
- `birth_date` (string, optional) - Doğum tarihi
- `gender` (string, optional) - Cinsiyet
- `nationality` (string, optional) - Uyruk
- `religion` (string, optional) - Din

**Adres Bilgileri:**
- `address` (string) - Adres
- `city` (string) - Şehir
- `district` (string) - İlçe
- `neighborhood` (string) - Mahalle

**Aile Bilgileri:**
- `marital_status` (string, optional) - Medeni durum
- `family_size` (number) - Aile büyüklüğü
- `children_count` (number, optional) - Çocuk sayısı
- `orphan_children_count` (number, optional) - Yetim çocuk sayısı
- `elderly_count` (number, optional) - Yaşlı sayısı
- `disabled_count` (number, optional) - Engelli sayısı

**Ekonomik Durum:**
- `income_level` (string, optional) - Gelir seviyesi
- `income_source` (string, optional) - Gelir kaynağı
- `has_debt` (boolean, optional) - Borç durumu
- `housing_type` (string, optional) - Konut tipi
- `has_vehicle` (boolean, optional) - Araç sahipliği

**Sağlık Bilgileri:**
- `health_status` (string, optional) - Sağlık durumu
- `has_chronic_illness` (boolean, optional) - Kronik hastalık
- `chronic_illness_detail` (string, optional) - Kronik hastalık detayı
- `has_disability` (boolean, optional) - Engellilik durumu
- `disability_detail` (string, optional) - Engellilik detayı
- `has_health_insurance` (boolean, optional) - Sağlık sigortası
- `regular_medication` (string, optional) - Düzenli ilaç kullanımı

**Eğitim ve İş:**
- `education_level` (string, optional) - Eğitim seviyesi
- `occupation` (string, optional) - Meslek
- `employment_status` (string, optional) - İstihdam durumu

**Yardım Bilgileri:**
- `aid_type` (string, optional) - Yardım tipi
- `totalAidAmount` (number, optional) - Toplam yardım miktarı
- `aid_duration` (string, optional) - Yardım süresi
- `priority` (string, optional) - Öncelik seviyesi
- `previous_aid` (boolean, optional) - Önceki yardım
- `other_organization_aid` (boolean, optional) - Başka kuruluştan yardım
- `emergency` (boolean, optional) - Acil durum

**Referans ve Notlar:**
- `reference_name` (string, optional) - Referans kişi adı
- `reference_phone` (string, optional) - Referans telefon
- `reference_relation` (string, optional) - Referans ilişkisi
- `application_source` (string, optional) - Başvuru kaynağı
- `notes` (string, optional) - Notlar
- `contact_preference` (string, optional) - İletişim tercihi

**Durum:**
- `status` (union) - TASLAK | AKTIF | PASIF | SILINDI
- `approval_status` (union, optional) - pending | approved | rejected
- `approved_by` (string, optional) - Onaylayan kişi
- `approved_at` (string, optional) - Onay tarihi

**İndeksler:**
- `by_tc_no` - TC Kimlik No ile arama
- `by_status` - Durum filtreleme
- `by_city` - Şehir filtreleme

---

### 3. donations (Bağışlar)

Bağış kayıtlarını saklar.

**Bağışçı Bilgileri:**
- `donor_name` (string) - Bağışçı adı
- `donor_phone` (string) - Bağışçı telefonu
- `donor_email` (string, optional) - Bağışçı email

**Bağış Detayları:**
- `amount` (number) - Bağış miktarı
- `currency` (union) - TRY | USD | EUR
- `donation_type` (string) - Bağış tipi
- `payment_method` (string) - Ödeme yöntemi
- `donation_purpose` (string) - Bağış amacı
- `notes` (string, optional) - Notlar

**Makbuz:**
- `receipt_number` (string) - Makbuz numarası
- `receipt_file_id` (string, optional) - Makbuz dosya ID

**Durum:**
- `status` (union) - pending | completed | cancelled

**Kumbara Alanları:**
- `is_kumbara` (boolean, optional) - Kumbara bağışı mı?
- `kumbara_location` (string, optional) - Kumbara konumu
- `collection_date` (string, optional) - Toplama tarihi
- `kumbara_institution` (string, optional) - Kumbara kurumu

**İndeksler:**
- `by_status` - Durum filtreleme
- `by_donor_email` - Email ile arama
- `by_receipt_number` - Makbuz numarası ile arama
- `by_is_kumbara` - Kumbara bağışları
- `by_kumbara_location` - Kumbara konumu

---

### 4. tasks (Görevler)

Görev yönetimi için kullanılır.

**Alanlar:**
- `title` (string) - Görev başlığı
- `description` (string, optional) - Açıklama
- `assigned_to` (id<users>, optional) - Atanan kişi
- `created_by` (id<users>) - Oluşturan kişi
- `priority` (union) - low | normal | high | urgent
- `status` (union) - pending | in_progress | completed | cancelled
- `due_date` (string, optional) - Bitiş tarihi
- `completed_at` (string, optional) - Tamamlanma tarihi
- `category` (string, optional) - Kategori
- `tags` (array<string>, optional) - Etiketler
- `is_read` (boolean) - Okundu mu?

**İndeksler:**
- `by_assigned_to` - Atanan kişiye göre
- `by_status` - Durum filtreleme
- `by_created_by` - Oluşturan kişiye göre

---

### 5. meetings (Toplantılar)

Toplantı kayıtlarını saklar.

**Alanlar:**
- `title` (string) - Toplantı başlığı
- `description` (string, optional) - Açıklama
- `meeting_date` (string) - Toplantı tarihi
- `location` (string, optional) - Konum
- `organizer` (id<users>) - Organizatör
- `participants` (array<id<users>>) - Katılımcılar
- `status` (union) - scheduled | ongoing | completed | cancelled
- `meeting_type` (union) - general | committee | board | other
- `agenda` (string, optional) - Gündem
- `notes` (string, optional) - Notlar

**İndeksler:**
- `by_organizer` - Organizatöre göre
- `by_status` - Durum filtreleme
- `by_meeting_date` - Tarihe göre

---

### 6. messages (Mesajlar)

İç mesajlaşma sistemi.

**Alanlar:**
- `message_type` (union) - sms | email | internal
- `sender` (id<users>) - Gönderen
- `recipients` (array<id<users>>) - Alıcılar
- `subject` (string, optional) - Konu
- `content` (string) - İçerik
- `sent_at` (string, optional) - Gönderim tarihi
- `status` (union) - draft | sent | failed
- `is_bulk` (boolean) - Toplu mesaj mı?
- `template_id` (string, optional) - Şablon ID

**İndeksler:**
- `by_sender` - Gönderene göre
- `by_status` - Durum filtreleme

---

### 7. parameters (Parametreler)

Sistem parametreleri ve dropdown değerleri.

**Alanlar:**
- `category` (string) - Kategori
- `name_tr` (string) - Türkçe isim
- `name_en` (string, optional) - İngilizce isim
- `name_ar` (string, optional) - Arapça isim
- `name_ru` (string, optional) - Rusça isim
- `name_fr` (string, optional) - Fransızca isim
- `value` (string) - Değer
- `order` (number) - Sıralama
- `is_active` (boolean) - Aktif mi?

**İndeksler:**
- `by_category` - Kategoriye göre
- `by_value` - Değere göre

---

### 8. aid_applications (Yardım Başvuruları)

Yardım başvuru süreçlerini yönetir.

**Alanlar:**
- `application_date` (string) - Başvuru tarihi
- `applicant_type` (union) - person | organization | partner
- `applicant_name` (string) - Başvuran adı
- `beneficiary_id` (id<beneficiaries>, optional) - İhtiyaç sahibi ID
- `one_time_aid` (number, optional) - Tek seferlik yardım
- `regular_financial_aid` (number, optional) - Düzenli nakdi yardım
- `regular_food_aid` (number, optional) - Düzenli gıda yardımı
- `in_kind_aid` (number, optional) - Ayni yardım
- `service_referral` (number, optional) - Hizmet yönlendirme
- `stage` (union) - draft | under_review | approved | ongoing | completed
- `status` (union) - open | closed
- `description` (string, optional) - Açıklama
- `notes` (string, optional) - Notlar
- `priority` (union, optional) - low | normal | high | urgent
- `processed_by` (id<users>, optional) - İşleyen kişi
- `processed_at` (string, optional) - İşlem tarihi
- `approved_by` (id<users>, optional) - Onaylayan
- `approved_at` (string, optional) - Onay tarihi
- `completed_at` (string, optional) - Tamamlanma tarihi

**İndeksler:**
- `by_beneficiary` - İhtiyaç sahibine göre
- `by_stage` - Aşamaya göre
- `by_status` - Duruma göre

---

### 9. finance_records (Finans Kayıtları)

Gelir ve gider kayıtları.

**Alanlar:**
- `record_type` (union) - income | expense
- `category` (string) - Kategori
- `amount` (number) - Tutar
- `currency` (union) - TRY | USD | EUR
- `description` (string) - Açıklama
- `transaction_date` (string) - İşlem tarihi
- `payment_method` (string, optional) - Ödeme yöntemi
- `receipt_number` (string, optional) - Makbuz numarası
- `receipt_file_id` (string, optional) - Makbuz dosya ID
- `related_to` (string, optional) - İlişkili kayıt
- `created_by` (id<users>) - Oluşturan
- `approved_by` (id<users>, optional) - Onaylayan
- `status` (union) - pending | approved | rejected

**İndeksler:**
- `by_record_type` - Kayıt tipine göre
- `by_status` - Duruma göre
- `by_created_by` - Oluşturana göre

---

## İlişkiler

### Kullanıcı İlişkileri
- `tasks.assigned_to` → `users._id`
- `tasks.created_by` → `users._id`
- `meetings.organizer` → `users._id`
- `meetings.participants[]` → `users._id`
- `messages.sender` → `users._id`
- `messages.recipients[]` → `users._id`
- `aid_applications.processed_by` → `users._id`
- `aid_applications.approved_by` → `users._id`
- `finance_records.created_by` → `users._id`
- `finance_records.approved_by` → `users._id`

### İhtiyaç Sahibi İlişkileri
- `aid_applications.beneficiary_id` → `beneficiaries._id`

---

## Güvenlik ve İzinler

Convex'te izinler uygulama seviyesinde yönetilir. Her collection için:
- Okuma: Kullanıcı rolüne göre
- Yazma: ADMIN, MANAGER rolleri
- Silme: ADMIN rolü
- Güncelleme: ADMIN, MANAGER rolleri

---

## Veri Tipleri

### Tarih Formatı
Tüm tarihler ISO 8601 string formatında saklanır:
```
"2024-01-15T10:30:00.000Z"
```

### Para Birimi
- TRY: Türk Lirası
- USD: Amerikan Doları
- EUR: Euro

### Durum Değerleri
- TASLAK: Henüz onaylanmamış
- AKTIF: Aktif kayıt
- PASIF: Pasif kayıt
- SILINDI: Silinmiş (soft delete)

---

## Migration ve Seed Data

Veritabanı kurulumu için:
```bash
npx convex dev    # Development
npx convex deploy # Production
```

Test kullanıcıları oluşturmak için:
```bash
npx tsx src/scripts/create-test-users.ts
```

