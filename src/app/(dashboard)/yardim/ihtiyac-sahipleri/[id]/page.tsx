'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, Trash2, User, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import api from '@/lib/api';
import { checkMernis } from '@/lib/api/mock-api';
import type { BeneficiaryDocument } from '@/types/collections';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema
const docSchema = z.object({
  name: z.string().min(2, 'İsim zorunludur'),
  tc_no: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{11}$/.test(val), { message: 'TC Kimlik No 11 haneli olmalıdır' }),
  phone: z.string().optional(),
  email: z.string().email('Geçersiz e-posta').optional().or(z.literal('')),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  marital_status: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  family_size: z.coerce.number().min(1).max(20).optional(),
  status: z.enum(['TASLAK', 'AKTIF', 'PASIF', 'SILINDI']),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

type FormValues = z.infer<typeof docSchema>;

export default function BeneficiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => api.beneficiaries.getBeneficiary(id),
  });

  const beneficiary = data?.data as BeneficiaryDocument | undefined;

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<BeneficiaryDocument>) =>
      api.beneficiaries.updateBeneficiary(id, payload),
    onSuccess: (res) => {
      if (!res.error) {
        toast.success('Kayıt güncellendi');
        refetch();
      } else {
        toast.error(res.error || 'Güncelleme başarısız');
      }
    },
    onError: () => toast.error('Güncelleme sırasında hata oluştu'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.beneficiaries.deleteBeneficiary(id),
    onSuccess: (res) => {
      if (!res.error) {
        toast.success('Kayıt silindi');
        router.push('/yardim/ihtiyac-sahipleri');
      } else {
        toast.error(res.error || 'Silme işlemi başarısız');
      }
    },
    onError: () => toast.error('Silme sırasında hata oluştu'),
  });

  const mernisMutation = useMutation({
    mutationFn: (identity: string) => checkMernis(identity),
    onSuccess: (res) => {
      if (res.success && res.data) {
        if (res.data.isValid) {
          toast.success(res.data.message || 'Mernis geçerli');
        } else {
          toast.error(res.data.message || 'Mernis geçersiz');
        }
      } else {
        toast.error(res.error || 'Mernis kontrolü başarısız');
      }
    },
    onError: () => toast.error('Mernis kontrolü sırasında hata oluştu'),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<FormValues>({
    // Resolver disabled temporarily - needs proper schema integration
    resolver: undefined,
    defaultValues: beneficiary
      ? {
          name: beneficiary.name || '',
          tc_no: beneficiary.tc_no || '',
          phone: beneficiary.phone || '',
          email: beneficiary.email || '',
          nationality: beneficiary.nationality || '',
          religion: beneficiary.religion || '',
          marital_status: beneficiary.marital_status || '',
          address: beneficiary.address || '',
          city: beneficiary.city || '',
          district: beneficiary.district || '',
          neighborhood: beneficiary.neighborhood || '',
          family_size: beneficiary.family_size ?? 1,
          status: beneficiary.status,
          approval_status: beneficiary.approval_status || 'pending',
        }
      : undefined,
  });

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !beneficiary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  İhtiyaç Sahibi Bulunamadı
                </h3>
                <p className="text-red-700">Aradığınız kayıt sistemde mevcut değil.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  İhtiyaç Sahibi - {beneficiary.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:bg-red-50"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                {deleteMutation.isPending ? 'Siliniyor...' : 'Kaldır'}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting || updateMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {isSubmitting || updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => router.back()}>
                <X className="h-4 w-4" />
                Kapat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Form */}
          <div className="col-span-9 space-y-6">
            {/* Temel Bilgiler */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded border flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-1">Fotoğraf</p>
                  </div>

                  <div className="col-span-10 grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-xs">İsim</Label>
                      <Input {...register('name')} className="h-9" />
                      {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Uyruk</Label>
                      <Input {...register('nationality')} className="h-9" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kimlik ve İletişim */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Kimlik ve İletişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">TC Kimlik No</Label>
                    <div className="flex gap-2">
                      <Input {...register('tc_no')} className="h-9" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          const tc = getValues('tc_no') || '';
                          if (!tc) {
                            toast.error('TC Kimlik No giriniz');
                            return;
                          }
                          mernisMutation.mutate(tc);
                        }}
                        disabled={mernisMutation.isPending}
                      >
                        {mernisMutation.isPending ? 'Kontrol...' : 'Mernis'}
                      </Button>
                    </div>
                    {errors.tc_no && <p className="text-xs text-red-600">{errors.tc_no.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Telefon</Label>
                    <Input {...register('phone')} className="h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">E-posta</Label>
                    <Input type="email" {...register('email')} className="h-9" />
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Medeni Durum</Label>
                    <Input {...register('marital_status')} className="h-9" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adres Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Adres Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Şehir/Bölge</Label>
                    <Input {...register('city')} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Yerleşim</Label>
                    <Input {...register('district')} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mahalle/Köy</Label>
                    <Input {...register('neighborhood')} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ailedeki Kişi Sayısı</Label>
                    <Controller
                      control={control}
                      name="family_size"
                      render={({ field }) => (
                        <Select
                          value={(field.value ?? 1).toString()}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Adres</Label>
                  <Textarea {...register('address')} rows={3} className="resize-none text-sm" />
                </div>
              </CardContent>
            </Card>

            {/* Durumlar */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Durum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Kaydı Durumu:</Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TASLAK" id="taslak" />
                            <Label htmlFor="taslak" className="text-sm font-normal">
                              Taslak
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="AKTIF" id="aktif" />
                            <Label htmlFor="aktif" className="text-sm font-normal">
                              Aktif
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PASIF" id="pasif" />
                            <Label htmlFor="pasif" className="text-sm font-normal">
                              Pasif
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SILINDI" id="silindi" />
                            <Label htmlFor="silindi" className="text-sm font-normal">
                              Silindi
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Onay Durumu</Label>
                    <Controller
                      control={control}
                      name="approval_status"
                      render={({ field }) => (
                        <Select value={field.value || 'pending'} onValueChange={field.onChange}>
                          <SelectTrigger className="h-9 w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="approved">Onaylandı</SelectItem>
                            <SelectItem value="rejected">Reddedildi</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kayıt Bilgileri */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Kayıt Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Kayıt Tarihi:</span>
                    <span className="ml-2 font-medium">
                      {new Date(beneficiary.$createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Son Güncelleme:</span>
                    <span className="ml-2 font-medium">
                      {new Date(beneficiary.$updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bağlantılı Kayıtlar */}
          <div className="col-span-3">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Bağlantılı Kayıtlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Banka Hesapları', count: 0 },
                  { label: 'Dokümanlar', count: 0 },
                  { label: 'Fotoğraflar', count: 0 },
                  { label: 'Yardım Talepleri', count: 0 },
                  { label: 'Yapılan Yardımlar', count: 0 },
                  { label: 'Rıza Beyanları', count: 0 },
                  { label: 'Sosyal Kartlar', count: 0 },
                  { label: 'Kart Özeti', count: 0 },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between h-9 px-3 hover:bg-gray-100"
                  >
                    <span className="text-sm">{item.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
