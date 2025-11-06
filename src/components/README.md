# Component Library Documentation

Bu dizin proje için geliştirilen React component'larını içerir.

## Component Yapısı

### Organizasyon

```
src/components/
├── ui/                    # Temel UI component'ları (Button, Input, vs.)
├── forms/                 # Form component'ları
├── kumbara/              # Kumbara ile ilgili component'lar
├── bank-accounts/        # Banka hesabı yönetimi
├── consents/             # Onay ve izin yönetimi
├── dependents/           # Bağımlı kişi yönetimi
├── documents/            # Döküman yönetimi
├── meetings/             # Toplantı yönetimi
├── messages/             # Mesajlaşma sistemi
├── scholarships/         # Burs yönetimi
├── tasks/                # Görev yönetimi
├── analytics/            # Analitik ve dashboard
├── layouts/              # Layout component'ları
└── error-boundary.tsx    # Hata yakalama component'ı
```

## Component Dokümantasyonu

### ErrorBoundary
- **Dosya**: `error-boundary.tsx`
- **Amaç**: Uygulama hatalarını yakalayıp kullanıcı dostu bir arayüz gösterir
- **Props**:
  - `children`: React.ReactNode
  - `fallback`: React.ReactNode (opsiyonel)

### KumbaraForm
- **Dosya**: `kumbara/KumbaraForm.tsx`
- **Amaç**: Kumbara bağışı oluşturma formu
- **Props**:
  - `onSuccess`: () => void (opsiyonel)
  - `onCancel`: () => void (opsiyonel)

### KumbaraCharts
- **Dosya**: `kumbara/KumbaraCharts.tsx`
- **Amaç**: Kumbara verileri için grafik ve analitik gösterim
- **Props**:
  - `data`: Kumbara verisi
  - `type`: Grafik türü

### MapLocationPicker
- **Dosya**: `kumbara/MapLocationPicker.tsx`
- **Amaç**: Google Maps entegrasyonu ile konum seçimi
- **Props**:
  - `initialLocation`: MapLocation (opsiyonel)
  - `onLocationSelect`: (location: MapLocation) => void

## Kullanım Örnekleri

### ErrorBoundary Kullanımı
```tsx
import { ErrorBoundary } from '@/components/error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### KumbaraForm Kullanımı
```tsx
import { KumbaraForm } from '@/components/kumbara/KumbaraForm';

function DonationPage() {
  const handleSuccess = () => {
    // Başarı sonrası yapılacak işlemler
  };

  return (
    <KumbaraForm
      onSuccess={handleSuccess}
      onCancel={() => window.history.back()}
    />
  );
}
```

## Design System

Tüm component'lar consistent bir tasarım dili izler:
- **Shadcn/ui** component'ları temel alınır
- **Tailwind CSS** ile styling
- **TypeScript** ile tip güvenliği
- **React Hook Form** ile form yönetimi
- **Zod** ile validasyon

## Best Practices

1. **Props Interface**: Her component için açık props interface tanımlayın
2. **JSDoc Comments**: Her public component için dokümantasyon ekleyin
3. **Error Handling**: Hataları yakalayıp uygun şekilde gösterin
4. **Loading States**: Asenkron işlemler için loading state'leri ekleyin
5. **Accessibility**: A11y standartlarına uygun kod yazın
6. **Performance**: React.memo ve useMemo/useCallback optimizasyonları

## Stil Rehberi

### Naming Conventions
- Component dosya isimleri: PascalCase
- Props interface'leri: ComponentNameProps
- Event handler'lar: handleActionName
- State değişkenleri: isState, hasState, setState

### Component Yapısı
```tsx
import React from 'react';

interface ComponentNameProps {
  // Props tanımları
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div>
      {/* Component içeriği */}
    </div>
  );
}
```

## Testing

Her component için test yazılması önerilir:
- Unit test'ler: Component mantığını test eder
- Integration test'ler: Component etkileşimlerini test eder
- Visual test'ler: UI değişikliklerini yakalar

## Gelecek Geliştirmeler

- [ ] Storybook entegrasyonu
- [ ] Visual regression testing
- [ ] Component showcase sayfası
- [ ] Automated documentation generation
- [ ] Component performance monitoring