'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Heart, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  FileText,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface OrphanAssistance {
  id: string;
  studentId: string;
  orphanType: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  assistanceType: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'CANCELLED';
  caseManager: string;
  lastCheckupDate?: string;
  nextCheckupDate?: string;
  notes?: string;
  studentName?: string;
}

const mockOrphanData: OrphanAssistance[] = [
  {
    id: 'orphan-001',
    studentId: 'student-001',
    orphanType: 'FULL_ORPHAN',
    guardianName: 'Fatma Yılmaz',
    guardianPhone: '5552345678',
    guardianRelation: 'Teyze',
    assistanceType: 'SCHOLARSHIP',
    amount: 3000,
    currency: 'TRY',
    startDate: '2024-01-01',
    status: 'ACTIVE',
    caseManager: 'admin@test.com',
    nextCheckupDate: '2024-12-01',
    notes: 'Düzenli takip gerekli',
    studentName: 'Ahmet Yılmaz'
  },
  {
    id: 'orphan-002',
    studentId: 'student-002',
    orphanType: 'PARTIAL_ORPHAN',
    guardianName: 'Mehmet Demir',
    guardianPhone: '5553456789',
    guardianRelation: 'Baba',
    assistanceType: 'MONTHLY_AID',
    amount: 1500,
    currency: 'TRY',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: 'ACTIVE',
    caseManager: 'manager@test.com',
    nextCheckupDate: '2024-11-15',
    studentName: 'Ayşe Demir'
  }
];

export default function YetimPage() {
  const [orphanData, setOrphanData] = useState<OrphanAssistance[]>(mockOrphanData);
  const [filteredData, setFilteredData] = useState<OrphanAssistance[]>(mockOrphanData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrphan, setSelectedOrphan] = useState<OrphanAssistance | null>(null);
  const [newOrphan, setNewOrphan] = useState({
    studentName: '',
    orphanType: 'FULL_ORPHAN',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    assistanceType: 'SCHOLARSHIP',
    amount: '',
    startDate: '',
    endDate: '',
    caseManager: '',
    notes: ''
  });

  useEffect(() => {
    filterData();
  }, [searchTerm, statusFilter, typeFilter, orphanData]);

  const filterData = () => {
    let filtered = [...orphanData];

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guardianPhone.includes(searchTerm)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(item => item.orphanType === typeFilter);
    }

    setFilteredData(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, icon: CheckCircle, text: 'Aktif' },
      SUSPENDED: { variant: 'destructive' as const, icon: AlertCircle, text: 'Askıya Alındı' },
      COMPLETED: { variant: 'secondary' as const, icon: CheckCircle, text: 'Tamamlandı' },
      CANCELLED: { variant: 'destructive' as const, icon: AlertCircle, text: 'İptal Edildi' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;

    return (
      <Badge variant={config?.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config?.text || status}
      </Badge>
    );
  };

  const getOrphanTypeBadge = (type: string) => {
    const typeNames: Record<string, string> = {
      FULL_ORPHAN: 'Tam Yetim',
      PARTIAL_ORPHAN: 'Kısmi Yetim',
      ABANDONED: ' Terk Edilmiş',
      PROTECTED: 'Koruma Altında'
    };

    return (
      <Badge variant="outline">
        {typeNames[type] || type}
      </Badge>
    );
  };

  const getAssistanceTypeBadge = (type: string) => {
    const typeNames: Record<string, string> = {
      SCHOLARSHIP: 'Burs',
      MONTHLY_AID: 'Aylık Yardım',
      EMERGENCY: 'Acil Yardım',
      EDUCATIONAL_SUPPORT: 'Eğitim Desteği'
    };

    return (
      <Badge variant="secondary">
        {typeNames[type] || type}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCreateOrphan = async () => {
    try {
      if (!newOrphan.studentName || !newOrphan.guardianName || !newOrphan.assistanceType) {
        toast.error('Öğrenci adı, veli bilgileri ve yardım türü zorunludur');
        return;
      }

      // Mock create - in real implementation, this would call an API
      const mockOrphan: OrphanAssistance = {
        id: `orphan-${Date.now()}`,
        studentId: `student-${Date.now()}`,
        orphanType: newOrphan.orphanType,
        guardianName: newOrphan.guardianName,
        guardianPhone: newOrphan.guardianPhone,
        guardianRelation: newOrphan.guardianRelation,
        assistanceType: newOrphan.assistanceType,
        amount: parseFloat(newOrphan.amount) || 0,
        currency: 'TRY',
        startDate: newOrphan.startDate,
        endDate: newOrphan.endDate || undefined,
        status: 'ACTIVE',
        caseManager: newOrphan.caseManager || 'current-user',
        nextCheckupDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: newOrphan.notes,
        studentName: newOrphan.studentName
      };

      setOrphanData(prev => [mockOrphan, ...prev]);
      toast.success('Yetim yardımı başarıyla oluşturuldu');
      
      setShowCreateDialog(false);
      setNewOrphan({
        studentName: '',
        orphanType: 'FULL_ORPHAN',
        guardianName: '',
        guardianPhone: '',
        guardianRelation: '',
        assistanceType: 'SCHOLARSHIP',
        amount: '',
        startDate: '',
        endDate: '',
        caseManager: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating orphan assistance:', error);
      toast.error('Yetim yardımı oluşturulurken hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yetim Yardımları</h1>
          <p className="text-muted-foreground">
            Yetim öğrenciler ve ailelerine yönelik yardım programlarını yönetin
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Yardım
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Yardım</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orphanData.length}</div>
            <p className="text-xs text-muted-foreground">
              Aktif yardım sayısı
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Yardımlar</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orphanData.filter(item => item.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Devam eden yardımlar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(orphanData.reduce((sum, item) => sum + item.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Aylık toplam yardım
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Takip Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orphanData.filter(item => {
                if (!item.nextCheckupDate) return false;
                const nextCheckup = new Date(item.nextCheckupDate);
                const today = new Date();
                const diffDays = Math.ceil((nextCheckup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= 7 && diffDays >= 0;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              7 gün içinde takip
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <Label htmlFor="search">Ara</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Öğrenci adı, veli adı, telefon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <Label htmlFor="status-filter">Durum</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm durumlar</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="SUSPENDED">Askıya Alındı</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[150px]">
              <Label htmlFor="type-filter">Yetim Türü</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm türler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm türler</SelectItem>
                  <SelectItem value="FULL_ORPHAN">Tam Yetim</SelectItem>
                  <SelectItem value="PARTIAL_ORPHAN">Kısmi Yetim</SelectItem>
                  <SelectItem value="ABANDONED">Terk Edilmiş</SelectItem>
                  <SelectItem value="PROTECTED">Koruma Altında</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orphan List */}
      <Card>
        <CardHeader>
          <CardTitle>Yetim Yardımları ({filteredData.length})</CardTitle>
          <CardDescription>
            Toplam {filteredData.length} yardım kaydı bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Yardım kaydı bulunamadı</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Yeni bir yetim yardımı oluşturun
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((orphan) => (
                <Card key={orphan.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {orphan.studentName}
                          </h3>
                          {getStatusBadge(orphan.status)}
                          {getOrphanTypeBadge(orphan.orphanType)}
                          {getAssistanceTypeBadge(orphan.assistanceType)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{orphan.guardianName} ({orphan.guardianRelation})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{orphan.guardianPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(orphan.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Başlangıç: {new Date(orphan.startDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        {orphan.nextCheckupDate && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="text-orange-600">
                              Sonraki takip: {new Date(orphan.nextCheckupDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Yetim Yardım Detayları</DialogTitle>
                              <DialogDescription>
                                {orphan.studentName} - {orphan.guardianName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Öğrenci</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {orphan.studentName}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Yetim Türü</Label>
                                  <div className="mt-1">
                                    {getOrphanTypeBadge(orphan.orphanType)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Veli</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {orphan.guardianName} ({orphan.guardianRelation})
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Telefon</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {orphan.guardianPhone}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Yardım Türü</Label>
                                  <div className="mt-1">
                                    {getAssistanceTypeBadge(orphan.assistanceType)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Tutar</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatCurrency(orphan.amount)}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Başlangıç Tarihi</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(orphan.startDate).toLocaleDateString('tr-TR')}
                                  </p>
                                </div>
                                {orphan.endDate && (
                                  <div>
                                    <Label className="text-sm font-medium">Bitiş Tarihi</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(orphan.endDate).toLocaleDateString('tr-TR')}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <Label className="text-sm font-medium">Durum</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(orphan.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Vaka Yöneticisi</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {orphan.caseManager}
                                  </p>
                                </div>
                                {orphan.nextCheckupDate && (
                                  <div>
                                    <Label className="text-sm font-medium">Sonraki Takip</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(orphan.nextCheckupDate).toLocaleDateString('tr-TR')}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {orphan.notes && (
                                <div>
                                  <Label className="text-sm font-medium">Notlar</Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {orphan.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Orphan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Yetim Yardımı</DialogTitle>
            <DialogDescription>
              Yeni bir yetim öğrenci yardımı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Öğrenci Adı *</Label>
                <Input
                  id="studentName"
                  value={newOrphan.studentName}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, studentName: e.target.value }))}
                  placeholder="Öğrenci adı soyadı"
                />
              </div>
              <div>
                <Label htmlFor="orphanType">Yetim Türü</Label>
                <Select
                  value={newOrphan.orphanType}
                  onValueChange={(value) => setNewOrphan(prev => ({ ...prev, orphanType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_ORPHAN">Tam Yetim</SelectItem>
                    <SelectItem value="PARTIAL_ORPHAN">Kısmi Yetim</SelectItem>
                    <SelectItem value="ABANDONED">Terk Edilmiş</SelectItem>
                    <SelectItem value="PROTECTED">Koruma Altında</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guardianName">Veli Adı *</Label>
                <Input
                  id="guardianName"
                  value={newOrphan.guardianName}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, guardianName: e.target.value }))}
                  placeholder="Veli adı"
                />
              </div>
              <div>
                <Label htmlFor="guardianPhone">Veli Telefonu</Label>
                <Input
                  id="guardianPhone"
                  value={newOrphan.guardianPhone}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, guardianPhone: e.target.value }))}
                  placeholder="5551234567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guardianRelation">Yakınlık</Label>
                <Input
                  id="guardianRelation"
                  value={newOrphan.guardianRelation}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, guardianRelation: e.target.value }))}
                  placeholder="Anne, baba, teyze..."
                />
              </div>
              <div>
                <Label htmlFor="assistanceType">Yardım Türü *</Label>
                <Select
                  value={newOrphan.assistanceType}
                  onValueChange={(value) => setNewOrphan(prev => ({ ...prev, assistanceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHOLARSHIP">Burs</SelectItem>
                    <SelectItem value="MONTHLY_AID">Aylık Yardım</SelectItem>
                    <SelectItem value="EMERGENCY">Acil Yardım</SelectItem>
                    <SelectItem value="EDUCATIONAL_SUPPORT">Eğitim Desteği</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Tutar (TL) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newOrphan.amount}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="3000"
                />
              </div>
              <div>
                <Label htmlFor="caseManager">Vaka Yöneticisi</Label>
                <Input
                  id="caseManager"
                  value={newOrphan.caseManager}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, caseManager: e.target.value }))}
                  placeholder="admin@test.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newOrphan.startDate}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newOrphan.endDate}
                  onChange={(e) => setNewOrphan(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={newOrphan.notes}
                onChange={(e) => setNewOrphan(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ek bilgiler..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateOrphan}>
              Yardım Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}