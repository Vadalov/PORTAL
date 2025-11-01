'use client';

import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function IncomeExpensePage() {
  return (
    <PlaceholderPage
      title="Gelir Gider"
      description="Gelir ve gider kayıtlarını yönetin"
      estimatedDate="Mart 2025"
      features={[
        'Gelir kayıt sistemi',
        'Gider takibi',
        'Kategori bazlı raporlama',
        'Bütçe planlaması',
        'Nakit akış analizi',
      ]}
    />
  );
}
