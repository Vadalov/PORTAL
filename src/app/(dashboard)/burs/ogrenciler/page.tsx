'use client';

import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function StudentsPage() {
  return (
    <PlaceholderPage
      title="Öğrenci Listesi"
      description="Burs alan öğrencileri görüntüleyin ve yönetin"
      estimatedDate="Şubat 2025"
      features={[
        'Öğrenci kayıt sistemi',
        'Burs ödemeleri takibi',
        'Akademik başarı izleme',
        'Belgeler ve evraklar',
        'Rapor kartları',
      ]}
    />
  );
}
