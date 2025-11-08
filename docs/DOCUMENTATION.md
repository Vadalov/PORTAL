# PORTAL - Dernek Yönetim Sistemi - Kapsamlı Dokümantasyon

**Versiyon:** 1.0.0  
**Son Güncelleme:** 2025-01-27  
**Proje Durumu:** MVP Tamamlandı - Geliştirme Devam Ediyor

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kurulum ve Başlangıç](#kurulum-ve-başlangıç)
3. [Mimari ve Teknoloji Yığını](#mimari-ve-teknoloji-yığını)
4. [Proje Yapısı](#proje-yapısı)
5. [Veritabanı Şeması](#veritabanı-şeması)
6. [API Dokümantasyonu](#api-dokümantasyonu)
7. [Sayfa Yapısı ve Özellikler](#sayfa-yapısı-ve-özellikler)
8. [Kullanıcı Rolleri ve Yetkilendirme](#kullanıcı-rolleri-ve-yetkilendirme)
9. [Güvenlik](#güvenlik)
10. [Test Stratejisi](#test-stratejisi)
11. [Deployment](#deployment)
12. [Eksiklikler ve Geliştirme Planı](#eksiklikler-ve-geliştirme-planı)
13. [Sorun Giderme](#sorun-giderme)

---

## 🎯 Genel Bakış

PORTAL, Türk derneklerinin (non-profit organizations) kapsamlı yönetimi için geliştirilmiş modern bir web uygulamasıdır. Sistem, Next.js 16, TypeScript ve Convex backend kullanılarak geliştirilmiştir.

### Temel Özellikler

- 👥 **Kullanıcı Yönetimi**: Rol tabanlı erişim kontrolü (6 farklı rol)
- 📋 **İhtiyaç Sahipleri Yönetimi**: Detaylı kayıt ve takip sistemi
- 💰 **Bağış Yönetimi**: Bağış kayıtları, kumbara takibi, raporlama
- 📚 **Yardım Programları**: Yardım başvuruları ve dağıtım takibi
- 📝 **Görev Yönetimi**: Kanban tarzı görev panoları
- 📅 **Toplantı Yönetimi**: Toplantı planlama ve takibi
- 💬 **İletişim Sistemi**: Kurum içi mesajlaşma ve toplu bildirimler
- 📊 **Raporlama**: Finansal ve operasyonel raporlar
- 🗂️ **Dosya Yönetimi**: Belgeler ve evraklar için dosya yükleme
- 🔐 **Güvenlik**: CSRF koruması, input sanitization, rate limiting

### Teknik Özellikler

- **Frontend**: Next.js 16 App Router, React 19, TypeScript
- **Backend**: Convex (Real-time database & API)
- **UI Framework**: Tailwind CSS v4, shadcn/ui components
- **State Management**: Zustand, TanStack Query
- **Form Yönetimi**: React Hook Form, Zod validation
- **Test**: Vitest (Unit/Integration), Playwright (E2E)
- **Monitoring**: Sentry (Error tracking), Google Analytics 4

---

## 🚀 Kurulum ve Başlangıç

### Gereksinimler

- **Node.js**: >= 20.9.0
- **npm**: >= 9.0.0
- **Convex Account**: Ücretsiz hesap yeterli

### Adım 1: Projeyi Klonlayın

```bash
git clone <repository-url>
cd PORTAL
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

### Adım 3: Environment Variables

`.env.local` dosyası oluşturun:

```bash
cp .env.example .env.local
```

Gerekli değişkenleri ayarlayın:

```env
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Session & Security
SESSION_SECRET=your-session-secret-min-32-chars
CSRF_SECRET=your-csrf-secret

# Optional: Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=your-ga-id
```

### Adım 4: Convex Backend Kurulumu

```bash
# Convex CLI ile giriş yapın
npx convex dev

# Veya production için
npx convex deploy
```

Convex URL'inizi `.env.local` dosyasına ekleyin.

### Adım 5: İlk Admin Kullanıcısını Oluşturun

```bash
# Test kullanıcıları oluştur
npx tsx src/scripts/create-demo-data.ts

# Veya Convex dashboard'dan manuel oluşturun
```

### Adım 6: Geliştirme Sunucusunu Başlatın

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Convex dev server (ayrı terminal)
npm run convex:dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Hızlı Komutlar

```bash
# Geliştirme
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server

# Kod Kalitesi
npm run lint             # ESLint kontrolü
npm run lint:fix         # Otomatik düzeltme
npm run typecheck        # TypeScript kontrolü
npm run format           # Prettier formatlama

# Test
npm run test             # Vitest (watch mode)
npm run test:run         # Testleri bir kez çalıştır
npm run test:coverage    # Coverage raporu
npm run e2e              # Playwright E2E testleri

# Convex
npm run convex:dev       # Convex development
npm run convex:deploy    # Convex production deploy
```

---

## 🏗️ Mimari ve Teknoloji Yığını

### Frontend Mimari

```
┌─────────────────────────────────────┐
│     Next.js 16 App Router           │
│  ┌───────────────────────────────┐  │
│  │   React Server Components     │  │
│  │   + Client Components         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   State Management            │  │
│  │   - Zustand (Client State)    │  │
│  │   - TanStack Query (Server)   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   UI Layer                    │  │
│  │   - shadcn/ui Components      │  │
│  │   - Tailwind CSS v4           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Backend Mimari

```
┌─────────────────────────────────────┐
│        Next.js API Routes           │
│  ┌───────────────────────────────┐  │
│  │   Middleware (Auth, Rate Limit)│ │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Convex Client (Server SDK)  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      Convex Backend           │  │
│  │  - Queries (Read Operations)  │  │
│  │  - Mutations (Write Ops)      │  │
│  │  - Actions (External APIs)    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Convex Database (Real-time) │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Veri Akışı

1. **Client Component** → TanStack Query → API Route
2. **API Route** → Convex Server SDK → Convex Function
3. **Convex Function** → Database Query/Mutation
4. **Response** → API Route → Client Component
5. **Real-time Updates** → Convex Subscription → Client

### Teknoloji Detayları

#### Frontend Stack

- **Next.js 16**: App Router, Server Components, Streaming
- **React 19**: Concurrent features, Server Components
- **TypeScript**: Strict mode, path aliases
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Framer Motion**: Animations
- **React Hook Form**: Form state management
- **Zod v4**: Runtime type validation

#### Backend Stack

- **Convex**: Real-time database, functions, file storage
- **bcryptjs**: Password hashing
- **Zod**: Server-side validation

#### Development Tools

- **Vitest**: Unit & integration testing
- **Playwright**: E2E testing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Sentry**: Error monitoring
- **Google Analytics**: Usage analytics

---

## 📁 Proje Yapısı

```
PORTAL/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (dashboard)/            # Protected route group
│   │   │   ├── genel/              # Dashboard
│   │   │   ├── bagis/              # Donations
│   │   │   ├── yardim/             # Aid management
│   │   │   ├── burs/               # Scholarships
│   │   │   ├── fon/                # Financial
│   │   │   ├── mesaj/              # Messages
│   │   │   ├── is/                 # Tasks & Meetings
│   │   │   ├── kullanici/          # User management
│   │   │   ├── partner/            # Partners
│   │   │   └── settings/           # Settings
│   │   ├── api/                    # API routes
│   │   │   ├── auth/               # Authentication
│   │   │   ├── beneficiaries/      # Beneficiaries CRUD
│   │   │   ├── donations/          # Donations CRUD
│   │   │   ├── tasks/              # Tasks CRUD
│   │   │   ├── meetings/           # Meetings CRUD
│   │   │   ├── messages/           # Messages CRUD
│   │   │   ├── storage/            # File upload
│   │   │   └── health/             # Health check
│   │   ├── login/                  # Login page
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Root page
│   │
│   ├── components/                 # React components
│   │   ├── ui/                     # Base UI components (shadcn/ui)
│   │   ├── forms/                  # Form components
│   │   ├── layouts/                # Layout components
│   │   ├── kumbara/                # Kumbara components
│   │   ├── messages/               # Message components
│   │   └── PlaceholderPage.tsx     # Placeholder component
│   │
│   ├── lib/                        # Utilities & configs
│   │   ├── convex/                 # Convex client setup
│   │   │   ├── client.ts           # Client SDK
│   │   │   └── server.ts           # Server SDK
│   │   ├── api/                    # API utilities
│   │   ├── validations/            # Zod schemas
│   │   ├── auth/                   # Auth utilities
│   │   ├── security/               # Security utilities
│   │   ├── sanitization.ts         # Input sanitization
│   │   └── utils.ts                # Helper functions
│   │
│   ├── stores/                     # Zustand stores
│   │   └── authStore.ts            # Auth state
│   │
│   ├── types/                      # TypeScript definitions
│   │   ├── auth.ts                 # Auth types
│   │   ├── beneficiary.ts          # Beneficiary types
│   │   └── database.ts             # Database types
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useApiCache.ts          # API caching
│   │   └── useInfiniteScroll.ts    # Infinite scroll
│   │
│   ├── config/                     # Configuration files
│   │   ├── navigation.ts           # Navigation config
│   │   └── design-tokens.ts        # Design tokens
│   │
│   └── middleware.ts               # Next.js middleware
│
├── convex/                         # Convex backend
│   ├── schema.ts                   # Database schema
│   ├── users.ts                    # User functions
│   ├── beneficiaries.ts            # Beneficiary functions
│   ├── donations.ts                # Donation functions
│   ├── tasks.ts                    # Task functions
│   ├── meetings.ts                 # Meeting functions
│   ├── messages.ts                 # Message functions
│   ├── storage.ts                  # File storage
│   └── _generated/                 # Generated types
│
├── e2e/                            # E2E tests (Playwright)
│   ├── auth.spec.ts
│   ├── beneficiaries.spec.ts
│   └── test-utils.ts
│
├── docs/                           # Documentation (legacy)
├── scripts/                        # Utility scripts
│   └── start-dev.mjs              # Development server script
│
├── public/                         # Static files
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── next.config.ts                  # Next.js config
├── vitest.config.ts                # Vitest config
└── playwright.config.cts           # Playwright config
```

---

## 🗄️ Veritabanı Şeması

Convex veritabanı şeması `convex/schema.ts` dosyasında tanımlanmıştır. Tüm collection'lar ve ilişkiler aşağıda detaylandırılmıştır.

### Collections

#### 1. users (Kullanıcılar)

Sistem kullanıcılarını saklar.

**Alanlar:**
- `name` (string): Kullanıcı adı
- `email` (string): Email adresi (unique)
- `role` (string): Kullanıcı rolü (UserRole enum)
- `avatar` (string, optional): Profil fotoğrafı URL
- `isActive` (boolean): Aktif/pasif durumu
- `labels` (array<string>, optional): Kullanıcı etiketleri
- `createdAt` (string, optional): Oluşturulma tarihi
- `lastLogin` (string, optional): Son giriş tarihi
- `passwordHash` (string, optional): Şifrelenmiş parola

**İndeksler:**
- `by_email`: Email ile arama
- `by_role`: Role göre filtreleme

**Roller:**
- `SUPER_ADMIN`: Tam yetki
- `ADMIN`: Yönetici
- `MANAGER`: Müdür
- `MEMBER`: Üye
- `VIEWER`: Görüntüleyici
- `VOLUNTEER`: Gönüllü

---

#### 2. beneficiaries (İhtiyaç Sahipleri)

Yardım alan kişilerin bilgilerini saklar.

**Temel Bilgiler:**
- `name` (string): Ad soyad
- `tc_no` (string): TC Kimlik No (11 digit, unique)
- `phone` (string): Telefon numarası
- `email` (string, optional): Email adresi
- `birth_date` (string, optional): Doğum tarihi
- `gender` (string, optional): Cinsiyet
- `nationality` (string, optional): Uyruk
- `religion` (string, optional): Din

**Adres Bilgileri:**
- `address` (string): Tam adres
- `city` (string): Şehir
- `district` (string): İlçe
- `neighborhood` (string): Mahalle

**Aile Bilgileri:**
- `marital_status` (string, optional): Medeni durum
- `family_size` (number): Aile büyüklüğü
- `children_count` (number, optional): Çocuk sayısı
- `orphan_children_count` (number, optional): Yetim çocuk sayısı
- `elderly_count` (number, optional): Yaşlı sayısı
- `disabled_count` (number, optional): Engelli sayısı

**Ekonomik Durum:**
- `income_level` (string, optional): Gelir seviyesi
- `income_source` (string, optional): Gelir kaynağı
- `has_debt` (boolean, optional): Borç durumu
- `housing_type` (string, optional): Konut tipi
- `has_vehicle` (boolean, optional): Araç sahipliği

**Sağlık Bilgileri:**
- `health_status` (string, optional): Sağlık durumu
- `has_chronic_illness` (boolean, optional): Kronik hastalık
- `chronic_illness_detail` (string, optional): Kronik hastalık detayı
- `has_disability` (boolean, optional): Engellilik durumu
- `disability_detail` (string, optional): Engellilik detayı
- `has_health_insurance` (boolean, optional): Sağlık sigortası
- `regular_medication` (string, optional): Düzenli ilaç kullanımı

**Eğitim ve İş:**
- `education_level` (string, optional): Eğitim seviyesi
- `occupation` (string, optional): Meslek
- `employment_status` (string, optional): İstihdam durumu

**Yardım Bilgileri:**
- `aid_type` (string, optional): Yardım tipi
- `totalAidAmount` (number, optional): Toplam yardım miktarı
- `aid_duration` (string, optional): Yardım süresi
- `priority` (string, optional): Öncelik seviyesi
- `previous_aid` (boolean, optional): Önceki yardım
- `other_organization_aid` (boolean, optional): Başka kuruluştan yardım
- `emergency` (boolean, optional): Acil durum

**Durum:**
- `status` (union): `TASLAK` | `AKTIF` | `PASIF` | `SILINDI`
- `approval_status` (union, optional): `pending` | `approved` | `rejected`
- `approved_by` (string, optional): Onaylayan kişi
- `approved_at` (string, optional): Onay tarihi

**İndeksler:**
- `by_tc_no`: TC Kimlik No ile arama
- `by_status`: Durum filtreleme
- `by_city`: Şehir filtreleme

---

#### 3. donations (Bağışlar)

Bağış kayıtlarını saklar.

**Bağışçı Bilgileri:**
- `donor_name` (string): Bağışçı adı
- `donor_phone` (string): Bağışçı telefonu
- `donor_email` (string, optional): Bağışçı email

**Bağış Detayları:**
- `amount` (number): Bağış miktarı
- `currency` (union): `TRY` | `USD` | `EUR`
- `donation_type` (string): Bağış tipi
- `payment_method` (string): Ödeme yöntemi
- `donation_purpose` (string): Bağış amacı
- `notes` (string, optional): Notlar

**Makbuz:**
- `receipt_number` (string): Makbuz numarası (unique)
- `receipt_file_id` (string, optional): Makbuz dosya ID

**Durum:**
- `status` (union): `pending` | `completed` | `cancelled`

**Kumbara Alanları:**
- `is_kumbara` (boolean, optional): Kumbara bağışı mı?
- `kumbara_location` (string, optional): Kumbara konumu
- `collection_date` (string, optional): Toplama tarihi
- `kumbara_institution` (string, optional): Kumbara kurumu
- `location_coordinates` (object, optional): Konum koordinatları
- `location_address` (string, optional): Konum adresi
- `route_points` (array, optional): Rota noktaları
- `route_distance` (number, optional): Rota mesafesi
- `route_duration` (number, optional): Rota süresi

**İndeksler:**
- `by_status`: Durum filtreleme
- `by_donor_email`: Email ile arama
- `by_receipt_number`: Makbuz numarası ile arama
- `by_is_kumbara`: Kumbara bağışları
- `by_kumbara_location`: Kumbara konumu

---

#### 4. tasks (Görevler)

Görev yönetimi için kullanılır.

**Alanlar:**
- `title` (string): Görev başlığı
- `description` (string, optional): Açıklama
- `assigned_to` (id<users>, optional): Atanan kişi
- `created_by` (id<users>): Oluşturan kişi
- `priority` (union): `low` | `normal` | `high` | `urgent`
- `status` (union): `pending` | `in_progress` | `completed` | `cancelled`
- `due_date` (string, optional): Bitiş tarihi
- `completed_at` (string, optional): Tamamlanma tarihi
- `category` (string, optional): Kategori
- `tags` (array<string>, optional): Etiketler
- `is_read` (boolean): Okundu mu?

**İndeksler:**
- `by_assigned_to`: Atanan kişiye göre
- `by_status`: Durum filtreleme
- `by_created_by`: Oluşturan kişiye göre

---

#### 5. meetings (Toplantılar)

Toplantı kayıtlarını saklar.

**Alanlar:**
- `title` (string): Toplantı başlığı
- `description` (string, optional): Açıklama
- `meeting_date` (string): Toplantı tarihi
- `location` (string, optional): Konum
- `organizer` (id<users>): Organizatör
- `participants` (array<id<users>>): Katılımcılar
- `status` (union): `scheduled` | `ongoing` | `completed` | `cancelled`
- `meeting_type` (union): `general` | `committee` | `board` | `other`
- `agenda` (string, optional): Gündem
- `notes` (string, optional): Notlar

**İndeksler:**
- `by_organizer`: Organizatöre göre
- `by_status`: Durum filtreleme
- `by_meeting_date`: Tarihe göre

---

#### 6. messages (Mesajlar)

İç mesajlaşma sistemi.

**Alanlar:**
- `message_type` (union): `sms` | `email` | `internal`
- `sender` (id<users>): Gönderen
- `recipients` (array<id<users>>): Alıcılar
- `subject` (string, optional): Konu
- `content` (string): İçerik
- `sent_at` (string, optional): Gönderim tarihi
- `status` (union): `draft` | `sent` | `failed`
- `is_bulk` (boolean): Toplu mesaj mı?
- `template_id` (string, optional): Şablon ID

**İndeksler:**
- `by_sender`: Gönderene göre
- `by_status`: Durum filtreleme

---

#### 7. aid_applications (Yardım Başvuruları)

Yardım başvuru süreçlerini yönetir.

**Alanlar:**
- `application_date` (string): Başvuru tarihi
- `applicant_type` (union): `person` | `organization` | `partner`
- `applicant_name` (string): Başvuran adı
- `beneficiary_id` (id<beneficiaries>, optional): İhtiyaç sahibi ID
- `one_time_aid` (number, optional): Tek seferlik yardım
- `regular_financial_aid` (number, optional): Düzenli nakdi yardım
- `regular_food_aid` (number, optional): Düzenli gıda yardımı
- `in_kind_aid` (number, optional): Ayni yardım
- `service_referral` (number, optional): Hizmet yönlendirme
- `stage` (union): `draft` | `under_review` | `approved` | `ongoing` | `completed`
- `status` (union): `open` | `closed`
- `description` (string, optional): Açıklama
- `notes` (string, optional): Notlar
- `priority` (union, optional): `low` | `normal` | `high` | `urgent`
- `processed_by` (id<users>, optional): İşleyen kişi
- `processed_at` (string, optional): İşlem tarihi
- `approved_by` (id<users>, optional): Onaylayan
- `approved_at` (string, optional): Onay tarihi
- `completed_at` (string, optional): Tamamlanma tarihi

**İndeksler:**
- `by_beneficiary`: İhtiyaç sahibine göre
- `by_stage`: Aşamaya göre
- `by_status`: Duruma göre

---

#### 8. finance_records (Finans Kayıtları)

Gelir ve gider kayıtları.

**Alanlar:**
- `record_type` (union): `income` | `expense`
- `category` (string): Kategori
- `amount` (number): Tutar
- `currency` (union): `TRY` | `USD` | `EUR`
- `description` (string): Açıklama
- `transaction_date` (string): İşlem tarihi
- `payment_method` (string, optional): Ödeme yöntemi
- `receipt_number` (string, optional): Makbuz numarası
- `receipt_file_id` (string, optional): Makbuz dosya ID
- `related_to` (string, optional): İlişkili kayıt
- `created_by` (id<users>): Oluşturan
- `approved_by` (id<users>, optional): Onaylayan
- `status` (union): `pending` | `approved` | `rejected`

**İndeksler:**
- `by_record_type`: Kayıt tipine göre
- `by_status`: Duruma göre
- `by_created_by`: Oluşturana göre

---

#### 9. files (Dosyalar)

Yüklenen dosyaların metadata'sını saklar.

**Alanlar:**
- `fileName` (string): Dosya adı
- `fileSize` (number): Dosya boyutu
- `fileType` (string): Dosya tipi (MIME type)
- `bucket` (string): Bucket adı
- `storageId` (id<_storage>): Convex fileStorage ID
- `uploadedBy` (id<users>, optional): Yükleyen
- `uploadedAt` (string): Yüklenme tarihi
- `beneficiary_id` (id<beneficiaries>, optional): İlişkili ihtiyaç sahibi
- `document_type` (string, optional): Belge tipi

**İndeksler:**
- `by_storage_id`: Storage ID ile arama
- `by_bucket`: Bucket'a göre
- `by_uploaded_by`: Yükleyene göre
- `by_beneficiary`: İhtiyaç sahibine göre

---

#### 10. partners (Ortaklar)

Partner kuruluşlar ve bağışçılar.

**Alanlar:**
- `name` (string): İsim
- `type` (union): `organization` | `individual` | `sponsor`
- `contact_person` (string, optional): İletişim kişisi
- `email` (string, optional): Email
- `phone` (string, optional): Telefon
- `address` (string, optional): Adres
- `website` (string, optional): Website
- `tax_number` (string, optional): Vergi numarası
- `partnership_type` (union): `donor` | `supplier` | `volunteer` | `sponsor` | `service_provider`
- `collaboration_start_date` (string, optional): İşbirliği başlangıç
- `collaboration_end_date` (string, optional): İşbirliği bitiş
- `notes` (string, optional): Notlar
- `status` (union): `active` | `inactive` | `pending`
- `total_contribution` (number, optional): Toplam katkı
- `contribution_count` (number, optional): Katkı sayısı
- `logo_url` (string, optional): Logo URL

**İndeksler:**
- `by_type`: Tip'e göre
- `by_status`: Duruma göre
- `by_partnership_type`: İşbirliği tipine göre
- `by_name`: İsme göre

---

#### 11. consents (Rıza Beyanları)

Kişisel veri işleme rıza beyanları.

**Alanlar:**
- `beneficiary_id` (id<beneficiaries>): İhtiyaç sahibi
- `consent_type` (string): Rıza tipi
- `consent_text` (string): Rıza metni
- `status` (union): `active` | `revoked` | `expired`
- `signed_at` (string): İmza tarihi
- `signed_by` (string, optional): İmzalayan
- `expires_at` (string, optional): Geçerlilik süresi
- `created_by` (id<users>, optional): Oluşturan
- `notes` (string, optional): Notlar

**İndeksler:**
- `by_beneficiary`: İhtiyaç sahibine göre
- `by_status`: Duruma göre

---

#### 12. bank_accounts (Banka Hesapları)

İhtiyaç sahiplerinin banka hesapları.

**Alanlar:**
- `beneficiary_id` (id<beneficiaries>): İhtiyaç sahibi
- `bank_name` (string): Banka adı
- `account_holder` (string): Hesap sahibi
- `account_number` (string): Hesap numarası
- `iban` (string, optional): IBAN
- `branch_name` (string, optional): Şube adı
- `branch_code` (string, optional): Şube kodu
- `account_type` (union): `checking` | `savings` | `other`
- `currency` (union): `TRY` | `USD` | `EUR`
- `is_primary` (boolean, optional): Ana hesap mı?
- `status` (union): `active` | `inactive` | `closed`
- `notes` (string, optional): Notlar

**İndeksler:**
- `by_beneficiary`: İhtiyaç sahibine göre
- `by_status`: Duruma göre

---

#### 13. dependents (Baktığı Kişiler)

İhtiyaç sahiplerinin baktığı kişiler (çocuk, eş, yaşlı vb.).

**Alanlar:**
- `beneficiary_id` (id<beneficiaries>): İhtiyaç sahibi (sorumlu)
- `name` (string): İsim
- `relationship` (string): İlişki (`spouse`, `child`, `parent`, `sibling`, `other`)
- `birth_date` (string, optional): Doğum tarihi
- `gender` (string, optional): Cinsiyet
- `tc_no` (string, optional): TC Kimlik No
- `phone` (string, optional): Telefon
- `education_level` (string, optional): Eğitim seviyesi
- `occupation` (string, optional): Meslek
- `health_status` (string, optional): Sağlık durumu
- `has_disability` (boolean, optional): Engellilik
- `disability_detail` (string, optional): Engellilik detayı
- `monthly_income` (number, optional): Aylık gelir
- `notes` (string, optional): Notlar

**İndeksler:**
- `by_beneficiary`: İhtiyaç sahibine göre
- `by_relationship`: İlişkiye göre

---

#### 14. system_settings (Sistem Ayarları)

Sistem konfigürasyon ayarları.

**Alanlar:**
- `category` (string): Kategori (`organization`, `email`, `notifications`, `system`, `security`, `appearance`, `integrations`, `reports`)
- `key` (string): Ayar anahtarı (unique)
- `value` (any): Ayar değeri
- `description` (string, optional): Açıklama
- `data_type` (union): `string` | `number` | `boolean` | `object` | `array`
- `is_sensitive` (boolean, optional): Hassas veri mi?
- `updated_by` (id<users>, optional): Güncelleyen
- `updated_at` (string): Güncellenme tarihi

**İndeksler:**
- `by_category`: Kategoriye göre
- `by_key`: Anahtara göre
- `by_category_key`: Kategori + Anahtar

---

#### 15. parameters (Parametreler)

Sistem parametreleri ve dropdown değerleri.

**Alanlar:**
- `category` (string): Kategori
- `name_tr` (string): Türkçe isim
- `name_en` (string, optional): İngilizce isim
- `name_ar` (string, optional): Arapça isim
- `name_ru` (string, optional): Rusça isim
- `name_fr` (string, optional): Fransızca isim
- `value` (string): Değer
- `order` (number): Sıralama
- `is_active` (boolean): Aktif mi?

**İndeksler:**
- `by_category`: Kategoriye göre
- `by_value`: Değere göre

---

### Veritabanı İlişkileri

#### Kullanıcı İlişkileri
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

#### İhtiyaç Sahibi İlişkileri
- `aid_applications.beneficiary_id` → `beneficiaries._id`
- `consents.beneficiary_id` → `beneficiaries._id`
- `bank_accounts.beneficiary_id` → `beneficiaries._id`
- `dependents.beneficiary_id` → `beneficiaries._id`
- `files.beneficiary_id` → `beneficiaries._id`

---

## 🔌 API Dokümantasyonu

### Authentication Endpoints

#### POST `/api/auth/login`

Kullanıcı girişi.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN"
  }
}
```

#### POST `/api/auth/logout`

Kullanıcı çıkışı.

**Response:**
```json
{
  "success": true
}
```

#### GET `/api/auth/session`

Mevcut session bilgisi.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN"
  }
}
```

---

### Beneficiaries Endpoints

#### GET `/api/beneficiaries`

İhtiyaç sahiplerini listele.

**Query Parameters:**
- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına kayıt
- `search` (string): Arama metni
- `status` (string): Durum filtreleme
- `city` (string): Şehir filtreleme

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "beneficiary_id",
      "name": "Ahmet Yılmaz",
      "tc_no": "12345678901",
      "phone": "5551234567",
      "status": "AKTIF",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET `/api/beneficiaries/[id]`

Belirli bir ihtiyaç sahibini getir.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "beneficiary_id",
    "name": "Ahmet Yılmaz",
    ...
  }
}
```

#### POST `/api/beneficiaries`

Yeni ihtiyaç sahibi oluştur.

**Request Body:**
```json
{
  "name": "Ahmet Yılmaz",
  "tc_no": "12345678901",
  "phone": "5551234567",
  "address": "Adres",
  "city": "İstanbul",
  "district": "Kadıköy",
  "neighborhood": "Fenerbahçe",
  "family_size": 4,
  ...
}
```

#### PUT `/api/beneficiaries/[id]`

İhtiyaç sahibi güncelle.

#### DELETE `/api/beneficiaries/[id]`

İhtiyaç sahibi sil (soft delete).

---

### Donations Endpoints

#### GET `/api/donations`

Bağışları listele.

**Query Parameters:**
- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına kayıt
- `status` (string): Durum filtreleme
- `donor_email` (string): Bağışçı email filtreleme

#### GET `/api/donations/[id]`

Belirli bir bağışı getir.

#### POST `/api/donations`

Yeni bağış oluştur.

**Request Body:**
```json
{
  "donor_name": "Bağışçı Adı",
  "donor_phone": "5551234567",
  "amount": 1000,
  "currency": "TRY",
  "donation_type": "Nakit",
  "payment_method": "Banka Transferi",
  "donation_purpose": "Genel Yardım",
  ...
}
```

#### PUT `/api/donations/[id]`

Bağış güncelle.

#### DELETE `/api/donations/[id]`

Bağış sil.

---

### Tasks Endpoints

#### GET `/api/tasks`

Görevleri listele.

**Query Parameters:**
- `status` (string): Durum filtreleme
- `assigned_to` (string): Atanan kişi ID
- `created_by` (string): Oluşturan kişi ID

#### POST `/api/tasks`

Yeni görev oluştur.

**Request Body:**
```json
{
  "title": "Görev Başlığı",
  "description": "Görev açıklaması",
  "assigned_to": "user_id",
  "priority": "high",
  "due_date": "2025-02-01",
  ...
}
```

---

### Meetings Endpoints

#### GET `/api/meetings`

Toplantıları listele.

#### POST `/api/meetings`

Yeni toplantı oluştur.

---

### Messages Endpoints

#### GET `/api/messages`

Mesajları listele.

#### POST `/api/messages`

Yeni mesaj gönder.

---

### Storage Endpoints

#### POST `/api/storage/upload`

Dosya yükle.

**Request:** `multipart/form-data`
- `file`: Dosya
- `bucket`: Bucket adı
- `beneficiary_id` (optional): İlişkili ihtiyaç sahibi

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_id",
    "fileName": "document.pdf",
    "fileSize": 1024,
    "fileType": "application/pdf",
    "url": "https://..."
  }
}
```

#### GET `/api/storage/[fileId]`

Dosya indir/önizle.

#### DELETE `/api/storage/[fileId]`

Dosya sil.

---

### Health Check

#### GET `/api/health`

Sistem sağlık kontrolü.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "services": {
    "convex": "connected",
    "database": "healthy"
  }
}
```

---

## 📄 Sayfa Yapısı ve Özellikler

### Tamamlanmış Sayfalar (12 Sayfa)

#### 1. Ana Sayfa (`/genel`)
- Dashboard görünümü
- İstatistikler (bağışlar, ihtiyaç sahipleri, görevler)
- Grafikler ve görselleştirmeler
- Hızlı erişim butonları

#### 2. Bağış Yönetimi
- **`/bagis/liste`**: Bağış listesi, filtreleme, arama
- **`/bagis/kumbara`**: Kumbara takip sistemi, harita entegrasyonu, QR kod

#### 3. Yardım Programları
- **`/yardim/ihtiyac-sahipleri`**: İhtiyaç sahipleri listesi, detay sayfası, form
- **`/yardim/basvurular`**: Yardım başvuruları, onay süreci

#### 4. İletişim
- **`/mesaj/kurum-ici`**: Kurum içi mesajlaşma
- **`/mesaj/toplu`**: Toplu mesaj gönderme

#### 5. İş Yönetimi
- **`/is/gorevler`**: Kanban tarzı görev yönetimi
- **`/is/toplantilar`**: Toplantı yönetimi, takvim

#### 6. Kullanıcı Yönetimi
- **`/kullanici`**: Kullanıcı listesi, rol yönetimi

#### 7. Sistem Ayarları
- **`/settings`**: Sistem ayarları
- **`/ayarlar/parametreler`**: Parametre yönetimi

---

### Placeholder Sayfalar (8 Sayfa)

#### 1. Bağış Raporları (`/bagis/raporlar`)
**Durum:** Kısmen çalışıyor (raporlama var, PDF export eksik)  
**Eksiklikler:**
- PDF export fonksiyonu
- Gelişmiş grafikler
- Karşılaştırmalı raporlar

#### 2. Yardım Listesi (`/yardim/liste`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Yardım kayıt sistemi
- Detaylı yardım takibi
- Kategori bazlı listeleme
- Dağıtım raporları

#### 3. Nakdi Vezne (`/yardim/nakdi-vezne`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Kasa giriş-çıkış takibi
- Nakit yardım dağıtımı
- Günlük kasa raporu
- Bütçe kontrolü

#### 4. Öğrenci Listesi (`/burs/ogrenciler`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Öğrenci kayıt sistemi
- Burs ödemeleri takibi
- Akademik başarı izleme

#### 5. Burs Başvuruları (`/burs/basvurular`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Başvuru formu sistemi
- Başvuru değerlendirme
- Belge yükleme
- Onay süreci yönetimi

#### 6. Yetim Öğrenciler (`/burs/yetim`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Yetim öğrenci kayıtları
- Sponsor eşleştirme
- Düzenli destek takibi

#### 7. Gelir Gider (`/fon/gelir-gider`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Gelir kayıt sistemi
- Gider takibi
- Kategori bazlı raporlama
- Bütçe planlaması

#### 8. Finans Raporları (`/fon/raporlar`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Aylık mali raporlar
- Yıllık finansal özet
- Gelir-gider karşılaştırması
- PDF rapor çıktısı

#### 9. Ortak Listesi (`/partner/liste`)
**Durum:** Placeholder  
**Planlanan Özellikler:**
- Partner kuruluş listesi
- İşbirliği takibi
- Katkı analizi

---

## 👥 Kullanıcı Rolleri ve Yetkilendirme

### Rol Hiyerarşisi

1. **SUPER_ADMIN**: Tüm yetkilere sahip
2. **ADMIN**: Yönetimsel işlemler
3. **MANAGER**: İş operasyonları
4. **MEMBER**: Standart kullanıcı
5. **VIEWER**: Sadece okuma
6. **VOLUNTEER**: Sınırlı yetkiler

### Yetki Matrisi

| İşlem | SUPER_ADMIN | ADMIN | MANAGER | MEMBER | VIEWER | VOLUNTEER |
|-------|-------------|-------|---------|--------|--------|-----------|
| Dashboard Görüntüleme | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kullanıcı Yönetimi | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Bağış Oluşturma | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Bağış Onaylama | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| İhtiyaç Sahibi Oluşturma | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| İhtiyaç Sahibi Güncelleme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Yardım Başvurusu Onaylama | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Görev Atama | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Toplu Mesaj Gönderme | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Finansal İşlemler | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Sistem Ayarları | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Rapor Görüntüleme | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Rapor Export | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Permission System

Her rol, belirli permission'lara sahiptir:

- `dashboard:read`
- `users:read`, `users:create`, `users:update`, `users:delete`
- `donations:read`, `donations:create`, `donations:update`, `donations:delete`, `donations:approve`
- `beneficiaries:read`, `beneficiaries:create`, `beneficiaries:update`, `beneficiaries:delete`
- `aid_requests:read`, `aid_requests:create`, `aid_requests:update`, `aid_requests:approve`
- `scholarships:read`, `scholarships:create`, `scholarships:update`
- `messaging:read`, `messaging:send`, `messaging:bulk`
- `financial:read`, `financial:create`, `financial:update`
- `reports:read`, `reports:export`
- `settings:read`, `settings:update`

---

## 🔐 Güvenlik

### Authentication

- **Session Management**: Cookie-based sessions
- **Password Hashing**: bcryptjs (salt rounds: 10)
- **CSRF Protection**: Token-based CSRF koruması
- **Session Expiry**: Yapılandırılabilir (varsayılan: 7 gün)

### Authorization

- **Role-Based Access Control (RBAC)**: 6 farklı rol
- **Permission System**: Granüler yetki kontrolü
- **Middleware Protection**: Route-level yetki kontrolü
- **API Protection**: Header-based yetki doğrulama

### Input Validation

- **Client-Side**: Zod schemas ile form validation
- **Server-Side**: API route'larında tekrar validation
- **Sanitization**: XSS ve injection koruması
- **TC Kimlik No Validation**: 11 digit algoritma kontrolü
- **Phone Validation**: Türk telefon formatı kontrolü

### Security Headers

Next.js config'de tanımlı:

- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Content-Security-Policy`: Strict CSP

### Rate Limiting

API endpoint'leri için rate limiting:

- **Authentication**: 5 requests / 5 minutes
- **File Upload**: 10 uploads / minute
- **Data Modification**: 50 requests / 15 minutes
- **Read Operations**: 200 requests / 15 minutes

### File Upload Security

- **MIME Type Validation**: Sadece izin verilen türler
- **File Size Limit**: Maksimum 10MB
- **File Name Sanitization**: Güvenli dosya adları
- **Content Scanning**: Dosya içerik kontrolü

### Error Handling

- **Error Messages**: Hassas bilgi içermez
- **Logging**: Sentry ile error tracking
- **Error Boundaries**: React error boundaries

---

## 🧪 Test Stratejisi

### Unit Tests (Vitest)

**Kapsam:**
- Utility functions
- Validation schemas
- Sanitization functions
- Helper functions

**Komutlar:**
```bash
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:coverage     # Coverage report
```

**Test Dosyaları:**
- `src/__tests__/lib/sanitization.test.ts`
- `src/__tests__/lib/validations/*.test.ts`
- `src/__tests__/hooks/*.test.ts`

**Mevcut Durum:**
- 165+ unit test
- 146 passing
- 19 failing (mock API issues, blocking değil)

---

### Integration Tests

**Kapsam:**
- API routes
- Convex functions
- Database operations

**Komutlar:**
```bash
npm run test:run
```

---

### E2E Tests (Playwright)

**Kapsam:**
- Kullanıcı akışları
- Form gönderimleri
- Sayfa navigasyonu
- Kritik işlevler

**Test Senaryoları:**
- `e2e/auth.spec.ts`: Authentication flow
- `e2e/beneficiaries.spec.ts`: Beneficiary management
- `e2e/donations.spec.ts`: Donation flow
- `e2e/search.spec.ts`: Search functionality
- `e2e/settings.spec.ts`: Settings management

**Komutlar:**
```bash
npm run e2e              # Run all E2E tests
npm run e2e:ui           # Interactive UI
npx playwright test --headed  # Visible browser
```

**Mevcut Durum:**
- 25+ E2E test
- Tüm testler passing

---

### Test Coverage

**Hedef:** 90%+ code coverage

**Mevcut Coverage:**
- Sanitization: 100%
- Validations: 95%+
- Utilities: 85%+
- Components: 60%+ (geliştirme aşamasında)

---

## 🚀 Deployment

### Production Deployment

#### 1. Environment Setup

`.env.production` dosyası oluşturun:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
SESSION_SECRET=production-secret-min-32-chars
CSRF_SECRET=production-csrf-secret
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### 2. Convex Deployment

```bash
npx convex deploy --prod
```

#### 3. Build

```bash
npm run build
```

#### 4. Deploy

**Vercel (Önerilen):**
```bash
vercel --prod
```

**Railway:**
- `nixpacks.toml` dosyası mevcut
- Otomatik deploy

**Self-Hosted:**
```bash
npm run start
```

---

### Deployment Checklist

- [ ] Environment variables ayarlandı
- [ ] Convex backend deploy edildi
- [ ] Pre-deployment checks geçti
- [ ] Build başarılı
- [ ] Production build test edildi
- [ ] Health check endpoint çalışıyor
- [ ] Authentication çalışıyor
- [ ] Database bağlantısı başarılı
- [ ] Error tracking (Sentry) çalışıyor
- [ ] Analytics (GA) çalışıyor

---

## ❌ Eksiklikler ve Geliştirme Planı

### Kritik Eksiklikler

#### 1. Placeholder Sayfalar (8 Sayfa)
- **Öncelik:** Yüksek
- **Tahmini Süre:** 2-3 ay
- **Sayfalar:**
  - Yardım Listesi
  - Nakdi Vezne
  - Burs sayfaları (3 sayfa)
  - Finans sayfaları (2 sayfa)
  - Ortak Listesi

#### 2. SMS/Email Entegrasyonu
- **Durum:** Dokümantasyon var, implementasyon eksik
- **Öncelik:** Orta
- **Gereksinimler:**
  - SMS provider entegrasyonu
  - Email provider entegrasyonu
  - Template sistemi
  - Gönderim logları

#### 3. PDF Export
- **Durum:** Kısmen var (CSV export mevcut)
- **Öncelik:** Orta
- **Gereksinimler:**
  - PDF generation library
  - Template sistemi
  - Branding desteği

#### 4. Gelişmiş Raporlama
- **Durum:** Temel raporlama var
- **Öncelik:** Orta
- **Gereksinimler:**
  - Karşılaştırmalı raporlar
  - Custom rapor oluşturma
  - Scheduled reports

#### 5. Test Coverage Artırma
- **Durum:** %60-70 coverage
- **Öncelik:** Orta
- **Hedef:** %90+ coverage
- **Eksikler:**
  - Component tests
  - Integration tests
  - API route tests

---

### İyileştirme Önerileri

#### 1. Performance
- [ ] VirtualizedDataTable tüm listelerde kullanılmalı
- [ ] Image optimization
- [ ] Code splitting iyileştirmeleri
- [ ] Cache stratejileri optimizasyonu

#### 2. UX/UI
- [ ] Loading states iyileştirmeleri
- [ ] Error messages daha açıklayıcı
- [ ] Mobile responsiveness iyileştirmeleri
- [ ] Accessibility (a11y) iyileştirmeleri

#### 3. Features
- [ ] Notification system
- [ ] Activity log
- [ ] Audit trail
- [ ] Data export (Excel, PDF)
- [ ] Bulk operations
- [ ] Advanced search
- [ ] Filters ve sorting

#### 4. Security
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management iyileştirmeleri

#### 5. Documentation
- [ ] API dokümantasyonu (OpenAPI/Swagger)
- [ ] Component Storybook
- [ ] User guide
- [ ] Admin guide

---

## 🔧 Sorun Giderme

### Yaygın Sorunlar

#### 1. Application Not Loading

**Belirtiler:**
- Blank page
- 500 Internal Server Error
- Timeout errors

**Çözüm:**
1. Health check endpoint kontrol et: `curl http://localhost:3000/api/health`
2. Environment variables kontrol et
3. Convex bağlantısı kontrol et
4. Build errors kontrol et: `npm run build`

---

#### 2. Authentication Not Working

**Belirtiler:**
- Kullanıcı giriş yapamıyor
- Session hemen sona eriyor
- Redirect loops

**Çözüm:**
1. Session secret kontrol et (min 32 karakter)
2. CSRF token kontrol et: `/api/csrf`
3. Browser console'da hataları kontrol et
4. Convex auth configuration kontrol et

---

#### 3. Database Connection Issues

**Belirtiler:**
- Veri yüklenmiyor
- "Connection failed" hataları
- Boş listeler

**Çözüm:**
1. Convex URL kontrol et: `NEXT_PUBLIC_CONVEX_URL`
2. Convex dashboard'da deployment durumu kontrol et
3. Network bağlantısı kontrol et
4. Rate limiting kontrol et

---

#### 4. Build Errors

**Belirtiler:**
- TypeScript errors
- Module not found errors
- Build fails

**Çözüm:**
1. `npm run typecheck` ile TypeScript errors kontrol et
2. `npm run lint` ile linting errors kontrol et
3. `node_modules` temizle: `rm -rf node_modules && npm install`
4. Cache temizle: `npm run clean`

---

#### 5. File Upload Issues

**Belirtiler:**
- Dosya yüklenmiyor
- File size limit errors
- MIME type errors

**Çözüm:**
1. Dosya boyutu kontrol et (max 10MB)
2. Dosya tipi kontrol et (izin verilen MIME types)
3. CSRF token kontrol et
4. Convex storage configuration kontrol et

---

### Debug Komutları

```bash
# Health check
curl http://localhost:3000/api/health

# TypeScript check
npm run typecheck

# Lint check
npm run lint

# Test run
npm run test:run

# Build check
npm run build

# Convex status
npx convex dev
```

---

### Loglar

**Application Logs:**
- Console logs (development)
- Sentry (production)
- Platform-specific logs (Vercel, Railway, etc.)

**Convex Logs:**
- Convex Dashboard → Logs
- Real-time function execution logs

**Browser Logs:**
- Chrome DevTools → Console
- Network tab → API requests

---

## 📞 Destek ve İletişim

### Dokümantasyon

- **Bu Dokümantasyon**: Tüm teknik detaylar
- **README.md**: Hızlı başlangıç
- **Code Comments**: Inline dokümantasyon

### Hata Bildirimi

1. GitHub Issues oluştur
2. Sentry'de error logları kontrol et
3. Browser console hatalarını paylaş

### Geliştirme

- **Code Style**: ESLint + Prettier
- **Git Workflow**: Conventional commits
- **PR Process**: Code review required

---

## 📝 Sonuç

PORTAL, Türk derneklerinin kapsamlı yönetimi için geliştirilmiş modern bir sistemdir. MVP aşaması tamamlanmış, geliştirme devam etmektedir.

### Tamamlanma Durumu

- **Core Features**: %80 tamamlandı
- **Pages**: %60 tamamlandı (12/20 sayfa)
- **Tests**: %70 coverage
- **Documentation**: %90 tamamlandı

### Öncelikli Geliştirmeler

1. Placeholder sayfaların tamamlanması
2. SMS/Email entegrasyonu
3. PDF export
4. Test coverage artırma
5. Performance optimizasyonları

---

**Son Güncelleme:** 2025-01-27  
**Versiyon:** 1.0.0  
**Durum:** Aktif Geliştirme

