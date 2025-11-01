'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getApplications,
  getScholarships,
  getStudents,
  createApplication
} from '@/lib/api/mock-api';
import {
  Scholarship,
  Student,
  ScholarshipApplication,
  ApplicationStatus,
  ScholarshipType,
  StudentStatus
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Users, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface ApplicationWithDetails extends ScholarshipApplication {
  scholarship?: Scholarship;
  student?: Student;
}

interface ApplicationFilters {
  status?: ApplicationStatus;
  scholarshipId?: string;
  studentId?: string;
}

export default function BursBasvurularPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newApplication, setNewApplication] = useState({
    scholarshipId: '',
    studentId: '',
    personalStatement: '',
    familySituation: '',
    financialNeed: '',
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load applications
      const applicationsResult = await getApplications({
        search: searchTerm,
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      });

      if (applicationsResult.success) {
        // Enrich applications with scholarship and student data
        const enrichedApplications = (applicationsResult.data?.data || []).map(app => ({
          ...app,
          scholarship: scholarships.find(s => s.id === app.scholarshipId),
          student: students.find(st => st.id === app.studentId)
        }));
        setApplications(enrichedApplications);
        setTotalCount(applicationsResult.data?.total || 0);
      }

      // Load scholarships and students if not loaded
      if (scholarships.length === 0) {
        const scholarshipsResult = await getScholarships({ isActive: true });
        if (scholarshipsResult.success) {
          setScholarships(scholarshipsResult.data?.data || []);
        }
      }

      if (students.length === 0) {
        const studentsResult = await getStudents({ status: StudentStatus.ACTIVE });
        if (studentsResult.success) {
          setStudents(studentsResult.data?.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      [ApplicationStatus.DRAFT]: { variant: 'secondary' as const, icon: FileText, text: 'Taslak' },
      [ApplicationStatus.SUBMITTED]: { variant: 'default' as const, icon: Clock, text: 'Gönderildi' },
      [ApplicationStatus.UNDER_REVIEW]: { variant: 'default' as const, icon: Eye, text: 'İnceleniyor' },
      [ApplicationStatus.APPROVED]: { variant: 'default' as const, icon: CheckCircle, text: 'Onaylandı' },
      [ApplicationStatus.REJECTED]: { variant: 'destructive' as const, icon: XCircle, text: 'Reddedildi' },
      [ApplicationStatus.WAITLIST]: { variant: 'secondary' as const, icon: Clock, text: 'Beklemede' },
      [ApplicationStatus.WITHDRAWN]: { variant: 'outline' as const, icon: UserCheck, text: 'Çekildi' },
      [ApplicationStatus.CANCELLED]: { variant: 'destructive' as const, icon: XCircle, text: 'İptal' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleCreateApplication = async () => {
    try {
      if (!newApplication.scholarshipId || !newApplication.studentId) {
        toast.error('Burs ve öğrenci seçimi zorunludur');
        return;
      }

      const result = await createApplication({
        scholarshipId: newApplication.scholarshipId,
        studentId: newApplication.studentId,
        personalStatement: newApplication.personalStatement,
        familySituation: newApplication.familySituation,
        financialNeed: newApplication.financialNeed
      });

      if (result.success) {
        toast.success('Başvuru başarıyla oluşturuldu');
        setShowCreateDialog(false);
        setNewApplication({
          scholarshipId: '',
          studentId: '',
          personalStatement: '',
          familySituation: '',
          financialNeed: '',
        });
        loadData();
      } else {
        toast.error('Başvuru oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating application:', error);
      toast.error('Başvuru oluşturulurken hata oluştu');
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ApplicationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Burs Başvuruları</h1>
          <p className="text-muted-foreground">
            Burs başvurularını yönetin ve değerlendirin
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Başvuru
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
                  placeholder="Öğrenci adı, burs adı..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-[200px]">
              <Label htmlFor="status-filter">Durum</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm durumlar</SelectItem>
                  <SelectItem value={ApplicationStatus.DRAFT}>Taslak</SelectItem>
                  <SelectItem value={ApplicationStatus.SUBMITTED}>Gönderildi</SelectItem>
                  <SelectItem value={ApplicationStatus.UNDER_REVIEW}>İnceleniyor</SelectItem>
                  <SelectItem value={ApplicationStatus.APPROVED}>Onaylandı</SelectItem>
                  <SelectItem value={ApplicationStatus.REJECTED}>Reddedildi</SelectItem>
                  <SelectItem value={ApplicationStatus.WAITLIST}>Beklemede</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Label htmlFor="scholarship-filter">Burs</Label>
              <Select
                value={filters.scholarshipId || ''}
                onValueChange={(value) => handleFilterChange('scholarshipId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm burslar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm burslar</SelectItem>
                  {scholarships.map((scholarship) => (
                    <SelectItem key={scholarship.id} value={scholarship.id}>
                      {scholarship.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Başvurular ({totalCount})</CardTitle>
          <CardDescription>
            Toplam {totalCount} başvuru bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Başvuru bulunamadı</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Yeni bir burs başvurusu oluşturun
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {application.student?.firstName} {application.student?.lastName}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>{application.scholarship?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{application.student?.institution}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
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
                              <DialogTitle>Başvuru Detayları</DialogTitle>
                              <DialogDescription>
                                {application.student?.firstName} {application.student?.lastName} - {application.scholarship?.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Öğrenci</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {application.student?.firstName} {application.student?.lastName}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Burs</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {application.scholarship?.name}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Durum</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(application.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Başvuru Tarihi</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                                  </p>
                                </div>
                              </div>
                              {application.personalStatement && (
                                <div>
                                  <Label className="text-sm font-medium">Kişisel Beyan</Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {application.personalStatement}
                                  </p>
                                </div>
                              )}
                              {application.familySituation && (
                                <div>
                                  <Label className="text-sm font-medium">Aile Durumu</Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {application.familySituation}
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

      {/* Create Application Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Burs Başvurusu</DialogTitle>
            <DialogDescription>
              Yeni bir burs başvurusu oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scholarship">Burs *</Label>
                <Select
                  value={newApplication.scholarshipId}
                  onValueChange={(value) => setNewApplication(prev => ({ ...prev, scholarshipId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Burs seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {scholarships.map((scholarship) => (
                      <SelectItem key={scholarship.id} value={scholarship.id}>
                        {scholarship.name} - {scholarship.amount} {scholarship.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="student">Öğrenci *</Label>
                <Select
                  value={newApplication.studentId}
                  onValueChange={(value) => setNewApplication(prev => ({ ...prev, studentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Öğrenci seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="personalStatement">Kişisel Beyan</Label>
              <Textarea
                id="personalStatement"
                placeholder="Kendiniz hakkında kısa bilgi..."
                value={newApplication.personalStatement}
                onChange={(e) => setNewApplication(prev => ({ ...prev, personalStatement: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="familySituation">Aile Durumu</Label>
              <Textarea
                id="familySituation"
                placeholder="Aile durumunuz hakkında bilgi..."
                value={newApplication.familySituation}
                onChange={(e) => setNewApplication(prev => ({ ...prev, familySituation: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="financialNeed">Mali İhtiyaç</Label>
              <Textarea
                id="financialNeed"
                placeholder="Mali durumunuz hakkında bilgi..."
                value={newApplication.financialNeed}
                onChange={(e) => setNewApplication(prev => ({ ...prev, financialNeed: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateApplication}>
              Başvuru Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}