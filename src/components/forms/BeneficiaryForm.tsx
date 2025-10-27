'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appwriteApi } from '@/lib/api/appwrite-api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Validation schema
const beneficiarySchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  tc_no: z.string().length(11, 'TC Kimlik numarası 11 haneli olmalıdır'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir adı girin'),
  district: z.string().min(2, 'İlçe adı girin'),
  neighborhood: z.string().min(2, 'Mahalle adı girin'),
  income_level: z.enum(['0-3000', '3000-5000', '5000-8000', '8000+']),
  family_size: z.number().min(1, 'Aile büyüklüğü en az 1 olmalıdır'),
  health_status: z.string().optional(),
  employment_status: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived'])
});

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

interface BeneficiaryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BeneficiaryForm({ onSuccess, onCancel }: BeneficiaryFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
    family_size: 1,
    income_level: '0-3000',
      status: 'active',
  },
  });

  const createBeneficiaryMutation = useMutation({
    mutationFn: (data: BeneficiaryFormData) =>
      appwriteApi.beneficiaries.createBeneficiary(data),
    onSuccess: () => {
      toast.success('İhtiyaç sahibi başarıyla eklendi');
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error('İhtiyaç sahibi eklenirken hata oluştu: ' + error.message);
    },
  });

  const onSubmit = async (data: BeneficiaryFormData) => {
    setIsSubmitting(true);
    try {
      await createBeneficiaryMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni İhtiyaç Sahibi Ekle</CardTitle>
        <CardDescription>
          İhtiyaç sahibi bilgilerini girerek yeni kayıt oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Kişisel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ahmet Yılmaz"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tc_no">TC Kimlik No *</Label>
                <Input
                  id="tc_no"
                  {...register('tc_no')}
                  placeholder="12345678901"
                  maxLength={11}
                />
                {errors.tc_no && (
                  <p className="text-sm text-red-600">{errors.tc_no.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="0555 123 45 67"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Adres Bilgileri</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Adres *</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Mahalle, Cadde, Sokak, No"
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Şehir *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="İstanbul"
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">İlçe *</Label>
                <Input
                  id="district"
                  {...register('district')}
                  placeholder="Kadıköy"
                />
                {errors.district && (
                  <p className="text-sm text-red-600">{errors.district.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Mahalle *</Label>
                <Input
                  id="neighborhood"
                  {...register('neighborhood')}
                  placeholder="Caferağa"
                />
                {errors.neighborhood && (
                  <p className="text-sm text-red-600">{errors.neighborhood.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ekonomik Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ekonomik Bilgiler</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income_level">Gelir Düzeyi *</Label>
                <Select
                  value={watch('income_level')}
                  onValueChange={(value) => setValue('income_level', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gelir düzeyi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3000">0-3.000 ₺</SelectItem>
                    <SelectItem value="3000-5000">3.000-5.000 ₺</SelectItem>
                    <SelectItem value="5000-8000">5.000-8.000 ₺</SelectItem>
                    <SelectItem value="8000+">8.000 ₺+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.income_level && (
                  <p className="text-sm text-red-600">{errors.income_level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_size">Aile Büyüklüğü *</Label>
                <Input
                  id="family_size"
                  type="number"
                  min={1}
                  {...register('family_size', { valueAsNumber: true })}
                />
                {errors.family_size && (
                  <p className="text-sm text-red-600">{errors.family_size.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_status">İstihdam Durumu</Label>
              <Input
                id="employment_status"
                {...register('employment_status')}
                placeholder="Öğrenci, İşsiz, Çalışıyor..."
              />
              {errors.employment_status && (
                <p className="text-sm text-red-600">{errors.employment_status.message}</p>
              )}
            </div>
          </div>

          {/* Sağlık Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sağlık Bilgileri</h3>

            <div className="space-y-2">
              <Label htmlFor="health_status">Genel Sağlık Durumu</Label>
              <Textarea
                id="health_status"
                {...register('health_status')}
                placeholder="Hastalıklar, engellilik durumu vb."
                rows={3}
              />
              {errors.health_status && (
                <p className="text-sm text-red-600">{errors.health_status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Ek bilgiler, özel durumlar..."
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Durum</Label>
              <RadioGroup
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'archived')}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Aktif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">Pasif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="archived" id="archived" />
                  <Label htmlFor="archived">Arşivlenmiş</Label>
                </div>
              </RadioGroup>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'İhtiyaç Sahibi Ekle'
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                İptal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}