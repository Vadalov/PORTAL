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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

// Validation schema
const donationSchema = z.object({
  donor_name: z.string().min(2, 'Donör adı en az 2 karakter olmalıdır'),
  donor_phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  donor_email: z.string().email('Geçerli bir email adresi girin').optional().or(z.literal('')),
  amount: z.number().min(1, 'Tutar 0\'dan büyük olmalıdır'),
  currency: z.enum(['TRY', 'USD', 'EUR']),
  donation_type: z.string().min(2, 'Bağış türü belirtin'),
  payment_method: z.string().min(2, 'Ödeme yöntemi belirtin'),
  donation_purpose: z.string().min(2, 'Bağış amacı belirtin'),
  receipt_number: z.string().min(1, 'Makbuz numarası zorunludur'),
  notes: z.string().optional(),
  receipt_file_id: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DonationForm({ onSuccess, onCancel }: DonationFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      currency: 'TRY',
      amount: 0,
      status: 'pending',
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: (data: DonationFormData) =>
      api.donations.createDonation(data),
    onSuccess: () => {
      toast.success('Bağış başarıyla kaydedildi');
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      toast.error(`Bağış kaydedilirken hata oluştu: ${  error.message}`);
    },
  });

  const onSubmit = async (data: DonationFormData) => {
    setIsSubmitting(true);
    try {
      let uploadedFileId = null;

      // Upload receipt file if provided
      if (receiptFile) {
        const uploadResult = await api.storage.uploadFile({
          file: receiptFile,
          bucketId: 'receipts',
          permissions: []
        });
        uploadedFileId = uploadResult.data?.$id;
      }

      // Create donation with file reference
      const donationData = {
        ...data,
        receipt_file_id: uploadedFileId || undefined,
      };

      await createDonationMutation.mutateAsync(donationData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Bağış Ekle</CardTitle>
        <CardDescription>
          Bağış bilgilerini girerek yeni kayıt oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Donör Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Donör Bilgileri</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donor_name">Donör Adı *</Label>
                <Input
                  id="donor_name"
                  {...register('donor_name')}
                  placeholder="Ahmet Yılmaz"
                />
                {errors.donor_name && (
                  <p className="text-sm text-red-600">{errors.donor_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="donor_phone">Telefon *</Label>
                <Input
                  id="donor_phone"
                  {...register('donor_phone')}
                  placeholder="0555 123 45 67"
                />
                {errors.donor_phone && (
                  <p className="text-sm text-red-600">{errors.donor_phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor_email">Email</Label>
              <Input
                id="donor_email"
                type="email"
                {...register('donor_email')}
                placeholder="ahmet@example.com"
              />
              {errors.donor_email && (
                <p className="text-sm text-red-600">{errors.donor_email.message}</p>
              )}
            </div>
          </div>

          {/* Bağış Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Bağış Bilgileri</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Tutar *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="1000.00"
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi *</Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Para birimi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">₺ TRY</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-red-600">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_number">Makbuz No *</Label>
                <Input
                  id="receipt_number"
                  {...register('receipt_number')}
                  placeholder="MB2024001"
                />
                {errors.receipt_number && (
                  <p className="text-sm text-red-600">{errors.receipt_number.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donation_type">Bağış Türü *</Label>
                <Input
                  id="donation_type"
                  {...register('donation_type')}
                  placeholder="Nakdi, Ayni, Gıda..."
                />
                {errors.donation_type && (
                  <p className="text-sm text-red-600">{errors.donation_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Ödeme Yöntemi *</Label>
                <Select
                  value={watch('payment_method')}
                  onValueChange={(value) => setValue('payment_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ödeme yöntemi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nakit">Nakit</SelectItem>
                    <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                    <SelectItem value="Banka Transferi">Banka Transferi</SelectItem>
                    <SelectItem value="Havale">Havale</SelectItem>
                    <SelectItem value="EFT">EFT</SelectItem>
                    <SelectItem value="Çek">Çek</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-sm text-red-600">{errors.payment_method.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donation_purpose">Bağış Amacı *</Label>
              <Input
                id="donation_purpose"
                {...register('donation_purpose')}
                placeholder="Ramazan paketi, Eğitim yardımı, Sağlık desteği..."
              />
              {errors.donation_purpose && (
                <p className="text-sm text-red-600">{errors.donation_purpose.message}</p>
              )}
            </div>
          </div>

          {/* Ek Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ek Bilgiler</h3>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Ek açıklamalar, özel notlar..."
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            <FileUpload
              onFileSelect={setReceiptFile}
              accept="image/*,.pdf"
              maxSize={5}
              placeholder="Makbuz yükleyin (PNG, JPG, PDF - max 5MB)"
              disabled={isSubmitting}
            />
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
                'Bağış Ekle'
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
