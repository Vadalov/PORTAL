'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aidApplicationsApi } from '@/lib/api/appwrite-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Utensils,
  Package,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { AidApplicationForm } from '@/components/forms/AidApplicationForm';

const STAGE_LABELS = {
  draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700' },
  under_review: { label: 'İnceleme', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
  ongoing: { label: 'Devam Ediyor', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Tamamlandı', color: 'bg-purple-100 text-purple-700' },
};

const STATUS_LABELS = {
  open: { label: 'Açık', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Kapalı', color: 'bg-red-100 text-red-700' },
};

export default function AidApplicationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['aid-applications', page, search, stageFilter, statusFilter],
    queryFn: () =>
      aidApplicationsApi.getAidApplications({
        page,
        limit,
        search,
        filters: {
          stage: stageFilter === 'all' ? undefined : stageFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      }),
  });

  const applications = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yardım Başvuruları</h1>
          <p className="text-gray-600 mt-2">Portal Plus tarzı başvuru sistemi - {total} kayıt</p>
        </div>

        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="gap-2 sm:w-auto w-full">
              <Plus className="h-4 w-4" />
              Yeni Başvuru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <AidApplicationForm
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Arama ve Filtreleme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kişi / Kurum / Partner"
                className="pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm Aşamalar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Aşamalar</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="under_review">İnceleme</SelectItem>
                <SelectItem value="approved">Onaylandı</SelectItem>
                <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm Durumlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="closed">Kapalı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Başvuru Listesi</CardTitle>
          <CardDescription>Toplam {total} başvuru bulundu</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">Veriler yüklenirken hata oluştu</div>
          ) : applications.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg font-medium">Başvuru bulunamadı</p>
              <p className="text-sm mt-2">
                {search ? 'Arama kriterlerinize uygun başvuru yok' : 'Henüz başvuru eklenmemiş'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.$id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{app.applicant_name}</h3>
                        <Badge variant="outline">
                          {app.applicant_type === 'person'
                            ? 'Kişi'
                            : app.applicant_type === 'organization'
                              ? 'Kurum'
                              : 'Partner'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(app.application_date).toLocaleDateString('tr-TR')}</span>
                      </div>

                      {/* Yardım Türleri */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {app.one_time_aid && app.one_time_aid > 0 && (
                          <Badge className="gap-1 bg-blue-100 text-blue-700">
                            <DollarSign className="h-3 w-3" />
                            Tek Seferlik: {app.one_time_aid.toLocaleString('tr-TR')} ₺
                          </Badge>
                        )}
                        {app.regular_financial_aid && app.regular_financial_aid > 0 && (
                          <Badge className="gap-1 bg-green-100 text-green-700">
                            <DollarSign className="h-3 w-3" />
                            Düzenli: {app.regular_financial_aid.toLocaleString('tr-TR')} ₺
                          </Badge>
                        )}
                        {app.regular_food_aid && app.regular_food_aid > 0 && (
                          <Badge className="gap-1 bg-orange-100 text-orange-700">
                            <Utensils className="h-3 w-3" />
                            Gıda: {app.regular_food_aid} paket
                          </Badge>
                        )}
                        {app.in_kind_aid && app.in_kind_aid > 0 && (
                          <Badge className="gap-1 bg-purple-100 text-purple-700">
                            <Package className="h-3 w-3" />
                            Ayni: {app.in_kind_aid} adet
                          </Badge>
                        )}
                        {app.service_referral && app.service_referral > 0 && (
                          <Badge className="gap-1 bg-red-100 text-red-700">
                            <Stethoscope className="h-3 w-3" />
                            Sevk: {app.service_referral}
                          </Badge>
                        )}
                      </div>

                      {/* Aşama ve Durum */}
                      <div className="flex gap-2">
                        <Badge className={STAGE_LABELS[app.stage].color}>
                          {STAGE_LABELS[app.stage].label}
                        </Badge>
                        <Badge className={STATUS_LABELS[app.status].color}>
                          {STATUS_LABELS[app.status].label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/yardim/basvurular/${app.$id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Detay
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Sayfa {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
