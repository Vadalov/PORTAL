# 🔄 PORTAL - Yaygın İş Akışları & Kod Örnekleri

---

## 1️⃣ Yeni Sayfa Oluşturma

### Adım 1: Sayfa Dosyası Oluştur

```typescript
// src/app/(dashboard)/yardim/yeni-sayfa/page.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function YeniSayfaPage() {
  const data = useQuery(api.module.list);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Sayfa Başlığı</h1>
      {/* İçerik */}
    </div>
  );
}
```

### Adım 2: Navigation'a Ekle

```typescript
// src/config/navigation.ts
{
  id: 'yeni-modul',
  name: 'Yeni Modül',
  icon: IconComponent,
  permission: MODULE_PERMISSIONS.NEW_MODULE,
  subPages: [
    {
      name: 'Sayfa',
      href: '/yardim/yeni-sayfa',
      description: 'Açıklama'
    },
  ],
}
```

### Adım 3: Permission Ekle

```typescript
// src/types/permissions.ts
export const MODULE_PERMISSIONS = {
  // ...
  NEW_MODULE: 'new_module:read',
};
```

---

## 2️⃣ Form Oluşturma & Gönderme

### Adım 1: Zod Schema

```typescript
// src/lib/validations/myForm.ts
import { z } from 'zod';

export const myFormSchema = z.object({
  name: z.string().min(1, 'Ad gerekli'),
  email: z.string().email('Geçerli email'),
  phone: z.string().regex(/^\+90\d{10}$/, 'Geçerli telefon'),
});

export type MyFormInput = z.infer<typeof myFormSchema>;
```

### Adım 2: Form Bileşeni

```typescript
// src/components/forms/MyForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { myFormSchema, type MyFormInput } from '@/lib/validations/myForm';

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<MyFormInput>({
    resolver: zodResolver(myFormSchema),
  });

  const createItem = useMutation(api.module.create);

  const onSubmit = async (data: MyFormInput) => {
    try {
      await createItem(data);
      // Başarı mesajı
    } catch (error) {
      // Hata mesajı
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('name')}
          placeholder="Ad"
          className="w-full px-3 py-2 border rounded"
        />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Gönder
      </button>
    </form>
  );
}
```

### Adım 3: Convex Mutation

```typescript
// convex/module.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Validasyon
    if (!args.name || args.name.length < 1) {
      throw new Error('Ad gerekli');
    }

    // Veritabanına ekle
    const id = await ctx.db.insert('collection_name', {
      name: args.name,
      email: args.email,
      phone: args.phone,
      created_at: new Date().toISOString(),
    });

    return id;
  },
});
```

---

## 3️⃣ Veri Listesi Gösterme

### Adım 1: Convex Query

```typescript
// convex/module.ts
export const list = query({
  args: { skip: v.number(), take: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('collection_name')
      .filter((q) => q.eq(q.field('status'), 'AKTIF'))
      .skip(args.skip)
      .take(args.take)
      .collect();
  },
});
```

### Adım 2: Liste Bileşeni

```typescript
// src/components/tables/MyList.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

export function MyList() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const items = useQuery(api.module.list, {
    skip: page * pageSize,
    take: pageSize,
  });

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Ad</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => (
            <tr key={item._id} className="border">
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.email}</td>
              <td className="border p-2">
                <button>Düzenle</button>
                <button>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Önceki
        </button>
        <button onClick={() => setPage(p => p + 1)}>
          Sonraki
        </button>
      </div>
    </div>
  );
}
```

---

## 4️⃣ Arama Fonksiyonalitesi

### Adım 1: Convex Search Query

```typescript
// convex/module.ts
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('collection_name')
      .withSearchIndex('by_search', (q) => q.search('name', args.query))
      .collect();
  },
});
```

### Adım 2: Arama Bileşeni

```typescript
// src/components/SearchBox.tsx
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

export function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const results = useQuery(
    api.module.search,
    searchTerm ? { query: searchTerm } : 'skip'
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />

      {results && (
        <div className="mt-4">
          {results.map((item) => (
            <div key={item._id} className="p-2 border-b">
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 5️⃣ Güncelleme İşlemi

### Adım 1: Convex Mutation

```typescript
// convex/module.ts
export const update = mutation({
  args: {
    id: v.id('collection_name'),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error('Bulunamadı');

    await ctx.db.patch(args.id, {
      name: args.name,
      email: args.email,
      updated_at: new Date().toISOString(),
    });

    return args.id;
  },
});
```

### Adım 2: Güncelleme Formu

```typescript
// src/components/forms/EditForm.tsx
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { myFormSchema } from '@/lib/validations/myForm';

export function EditForm({ id }: { id: string }) {
  const item = useQuery(api.module.getById, { id });
  const updateItem = useMutation(api.module.update);
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(myFormSchema),
    values: item ? { name: item.name, email: item.email, phone: item.phone } : undefined,
  });

  const onSubmit = async (data: any) => {
    await updateItem({ id, ...data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('name')} className="w-full px-3 py-2 border rounded" />
      <input {...register('email')} className="w-full px-3 py-2 border rounded" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Güncelle
      </button>
    </form>
  );
}
```

---

## 6️⃣ Silme İşlemi

### Adım 1: Convex Mutation

```typescript
// convex/module.ts
export const remove = mutation({
  args: { id: v.id('collection_name') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
```

### Adım 2: Silme Butonu

```typescript
// src/components/DeleteButton.tsx
'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function DeleteButton({ id }: { id: string }) {
  const deleteItem = useMutation(api.module.remove);

  const handleDelete = async () => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      await deleteItem({ id });
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-3 py-1 rounded"
    >
      Sil
    </button>
  );
}
```

---

## 7️⃣ Dosya Yükleme

### Adım 1: Convex Storage

```typescript
// convex/storage.ts
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveFile = mutation({
  args: { storageId: v.string(), fileName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('documents', {
      fileName: args.fileName,
      storageId: args.storageId,
      uploadedBy: ctx.auth.getUserIdentity()?.tokenIdentifier,
      created_at: new Date().toISOString(),
    });
  },
});
```

### Adım 2: Upload Bileşeni

```typescript
// src/components/FileUpload.tsx
'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function FileUpload() {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveFile = useMutation(api.storage.saveFile);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    const { storageId } = await response.json();
    await saveFile({ storageId, fileName: file.name });
  };

  return (
    <input
      type="file"
      onChange={handleUpload}
      className="block w-full"
    />
  );
}
```

---

## 8️⃣ İzin Kontrolü

### Adım 1: Permission Check

```typescript
// src/lib/auth/permissions.ts
export function canAccess(userRole: string, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission) || rolePermissions.includes('admin:all');
}
```

### Adım 2: Protected Component

```typescript
// src/components/ProtectedComponent.tsx
'use client';

import { useAuthStore } from '@/stores/authStore';
import { canAccess } from '@/lib/auth/permissions';
import { MODULE_PERMISSIONS } from '@/types/permissions';

export function ProtectedComponent() {
  const user = useAuthStore((state) => state.user);

  if (!user || !canAccess(user.role, MODULE_PERMISSIONS.BENEFICIARIES)) {
    return <div>Erişim Reddedildi</div>;
  }

  return <div>Korumalı İçerik</div>;
}
```

---

## 9️⃣ Hata Yönetimi

### Adım 1: Error Boundary

```typescript
// src/components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Error caught by boundary', error);
  }, [error]);

  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded">
      <h2 className="font-bold">Bir hata oluştu</h2>
      <p>{error.message}</p>
      <button
        onClick={reset}
        className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
```

### Adım 2: Try-Catch

```typescript
try {
  await createItem(data);
  toast.success('Başarıyla oluşturuldu');
} catch (error) {
  logger.error('Create failed', error as Error);
  toast.error('Oluşturma başarısız');
}
```

---

## 🔟 Bildirim Gönderme

### Adım 1: Notification Mutation

```typescript
// convex/messages.ts
export const sendNotification = mutation({
  args: {
    recipient_id: v.id('users'),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('messages', {
      sender_id: ctx.auth.getUserIdentity()?.tokenIdentifier,
      recipient_id: args.recipient_id,
      content: `${args.title}: ${args.message}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  },
});
```

### Adım 2: Notification Hook

```typescript
// src/hooks/useNotification.ts
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useNotification() {
  const send = useMutation(api.messages.sendNotification);

  return {
    notify: (recipientId: string, title: string, message: string) =>
      send({ recipient_id: recipientId, title, message }),
  };
}
```

---

## 📋 Checklist: Yeni Özellik Ekleme

- [ ] Convex schema'ya collection ekle
- [ ] Convex query/mutation fonksiyonları yaz
- [ ] TypeScript types oluştur
- [ ] Zod validation schema yaz
- [ ] React bileşenleri oluştur
- [ ] Navigation'a ekle
- [ ] Permission ekle
- [ ] Unit testler yaz
- [ ] E2E testler yaz
- [ ] Dokümantasyon güncelle
- [ ] Code review
- [ ] Deploy
