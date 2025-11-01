'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getStudents,
  getStudent,
  createStudent
} from '@/lib/api/mock-api';
import {
  Student,
  StudentStatus,
  EducationLevel,
  OrphanStatus
} from '@/types/scholarship';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  BookOpen, 
  Mail, 
  Phone,
  MapPin,
  GraduationCap,
  DollarSign,
  Users,
  Heart
} from 'lucide-react';

export default function OgrencilerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    educationLevel: '',
    isOrphan: '',
    city: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    birthDate: '',
    gender: 'MALE',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Türkiye',
    educationLevel: EducationLevel.BACHELOR,
    institution: '',
    department: '',
    grade: '',
    gpa: '',
    academicYear: '2024-2025',
    familyIncome: '',
    familySize: '',
    isOrphan: false,
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    notes: '',
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const result = await getStudents({
        search: searchTerm,
        status: filters.status as StudentStatus || undefined,
        educationLevel: filters.educationLevel as EducationLevel || undefined,
        isOrphan: filters.isOrphan === 'true' ? true : filters.isOrphan === 'false' ? false : undefined,
        city: filters.city || undefined,
        page: currentPage,
        limit: itemsPerPage
      });

      if (result.success) {
        setStudents(result.data?.data || []);
        setTotalCount(result.data?.total || 0);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Öğrenciler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: StudentStatus) => {
    const statusConfig = {
      [StudentStatus.ACTIVE]: { variant: 'default' as const, text: 'Aktif' },
      [StudentStatus.GRADUATED]: { variant: 'secondary' as const, text: 'Mezun' },
      [StudentStatus.SUSPENDED]: { variant: 'destructive' as const, text: 'Askıya Alındı' },
      [StudentStatus.DROPPED_OUT]: { variant: 'outline' as const, text: 'Okulu Bıraktı' },
      [StudentStatus.TRANSFERRED]: { variant: 'outline' as const, text: 'Transfer' }
    };

    const config = statusConfig[status];

    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const getEducationLevelBadge = (level: EducationLevel) => {
    const levelConfig = {
      [EducationLevel.PRIMARY]: { text: 'İlkokul' },
      [EducationLevel.SECONDARY]: { text: 'Ortaokul' },
      [EducationLevel.HIGH_SCHOOL]: { text: 'Lise' },
      [EducationLevel.BACHELOR]: { text: 'Lisans' },
      [EducationLevel.MASTER]: { text: 'Yüksek Lisans' },
      [EducationLevel.DOCTORATE]: { text: 'Doktora' },
      [EducationLevel.VOCATIONAL]: { text: 'Meslek' }
    };

    const config = levelConfig[level];

    return (
      <Badge variant="outline">
        {config.text}
      </Badge>
    );
  };

  const handleCreateStudent = async () => {
    try {
      if (!newStudent.firstName || !newStudent.lastName || !newStudent.institution) {
        toast.error('Ad, soyad ve eğitim kurumu zorunludur');
        return;
      }

      const studentData = {
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        nationalId: newStudent.nationalId || undefined,
        birthDate: newStudent.birthDate ? new Date(newStudent.birthDate) : undefined,
        gender: newStudent.gender as 'MALE' | 'FEMALE',
        email: newStudent.email || undefined,
        phone: newStudent.phone || undefined,
        address: newStudent.address || undefined,
        city: newStudent.city || undefined,
        country: newStudent.country,
        educationLevel: newStudent.educationLevel,
        institution: newStudent.institution,
        department: newStudent.department || undefined,
        grade: newStudent.grade || undefined,
        gpa: newStudent.gpa ? parseFloat(newStudent.gpa) : undefined,
        academicYear: newStudent.academicYear,
        familyIncome: newStudent.familyIncome ? parseFloat(newStudent.familyIncome) : undefined,
        familySize: newStudent.familySize ? parseInt(newStudent.familySize) : undefined,
        isOrphan: newStudent.isOrphan,
        guardianName: newStudent.guardianName || undefined,
        guardianPhone: newStudent.guardianPhone || undefined,
        guardianRelation: newStudent.guardianRelation || undefined,
        notes: newStudent.notes || undefined,
      };

      const result = await createStudent(studentData);

      if (result.success) {
        toast.success('Öğrenci başarıyla oluşturuldu');
        setShowCreateDialog(false);
        setNewStudent({
          firstName: '',
          lastName: '',
          nationalId: '',
          birthDate: '',
          gender: 'MALE',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: 'Türkiye',
          educationLevel: EducationLevel.BACHELOR,
          institution: '',
          department: '',
          grade: '',
          gpa: '',
          academicYear: '2024-2025',
          familyIncome: '',
          familySize: '',
          isOrphan: false,
          guardianName: '',
          guardianPhone: '',
          guardianRelation: '',
          notes: '',
        });
        loadData();
      } else {
        toast.error('Öğrenci oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Öğrenci oluşturulurken hata oluştu');
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Öğrenciler</h1>
          <p className="text-muted-foreground">
            Öğrenci bilgilerini yönetin ve düzenleyin
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Öğrenci
        </Button>
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
                  placeholder="Ad, soyad, TC No, kurum..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <Label htmlFor="status-filter">Durum</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm durumlar</SelectItem>
                  <SelectItem value={StudentStatus.ACTIVE}>Aktif</SelectItem>
                  <SelectItem value={StudentStatus.GRADUATED}>Mezun</SelectItem>
                  <SelectItem value={StudentStatus.SUSPENDED}>Askıya Alındı</SelectItem>
                  <SelectItem value={StudentStatus.DROPPED_OUT}>Okulu Bıraktı</SelectItem>
                  <SelectItem value={StudentStatus.TRANSFERRED}>Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[150px]">
              <Label htmlFor="education-filter">Eğitim Seviyesi</Label>
              <Select
                value={filters.educationLevel}
                onValueChange={(value) => handleFilterChange('educationLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm seviyeler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm seviyeler</SelectItem>
                  <SelectItem value={EducationLevel.PRIMARY}>İlkokul</SelectItem>
                  <SelectItem value={EducationLevel.SECONDARY}>Ortaokul</SelectItem>
                  <SelectItem value={EducationLevel.HIGH_SCHOOL}>Lise</SelectItem>
                  <SelectItem value={EducationLevel.BACHELOR}>Lisans</SelectItem>
                  <SelectItem value={EducationLevel.MASTER}>Yüksek Lisans</SelectItem>
                  <SelectItem value={EducationLevel.DOCTORATE}>Doktora</SelectItem>
                  <SelectItem value={EducationLevel.VOCATIONAL}>Meslek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[120px]">
              <Label htmlFor="orphan-filter">Yetim</Label>
              <Select
                value={filters.isOrphan}
                onValueChange={(value) => handleFilterChange('isOrphan', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hepsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Hepsi</SelectItem>
                  <SelectItem value="true">Evet</SelectItem>
                  <SelectItem value="false">Hayır</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Öğrenciler ({totalCount})</CardTitle>
          <CardDescription>
            Toplam {totalCount} öğrenci bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Öğrenci bulunamadı</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Yeni bir öğrenci kaydı oluşturun
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <Card key={student.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {student.firstName} {student.lastName}
                          </h3>
                          {getStatusBadge(student.status)}
                          {student.isOrphan && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <Heart className="h-3 w-3 mr-1" />
                              Yetim
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <span>{student.institution}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{getEducationLevelBadge(student.educationLevel)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{student.grade}</span>
                          </div>
                          {student.gpa && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>GPA: {student.gpa}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          {student.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                          {student.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{student.email}</span>
                            </div>
                          )}
                          {student.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{student.city}</span>
                            </div>
                          )}
                        </div>
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
                              <DialogTitle>Öğrenci Detayları</DialogTitle>
                              <DialogDescription>
                                {student.firstName} {student.lastName} - {student.institution}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Ad Soyad</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.firstName} {student.lastName}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">TC No</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.nationalId || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Durum</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(student.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Eğitim Seviyesi</Label>
                                  <div className="mt-1">
                                    {getEducationLevelBadge(student.educationLevel)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Eğitim Kurumu</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.institution}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Bölüm</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.department || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Sınıf</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.grade || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">GPA</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.gpa || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">E-posta</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.email || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Telefon</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.phone || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Şehir</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.city || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Aile Geliri</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.familyIncome ? `${student.familyIncome} TL` : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Aile Büyüklüğü</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.familySize || '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Yetim Durumu</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.isOrphan ? 'Evet' : 'Hayır'}
                                  </p>
                                </div>
                              </div>
                              {student.isOrphan && student.guardianName && (
                                <div>
                                  <Label className="text-sm font-medium">Veli Bilgileri</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.guardianName} ({student.guardianRelation}) - {student.guardianPhone}
                                  </p>
                                </div>
                              )}
                              {student.notes && (
                                <div>
                                  <Label className="text-sm font-medium">Notlar</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.notes}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {currentPage} / {totalPages} (Toplam {totalCount} kayıt)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* Create Student Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Öğrenci</DialogTitle>
            <DialogDescription>
              Yeni bir öğrenci kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Kişisel Bilgiler */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Ad"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input
                    id="lastName"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Soyad"
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">TC Kimlik No</Label>
                  <Input
                    id="nationalId"
                    value={newStudent.nationalId}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, nationalId: e.target.value }))}
                    placeholder="12345678901"
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={newStudent.birthDate}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Cinsiyet</Label>
                  <Select
                    value={newStudent.gender}
                    onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value as 'MALE' | 'FEMALE' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Erkek</SelectItem>
                      <SelectItem value="FEMALE">Kadın</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="5551234567"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={newStudent.city}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="İstanbul"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={newStudent.address}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adres bilgisi..."
                  rows={2}
                />
              </div>
            </div>

            {/* Eğitim Bilgileri */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Eğitim Bilgileri</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="educationLevel">Eğitim Seviyesi *</Label>
                  <Select
                    value={newStudent.educationLevel}
                    onValueChange={(value) => setNewStudent(prev => ({ ...prev, educationLevel: value as EducationLevel }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EducationLevel.PRIMARY}>İlkokul</SelectItem>
                      <SelectItem value={EducationLevel.SECONDARY}>Ortaokul</SelectItem>
                      <SelectItem value={EducationLevel.HIGH_SCHOOL}>Lise</SelectItem>
                      <SelectItem value={EducationLevel.BACHELOR}>Lisans</SelectItem>
                      <SelectItem value={EducationLevel.MASTER}>Yüksek Lisans</SelectItem>
                      <SelectItem value={EducationLevel.DOCTORATE}>Doktora</SelectItem>
                      <SelectItem value={EducationLevel.VOCATIONAL}>Meslek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="institution">Eğitim Kurumu *</Label>
                  <Input
                    id="institution"
                    value={newStudent.institution}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="Üniversite/Kurum adı"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Bölüm</Label>
                  <Input
                    id="department"
                    value={newStudent.department}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Bölüm adı"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Sınıf</Label>
                  <Input
                    id="grade"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="1. sınıf, 2. sınıf..."
                  />
                </div>
                <div>
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={newStudent.gpa}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, gpa: e.target.value }))}
                    placeholder="3.50"
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Akademik Yıl</Label>
                  <Input
                    id="academicYear"
                    value={newStudent.academicYear}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, academicYear: e.target.value }))}
                    placeholder="2024-2025"
                  />
                </div>
              </div>
            </div>

            {/* Aile ve Mali Durum */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Aile ve Mali Durum</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="familyIncome">Aylık Aile Geliri (TL)</Label>
                  <Input
                    id="familyIncome"
                    type="number"
                    value={newStudent.familyIncome}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, familyIncome: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="familySize">Aile Büyüklüğü</Label>
                  <Input
                    id="familySize"
                    type="number"
                    min="1"
                    value={newStudent.familySize}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, familySize: e.target.value }))}
                    placeholder="4"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOrphan"
                  checked={newStudent.isOrphan}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, isOrphan: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isOrphan" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Yetim öğrenci
                </Label>
              </div>
              {newStudent.isOrphan && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="guardianName">Veli Adı</Label>
                    <Input
                      id="guardianName"
                      value={newStudent.guardianName}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, guardianName: e.target.value }))}
                      placeholder="Veli adı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianPhone">Veli Telefonu</Label>
                    <Input
                      id="guardianPhone"
                      value={newStudent.guardianPhone}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, guardianPhone: e.target.value }))}
                      placeholder="5551234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianRelation">Yakınlık</Label>
                    <Input
                      id="guardianRelation"
                      value={newStudent.guardianRelation}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, guardianRelation: e.target.value }))}
                      placeholder="Anne, baba..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notlar */}
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={newStudent.notes}
                onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ek bilgiler..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateStudent}>
              Öğrenci Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}