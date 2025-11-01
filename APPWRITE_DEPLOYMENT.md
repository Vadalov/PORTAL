# Appwrite Deployment Ayarları / Appwrite Deployment Configuration

Bu doküman, PORTAL projesinin Appwrite backend yapılandırmasını ve dağıtımını (deployment) açıklar.

This document explains the Appwrite backend configuration and deployment for the PORTAL project.

---

## ⚡ Hızlı Başlangıç / Quick Start

```bash
# 1. Environment değişkenlerini ayarla / Setup environment variables
cp .env.example .env.local
# Edit .env.local and add your Appwrite credentials

# 2. Konfigürasyonu doğrula / Validate configuration
npm run appwrite:validate

# 3. Otomatik kurulum / Automatic setup (Recommended)
npm run appwrite:setup

# Or interactive deployment
npm run appwrite:deploy:quick
```

**📌 Detaylı adımlar için aşağıdaki bölümleri okuyun / Read sections below for detailed steps**

---

## 📋 İçindekiler / Table of Contents

- [Gereksinimler / Prerequisites](#gereksinimler--prerequisites)
- [Kurulum / Installation](#kurulum--installation)
- [Yapılandırma / Configuration](#yapılandırma--configuration)
- [Deployment](#deployment)
- [Komutlar / Commands](#komutlar--commands)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Gereksinimler / Prerequisites

### Yazılım / Software

- Node.js 22+
- npm 10+
- Appwrite Cloud hesabı veya self-hosted Appwrite instance
- Git

### Appwrite Proje Bilgileri / Appwrite Project Info

Aşağıdaki bilgilere ihtiyacınız var:

- **Project ID**: Appwrite projenizin ID'si
- **API Endpoint**: `https://cloud.appwrite.io/v1` (Appwrite Cloud için) veya kendi endpoint'iniz
- **API Key**: Server-side işlemler için API key (Appwrite Console'dan oluşturun)

---

## 📦 Kurulum / Installation

### 1. Appwrite CLI Kurulumu / Install Appwrite CLI

Proje bağımlılıkları ile birlikte gelir:

```bash
npm install
```

Veya global olarak yükleyin:

```bash
npm install -g appwrite-cli
```

### 2. Ortam Değişkenlerini Ayarlama / Setup Environment Variables

`.env.local` dosyanızı oluşturun (`.env.example`'dan kopyalayın):

```bash
cp .env.example .env.local
```

Aşağıdaki değişkenleri doldurun:

```env
# Backend Provider
BACKEND_PROVIDER=appwrite
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite

# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_DATABASE_ID=dernek_db

# Server-side API Key (NEVER expose to client!)
APPWRITE_API_KEY=your_api_key_here

# Storage Buckets
NEXT_PUBLIC_STORAGE_DOCUMENTS=documents
NEXT_PUBLIC_STORAGE_RECEIPTS=receipts
NEXT_PUBLIC_STORAGE_PHOTOS=photos
NEXT_PUBLIC_STORAGE_REPORTS=reports
```

---

## ⚙️ Yapılandırma / Configuration

### appwrite.json Dosyası

Proje kökünde `appwrite.json` dosyası bulunur. Bu dosya tüm Appwrite yapılandırmasını içerir:

- **Veritabanı şeması**: Tüm collection tanımları
- **Özellikler (Attributes)**: Her collection için field tanımları
- **İndeksler (Indexes)**: Performans için index'ler
- **Storage buckets**: Dosya depolama alanları

### Manuel Düzenleme

`appwrite.json` dosyasını düzenlerken:

1. **projectId**: Kendi Appwrite project ID'nizi girin
2. **Collection ID'leri**: Değiştirmeyin (kod içinde kullanılıyor)
3. **Attribute boyutları**: İhtiyaca göre ayarlayabilirsiniz
4. **Storage limitleri**: `maximumFileSize` ve `allowedFileExtensions`

---

## 🚀 Deployment

### Seçenek 1: Otomatik Kurulum (Önerilen)

Tüm collection'ları ve bucket'ları otomatik oluşturur:

```bash
npm run appwrite:setup
```

Bu komut:

- ✅ Veritabanını oluşturur
- ✅ Tüm collection'ları oluşturur
- ✅ Attribute'ları ekler
- ✅ Index'leri oluşturur
- ✅ Storage bucket'larını oluşturur

### Seçenek 2: Appwrite CLI ile Deploy

#### 2.1. Appwrite CLI'ye Giriş

```bash
# Appwrite Cloud için
npx appwrite login

# Self-hosted için
npx appwrite login --endpoint "https://your-appwrite-url/v1"
```

#### 2.2. Proje Bağlantısı

```bash
# Mevcut bir projeye bağlan
npx appwrite init project

# appwrite.json dosyasındaki projectId'yi güncelleyin
```

#### 2.3. Deploy

```bash
# Tüm yapılandırmayı deploy et
npm run appwrite:deploy

# Veya manuel olarak
npx appwrite deploy collection
npx appwrite deploy bucket
```

### Seçenek 3: Manuel Kurulum

Appwrite Console'dan manuel olarak:

1. **Database Oluştur**: `dernek_db` adında database oluşturun
2. **Collection'ları Oluştur**: Her collection için `appwrite.json`'daki tanımları kullanın
3. **Attribute'ları Ekle**: Her collection için attribute'ları ekleyin
4. **Index'leri Oluştur**: Performance için gerekli index'leri oluşturun
5. **Bucket'ları Oluştur**: Storage için 4 bucket oluşturun (documents, receipts, photos, reports)

---

## 📝 Komutlar / Commands

### npm Scripts

```bash
# Appwrite backend'i otomatik kur
npm run appwrite:setup

# Appwrite CLI ile deploy
npm run appwrite:deploy

# Appwrite CLI başlangıç
npm run appwrite:init

# Bağlantıyı test et
npm run diagnose

# Config doğrulama
npm run validate:config
```

### Appwrite CLI Komutları

```bash
# Login
npx appwrite login

# Proje bilgilerini görüntüle
npx appwrite projects list

# Collection'ları listele
npx appwrite databases listCollections --databaseId dernek_db

# Bucket'ları listele
npx appwrite storage listBuckets

# Collection deploy
npx appwrite deploy collection

# Bucket deploy
npx appwrite deploy bucket

# Logout
npx appwrite logout
```

---

## 🗂️ Collection Yapısı / Collection Structure

Proje aşağıdaki collection'ları içerir:

| Collection ID      | Açıklama           | Ana Attribute'lar                           |
| ------------------ | ------------------ | ------------------------------------------- |
| `users`            | Kullanıcılar       | name, email, role, isActive                 |
| `beneficiaries`    | İhtiyaç Sahipleri  | firstName, lastName, identityNumber, status |
| `donations`        | Bağışlar           | donor_name, amount, currency, status        |
| `aid_requests`     | Yardım Talepleri   | beneficiary_id, request_type, status        |
| `aid_applications` | Yardım Başvuruları | applicant_name, stage, status               |
| `scholarships`     | Burslar            | student_name, scholarship_amount, status    |
| `parameters`       | Parametreler       | category, name_tr, value                    |
| `tasks`            | Görevler           | title, status, assigned_to                  |
| `meetings`         | Toplantılar        | title, meeting_date, status                 |
| `messages`         | Mesajlar           | subject, content, sender, status            |
| `finance_records`  | Mali Kayıtlar      | type, amount, date                          |
| `orphans`          | Yetimler           | name, birth_date, status                    |
| `sponsors`         | Sponsorlar         | name, type, status                          |
| `campaigns`        | Kampanyalar        | title, target_amount, status                |

---

## 💾 Storage Buckets

| Bucket ID   | Açıklama       | Max Size | Dosya Türleri                  |
| ----------- | -------------- | -------- | ------------------------------ |
| `documents` | Genel Belgeler | 20 MB    | pdf, doc, docx, xls, xlsx, txt |
| `receipts`  | Makbuzlar      | 10 MB    | pdf, jpg, jpeg, png            |
| `photos`    | Fotoğraflar    | 10 MB    | jpg, jpeg, png, gif, webp      |
| `reports`   | Raporlar       | 50 MB    | pdf, xls, xlsx, csv            |

---

## 🔐 Güvenlik / Security

### İzinler / Permissions

Collection permission'ları varsayılan olarak:

- **Read**: `any()` - Herkes okuyabilir
- **Create**: `users()` - Authenticated kullanıcılar oluşturabilir
- **Update**: `users()` - Authenticated kullanıcılar güncelleyebilir
- **Delete**: `users()` - Authenticated kullanıcılar silebilir

⚠️ **Production'da** bu izinleri kısıtlayın!

### API Key Güvenliği

- ✅ API Key'i **SADECE** server-side kod içinde kullanın
- ✅ `.env.local` dosyasını git'e commit etmeyin
- ✅ API Key'i client-side kod veya browser'da EXPOSE ETMEYİN
- ✅ Environment variable olarak `APPWRITE_API_KEY` kullanın

---

## 🔍 Troubleshooting

### Bağlantı Sorunları / Connection Issues

```bash
# Appwrite bağlantısını test et
npm run diagnose

# Config'i doğrula
npm run validate:config
```

### Collection Oluşturulamıyor

**Problem**: "Collection already exists" hatası

**Çözüm**: Collection zaten mevcut. Silip tekrar oluşturun veya attribute'ları manuel ekleyin.

### API Key Hatası

**Problem**: "Invalid API Key" veya "API Key is required"

**Çözüm**:

1. Appwrite Console'dan yeni API Key oluşturun
2. `.env.local` dosyasında `APPWRITE_API_KEY` değişkenini güncelleyin
3. Uygulamayı yeniden başlatın

### Permission Hatası

**Problem**: "Permission denied" veya "Unauthorized"

**Çözüm**:

1. Appwrite Console'dan collection permission'larını kontrol edin
2. API Key'in gerekli scope'ları olduğundan emin olun
3. User authentication durumunu kontrol edin

### Attribute Size Hatası

**Problem**: "Attribute size exceeds limit"

**Çözüm**: `appwrite.json` dosyasında ilgili attribute'un `size` değerini artırın.

---

## 📚 Kaynaklar / Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite CLI Documentation](https://appwrite.io/docs/tooling/command-line)
- [Appwrite Node.js SDK](https://appwrite.io/docs/sdks#server)
- [Appwrite JavaScript SDK](https://appwrite.io/docs/sdks#client)
- [PORTAL Project Documentation](./README.md)

---

## 🤝 Destek / Support

Sorularınız için:

- GitHub Issues: [Vadalov/PORTAL/issues](https://github.com/Vadalov/PORTAL/issues)
- Appwrite Discord: [discord.gg/appwrite](https://discord.gg/appwrite)

---

## 📄 Lisans / License

MIT License - Detaylar için [LICENSE](./LICENSE) dosyasına bakın.
