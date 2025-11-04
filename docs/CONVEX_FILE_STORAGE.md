# Convex File Storage Implementation

Bu dokümantasyon, Convex fileStorage kullanarak dosya yükleme sisteminin nasıl implement edildiğini açıklar.

## Genel Bakış

Convex fileStorage, dosyaları güvenli bir şekilde saklamak ve erişmek için built-in bir sistem sağlar. Bu implementasyon, Convex'in fileStorage API'sini kullanarak dosya yükleme, indirme ve önizleme özelliklerini sağlar.

## Mimari

### 1. Upload İşlemi

```
Client → Next.js API Route → Convex Action (generateUploadUrl) → Upload URL
Client → Upload URL (POST) → Convex fileStorage → Storage ID
Client → Convex Mutation (storeFileMetadata) → Database
```

### 2. Download/Preview İşlemi

```
Client → Next.js API Route → Convex Query (getFileMetadata) → Metadata
Next.js API Route → Convex Query (getFileUrl) → File URL
Next.js API Route → Redirect to File URL
```

## Convex Functions

### `generateUploadUrl` (Action)
Convex fileStorage için bir upload URL'i oluşturur.

```typescript
export const generateUploadUrl = action(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
```

### `storeFileMetadata` (Mutation)
Başarılı bir upload sonrası dosya metadata'sını veritabanına kaydeder.

```typescript
export const storeFileMetadata = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    bucket: v.string(),
    storageId: v.id("_storage"),
    uploadedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Store metadata in files table
  },
});
```

### `getFileUrl` (Query)
Convex fileStorage'dan dosya URL'ini alır.

```typescript
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

### `deleteFile` (Action)
Convex fileStorage'dan dosyayı siler.

```typescript
export const deleteFile = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});
```

## API Endpoints

### POST `/api/storage/upload`
Dosya yükleme endpoint'i.

**Request:**
- `multipart/form-data`
- `file`: File object
- `bucket`: Optional bucket identifier (default: 'reports')

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "j123...",
    "storageId": "k456...",
    "fileUrl": "https://...",
    "bucketId": "receipts",
    "fileName": "receipt.pdf",
    "fileSize": 1024,
    "fileType": "application/pdf"
  }
}
```

### GET `/api/storage/files/[id]`
Dosya metadata'sını ve URL'ini döner.

**Query Parameters:**
- `download=true`: Download için redirect yapar

### GET `/api/storage/files/[id]/download`
Dosyayı indirmek için redirect yapar.

### GET `/api/storage/files/[id]/preview`
Dosyayı önizlemek için redirect yapar (browser inline görüntüleme).

## Schema

### Files Table

```typescript
files: defineTable({
  fileName: v.string(),
  fileSize: v.number(),
  fileType: v.string(),
  bucket: v.string(),
  storageId: v.id('_storage'), // Convex fileStorage ID
  uploadedBy: v.optional(v.id('users')),
  uploadedAt: v.string(),
})
  .index('by_storage_id', ['storageId'])
  .index('by_bucket', ['bucket'])
  .index('by_uploaded_by', ['uploadedBy']),
```

## Kullanım Örneği

### Frontend'den Dosya Yükleme

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('bucket', 'receipts');

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
const fileId = result.data.fileId;
```

### Dosya Görüntüleme

```typescript
// Preview
window.open(`/api/storage/files/${fileId}`, '_blank');

// Download
window.open(`/api/storage/files/${fileId}?download=true`, '_blank');
```

## Güvenlik

1. **Authentication**: Tüm upload endpoint'leri authentication gerektirir
2. **File Validation**: Dosya boyutu (max 10MB) ve tip kontrolü yapılır
3. **CSRF Protection**: Upload endpoint'i CSRF koruması altındadır
4. **Bucket Isolation**: Farklı bucket'lar için ayrı erişim kontrolü yapılabilir

## Desteklenen Dosya Tipleri

- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Spreadsheets: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## Limitler

- **Max File Size**: 10MB
- **Storage**: Convex fileStorage limitleri (plan'a göre değişir)

## Notlar

- Convex fileStorage ID'leri `Id<"_storage">` tipindedir
- Upload URL'leri tek kullanımlıktır (single-use)
- File URL'leri otomatik olarak expire olur (Convex tarafından yönetilir)
- Metadata silinirken, fileStorage'dan dosya da silinmeli (deleteFile action kullanılmalı)

## Gelecek İyileştirmeler

- [ ] File versioning desteği
- [ ] Image optimization/resizing
- [ ] Thumbnail generation
- [ ] Batch upload support
- [ ] Upload progress tracking
- [ ] File access permissions/ACL

