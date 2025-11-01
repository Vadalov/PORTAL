import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import {
  Transaction,
  TransactionQuery,
  CreateTransactionInput,
  TransactionType,
  TransactionCategory,
  ApiResponse,
} from '@/types/financial';

// Mock data store - in real implementation, this would connect to database
const transactions: Transaction[] = [
  {
    id: '1',
    userId: 'user-1',
    type: 'income',
    category: 'donation',
    amount: 5000,
    currency: 'TRY',
    description: 'Bağış geliri',
    date: new Date('2024-11-01'),
    status: 'completed',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
    tags: ['bağış'],
    appwriteId: 'mock-tx-1',
  },
  {
    id: '2',
    userId: 'user-1',
    type: 'expense',
    category: 'administrative',
    amount: 1200,
    currency: 'TRY',
    description: 'Ofis kiraları',
    date: new Date('2024-11-02'),
    status: 'completed',
    createdAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-11-02'),
    tags: ['ofis', 'kira'],
    appwriteId: 'mock-tx-2',
  },
];

// Helper functions
function parseQueryParams(request: NextRequest): TransactionQuery {
  const { searchParams } = new URL(request.url);

  return {
    type: (searchParams.get('type') as TransactionType) || undefined,
    category: (searchParams.get('category') as TransactionCategory) || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    minAmount: searchParams.get('minAmount')
      ? parseFloat(searchParams.get('minAmount')!)
      : undefined,
    maxAmount: searchParams.get('maxAmount')
      ? parseFloat(searchParams.get('maxAmount')!)
      : undefined,
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 100),
    sortBy: (searchParams.get('sortBy') as 'date' | 'amount' | 'category') || 'date',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

function filterTransactions(transactions: Transaction[], query: TransactionQuery): Transaction[] {
  let filtered = [...transactions];

  // Type filter
  if (query.type) {
    filtered = filtered.filter((tx) => tx.type === query.type);
  }

  // Category filter
  if (query.category) {
    filtered = filtered.filter((tx) => tx.category === query.category);
  }

  // Date range filter
  if (query.startDate) {
    const startDate = new Date(query.startDate);
    filtered = filtered.filter((tx) => tx.date >= startDate);
  }

  if (query.endDate) {
    const endDate = new Date(query.endDate);
    filtered = filtered.filter((tx) => tx.date <= endDate);
  }

  // Amount range filter
  const minAmount = query.minAmount;
  if (minAmount !== undefined) {
    filtered = filtered.filter((tx) => tx.amount >= minAmount);
  }

  const maxAmount = query.maxAmount;
  if (maxAmount !== undefined) {
    filtered = filtered.filter((tx) => tx.amount <= maxAmount);
  }

  // Status filter
  if (query.status) {
    filtered = filtered.filter((tx) => tx.status === query.status);
  }

  // Search filter
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        tx.description.toLowerCase().includes(searchTerm) ||
        tx.category.toLowerCase().includes(searchTerm) ||
        (tx.tags && tx.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    const order = query.sortOrder === 'asc' ? 1 : -1;

    switch (query.sortBy) {
      case 'amount':
        return (a.amount - b.amount) * order;
      case 'category':
        return a.category.localeCompare(b.category) * order;
      case 'date':
      default:
        return (a.date.getTime() - b.date.getTime()) * order;
    }
  });

  return filtered;
}

function paginateResults<T>(results: T[], page: number, limit: number) {
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    data: paginatedResults,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * GET /api/financial/transactions
 * List transactions with pagination and filtering
 */
async function getTransactionsHandler(request: NextRequest) {
  try {
    const query = parseQueryParams(request);
    const filteredTransactions = filterTransactions(transactions, query);
    const result = paginateResults(filteredTransactions, query.page, query.limit);

    const response: ApiResponse<{
      data: Transaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }> = {
      success: true,
      data: result,
      message: `${result.pagination.total} işlem bulundu`,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Transactions list error:', error);
    return NextResponse.json({ success: false, error: 'İşlemler listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/financial/transactions
 * Create new transaction
 */
async function createTransactionHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTransactionInput;

    if (!body) {
      return NextResponse.json({ success: false, error: 'Veri bulunamadı' }, { status: 400 });
    }

    // Basic validation
    if (!body.type || !body.category || !body.amount || !body.description) {
      return NextResponse.json({ success: false, error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      userId: 'user-1', // In real app, get from auth
      type: body.type,
      category: body.category as TransactionCategory,
      amount: body.amount,
      currency: body.currency || 'TRY',
      description: body.description,
      date: body.date,
      status: body.status || 'pending',
      tags: body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      appwriteId: `mock-${Date.now()}`,
    };

    transactions.unshift(newTransaction);

    return NextResponse.json(
      {
        success: true,
        data: newTransaction,
        message: 'İşlem başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Transaction creation error:', error);
    return NextResponse.json({ success: false, error: 'İşlem oluşturulamadı' }, { status: 500 });
  }
}

/**
 * GET /api/financial/transactions/stats
 * Get transaction statistics
 */
async function getTransactionStatsHandler(request: NextRequest) {
  try {
    const query = parseQueryParams(request);
    const filteredTransactions = filterTransactions(transactions, query);

    const stats = {
      totalIncome: filteredTransactions
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0),
      totalExpense: filteredTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0),
      netBalance: 0,
      transactionCount: filteredTransactions.length,
      pendingTransactions: filteredTransactions.filter((tx) => tx.status === 'pending').length,
      completedTransactions: filteredTransactions.filter((tx) => tx.status === 'completed').length,
      categories: {} as Record<
        TransactionCategory,
        { income: number; expense: number; count: number }
      >,
    };

    stats.netBalance = stats.totalIncome - stats.totalExpense;

    // Calculate category stats
    filteredTransactions.forEach((tx) => {
      if (!stats.categories[tx.category]) {
        stats.categories[tx.category] = { income: 0, expense: 0, count: 0 };
      }
      stats.categories[tx.category].count++;
      if (tx.type === 'income') {
        stats.categories[tx.category].income += tx.amount;
      } else {
        stats.categories[tx.category].expense += tx.amount;
      }
    });

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'İstatistikler başarıyla getirildi',
    });
  } catch (error: unknown) {
    console.error('Transaction stats error:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler getirilemedi' },
      { status: 500 }
    );
  }
}

// Export handlers
export const GET = getTransactionsHandler;
export const POST = withCsrfProtection(createTransactionHandler);
export const GET_stats = getTransactionStatsHandler;
