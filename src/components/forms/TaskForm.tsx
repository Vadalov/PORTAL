
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Loader2, X, AlertCircle, User, Calendar } from 'lucide-react';
import { taskSchema, type TaskFormData, getPriorityColor, getStatusColor, getPriorityLabel, getStatusLabel, isTaskDueSoon } from '@/lib/validations/task';
import type { UserDocument } from '@/types/collections';

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<TaskFormData>;
  taskId?: string; // If provided, it's edit mode
}

export function TaskForm({ onSuccess, onCancel, initialData, taskId }: TaskFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.due_date ? new Date(initialData.due_date) : undefined
  );

  const isEditMode = !!taskId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      assigned_to: initialData?.assigned_to || '',
      created_by: user?.id || '',
      priority: initialData?.priority || 'normal',
      status: initialData?.status || 'pending',
      due_date: initialData?.due_date || '',
      category: initialData?.category || '',
      tags: initialData?.tags || [],
      is_read: initialData?.is_read || false,
    },
  });

  // Fetch users for assigned_to dropdown
  // Fetch users for assignment - disabled for now
  // const { data: usersResponse } = useQuery({
  //   queryKey: ['users'],
  //   queryFn: () => api.users.getUsers({ limit: 100 } as any),
  //   enabled: true,
  // });

  const users: any[] = []; // Empty for now

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => api.tasks.createTask(data),
    onSuccess: () => {
      toast.success('Görev başarıyla oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error('Görev oluşturulurken hata oluştu: ' + error.message);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => api.tasks.updateTask(taskId!, data),
    onSuccess: () => {
      toast.success('Görev başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error('Görev güncellenirken hata oluştu: ' + error.message);
    },
  });

  // Set created_by when user is available
  useEffect(() => {
    if (user?.id && !isEditMode) {
      setValue('created_by', user.id);
    }
  }, [user?.id, setValue, isEditMode]);

  // Handle tag input
  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && tags.length < 10 && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // Handle due date change
  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date);
    setValue('due_date', date?.toISOString() || '');
  };

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // Auto-set completed_at when status becomes 'completed'
      if (data.status === 'completed' && !data.completed_at) {
        data.completed_at = new Date().toISOString();
      }

      if (isEditMode) {
        await updateTaskMutation.mutateAsync(data);
      } else {
        await createTaskMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus = watch('status');
  const currentPriority = watch('priority');
  const isDueSoon = dueDate && isTaskDueSoon(dueDate.toISOString());

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Görev Düzenle' : 'Yeni Görev Ekle'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'Görev bilgilerini güncelleyin' : 'Görev bilgilerini girerek yeni kayıt oluşturun'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Görev başlığını girin"
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Görev detaylarını açıklayın"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Atanan Kişi</Label>
            <Select
              value={watch('assigned_to')}
              onValueChange={(value) => setValue('assigned_to', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kişi seçin veya boş bırakın" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Atanmadı</SelectItem>
                {users.map((user: UserDocument) => (
                  <SelectItem key={user.$id} value={user.$id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigned_to && (
              <p className="text-sm text-red-600">{errors.assigned_to.message}</p>
            )}
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Öncelik *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor('low')}>
                        {getPriorityLabel('low')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor('normal')}>
                        {getPriorityLabel('normal')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor('high')}>
                        {getPriorityLabel('high')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor('urgent')}>
                        {getPriorityLabel('urgent')}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor('pending')}>
                        {getStatusLabel('pending')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor('in_progress')}>
                        {getStatusLabel('in_progress')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor('completed')}>
                        {getStatusLabel('completed')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor('cancelled')}>
                        {getStatusLabel('cancelled')}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Son Tarih</Label>
            <div className="flex items-center gap-2">
              <DatePicker
                value={dueDate}
                onChange={handleDueDateChange}
                placeholder="Son tarih seçin"
                disabled={isSubmitting}
              />
              {isDueSoon && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Yaklaşıyor</span>
                </div>
              )}
            </div>
            {errors.due_date && (
              <p className="text-sm text-red-600">{errors.due_date.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="Kategori (örn: Bağış, Yardım, İdari)"
              maxLength={50}
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler</Label>
            <div className="space-y-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Etiket yazın ve Enter'a basın"
                maxLength={30}
                disabled={tags.length >= 10}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {tags.length}/10 etiket
                </span>
                {tags.length >= 10 && (
                  <span className="text-sm text-red-500">
                    Maksimum etiket sayısına ulaşıldı
                  </span>
                )}
              </div>
            </div>
            
            {/* Display tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-sm text-red-600">{errors.tags.message}</p>
            )}
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
                  {isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                </>
              ) : (
                isEditMode ? 'Güncelle' : 'Kaydet'
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
