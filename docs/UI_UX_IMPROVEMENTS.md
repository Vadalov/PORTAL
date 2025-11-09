# UI/UX İyileştirmeleri Rehberi

## 📋 Genel Bakış

Bu dokümanda uygulamaya eklenen yeni UI/UX bileşenleri ve iyileştirmeleri anlatılmaktadır.

---

## 🎯 Yeni Bileşenler

### 1. **Breadcrumb Navigation** (`BreadcrumbNav`)
Kullanıcıların sayfada nerede olduğunu ve geri gitmeyi kolaylaştırır.

**Özellikler:**
- Otomatik yol oluşturma (`pathname`'dan)
- Türkçe etiket çevirisi
- Klavye navigasyonu desteği
- Erişilebilirlik (ARIA) desteği

**Kullanım:**
```tsx
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

export default function Page() {
  return (
    <>
      <BreadcrumbNav />
      {/* Page content */}
    </>
  );
}
```

---

### 2. **Analytics Tracker** (`AnalyticsTrackerComponent`)
Kullanıcı davranışını ve performansı takip eder.

**Özellikler:**
- Sayfa görüntülemeleri
- Kullanıcı etkileşimleri (tıklamalar, tuşlar)
- Core Web Vitals (LCP, FID, CLS)
- Session süresi takibi
- Oturum başlama/bitişi

**Kullanım:**
```tsx
import { AnalyticsTrackerComponent } from '@/components/ui/analytics-tracker';

export default function Layout() {
  return (
    <>
      <AnalyticsTrackerComponent
        enabled={true}
        trackCoreWebVitals={true}
        trackUserInteractions={true}
      />
      {/* Layout content */}
    </>
  );
}
```

---

### 3. **Keyboard Shortcuts** (`KeyboardShortcuts`)
Klavye kısayollarını yönetir ve yardım iletişim kutusunu gösterir.

**Özellikler:**
- Özel kısayolları tanımla
- Otomatik yardım iletişim kutusu
- `?` veya `Ctrl+/` ile açılır
- Ctrl, Shift, Alt kombinasyonları

**Kullanım:**
```tsx
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts';

const shortcuts = [
  {
    key: 'k',
    ctrl: true,
    description: 'Ara',
    callback: () => { /* search logic */ },
  },
];

export default function Layout() {
  return (
    <>
      <KeyboardShortcuts shortcuts={shortcuts} enabled={true} />
      {/* Layout content */}
    </>
  );
}
```

---

### 4. **Theme Switcher** (`ThemeSwitcher`)
Açık/Koyu tema geçişi sağlar.

**Özellikler:**
- Açık/Koyu tema geçişi
- Sistem tercihini kullan
- LocalStorage'da kaydedilir
- Düşük işlem gücü

**Kullanım:**
```tsx
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export default function Header() {
  return (
    <nav>
      <ThemeSwitcher defaultTheme="system" />
    </nav>
  );
}
```

---

### 5. **Column Visibility Toggle** (`ColumnVisibilityToggle`)
Tablo sütunlarını göster/gizle ve yönet.

**Özellikler:**
- Sütunları göster/gizle
- Hepsini göster/gizle
- Görünürlük sayacı
- PopoverContent'te listelenir

**Kullanım:**
```tsx
import { ColumnVisibilityToggle, ColumnDef } from '@/components/ui/column-visibility-toggle';

const columns: ColumnDef[] = [
  { key: 'name', label: 'Ad' },
  { key: 'email', label: 'Email', visible: true },
];

export default function DataTable() {
  const [visible, setVisible] = useState({
    name: true,
    email: true,
  });

  return (
    <>
      <ColumnVisibilityToggle
        columns={columns}
        onVisibilityChange={setVisible}
      />
      {/* Table content */}
    </>
  );
}
```

---

### 6. **Accessible Form Field** (`AccessibleFormField`)
Erişilebilir form alanları oluşturur.

**Özellikler:**
- ARIA etiketleri
- Hata ve ipucu mesajları
- Zorunlu alan göstergesi
- Devre dışı bırakılan durumu

**Kullanım:**
```tsx
import { AccessibleInput, AccessibleSelect } from '@/components/ui/accessible-form-field';

export default function Form() {
  return (
    <>
      <AccessibleInput
        label="Ad"
        placeholder="Adınızı girin"
        required={true}
        error={errors.name}
        hint="Tam adınızı girin"
      />
      <AccessibleSelect
        label="Rol"
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'Kullanıcı' },
        ]}
        error={errors.role}
      />
    </>
  );
}
```

---

### 7. **Enhanced Toast** (`enhancedToast`)
Geliştirilmiş bildirim sistemi.

**Özellikler:**
- Başarı, hata, uyarı, bilgi durumları
- Eylem düğmeleri
- Özel açıklamalar
- Otomatik kapatma

**Kullanım:**
```tsx
import { enhancedToast } from '@/components/ui/enhanced-toast';

// Basit mesaj
enhancedToast.success('Başarıyla kaydedildi');

// Başlık ve açıklama
enhancedToast.success({
  title: 'Başarılı',
  description: 'Verileriniz kaydedildi',
  action: {
    label: 'Geri Al',
    onClick: () => { /* undo logic */ },
  },
});

// Promise ile
enhancedToast.promise(
  updateUserAPI(),
  {
    loading: 'Güncelleniyor...',
    success: 'Güncellendi!',
    error: 'Güncelleme başarısız',
  }
);
```

---

## 🎨 Stil Rehberi

### Renk Paleti
- **Başarı**: `bg-green-50`, `text-green-600`, `text-green-900`
- **Hata**: `bg-red-50`, `text-red-600`, `text-red-900`
- **Uyarı**: `bg-amber-50`, `text-amber-600`, `text-amber-900`
- **Bilgi**: `bg-blue-50`, `text-blue-600`, `text-blue-900`

### Tasarım Sistemi
- Sınırlar: `border-slate-200/60`
- Gölgeler: `shadow-lg shadow-slate-200/50`
- Geçişler: `duration-200 ease-out`
- Spacing: `gap-2`, `gap-2.5`, `gap-3`

---

## ♿ Erişilebilirlik

### ARIA Öznitelikleri
- `aria-label`: Eğer görünür metin yoksa
- `aria-describedby`: Hata ve ipuçları
- `aria-invalid`: Hatalı alanlar
- `aria-disabled`: Devre dışı bırakılan alanlar
- `aria-live`: Dinamik içerik güncellemeleri
- `aria-current="page"`: Breadcrumb'da aktif sayfa

### Keyboard Navigation
- Tab: Alan değiştirme
- Enter: Formu gönder
- Escape: İletişim kutusunu kapat
- `?`: Kısayolları göster
- `Ctrl+K`: Ara

---

## 📊 Performans İzleme

Analytics tracker aşağıdaki metrikleri kaydeder:
- **Page View**: Sayfa yükleme
- **User Interaction**: Tıklamalar ve tuş basışları
- **Session Duration**: Oturum süresi
- **Inactivity**: Hareketsizlik süresi
- **Core Web Vitals**: LCP, FID, CLS

---

## 🔧 Kullanım Örnekleri

### Tam Layout Örneği

```tsx
'use client';

import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { AnalyticsTrackerComponent } from '@/components/ui/analytics-tracker';
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shortcuts = [
    {
      key: 'k',
      ctrl: true,
      description: 'Ara',
      callback: () => console.log('Search'),
    },
  ];

  return (
    <div>
      <header>{/* header content */}</header>

      <main>
        <BreadcrumbNav />
        {children}
      </main>

      <AnalyticsTrackerComponent />
      <KeyboardShortcuts shortcuts={shortcuts} />
    </div>
  );
}
```

---

## 📱 Responsive Tasarım

### Breakpoints
- `sm`: 640px (Tablet)
- `md`: 768px (Tablet+)
- `lg`: 1024px (Masaüstü)
- `xl`: 1280px (Büyük masaüstü)

### Örnek
```tsx
<div className="hidden sm:inline">Masaüstü</div>
<div className="sm:hidden">Mobil</div>
```

---

## 🚀 Performans Önerileri

1. **Breadcrumb**: Çok fazla kısayol kullanmayın (max 5)
2. **Analytics**: Üretim ortamında devre dışı bırak
3. **Toasts**: Aynı anda maksimum 3 toast göster
4. **Form Fields**: Büyük formlar için scroll içinde yerleştir
5. **Column Visibility**: Tablo 20+ sütun varsa kullan

---

## 🧪 Test Edilmiş Tarayıcılar

- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+
- ✅ Mobile Safari (iOS 16+)
- ✅ Chrome Mobile (Android 12+)

---

## 📝 Notlar

- Tüm bileşenler TypeScript'te yazılmıştır
- Tailwind CSS v4 ile stillendirilmiştir
- Framer Motion animasyonları destekler
- Sentry entegrasyonu logger aracılığıyla çalışır
- LocalStorage tarayıcı desteğine ihtiyaç duyar

---

**Son Güncelleme:** November 9, 2025
