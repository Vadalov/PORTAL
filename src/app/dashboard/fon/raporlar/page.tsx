'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ErrorAlert } from '@/components/ui/error-alert';
import { 
  FinancialReport, 
  ReportType,
  DashboardMetrics,
  ApiResponse
} from '@/types/financial';
import {
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Eye,
  Plus,
  Loader2,
  DollarSign,
  FileSpreadsheet,
  FileDown,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  cash_flow: 'Nakit Akışı',
  budget_comparison: 'Bütçe Karşılaştırması',
  category_analysis: 'Kategori Analizi',
  monthly_summary: 'Aylık Özet',
  yearly_summary: 'Yıllık Özet',
  donor_report: 'Bağışçı Raporu',
  expense_report: 'Gider Raporu'
};

interface ReportStats {
  totalReports: number;
  generatedReports: number;
  totalRevenue: number;
  totalExpense: number;
  netBalance: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export default function RaporlarPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  
  // Report generation form
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateFormData, setGenerateFormData] = useState({
    type: 'monthly_summary' as ReportType,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Chart data states
  const [chartData, setChartData] = useState<{
    monthlyTrend: Array<{ month: string; income: number; expense: number; balance: number }>;
    categoryDistribution: Array<{ category: string; amount: number; percentage: number }>;
  }>({
    monthlyTrend: [],
    categoryDistribution: []
  });

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/financial/reports');
      const result: ApiResponse<FinancialReport[]> = await response.json();

      if (result.success && result.data) {
        setReports(result.data);
      } else {
        setError(result.error || 'Raporlar yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/financial/dashboard');
      const result: ApiResponse<DashboardMetrics> = await response.json();

      if (result.success && result.data) {
        setDashboardMetrics(result.data);
      }
    } catch (err) {
      console.error('Dashboard metrics fetch error:', err);
    }
  }, []);

  // Fetch report statistics
  const fetchStats = useCallback(async () => {
    try {
      // Mock statistics - in real app, this would come from API
      const mockStats: ReportStats = {
        totalReports: reports.length,
        generatedReports: reports.length,
        totalRevenue: 125000,
        totalExpense: 89000,
        netBalance: 36000,
        topCategories: [
          { category: 'Bağış', amount: 45000, percentage: 36 },
          { category: 'Üyelik Aidatı', amount: 28000, percentage: 22.4 },
          { category: 'İdari Giderler', amount: 25000, percentage: 20 },
          { category: 'Program Giderleri', amount: 18000, percentage: 14.4 },
          { category: 'Diğer', amount: 9000, percentage: 7.2 }
        ]
      };
      
      setStats(mockStats);

      // Generate chart data
      const monthlyTrend = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = format(date, 'MMM yyyy', { locale: tr });
        
        monthlyTrend.push({
          month: monthName,
          income: Math.random() * 20000 + 5000,
          expense: Math.random() * 15000 + 3000,
          balance: 0 // Will be calculated
        });
      }
      
      // Calculate balances
      monthlyTrend.forEach(month => {
        month.balance = month.income - month.expense;
      });

      setChartData({
        monthlyTrend,
        categoryDistribution: mockStats.topCategories
      });

    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [reports.length]);

  // Load data on component mount
  useEffect(() => {
    fetchReports();
    fetchDashboardMetrics();
  }, [fetchReports, fetchDashboardMetrics]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Generate new report
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateFormData),
      });

      const result: ApiResponse<FinancialReport> = await response.json();

      if (result.success) {
        setShowGenerateForm(false);
        fetchReports(); // Refresh the list
        fetchStats(); // Refresh the stats
      } else {
        setError(result.error || 'Rapor oluşturulamadı');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
      console.error('Report generation error:', err);
    } finally {
      setGenerating(false);
    }
  };


  // Mock chart component (replace with actual chart library)
  const SimpleChart = ({ data, type }: { data: unknown[], type: 'line' | 'pie' | 'bar' }) => {
    return (
      <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {type === 'line' ? 'Çizgi Grafiği' : type === 'pie' ? 'Pasta Grafiği' : 'Çubuk Grafiği'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.length} veri noktası
          </p>
        </div>
      </div>
    );
  };

  // Export to PDF (mock function)
  const handleExportPDF = (report: FinancialReport) => {
    // In real implementation, use jsPDF or similar library
    alert(`PDF export özelliği yakında eklenecek. Rapor: ${report.title}`);
  };

  // Export to Excel (mock function)
  const handleExportExcel = (report: FinancialReport) => {
    // In real implementation, use xlsx library
    alert(`Excel export özelliği yakında eklenecek. Rapor: ${report.title}`);
  };

  // Loading state
  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Raporlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finansal Raporlar</h1>
          <p className="text-muted-foreground">
            Detaylı finansal analizler ve raporlar oluşturun
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { fetchReports(); fetchStats(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Dialog open={showGenerateForm} onOpenChange={setShowGenerateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Rapor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Rapor Oluştur</DialogTitle>
                <DialogDescription>
                  Belirttiğiniz kriterlere göre finansal rapor oluşturun
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div>
                  <Label htmlFor="report-type">Rapor Türü</Label>
                  <Select 
                    value={generateFormData.type} 
                    onValueChange={(value) => setGenerateFormData(prev => ({ ...prev, type: value as ReportType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Başlangıç Tarihi</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={generateFormData.startDate}
                      onChange={(e) => setGenerateFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">Bitiş Tarihi</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={generateFormData.endDate}
                      onChange={(e) => setGenerateFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowGenerateForm(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      'Rapor Oluştur'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {/* Dashboard Metrics */}
      {dashboardMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardMetrics.currentMonth.income)}
              </div>
              <p className="text-xs text-muted-foreground">
                Geçen aya göre %{dashboardMetrics.trends.percentage}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aylık Gider</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dashboardMetrics.currentMonth.expense)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardMetrics.currentMonth.transactionCount} işlem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yıllık Net</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardMetrics.yearly.netBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam bakiye
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bütçe Kullanımı</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                %{dashboardMetrics.currentMonth.budgetUtilization.toFixed(1)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${dashboardMetrics.currentMonth.budgetUtilization > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(dashboardMetrics.currentMonth.budgetUtilization, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Aylık Trend
            </CardTitle>
            <CardDescription>
              Son 12 ayın gelir-gider trendi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart data={chartData.monthlyTrend} type="line" />
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Kategori Dağılımı
            </CardTitle>
            <CardDescription>
              Gelir ve gider kategorilerinin dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart data={chartData.categoryDistribution} type="pie" />
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Rapor</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                {stats.generatedReports} oluşturulan rapor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Raporlanan dönem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Bakiye</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.netBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Gelir - Gider
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Finansal Raporlar</CardTitle>
          <CardDescription>
            {reports.length > 0 ? `${reports.length} rapor bulundu` : 'Henüz rapor oluşturulmamış'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{report.title}</h3>
                        <Badge variant="outline">
                          {REPORT_TYPE_LABELS[report.type]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Başlangıç:</span><br />
                          {formatDate(report.dateRange.startDate)}
                        </div>
                        <div>
                          <span className="font-medium">Bitiş:</span><br />
                          {formatDate(report.dateRange.endDate)}
                        </div>
                        <div>
                          <span className="font-medium">Toplam Gelir:</span><br />
                          <span className="text-green-600 font-medium">
                            {formatCurrency(report.data.summary.totalIncome)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Toplam Gider:</span><br />
                          <span className="text-red-600 font-medium">
                            {formatCurrency(report.data.summary.totalExpense)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportPDF(report)}
                      >
                        <FileDown className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportExcel(report)}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Net Bakiye:</span><br />
                        <span className={`font-semibold ${report.data.summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(report.data.summary.netBalance)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">İşlem Sayısı:</span><br />
                        {report.data.summary.transactionCount}
                      </div>
                      <div>
                        <span className="font-medium">Oluşturulma:</span><br />
                        {formatDate(report.generatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? 'Raporlar yükleniyor...' : (
                <div>
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Henüz rapor oluşturulmamış</h3>
                  <p className="text-muted-foreground mb-4">
                    İlk finansal raporunuzu oluşturmak için yukarıdaki butonu kullanın.
                  </p>
                  <Button onClick={() => setShowGenerateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Raporu Oluştur
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
