'use client';

import { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';
import { exportBeneficiaries } from '@/lib/api/mock-api';
import type { BeneficiaryDocument } from '@/types/collections';
import { toast } from 'sonner';
import { ArrowUpRight, Download, Plus, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy modal component
const BeneficiaryQuickAddModal = lazy(() =>
  import('@/components/forms/BeneficiaryQuickAddModal').then((mod) => ({
    default: mod.BeneficiaryQuickAddModal,
  }))
);

export default function BeneficiariesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['beneficiaries', page, search],
    queryFn: () => api.beneficiaries.getBeneficiaries({ page, limit, search }),
  });

  const beneficiaries = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleModalClose = () => {
    setShowQuickAddModal(false);
    refetch();
  };

  const handleExport = async () => {
    const result = await exportBeneficiaries({ search });
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
  };

  const columns: Column<BeneficiaryDocument>[] = [
    {
      key: 'actions',
      label: '',
      render: (item) => (
        <Link href={`/yardim/ihtiyac-sahipleri/${item.$id}`}>
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
    },
    {
      key: 'tc_no',
      label: 'Kimlik No',
    },
    {
      key: 'phone',
      label: 'Telefon',
    },
    {
      key: 'city',
      label: 'Şehir',
    },
    {
      key: 'district',
      label: 'İlçe',
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
  ];

  return (
    <>
      {showQuickAddModal && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-lg shadow-lg border p-6 max-w-md w-full mx-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-1/2 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        }>
          <BeneficiaryQuickAddModal open={showQuickAddModal} onOpenChange={handleModalClose} />
        </Suspense>
      )}

      <PageLayout
        title="İhtiyaç Sahipleri"
        description="Kayıtlı ihtiyaç sahiplerini görüntüleyin ve yönetin"
        actions={
          <>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Dışa Aktar
            </Button>
            <Button onClick={() => setShowQuickAddModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni Ekle
            </Button>
          </>
        }
      >
        <DataTable<Record<string, unknown>>
        data={beneficiaries as unknown as Record<string, unknown>[]}
        columns={
        columns as unknown as import('@/components/ui/data-table').Column<
        Record<string, unknown>
        >[]
        }
        isLoading={isLoading}
        error={error as Error}
        emptyMessage="İhtiyaç sahibi bulunamadı"
        emptyDescription="Henüz kayıt eklenmemiş"
        searchable={true}
        searchValue={search}
        onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
        }}
        searchPlaceholder="İsim, TC No veya telefon ile ara..."
        pagination={{
        page,
        totalPages,
        total,
        onPageChange: setPage,
        }}
        onRowClick={(item) => router.push(`/yardim/ihtiyac-sahipleri/${item.$id}`)}
          refetch={refetch}
        />
      </PageLayout>
    </>
  );
}
