'use client';

import { PlaceholderPage } from '@/components/PlaceholderPage';


export default function DonationReportsPage() {
  return (
    <PlaceholderPage
      title="Bağış Raporları"
      description="Bağış raporlarını görüntüleyin ve dışa aktarın"
      estimatedDate="Şubat 2025"
      features={[
        'Dönemsel bağış raporları',
        'Bağışçı bazlı analizler',
        'Excel ve PDF dışa aktarma',
        'Grafiksel gösterimler',
        'Karşılaştırmalı raporlar',
      ]}
    />
  );
}
