'use client';

import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function FinancialDashboardPage() {
  return (
    <PlaceholderPage
      title="Finansal Dashboard"
      description="Mali durumu görsel olarak takip edin"
      estimatedDate="Nisan 2025"
      features={[
        'Gerçek zamanlı mali göstergeler',
        'Gelir-gider grafikleri',
        'Bütçe karşılaştırmaları',
        'Trend analizleri',
        "Özelleştirilebilir widget'lar",
      ]}
    />
  );
}
