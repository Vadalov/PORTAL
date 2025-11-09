# 📦 PORTAL - Modüller Detaylı Analiz

---

## 1. 👥 Kullanıcı Yönetimi Modülü

### Dosyalar

- `src/app/(dashboard)/ayarlar/kullanicilar/` - UI Pages
- `convex/users.ts` - Backend functions
- `src/lib/auth/` - Authentication utilities
- `src/types/auth.ts` - Type definitions

### Özellikler

- Kullanıcı CRUD işlemleri
- Rol atama (Admin, Manager, Staff, Volunteer, Donor, Viewer)
- İzin yönetimi
- Aktif/Pasif durumu
- Son giriş takibi
- Avatar yönetimi

### Veri Modeli

```typescript
interface User {
  _id: Id<'users'>;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'volunteer' | 'donor' | 'viewer';
  permissions?: string[];
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  passwordHash?: string;
}
```

### API Endpoints

- `GET /api/users` - Kullanıcı listesi
- `POST /api/users` - Yeni kullanıcı
- `PUT /api/users/:id` - Güncelle
- `DELETE /api/users/:id` - Sil

---

## 2. 🤝 İhtiyaç Sahipleri Modülü

### Dosyalar

- `src/app/(dashboard)/yardim/ihtiyac-sahipleri/` - UI Pages
- `convex/beneficiaries.ts` - Backend functions
- `src/types/beneficiary.ts` - Type definitions
- `src/components/beneficiary-*` - Components

### Özellikler

- Detaylı kişisel bilgiler
- Aile yapısı ve bağımlılar
- Sağlık durumu
- Eğitim ve istihdam
- Yardım geçmişi
- Onay durumu
- Durum takibi (TASLAK, AKTIF, PASIF, SILINDI)

### Veri Modeli

```typescript
interface Beneficiary {
  _id: Id<'beneficiaries'>;
  name: string;
  tc_no: string; // Hashed
  phone: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  address: string;
  city: string;
  district: string;
  family_size: number;
  children_count?: number;
  income_level?: string;
  health_status?: string;
  status: 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI';
  approval_status?: 'pending' | 'approved' | 'rejected';
  totalAidAmount?: number;
  notes?: string;
}
```

### Önemli Fonksiyonlar

- `list()` - Sayfalı liste
- `create()` - Yeni kayıt
- `update()` - Güncelle
- `search()` - Arama
- `getById()` - Detay

---

## 3. 💰 Bağış Yönetimi Modülü

### Dosyalar

- `src/app/(dashboard)/bagis/` - UI Pages
- `convex/donations.ts` - Backend functions
- `src/types/financial.ts` - Type definitions

### Özellikler

- Bağış kayıtları
- Bağışçı bilgileri
- Bağış kampanyaları (Kumbara)
- Bağış raporları
- Finansal analiz
- Vergi belgeleri

### Veri Modeli

```typescript
interface Donation {
  _id: Id<'donations'>;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  amount: number;
  currency: string;
  donation_date: string;
  donation_type: 'cash' | 'check' | 'transfer' | 'other';
  campaign_id?: Id<'campaigns'>;
  notes?: string;
  receipt_issued: boolean;
  tax_deductible: boolean;
}
```

### Raporlar

- Aylık bağış toplamı
- Bağışçı analizi
- Kampanya performansı
- Vergi raporları

---

## 4. 📚 Burs Sistemi Modülü

### Dosyalar

- `src/app/(dashboard)/burs/` - UI Pages
- `convex/scholarships.ts` - Backend functions
- `src/types/scholarship.ts` - Type definitions

### Özellikler

- Öğrenci başvuruları
- Burs başvuru yönetimi
- Yetim burs sistemi
- Başvuru durumu takibi
- Belge yönetimi
- Onay iş akışı

### Veri Modeli

```typescript
interface Scholarship {
  _id: Id<'scholarships'>;
  applicant_name: string;
  applicant_tc_no: string;
  school_name: string;
  grade_level: string;
  gpa?: number;
  family_income?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  scholarship_amount: number;
  start_date: string;
  end_date?: string;
  documents?: string[];
}
```

---

## 5. ✅ Görev Yönetimi Modülü

### Dosyalar

- `src/app/(dashboard)/gorevler/` - UI Pages
- `convex/tasks.ts` - Backend functions
- `src/components/tasks/` - Components

### Özellikler

- Kanban tarzı görev panoları
- Görev atama
- Durum takibi (TODO, IN_PROGRESS, DONE)
- Öncelik seviyeleri
- Tarih takibi
- Atanan kişi

### Veri Modeli

```typescript
interface Task {
  _id: Id<'tasks'>;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: Id<'users'>;
  created_by: Id<'users'>;
  due_date?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 6. 📅 Toplantı Yönetimi Modülü

### Dosyalar

- `src/app/(dashboard)/toplantılar/` - UI Pages
- `convex/meetings.ts` - Backend functions
- `convex/meeting_decisions.ts` - Kararlar
- `convex/meeting_action_items.ts` - Aksiyon maddeleri

### Özellikler

- Toplantı planlama
- Katılımcı yönetimi
- Toplantı kararları
- Aksiyon maddeleri
- Tutanak
- Takip

### Veri Modeli

```typescript
interface Meeting {
  _id: Id<'meetings'>;
  title: string;
  description?: string;
  scheduled_date: string;
  location?: string;
  attendees: Id<'users'>[];
  created_by: Id<'users'>;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface MeetingDecision {
  _id: Id<'meeting_decisions'>;
  meeting_id: Id<'meetings'>;
  decision_text: string;
  decided_by: Id<'users'>;
  created_at: string;
}
```

---

## 7. 💬 İletişim Modülü

### Dosyalar

- `src/app/(dashboard)/mesajlar/` - UI Pages
- `convex/messages.ts` - Backend functions
- `src/components/messages/` - Components

### Özellikler

- Kurum içi mesajlaşma
- Toplu bildirimler
- Mesaj geçmişi
- Okundu/Okunmadı durumu
- Dosya ekleme

### Veri Modeli

```typescript
interface Message {
  _id: Id<'messages'>;
  sender_id: Id<'users'>;
  recipient_id?: Id<'users'>;
  group_id?: string;
  content: string;
  attachments?: string[];
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}
```

---

## 8. 📊 Finansal Yönetim Modülü

### Dosyalar

- `src/app/(dashboard)/fon/` - UI Pages
- `convex/finance_records.ts` - Backend functions
- `convex/bank_accounts.ts` - Banka hesapları

### Özellikler

- Finansal kayıtlar
- Banka hesapları
- Gelir/Gider takibi
- Finansal raporlar
- Bütçe yönetimi

### Veri Modeli

```typescript
interface FinanceRecord {
  _id: Id<'finance_records'>;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  bank_account_id?: Id<'bank_accounts'>;
  created_by: Id<'users'>;
}

interface BankAccount {
  _id: Id<'bank_accounts'>;
  bank_name: string;
  account_number: string;
  account_holder: string;
  balance: number;
  currency: string;
}
```

---

## 9. 🗂️ Dosya Yönetimi Modülü

### Dosyalar

- `convex/documents.ts` - Backend functions
- `convex/storage.ts` - Dosya depolama
- `src/components/documents/` - Components

### Özellikler

- Belge yükleme
- Dosya depolama
- Dosya indirme
- Dosya silme
- Dosya türü kontrolü

### Desteklenen Dosya Türleri

- PDF
- Word (.docx)
- Excel (.xlsx)
- Resim (.jpg, .png)
- Metin (.txt)

---

## 10. 🤝 İş Ortakları Modülü

### Dosyalar

- `convex/partners.ts` - Backend functions
- `src/components/partners/` - Components

### Özellikler

- İş ortağı kayıtları
- İletişim bilgileri
- Anlaşma yönetimi
- İş ortağı kategorileri

---

## 11. ✅ Yardım Başvuruları Modülü

### Dosyalar

- `src/app/(dashboard)/yardim/basvurular/` - UI Pages
- `convex/aid_applications.ts` - Backend functions

### Özellikler

- Yardım başvurusu alımı
- Başvuru durumu takibi
- Belge yönetimi
- Onay iş akışı

---

## 12. 🔐 Onay & Rıza Modülü

### Dosyalar

- `convex/consents.ts` - Backend functions

### Özellikler

- KVKK onayları
- GDPR uyumluluğu
- Veri işleme onayları
- Onay geçmişi

---

## 13. 👨‍👩‍👧‍👦 Bağımlılar Modülü

### Dosyalar

- `convex/dependents.ts` - Backend functions
- `src/components/dependents/` - Components

### Özellikler

- Aile üyeleri
- Çocuk bilgileri
- Yaşlı bakım
- Engelli bakım

---

## 14. ⚙️ Sistem Ayarları Modülü

### Dosyalar

- `src/app/(dashboard)/ayarlar/` - UI Pages
- `convex/system_settings.ts` - Backend functions

### Özellikler

- Sistem konfigürasyonu
- Kurum bilgileri
- Bildirim ayarları
- Raporlama ayarları

---

## 15. 🔔 Bildirim Sistemi

### Dosyalar

- `convex/workflow_notifications.ts` - Backend functions

### Özellikler

- İş akışı bildirimleri
- Otomatik bildirimler
- Bildirim şablonları
- Bildirim geçmişi

---

## 📊 Modüller Arası İlişkiler

```
Users (Merkez)
├── Beneficiaries (İhtiyaç Sahipleri)
│   ├── Aid Applications (Yardım Başvuruları)
│   ├── Dependents (Bağımlılar)
│   └── Documents (Belgeler)
├── Donations (Bağışlar)
│   └── Finance Records (Finansal Kayıtlar)
├── Scholarships (Burslar)
│   └── Documents (Belgeler)
├── Tasks (Görevler)
├── Meetings (Toplantılar)
│   ├── Meeting Decisions (Kararlar)
│   └── Meeting Action Items (Aksiyon Maddeleri)
├── Messages (Mesajlar)
├── Bank Accounts (Banka Hesapları)
├── Partners (İş Ortakları)
├── Consents (Onaylar)
└── System Settings (Sistem Ayarları)
```

---

## 🔄 Veri Akışı Örneği: Yardım Başvurusu

1. **Başvuru Oluşturma** → Aid Applications
2. **Belge Yükleme** → Documents + Storage
3. **Onay İş Akışı** → Workflow Notifications
4. **Karar Alma** → Meeting Decisions
5. **Yardım Dağıtımı** → Finance Records
6. **Bildirim Gönderme** → Messages
7. **Takip** → Tasks

---

## 🎯 Modül Seçim Rehberi

| Görev              | Modül           |
| ------------------ | --------------- |
| Yeni kişi eklemek  | Beneficiaries   |
| Bağış kaydetmek    | Donations       |
| Öğrenci başvurusu  | Scholarships    |
| Görev atamak       | Tasks           |
| Toplantı planlamak | Meetings        |
| Mesaj göndermek    | Messages        |
| Finansal kayıt     | Finance Records |
| Belge yüklemek     | Documents       |
| Kullanıcı yönetimi | Users           |
| Sistem ayarları    | System Settings |
