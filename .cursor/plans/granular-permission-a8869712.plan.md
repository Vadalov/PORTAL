<!-- a8869712-9da8-4805-9957-5cd542abdbda 3c934748-5efb-402b-9f89-992227174865 -->
# Granüler İzin Sistemi - Kullanıcı Bazlı Modül Erişimi

## 1. Veritabanı Şeması Güncellemeleri

### users koleksiyonuna yeni alanlar ekle

**Dosya:** `convex/schema.ts`

```typescript
users: defineTable({
  name: v.string(),
  email: v.string(),
  role: v.string(), // "Dernek Başkanı", "Personel" gibi display name
  permissions: v.array(v.string()), // Modül erişim listesi
  isActive: v.boolean(),
  // ... mevcut alanlar
})
```

### Permission sabitleri tanımla

**Yeni dosya:** `src/types/permissions.ts`

Modül bazlı izinler:

- `beneficiaries:access` - Hak Sahipleri
- `donations:access` - Bağışlar
- `aid_applications:access` - Yardım Başvuruları
- `scholarships:access` - Burslar
- `messages:access` - Mesajlaşma
- `finance:access` - Finans
- `reports:access` - Raporlar
- `settings:access` - Ayarlar
- `users:manage` - Kullanıcı Yönetimi (sadece Dernek Başkanı)

## 2. TC Maskeleme/Hash Sistemini Kaldır

### Convex fonksiyonlarından temizle

**Dosyalar:**

- `convex/beneficiaries.ts` - `hashTcNumber`, `maskTcNumber`, `requireTcNumberAccess` çağrılarını kaldır
- `convex/tc_security.ts` - Dosyayı sil veya kullanımdan kaldır
- `convex/donations.ts` - TC hash işlemlerini kaldır

### API route'larından temizle

**Dosyalar:**

- `src/app/api/beneficiaries/route.ts`
- `src/app/api/donations/route.ts`

TC numarası artık düz metin olarak saklanacak ve gösterilecek.

## 3. Kullanıcı Yönetimi Modülü

### Kullanıcı Listesi Sayfası

**Dosya:** `src/app/(dashboard)/kullanici/page.tsx`

- Kullanıcı tablosu (ad, email, rol, durum)
- Dernek Başkanı için "Yeni Kullanıcı" butonu
- Düzenle/Sil aksiyonları

### Kullanıcı Formu

**Dosya:** `src/components/forms/UserForm.tsx`

Form alanları:

- Ad Soyad
- E-posta
- Telefon
- Rol (text input - "Muhasebeci", "Sosyal Yardım Uzmanı" vb.)
- Şifre (ilk oluşturma veya sıfırlama)
- Aktif/Pasif toggle
- **Modül Erişim Seçimi:** Checkbox grubu
  - [ ] Hak Sahipleri
  - [ ] Bağışlar
  - [ ] Yardım Başvuruları
  - [ ] Burslar
  - [ ] Mesajlaşma
  - [ ] Finans
  - [ ] Raporlar
  - [ ] Ayarlar

### Convex Mutations

**Dosya:** `convex/users.ts`

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(), // Display name
    permissions: v.array(v.string()),
    passwordHash: v.string(),
    phone: v.optional(v.string()),
    isActive: v.boolean()
  },
  handler: async (ctx, args) => {
    // Email unique kontrolü
    // Kullanıcı oluştur
  }
});

export const update = mutation({
  args: {
    id: v.id("users"),
    permissions: v.optional(v.array(v.string())),
    // ... diğer alanlar
  },
  handler: async (ctx, args) => {
    // Güncelle
  }
});
```

### API Routes

**Dosyalar:**

- `src/app/api/users/route.ts` - GET (liste), POST (oluştur)
- `src/app/api/users/[id]/route.ts` - GET (detay), PUT (güncelle), DELETE (sil)

Sadece `users:manage` iznine sahip kullanıcılar erişebilir.

## 4. Yetkilendirme Sistemi Güncellemesi

### Auth kontrolünü güncelle

**Dosya:** `src/lib/api/auth-utils.ts`

```typescript
export async function requireModuleAccess(
  module: string
): Promise<{ user: SessionUser; session: AuthSession }> {
  const { user, session } = await requireAuthenticatedUser();
  
  // Dernek Başkanı her şeye erişebilir
  if (user.permissions.includes('users:manage')) {
    return { user, session };
  }
  
  // Modül izni kontrolü
  const requiredPermission = `${module}:access`;
  if (!user.permissions.includes(requiredPermission)) {
    throw new ApiAuthError('Bu modüle erişim yetkiniz yok', 403);
  }
  
  return { user, session };
}
```

### Her API route'a modül kontrolü ekle

**Örnek:** `src/app/api/beneficiaries/route.ts`

```typescript
export async function GET(request: NextRequest) {
  await requireModuleAccess('beneficiaries');
  // ... devam
}
```

## 5. Dashboard Menü Kontrolü

### Sidebar'ı güncelle

**Dosya:** `src/components/ui/modern-sidebar.tsx`

Her menü öğesi için izin kontrolü:

```typescript
const menuItems = [
  {
    label: 'Hak Sahipleri',
    href: '/hak-sahibi',
    icon: Users,
    permission: 'beneficiaries:access'
  },
  {
    label: 'Bağışlar',
    href: '/bagis',
    icon: Heart,
    permission: 'donations:access'
  },
  // ...
];

// Render
{menuItems.map(item => {
  if (item.permission && !user?.permissions.includes(item.permission)) {
    return null; // Gösterme
  }
  return <MenuItem key={item.href} {...item} />;
})}
```

## 6. İlk Admin Seed Script

### Seed fonksiyonu

**Yeni dosya:** `convex/seed.ts`

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    // Dernek Başkanı var mı kontrol et
    const existing = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("permissions"), ["users:manage"]))
      .first();
    
    if (existing) {
      return { message: "Dernek Başkanı zaten mevcut" };
    }
    
    // İlk admin oluştur
    const adminId = await ctx.db.insert("users", {
      name: "Dernek Başkanı",
      email: "baskan@dernek.org",
      role: "Dernek Başkanı",
      permissions: ["users:manage"], // Tüm erişim
      passwordHash: "HASH_BURAYA", // Manuel değiştirilmeli
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    return { message: "Dernek Başkanı oluşturuldu", id: adminId };
  }
});
```

Deploy sonrası çalıştır:

```bash
npx convex run seed:seedFirstAdmin --prod
```

## 7. Rol İsimleri Türkçeleştirme

### Display mapping kaldır

Artık `role` alanı direkt Türkçe isim içerecek:

- "Dernek Başkanı"
- "Muhasebe Sorumlusu"
- "Sosyal Yardım Uzmanı"
- vb.

Kullanıcı oluştururken serbest text input.

## 8. UI Güncellemeleri

### Permission checkbox grubu

**Yeni component:** `src/components/users/PermissionCheckboxGroup.tsx`

```typescript
const MODULE_LABELS = {
  'beneficiaries:access': 'Hak Sahipleri',
  'donations:access': 'Bağışlar',
  'aid_applications:access': 'Yardım Başvuruları',
  'scholarships:access': 'Burslar',
  'messages:access': 'Mesajlaşma',
  'finance:access': 'Finans',
  'reports:access': 'Raporlar',
  'settings:access': 'Ayarlar'
};

export function PermissionCheckboxGroup({ value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>Modül Erişimleri</Label>
      {Object.entries(MODULE_LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-2">
          <Checkbox
            checked={value.includes(key)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...value, key]);
              } else {
                onChange(value.filter(p => p !== key));
              }
            }}
          />
          <Label>{label}</Label>
        </div>
      ))}
    </div>
  );
}
```

## 9. Test ve Doğrulama

### Test senaryoları

- Dernek Başkanı kullanıcı oluşturabilir mi?
- Oluşturulan kullanıcı sadece izin verilen modülleri görebiliyor mu?
- Sidebar'da yetkisiz modüller gizleniyor mu?
- API route'lar yetkisiz erişimi engelliyor mu?
- TC numarası düz metin olarak görünüyor mu?

### Komutlar

```bash
npm run typecheck
npm run lint
npm run test:run
```

## 10. Migration (Mevcut Veriler)

### TC numaralarını düz metne çevir

**Yeni dosya:** `convex/migrations/unhashTcNumbers.ts`

Eğer mevcut hash'lenmiş TC'ler varsa, bunları plain text'e çevirmek için manuel script gerekebilir (veya yeni kayıtlar olarak kabul edilir).

### Mevcut kullanıcılara permission ekle

Manuel olarak veya script ile mevcut kullanıcılara `permissions` array'i ekle.

## Dosya Listesi

### Yeni Dosyalar

- `src/types/permissions.ts`
- `src/app/(dashboard)/kullanici/page.tsx`
- `src/app/(dashboard)/kullanici/yeni/page.tsx`
- `src/app/(dashboard)/kullanici/[id]/duzenle/page.tsx`
- `src/app/api/users/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/components/forms/UserForm.tsx`
- `src/components/users/PermissionCheckboxGroup.tsx`
- `src/components/tables/UsersTable.tsx`
- `convex/seed.ts`
- `convex/migrations/unhashTcNumbers.ts` (opsiyonel)

### Güncellenecek Dosyalar

- `convex/schema.ts`
- `convex/users.ts`
- `convex/beneficiaries.ts`
- `convex/donations.ts`
- `src/lib/api/auth-utils.ts`
- `src/components/ui/modern-sidebar.tsx`
- `src/app/api/beneficiaries/route.ts`
- `src/app/api/donations/route.ts`
- `src/app/api/messages/route.ts`
- (Diğer API route'lar benzer şekilde)

### Silinecek/Kullanımdan Kaldırılacak

- `convex/tc_security.ts`
- `src/types/auth.ts` içindeki `ROLE_PERMISSIONS` mapping (basitleştirilecek)

### To-dos

- [ ] Convex schema güncellemesi: users tablosuna permissions array ve role string alanı ekle
- [ ] Permission sabitleri tanımla (beneficiaries:access, donations:access vb.)
- [ ] TC hash/mask sistemini Convex ve API route'larından kaldır
- [ ] Kullanıcı yönetimi UI (liste, oluştur, düzenle sayfaları)
- [ ] UserForm ve PermissionCheckboxGroup bileşenleri
- [ ] Kullanıcı API route'ları (GET/POST/PUT/DELETE)
- [ ] Convex users fonksiyonları (list, create, update, delete)
- [ ] Auth utils güncelleme: requireModuleAccess fonksiyonu
- [ ] Tüm API route'lara modül erişim kontrolü ekle
- [ ] Dashboard sidebar menü izin kontrolü
- [ ] İlk Dernek Başkanı seed script
- [ ] Test ve doğrulama: typecheck, lint, manuel test senaryoları