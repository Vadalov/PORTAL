'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { KumbaraCreateInput } from '@/lib/validations/kumbara';
import { kumbaraCreateSchema } from '@/lib/validations/kumbara';
import { MapLocationPicker } from './MapLocationPicker';
import { FileUpload } from '@/components/ui/file-upload';

type KumbaraFormData = any;

interface KumbaraFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Field validation component
interface FieldWithValidationProps {
  label: string;
  error?: string;
  validation?: 'valid' | 'invalid' | 'pending';
  required?: boolean;
  children: React.ReactNode;
  errorId?: string;
}

function FieldWithValidation({
  label,
  error,
  validation,
  required,
  children,
  errorId,
}: FieldWithValidationProps) {
  const getValidationIcon = () => {
    switch (validation) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
        {label}
      </Label>
      <div className="relative">{children}</div>
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

export function KumbaraForm({ onSuccess, onCancel }: KumbaraFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapLocation, setMapLocation] = useState<any>(null);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const queryClient = useQueryClient();

  const form = useForm<any>({
    resolver: zodResolver(kumbaraCreateSchema),
    defaultValues: {
      currency: 'TRY',
      donation_type: 'Kumbara',
      donation_purpose: 'Kumbara Bağışı',
      payment_method: 'Nakit',
      status: 'pending',
      is_kumbara: true,
    },
  });

  // Handle map location selection
  const handleLocationSelect = (location: any) => {
    setMapLocation(location);
    form.setValue('location_coordinates', { lat: location.lat, lng: location.lng });
    if (location.address) {
      form.setValue('location_address', location.address);
    }
  };

  // Handle route updates
  const handleRouteUpdate = (route: any[]) => {
    setRouteData(route);
    form.setValue('route_points', route);

    // Calculate route metrics if available
    if (route.length >= 2) {
      // This would be calculated by the map component or Google Directions API
      form.setValue('route_distance', null);
      form.setValue('route_duration', null);
    }
  };

  // Handle file upload
  const handleFileSelect = (file: File | null, sanitizedFilename?: string) => {
    setUploadedFile(file);
    if (file) {
      setUploadedFileName(sanitizedFilename || file.name);
      form.setValue('receipt_file_id', sanitizedFilename || file.name);
    } else {
      setUploadedFileName('');
      form.setValue('receipt_file_id', '');
    }
  };

  const { mutate: createKumbaraDonation, isPending } = useMutation({
    mutationFn: async (data: KumbaraFormData) => {
      const response = await fetch('/api/kumbara', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kumbara bağışı oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['kumbara-donations'] });

      // Show success message with QR code
      if (response.data?.qr_code) {
        toast.success(
          <div className="space-y-2">
            <p>Kumbara bağışı başarıyla kaydedildi!</p>
            <p className="text-sm">QR Kod oluşturuldu. Kumbara detaylarını görmek için tıklayın.</p>
          </div>,
          {
            duration: 5000,
          }
        );
      } else {
        toast.success('Kumbara bağışı başarıyla kaydedildi');
      }

      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: KumbaraFormData) => {
    setIsSubmitting(true);
    try {
      let finalData = { ...data };

      // Upload file if present
      if (uploadedFile) {
        try {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('bucket', 'receipts');

          const uploadResponse = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: {
              'X-CSRF-Token': (await (await fetch('/api/csrf')).json()).token,
            },
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            if (uploadResult.success && uploadResult.data?.fileId) {
              finalData.receipt_file_id = uploadResult.data.fileId;
              toast.success('Dosya başarıyla yüklendi');
            }
          } else {
            const error = await uploadResponse.json();
            console.error('File upload failed:', error);
            toast.error('Dosya yükleme hatası: ' + (error.error || 'Bilinmeyen hata'));
            setIsSubmitting(false);
            return;
          }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error('Dosya yükleme işlemi başarısız');
          setIsSubmitting(false);
          return;
        }
      }

      // Create kumbara donation with uploaded file info
      createKumbaraDonation(finalData);
    } catch (error) {
      console.error('Error creating kumbara donation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number, currency: 'TRY' | 'USD' | 'EUR') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Yeni Kumbara Bağışı</CardTitle>
        <CardDescription className="text-sm">
          Kumbara bağışını kaydetmek için formu doldurunuz. <span className="text-red-500">*</span> zorunlu alanlar
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Bağışçı Bilgileri */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-700">👤 Bağışçı Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <FormField
                  control={form.control}
                  name="donor_name"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Bağışçı Adı" required error={String(form.formState.errors.donor_name?.message || '')}>
                      <Input {...field} placeholder="Ad Soyad" />
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="donor_phone"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Telefon" required error={String(form.formState.errors.donor_phone?.message || '')}>
                      <Input {...field} placeholder="5XXXXXXXXX" />
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="donor_email"
                  render={({ field }: any) => (
                    <FieldWithValidation label="E-posta" error={String(form.formState.errors.donor_email?.message || '')}>
                      <Input type="email" {...field} placeholder="ornek@email.com" />
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receipt_number"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Makbuz Numarası" required error={String(form.formState.errors.receipt_number?.message || '')}>
                      <Input {...field} placeholder="KB-2024-001" />
                    </FieldWithValidation>
                  )}
                />
              </div>
            </div>

            {/* Bağış Detayları */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-700">💰 Bağış Detayları</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Tutar" required error={String(form.formState.errors.amount?.message || '')}>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Para Birimi" required error={String(form.formState.errors.currency?.message || '')}>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                          <SelectItem value="USD">Amerikan Doları ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Ödeme Yöntemi" required error={String(form.formState.errors.payment_method?.message || '')}>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Nakit">Nakit</SelectItem>
                          <SelectItem value="Banka Kartı">Banka Kartı</SelectItem>
                          <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                          <SelectItem value="Havale/EFT">Havale/EFT</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldWithValidation>
                  )}
                />
              </div>
            </div>

            {/* Kumbara Bilgileri ve Harita */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-blue-600">🏦 Kumbara Bilgileri & Harita</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="kumbara_location"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Kumbara Lokasyonu" required error={String(form.formState.errors.kumbara_location?.message || '')}>
                      <Input {...field} placeholder="Örn: Ofis Giriş, Market Girişi" />
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kumbara_institution"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Kurum/Adres" required error={String(form.formState.errors.kumbara_institution?.message || '')}>
                      <Input {...field} placeholder="Örn: ABC A.Ş. - Merkez Mah. No:123" />
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collection_date"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Toplama Tarihi" required error={String(form.formState.errors.collection_date?.message || '')}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'dd MMMM yyyy', { locale: tr })
                              ) : (
                                <span>Tarih seçiniz</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FieldWithValidation>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Durum" required error={String(form.formState.errors.status?.message || '')}>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Beklemede</SelectItem>
                          <SelectItem value="completed">Tamamlandı</SelectItem>
                          <SelectItem value="cancelled">İptal Edildi</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldWithValidation>
                  )}
                />
              </div>
            </div>

            {/* Harita ve Konum Seçimi - Daraltılmış */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-green-600">🗺️ Konum & Rota</h3>
                <span className="text-xs text-muted-foreground">(İsteğe bağlı)</span>
              </div>
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                onRouteUpdate={handleRouteUpdate}
                height="400px"
                className="border border-green-200"
              />
            </div>

            {/* Alt Bölüm: Notlar ve Belgeler - Yan Yana */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Notlar - Kompakt */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-700">📝 Notlar</h3>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }: any) => (
                    <FieldWithValidation label="Ek Notlar" error={String(form.formState.errors.notes?.message || '')}>
                      <Textarea
                        {...field}
                        placeholder="İsteğe bağlı notlar..."
                        rows={4}
                        className="resize-none"
                      />
                    </FieldWithValidation>
                  )}
                />
              </div>

              {/* Dosya Yükleme - Kompakt */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-purple-600">📎 Belgeler</h3>
                <p className="text-xs text-muted-foreground -mt-1">
                  Makbuz/fotoğraf (isteğe bağlı)
                </p>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept="image/*,.pdf"
                  maxSize={10}
                  placeholder="Belge seçin"
                  disabled={isPending || isSubmitting}
                  allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf']}
                  allowedExtensions={['jpg', 'jpeg', 'png', 'webp', 'pdf']}
                />
              </div>
            </div>

            {/* Action Buttons - Kompakt */}
            <div className="flex gap-3 pt-3 border-t">
              <Button
                type="submit"
                disabled={isPending || isSubmitting}
                className="flex-1 h-11"
                size="lg"
              >
                {isPending || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  '💾 Kumbara Kaydet'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending || isSubmitting}
                className="h-11 px-6"
              >
                ✖️ İptal
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
