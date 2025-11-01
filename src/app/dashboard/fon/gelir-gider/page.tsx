'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Transaction, 
  CreateTransactionInput,
  TransactionQuery,
  ApiResponse
} from '@/types/financial';
import { 
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  pendingTransactions: number;
  completedTransactions: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  // Income Categories
  donation: 'Bağış',
  membership_fee: 'Üyelik Aidatı',
  sponsorship: 'Sponsorluk',
  event_revenue: 'Etkinlik Geliri',
  grant: 'Hibe',
  other_income: 'Diğer Gelir',

  // Expense Categories
  administrative: 'İdari',
  program_expenses: 'Program Giderleri',
  scholarship: 'Burs',
  assistance: 'Yardım',
  marketing: 'Pazarlama',
  office_supplies: 'Ofis Malzemeleri',
  utilities: 'Faturalar',
  transportation: 'Ulaşım',
  other_expense: 'Diğer Gider'
};

const TYPE_LABELS = {
  income: 'Gelir',
  expense: 'Gider'
};

export default function GelirGiderPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<TransactionQuery>({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  // Transaction form
  const [showAddForm, setShowAddForm] = useState(false);
  const [_editingTransaction, _setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<CreateTransactionInput>({
    type: 'income',
    category: 'donation',
    amount: 0,
    currency: 'TRY',
    description: '',
    date: new Date(),
    status: 'pending',
    tags: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch transactions with current filters
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/financial/transactions?${queryParams}`);
      const result: ApiResponse<{
        data: Transaction[];
        pagination: PaginationInfo;
      }> = await response.json();

      if (result.success && result.data) {
        setTransactions(result.data.data);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'İşlemler yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
      console.error('Transactions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch transaction statistics
  const fetchStats = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && key !== 'page' && key !== 'limit') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/financial/transactions/stats?${queryParams}`);
      const result: ApiResponse<TransactionStats> = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [filters]);

  // Load data on filter changes
  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<Transaction> = await response.json();

      if (result.success) {
        setShowAddForm(false);
        _setEditingTransaction(null);
        resetForm();
        fetchTransactions(); // Refresh the list
        fetchStats(); // Refresh the stats
      } else {
        setError(result.error || 'İşlem kaydedilemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
      console.error('Transaction submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'income',
      category: 'donation',
      amount: 0,
      currency: 'TRY',
      description: '',
      date: new Date(),
      status: 'pending',
      tags: []
    });
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TransactionQuery, value: TransactionQuery[keyof TransactionQuery]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value as number) // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: tr });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      completed: 'default',
      cancelled: 'destructive'
    };

    const labels: Record<string, string> = {
      pending: 'Bekliyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return filters.sortOrder === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  // Handle sort
  const handleSort = (field: 'date' | 'amount' | 'category') => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Loading state
  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">İşlemler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gelir-Gider Yönetimi</h1>
          <p className="text-muted-foreground">
            Finansal işlemlerinizi yönetin ve takip edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchTransactions}>
            <FileText className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni İşlem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni İşlem Ekle</DialogTitle>
                <DialogDescription>
                  Yeni bir gelir veya gider işlemi oluşturun
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tür</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleFilterChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Gelir</SelectItem>
                        <SelectItem value="expense">Gider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Tutar</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Para Birimi</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">TRY</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="İşlem açıklaması..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Tarih</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Durum</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pending' | 'completed' | 'cancelled' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Bekliyor</SelectItem>
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                        <SelectItem value="cancelled">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <AlertCircle className="w-5 h-5 text-red-500 inline mr-2" />
                Hata
              </AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setError(null)}>Tamam</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedTransactions} tamamlanmış işlem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.transactionCount} toplam işlem
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen İşlemler</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingTransactions}
              </div>
              <p className="text-xs text-muted-foreground">
                Onay bekleyen
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Açıklama ara..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">Tür</Label>
              <Select 
                value={filters.type || ''} 
                onValueChange={(value) => handleFilterChange('type', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm işlemler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm İşlemler</SelectItem>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">Kategori</Label>
              <Select 
                value={filters.category || ''} 
                onValueChange={(value) => handleFilterChange('category', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Kategoriler</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Durum</Label>
              <Select 
                value={filters.status || ''} 
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Bekliyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <div>
              <Label htmlFor="start-date">Başlangıç Tarihi</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Bitiş Tarihi</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              />
            </div>
            <div>
              <Label htmlFor="min-amount">Minimum Tutar</Label>
              <Input
                id="min-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>İşlemler</CardTitle>
          <CardDescription>
            {pagination ? `${pagination.total} işlem gösteriliyor` : 'İşlemler yükleniyor...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-7 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                <button 
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Tarih {getSortIcon('date')}
                </button>
                <div>Açıklama</div>
                <button 
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Kategori {getSortIcon('category')}
                </button>
                <div>Tür</div>
                <button 
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Tutar {getSortIcon('amount')}
                </button>
                <div>Durum</div>
                <div>İşlemler</div>
              </div>

              {/* Transaction Rows */}
              {transactions.map((transaction) => (
                <div key={transaction.id} className="grid md:grid-cols-7 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Date */}
                  <div className="text-sm">
                    <div className="md:hidden font-medium">Tarih</div>
                    {formatDate(transaction.date)}
                  </div>
                  
                  {/* Description */}
                  <div>
                    <div className="md:hidden font-medium">Açıklama</div>
                    <div className="font-medium">{transaction.description}</div>
                    {transaction.tags && transaction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Category */}
                  <div className="text-sm">
                    <div className="md:hidden font-medium">Kategori</div>
                    {CATEGORY_LABELS[transaction.category] || transaction.category}
                  </div>
                  
                  {/* Type */}
                  <div className="text-sm">
                    <div className="md:hidden font-medium">Tür</div>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                      {TYPE_LABELS[transaction.type]}
                    </Badge>
                  </div>
                  
                  {/* Amount */}
                  <div className="text-sm">
                    <div className="md:hidden font-medium">Tutar</div>
                    <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="text-sm">
                    <div className="md:hidden font-medium">Durum</div>
                    {getStatusBadge(transaction.status)}
                  </div>
                  
                  {/* Actions */}
                  <div className="text-sm">
                    <div className="md:hidden font-medium">İşlemler</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? 'İşlemler yükleniyor...' : 'Hiç işlem bulunamadı'}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Sayfa {pagination.page} / {pagination.totalPages} ({pagination.total} toplam)
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!pagination.hasPrev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Önceki
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}