# Convex Backend Setup

Bu proje Convex backend kullanmaktadır.

## Referral

Bu proje Convex referral linkini kullanmaktadır:
https://convex.dev/referral/ISAA254432

## Kurulum

1. **Convex CLI ile Giriş:**
   ```bash
   npx convex dev
   ```

2. **Environment Variables:**
   `.env.local` dosyasında `NEXT_PUBLIC_CONVEX_URL` ayarlanmış olmalı.

3. **Development Modu:**
   ```bash
   npm run convex:dev
   ```

4. **Deploy:**
   ```bash
   npm run convex:deploy
   ```

## Kullanılabilir Fonksiyonlar

### Users (`convex/users.ts`)
- `list()` - Tüm kullanıcıları listele
- `get({ id })` - ID ile kullanıcı getir
- `getByEmail({ email })` - Email ile kullanıcı getir
- `create({ ... })` - Yeni kullanıcı oluştur
- `update({ id, ... })` - Kullanıcı güncelle
- `remove({ id })` - Kullanıcı sil

### Beneficiaries (`convex/beneficiaries.ts`)
- `list({ limit, skip, status, city, search })` - İhtiyaç sahiplerini listele
- `get({ id })` - ID ile getir
- `getByTcNo({ tc_no })` - TC No ile getir
- `create({ ... })` - Yeni ihtiyaç sahibi oluştur
- `update({ id, ... })` - Güncelle
- `remove({ id })` - Sil

### Donations (`convex/donations.ts`)
- `list({ limit, skip, status, donor_email })` - Bağışları listele
- `get({ id })` - ID ile getir
- `getByReceiptNumber({ receipt_number })` - Makbuz no ile getir
- `create({ ... })` - Yeni bağış oluştur
- `update({ id, ... })` - Güncelle
- `remove({ id })` - Sil

### Tasks (`convex/tasks.ts`)
- `list({ limit, skip, status, assigned_to, created_by })` - Görevleri listele
- `get({ id })` - ID ile getir
- `create({ ... })` - Yeni görev oluştur
- `update({ id, ... })` - Güncelle (completed_at otomatik set edilir)
- `remove({ id })` - Sil

### Meetings (`convex/meetings.ts`)
- `list({ limit, skip, status, organizer })` - Toplantıları listele
- `get({ id })` - ID ile getir
- `create({ ... })` - Yeni toplantı oluştur
- `update({ id, ... })` - Güncelle
- `remove({ id })` - Sil

### Messages (`convex/messages.ts`)
- `list({ limit, skip, status, sender })` - Mesajları listele
- `get({ id })` - ID ile getir
- `create({ ... })` - Yeni mesaj oluştur
- `update({ id, ... })` - Güncelle (sent_at otomatik set edilir)
- `remove({ id })` - Sil

## Next.js'de Kullanım

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  // Query kullanımı
  const beneficiaries = useQuery(api.beneficiaries.list, {
    limit: 10,
    status: "AKTIF",
  });

  // Mutation kullanımı
  const createBeneficiary = useMutation(api.beneficiaries.create);

  const handleCreate = async () => {
    await createBeneficiary({
      name: "Ahmet Yılmaz",
      tc_no: "12345678901",
      phone: "5551234567",
      // ... diğer alanlar
    });
  };

  return <div>...</div>;
}
```

## Dashboard

Convex Dashboard: https://dashboard.convex.dev/d/fleet-octopus-839

## Schema

Schema dosyası: `convex/schema.ts`

Değişiklik yaptıktan sonra:
```bash
npx convex dev
```

Bu komut schema değişikliklerini otomatik olarak deploy eder.
