'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getScholarshipStats,
  getStudentStats,
  getScholarships,
  getApplications
} from '@/lib/api/mock-api';
import {
  ScholarshipType,
  ApplicationStatus,
  StudentStatus
} from '@/types/scholarship';
import { 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp,
  BookOpen,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  scholarships: {
    total: number;
    active: number;
    byType: Record<ScholarshipType, number>;
    totalBudget: number;
  };
  students: {
    total: number;
    active: number;
    byEducationLevel: Record<string, number>;
    orphans: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejectionRate: number;
  };
}

export default function BursDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentScholarships, setRecentScholarships] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const [scholarshipStatsResult, studentStatsResult] = await Promise.all([
        getScholarshipStats(),
        getStudentStats()
      ]);

      // Load recent scholarships
      const scholarshipsResult = await getScholarships({ page: 1, limit: 5 });
      if (scholarshipsResult.success) {
        setRecentScholarships(scholarshipsResult.data?.data || []);
      }

      // Load recent applications
      const applicationsResult = await getApplications({ page: 1, limit: 5 });
      if (applicationsResult.success) {
        setRecentApplications(applicationsResult.data?.data || []);
      }

      if (scholarshipStatsResult.success && studentStatsResult.success) {
        // Calculate application stats from mock data
        const totalApplications = 45; // Mock data
        const pendingApplications = 12;
        const approvedApplications = 25;
        const rejectedApplications = totalApplications - pendingApplications - approvedApplications;
        
        setStats({
          scholarships: {
            total: scholarshipStatsResult.data?.total || 0,
            active: scholarshipStatsResult.data?.active || 0,
            byType: scholarshipStatsResult.data?.byType || {} as Record<ScholarshipType, number>,
            totalBudget: scholarshipStatsResult.data?.totalBudget || 0
          },
          students: {
            total: studentStatsResult.data?.total || 0,
            active: studentStatsResult.data?.active || 0,
            byEducationLevel: studentStatsResult.data?.byEducationLevel || {},
            orphans: studentStatsResult.data?.orphans || 0
          },
          applications: {
            total: totalApplications,
            pending: pendingApplications,
            approved: approvedApplications,
            rejectionRate: totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0
          }
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string }> = {
      [ApplicationStatus.DRAFT]: { variant: 'secondary', text: 'Taslak' },
      [ApplicationStatus.SUBMITTED]: { variant: 'default', text: 'Gönderildi' },
      [ApplicationStatus.UNDER_REVIEW]: { variant: 'default', text: 'İnceleniyor' },
      [ApplicationStatus.APPROVED]: { variant: 'default', text: 'Onaylandı' },
      [ApplicationStatus.REJECTED]: { variant: 'destructive', text: 'Reddedildi' },
      [ApplicationStatus.WAITLIST]: { variant: 'outline', text: 'Beklemede' }
    };

    const config = statusConfig[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Burs Yönetimi</h1>
          <p className="text-muted-foreground">
            Burs sistemi özet bilgileri ve hızlı erişim
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/burs/basvurular')}>
            <Eye className="mr-2 h-4 w-4" />
            Başvurular
          </Button>
          <Button onClick={() => router.push('/dashboard/burs/ogrenciler')}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Öğrenci
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Burs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.scholarships.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.scholarships.active || 0} aktif burs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kayıtlı Öğrenci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.students.active || 0} aktif öğrenci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başvurular</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.applications.pending || 0} bekleyen başvuru
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bütçe</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.scholarships.totalBudget || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Yıllık toplam bütçe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              %{stats?.applications.approved && stats?.applications.total 
                ? Math.round((stats.applications.approved / stats.applications.total) * 100) 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Onaylanan başvuru oranı
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yetim Öğrenci</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.students.orphans || 0}</div>
            <p className="text-xs text-muted-foreground">
              Özel destek gerektiren öğrenci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Başvuru</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              İnceleme bekleyen başvuru
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Scholarships */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Son Burslar</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/burs/basvurular')}
              >
                Tümünü Gör
              </Button>
            </div>
            <CardDescription>
              En son eklenen burs programları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentScholarships.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Henüz burs bulunmuyor
              </div>
            ) : (
              <div className="space-y-3">
                {recentScholarships.map((scholarship) => (
                  <div key={scholarship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{scholarship.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(scholarship.amount)} - {scholarship.duration} ay
                      </p>
                    </div>
                    <Badge variant={scholarship.isActive ? 'default' : 'secondary'}>
                      {scholarship.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Son Başvurular</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/burs/basvurular')}
              >
                Tümünü Gör
              </Button>
            </div>
            <CardDescription>
              En son alınan burs başvuruları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Henüz başvuru bulunmuyor
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Öğrenci #{application.studentId.slice(-4)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.applicationDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>
            Sık kullanılan işlemlere hızlı erişim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/dashboard/burs/ogrenciler')}
            >
              <Users className="h-6 w-6" />
              <span>Yeni Öğrenci</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/dashboard/burs/basvurular')}
            >
              <FileText className="h-6 w-6" />
              <span>Yeni Başvuru</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push('/dashboard/burs/yetim')}
            >
              <Heart className="h-6 w-6" />
              <span>Yetim Desteği</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Download className="h-6 w-6" />
              <span>Rapor İndir</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scholarship Types Breakdown */}
      {stats?.scholarships.byType && Object.keys(stats.scholarships.byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Burs Türleri Dağılımı</CardTitle>
            <CardDescription>
              Mevcut burs programlarının türlere göre dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(stats.scholarships.byType).map(([type, count]) => {
                const typeNames: Record<string, string> = {
                  [ScholarshipType.ACADEMIC]: 'Akademik Başarı',
                  [ScholarshipType.NEED_BASED]: 'İhtiyaç Sahibi',
                  [ScholarshipType.ORPHAN]: 'Yetim',
                  [ScholarshipType.SPECIAL_NEEDS]: 'Özel Gereksinim',
                  [ScholarshipType.REFUGEE]: 'Mülteci',
                  [ScholarshipType.DISASTER_VICTIM]: 'Afet Mağduru',
                  [ScholarshipType.TALENT]: 'Yetenek'
                };

                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{typeNames[type] || type}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}