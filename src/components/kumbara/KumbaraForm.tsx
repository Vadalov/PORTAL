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
      collection_date: new Date().toISOString().split('T')[0], // Bugünün tarihi
    },
    mode: 'onChange', // Real-time validation
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
        const errorMessage = error.error || 'Kumbara bağışı oluşturulamadı';
        const errorDetails = error.details ? (Array.isArray(error.details) ? error.details.join(', ') : error.details) : '';
        throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
      }

      return response.json();
    },
    onSuccess: (response) => {
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: KumbaraFormData) => {
    setIsSubmitting(true);
    try {
      const finalData = { ...data };

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
            toast.error(`Dosya yükleme hatası: ${  error.error || 'Bilinmeyen hata'}`);
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

      // Clean up location coordinates - only send if both lat and lng are valid
      if (finalData.location_coordinates) {
        const { lat, lng } = finalData.location_coordinates;
        if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
          finalData.location_coordinates = undefined;
        }
      }

      // Create kumbara donation with uploaded file info
      console.log('Submitting kumbara donation:', finalData);
      createKumbaraDonation(finalData);
      // Note: setIsSubmitting(false) is called in onSuccess/onError callbacks
    } catch (error) {
      console.error('Error creating kumbara donation:', error);
      setIsSubmitting(false);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const formatCurrency = (value: number, currency: 'TRY' | 'USD' | 'EUR') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(value);
  };

  // Form completion progress
  const watchedFields = form.watch();
  const requiredFields = ['donor_name', 'donor_phone', 'amount', 'currency', 'kumbara_location', 'kumbara_institution', 'collection_date', 'receipt_number'];
  const completedFields = requiredFields.filter(field => {
    const value = watchedFields[field];
    return value !== undefined && value !== null && value !== '';
  });
  const progress = Math.round((completedFields.length / requiredFields.length) * 100);

  return (
    <div className="w-full">
      <div className="mb-2 pb-2 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <span className="text-lg">🐷</span>
              Yeni Kumbara Bağışı
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Formu doldurunuz. <span className="text-red-500 font-semibold">*</span> zorunlu
            </p>
          </div>
          {/* Progress Indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs font-medium text-muted-foreground">
              %{progress}
            </div>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            {/* Bağışçı Bilgileri */}
            <div className="space-y-2 p-2 bg-gray-50/50 dark:bg-gray-900/20 rounded-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">👤</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Bağışçı Bilgileri</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="donor_name"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Bağışçı Adı <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ahmet Yılmaz"
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="donor_phone"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Telefon <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="5XX XXX XX XX"
                          className="h-8 text-sm"
                          maxLength={11}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="donor_email"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">E-posta</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="ornek@email.com"
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receipt_number"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Makbuz No <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="KB-2024-001"
                          className="h-8 text-sm font-mono"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bağış Detayları */}
            <div className="space-y-2 p-2 bg-green-50/50 dark:bg-green-900/10 rounded-md border border-green-200 dark:border-green-900/30">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">💰</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Bağış Detayları</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Tutar <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              field.onChange(value);
                            }}
                            placeholder="0.00"
                            className="h-8 pr-12 text-sm font-semibold"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                            {form.watch('currency') === 'TRY' ? '₺' : form.watch('currency') === 'USD' ? '$' : '€'}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Para Birimi <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRY">🇹🇷 TRY (₺)</SelectItem>
                          <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                          <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Ödeme <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Nakit">💵 Nakit</SelectItem>
                          <SelectItem value="Banka Kartı">💳 Banka Kartı</SelectItem>
                          <SelectItem value="Kredi Kartı">💳 Kredi Kartı</SelectItem>
                          <SelectItem value="Havale/EFT">🏦 Havale/EFT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Kumbara Bilgileri */}
            <div className="space-y-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-900/30">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🏦</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Kumbara Bilgileri</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="kumbara_location"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Lokasyon <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ofis Giriş, Market"
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kumbara_institution"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Kurum/Adres <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ABC A.Ş. - Merkez Mah."
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collection_date"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Tarih <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full h-8 pl-2 text-xs text-left font-normal justify-start',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-1.5 h-3 w-3" />
                              {field.value ? (
                                format(new Date(field.value), 'dd.MM.yyyy', { locale: tr })
                              ) : (
                                <span>Tarih seçiniz</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : new Date()}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, 'yyyy-MM-dd'));
                              }
                            }}
                            initialFocus
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">
                        Durum <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">⏳ Beklemede</SelectItem>
                          <SelectItem value="completed">✅ Tamamlandı</SelectItem>
                          <SelectItem value="cancelled">❌ İptal Edildi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Konum Bilgileri - Harita olmadan */}
            <div className="space-y-2 p-2 bg-green-50/50 dark:bg-green-900/10 rounded-md border border-green-200 dark:border-green-900/30">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📍</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Konum (Opsiyonel)</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="location_address"
                  render={({ field }: any) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Adres</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Merkez Mah. No:123"
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location_coordinates"
                  render={({ field }: any) => {
                    const currentLat = field.value?.lat;
                    const currentLng = field.value?.lng;
                    
                    return (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Koordinatlar</FormLabel>
                        <div className="flex gap-1.5">
                          <Input 
                            placeholder="Lat"
                            className="h-8 text-xs"
                            type="number"
                            step="any"
                            value={currentLat !== undefined && currentLat !== null ? currentLat : ''}
                            onChange={(e) => {
                              const latStr = e.target.value.trim();
                              const lat = latStr === '' ? undefined : parseFloat(latStr);
                              const lng = currentLng !== undefined && currentLng !== null ? currentLng : undefined;
                              
                              // Sadece her ikisi de geçerli sayı olduğunda kaydet
                              if (latStr === '') {
                                // Lat boşsa, koordinatları temizle
                                field.onChange(undefined);
                                setMapLocation(null);
                              } else if (!isNaN(lat as number)) {
                                // Lat geçerli, lng de geçerliyse kaydet
                                const newValue = (lng !== undefined && !isNaN(lng)) 
                                  ? { lat, lng }
                                  : undefined;
                                field.onChange(newValue);
                                setMapLocation(newValue || null);
                              }
                            }}
                          />
                          <Input 
                            placeholder="Lng"
                            className="h-8 text-xs"
                            type="number"
                            step="any"
                            value={currentLng !== undefined && currentLng !== null ? currentLng : ''}
                            onChange={(e) => {
                              const lngStr = e.target.value.trim();
                              const lng = lngStr === '' ? undefined : parseFloat(lngStr);
                              const lat = currentLat !== undefined && currentLat !== null ? currentLat : undefined;
                              
                              // Sadece her ikisi de geçerli sayı olduğunda kaydet
                              if (lngStr === '') {
                                // Lng boşsa, koordinatları temizle
                                field.onChange(undefined);
                                setMapLocation(null);
                              } else if (!isNaN(lng as number)) {
                                // Lng geçerli, lat de geçerliyse kaydet
                                const newValue = (lat !== undefined && !isNaN(lat))
                                  ? { lat, lng }
                                  : undefined;
                                field.onChange(newValue);
                                setMapLocation(newValue || null);
                              }
                            }}
                          />
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>

            {/* Alt Bölüm: Notlar ve Belgeler */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Notlar */}
              <div className="space-y-1 p-1.5 bg-amber-50/50 dark:bg-amber-900/10 rounded border border-amber-200 dark:border-amber-900/30">
                <div className="flex items-center gap-1">
                  <span className="text-xs">📝</span>
                  <h3 className="text-[10px] font-medium text-gray-900 dark:text-gray-100">Notlar</h3>
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }: any) => (
                    <FormItem className="mb-0">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="..."
                          rows={1}
                          className="resize-none text-xs h-8 py-1"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dosya Yükleme */}
              <div className="space-y-1 p-1.5 bg-purple-50/50 dark:bg-purple-900/10 rounded border border-purple-200 dark:border-purple-900/30">
                <div className="flex items-center gap-1">
                  <span className="text-xs">📎</span>
                  <h3 className="text-[10px] font-medium text-gray-900 dark:text-gray-100">Belge</h3>
                </div>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept="image/*,.pdf"
                  maxSize={10}
                  placeholder="Seç"
                  disabled={isPending || isSubmitting}
                  allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf']}
                  allowedExtensions={['jpg', 'jpeg', 'png', 'webp', 'pdf']}
                  className="space-y-1"
                  compact={true}
                />
                {uploadedFileName && (
                  <div className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span className="truncate">{uploadedFileName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="submit"
                disabled={isPending || isSubmitting || !form.formState.isValid}
                className="flex-1 h-8 text-xs font-semibold"
              >
                {isPending || isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <span className="mr-1.5">💾</span>
                    Kaydet
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending || isSubmitting}
                className="h-8 px-4 text-xs"
              >
                <span className="mr-1.5">✖️</span>
                İptal
              </Button>
            </div>
            
            {/* Form Validation Summary */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-0.5">
                      Hataları düzeltin
                    </p>
                    <ul className="text-xs text-red-700 dark:text-red-300 space-y-0.5">
                      {Object.entries(form.formState.errors).slice(0, 2).map(([field, error]: any) => (
                        <li key={field}>• {error?.message || `${field} hatalı`}</li>
                      ))}
                      {Object.keys(form.formState.errors).length > 2 && (
                        <li>• +{Object.keys(form.formState.errors).length - 2} hata daha</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
    </div>
  );
}
