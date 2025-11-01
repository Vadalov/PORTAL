'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardMetrics, ApiResponse } from '@/types/financial';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PieChart,
  FileText,
  Plus,
  Eye,
  Download,
  Calendar,
  Wallet,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  budgetUtilization: number;
  previousMonthComparison: {
    income: number;
    expense: number;
    balance: number;
  };
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  type: 'income' | 'expense';
  trend: 'up' | 'down' | 'stable';
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  status: string;
}

export default function FinancialDashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const router = useRouter();

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard metrics
      const metricsResponse = await fetch('/api/financial/dashboard');
      const metricsData: ApiResponse<DashboardMetrics> = await metricsResponse.json();

      if (metricsData.success && metricsData.data) {
        // Set summary data
        setSummary({
          totalIncome: metricsData.data.currentMonth.income,
          totalExpense: metricsData.data.currentMonth.expense,
          netBalance: metricsData.data.currentMonth.balance,
          transactionCount: metricsData.data.currentMonth.transactionCount,
          budgetUtilization: metricsData.data.currentMonth.budgetUtilization,
          previousMonthComparison: {
            income: metricsData.data.previousMonth.income,
            expense: metricsData.data.previousMonth.expense,
            balance: metricsData.data.previousMonth.balance,
          },
        });

        // Generate alerts
        const alerts: Alert[] = [];
        if (metricsData.data.alerts.budgetOverspend) {
          alerts.push({
            id: 'budget-overspend',
            type: 'error',
            title: 'Bütçe Aşımı',
            message: 'Bütçe planınızı aştınız! Lütfen harcamalarınızı gözden geçirin.',
            timestamp: new Date(),
          });
        }
        if (metricsData.data.alerts.lowBalance) {
          alerts.push({
            id: 'low-balance',
            type: 'warning',
            title: 'Düşük Bakiye',
            message: 'Hesap bakiyeniz kritik seviyenin altında.',
            timestamp: new Date(),
          });
        }
        if (metricsData.data.alerts.pendingInvoices > 0) {
          alerts.push({
            id: 'pending-invoices',
            type: 'info',
            title: 'Bekleyen Faturalar',
            message: `${metricsData.data.alerts.pendingInvoices} bekleyen fatura var.`,
            timestamp: new Date(),
          });
        }
        setAlerts(alerts);

        // Mock recent transactions
        setRecentTransactions([
          {
            id: '1',
            description: 'Bağış Geliri',
            amount: 5000,
            type: 'income',
            date: new Date(),
            status: 'completed',
          },
          {
            id: '2',
            description: 'Ofis Kiraları',
            amount: -1200,
            type: 'expense',
            date: new Date(Date.now() - 86400000),
            status: 'completed',
          },
        ]);

        // Mock category data
        setCategoryData([
          { name: 'Bağışlar', amount: 15000, percentage: 45, type: 'income', trend: 'up' },
          {
            name: 'Üyelik Aidatları',
            amount: 8000,
            percentage: 24,
            type: 'income',
            trend: 'stable',
          },
          { name: 'İdari Giderler', amount: 6000, percentage: 30, type: 'expense', trend: 'down' },
          { name: 'Program Giderleri', amount: 4000, percentage: 20, type: 'expense', trend: 'up' },
        ]);
      }
    } catch (err: unknown) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', type: 'income' | 'expense') => {
    const isPositive = type === 'income' ? trend === 'up' : trend === 'down';
    if (trend === 'stable') return <div className="w-4 h-4 border-2 border-gray-400 rounded" />;
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getAlertIcon = (type: 'warning' | 'error' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mali Yönetim</h1>
          <p className="text-muted-foreground">Finansal durumunuz ve performans metrikleriniz</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setTimeRange('month')}>
            <Calendar className="w-4 h-4 mr-2" />
            Aylık
          </Button>
          <Button variant="outline" onClick={() => setTimeRange('quarter')}>
            <Calendar className="w-4 h-4 mr-2" />
            Üç Aylık
          </Button>
          <Button variant="outline" onClick={() => setTimeRange('year')}>
            <Calendar className="w-4 h-4 mr-2" />
            Yıllık
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Uyarılar ve Bildirimler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary && formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Önceki aya göre{' '}
              {summary &&
                formatPercentage(
                  ((summary.totalIncome - summary.previousMonthComparison.income) /
                    summary.previousMonthComparison.income) *
                    100
                )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary && formatCurrency(Math.abs(summary.totalExpense))}
            </div>
            <p className="text-xs text-muted-foreground">
              Önceki aya göre{' '}
              {summary &&
                formatPercentage(
                  ((summary.totalExpense - summary.previousMonthComparison.expense) /
                    summary.previousMonthComparison.expense) *
                    100
                )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Bakiye</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${summary && summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {summary && formatCurrency(summary.netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Önceki aya göre{' '}
              {summary &&
                formatPercentage(
                  ((summary.netBalance - summary.previousMonthComparison.balance) /
                    summary.previousMonthComparison.balance) *
                    100
                )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bütçe Kullanımı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary && `${summary.budgetUtilization.toFixed(1)}%`}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${summary && summary.budgetUtilization > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(summary?.budgetUtilization || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Kategori Dağılımı
            </CardTitle>
            <CardDescription>Gelir ve gider kategorilerinizin dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(category.trend, category.type)}
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.percentage}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${category.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(category.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Son İşlemler
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/fon/gelir-gider')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Tümünü Gör
              </Button>
            </CardTitle>
            <CardDescription>En son gerçekleştirilen finansal işlemler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.date.toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => router.push('/dashboard/fon/gelir-gider')}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni İşlem
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/fon/budget')}>
          <Target className="w-4 h-4 mr-2" />
          Bütçe Yönetimi
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/fon/raporlar')}>
          <FileText className="w-4 h-4 mr-2" />
          Finansal Raporlar
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Rapor İndir
        </Button>
      </div>
    </div>
  );
}
