'use client';

import React, { useState, lazy, Suspense, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { VirtualizedDataTable, type DataTableColumn } from '@/components/ui/virtualized-data-table';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { convexApiClient as api } from '@/lib/api/convex-api-client';
import type { BeneficiaryDocument } from '@/types/database';
import { toast } from 'sonner';
import { ArrowUpRight, Download, Plus } from 'lucide-react';

// Performance monitoring imports
import { useFPSMonitor } from '@/lib/performance-monitor';
import { useCachedQuery, usePrefetchWithCache } from '@/lib/api-cache';

// Optimized skeleton
import { TableSkeleton } from '@/components/ui/skeleton-optimized';

// Stub function for beneficiary export
const exportBeneficiaries = async (_params: { search?: string; beneficiaries?: BeneficiaryDocument[]; format?: 'csv' | 'excel' | 'pdf' }) => {
  toast.info('Dışa aktarma özelliği yakında eklenecek');
  return Promise.resolve({ success: true, data: null, error: null });
};

// Lazy load heavy modal component
const BeneficiaryQuickAddModal = lazy(() =>
  import('@/components/forms/BeneficiaryQuickAddModal').then((mod) => ({
    default: mod.BeneficiaryQuickAddModal,
  }))
);

export default function BeneficiariesPage() {
  const router = useRouter();

  // Performance monitoring
  const { getFPS, isGoodPerformance } = useFPSMonitor();
  
  // Smart caching
  const { prefetch } = usePrefetchWithCache();
  
  const [search, setSearch] = useState('');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  // Use cached query with performance optimization
  const { data: cachedData, isLoading, error, refetch } = useCachedQuery<{ success: boolean; data: BeneficiaryDocument[]; total: number }>({
    queryKey: ['beneficiaries-cached', search],
    endpoint: '/api/beneficiaries',
    params: { 
      page: 1,
      limit: 10000, // Load all data for virtual scrolling
      search 
    },
    dataType: 'beneficiaries',
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  // Fallback to direct API if cached query fails
  const fallbackQuery = useQuery({
    queryKey: ['beneficiaries', search],
    queryFn: () => api.beneficiaries.getBeneficiaries({
      page: 1,
      limit: 10000,
      search
    }),
    enabled: !cachedData && !isLoading,
  });

  const beneficiaries = (cachedData?.data || fallbackQuery.data?.data || []) as BeneficiaryDocument[];

  // Memoized handlers
  const handleModalClose = useCallback(() => {
    setShowQuickAddModal(false);
    refetch();
    fallbackQuery.refetch();
  }, [refetch, fallbackQuery]);

  const handleExport = useCallback(async () => {
    const result = await exportBeneficiaries({ search, beneficiaries });
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ihtiyac_sahipleri_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Veri başarıyla dışa aktarıldı');
    } else {
      toast.error('Dışa aktarma sırasında hata oluştu');
    }
  }, [search, beneficiaries]);

  const handleShowModal = useCallback(() => {
    setShowQuickAddModal(true);
  }, []);

  // Performance monitoring
  React.useEffect(() => {
    if (!isGoodPerformance()) {
      console.warn('Performance degraded:', { fps: getFPS() });
    }
  }, [getFPS, isGoodPerformance]);

  // Prefetch related data
  React.useEffect(() => {
    prefetch({
      endpoint: '/api/aid-applications',
      dataType: 'applications',
      priority: 'normal',
    });
  }, [prefetch]);

  // Memoized columns
  const columns: DataTableColumn<BeneficiaryDocument>[] = useMemo(() => [
    {
      key: 'actions',
      label: '',
      render: (item) => (
        <Link href={`/yardim/ihtiyac-sahipleri/${item._id}`}>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      ),
      className: 'w-12',
    },
    {
      key: 'type',
      label: 'Tür',
      render: () => (
        <Badge variant="secondary" className="font-medium">
          İhtiyaç Sahibi
        </Badge>
      ),
    },
    {
      key: 'name',
      label: 'İsim',
      render: (item) => <span className="font-medium text-foreground">{item.name || '-'}</span>,
    },
    {
      key: 'nationality',
      label: 'Uyruk',
      render: (item) => item.nationality || '-',
    },
    {
      key: 'tc_no',
      label: 'Kimlik No',
      render: (item) => item.tc_no || '-',
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (item) => item.phone || '-',
    },
    {
      key: 'city',
      label: 'Şehir',
      render: (item) => item.city || '-',
    },
    {
      key: 'district',
      label: 'İlçe',
      render: (item) => item.district || '-',
    },
    {
      key: 'address',
      label: 'Adres',
      render: (item) => (
        <span className="max-w-xs truncate block" title={item.address || '-'}>
          {item.address || '-'}
        </span>
      ),
    },
    {
      key: 'family_size',
      label: 'Aile Büyüklüğü',
      render: (item) => <Badge variant="outline">{item.family_size ?? '-'}</Badge>,
    },
  ], []);

  return (
    <PageLayout
      title="İhtiyaç Sahipleri"
      description="Kayıtlı ihtiyaç sahiplerini görüntüleyin ve yönetin"
      actions={
        <>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button onClick={handleShowModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Ekle
          </Button>
        </>
      }
    >
        {showQuickAddModal && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-background rounded-lg shadow-lg border p-6 max-w-md w-full mx-4">
                <TableSkeleton rows={4} />
              </div>
            </div>
          }>
            <BeneficiaryQuickAddModal open={showQuickAddModal} onOpenChange={handleModalClose} />
          </Suspense>
        )}

        <VirtualizedDataTable<BeneficiaryDocument>
          data={beneficiaries}
          columns={columns}
          isLoading={isLoading || fallbackQuery.isLoading}
          error={(error || fallbackQuery.error) as Error}
          emptyMessage="İhtiyaç sahibi bulunamadı"
          emptyDescription="Henüz kayıt eklenmemiş"
          searchable={true}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
          }}
          searchPlaceholder="İsim, TC No veya telefon ile ara..."
          onRowClick={(item) => router.push(`/yardim/ihtiyac-sahipleri/${item._id}`)}
          refetch={() => {
            refetch();
            fallbackQuery.refetch();
          }}
          rowHeight={65}
          containerHeight={600}
        />
      </PageLayout>
  );
}
