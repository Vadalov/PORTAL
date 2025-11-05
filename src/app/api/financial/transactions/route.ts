import { NextRequest, NextResponse } from 'next/server';
import { convexFinanceRecords, normalizeQueryParams } from '@/lib/convex/api';
import logger from '@/lib/logger';
import {
  TransactionQuery,
  CreateTransactionInput,
  TransactionType,
  TransactionCategory,
  ApiResponse,
} from '@/types/financial';
import { getCurrentUserId } from '@/lib/auth/get-user';

// Type for finance record from Convex
interface FinanceRecord {
  _id: string;
  _creationTime: number;
  created_by: string;
  record_type: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  transaction_date: string;
  status: 'pending' | 'approved' | 'rejected';
  [key: string]: unknown;
}

// Type for transaction response
interface Transaction {
  id: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// Helper to convert finance_record from Convex to Transaction format
function convertToTransaction(record: FinanceRecord): Transaction {
  return {
    id: record._id,
    userId: record.created_by,
    type: record.record_type,
    category: record.category,
    amount: record.amount,
    currency: record.currency,
    description: record.description,
    date: new Date(record.transaction_date),
    status: record.status === 'approved' ? 'completed' : record.status === 'rejected' ? 'cancelled' : 'pending',
    createdAt: new Date(record._creationTime),
    updatedAt: new Date(record._creationTime),
    tags: [],
  };
}

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

// Note: Filtering is now done on Convex side, but we keep this for client-side filtering if needed
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
    filtered = filtered.filter((tx) => new Date(tx.date) >= startDate);
  }

  if (query.endDate) {
    const endDate = new Date(query.endDate);
    filtered = filtered.filter((tx) => new Date(tx.date) <= endDate);
  }

  // Amount range filter
  if (query.minAmount !== undefined) {
    filtered = filtered.filter((tx) => tx.amount >= query.minAmount!);
  }

  if (query.maxAmount !== undefined) {
    filtered = filtered.filter((tx) => tx.amount <= query.maxAmount!);
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
        tx.description?.toLowerCase().includes(searchTerm) ||
        tx.category?.toLowerCase().includes(searchTerm)
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    const order = query.sortOrder === 'asc' ? 1 : -1;

    switch (query.sortBy) {
      case 'amount':
        return (a.amount - b.amount) * order;
      case 'category':
        return (a.category || '').localeCompare(b.category || '') * order;
      case 'date':
      default:
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
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
    const { searchParams } = new URL(request.url);
    
    // Get finance records from Convex
    const params = normalizeQueryParams(searchParams);
    const response = await convexFinanceRecords.list({
      ...params,
      record_type: query.type || undefined,
    });

    // Convert Convex records to Transaction format
    let transactions = (response.documents || []).map(convertToTransaction);

    // Apply additional client-side filtering
    if (query.category || query.startDate || query.endDate || query.minAmount || query.maxAmount || query.search) {
      transactions = filterTransactions(transactions, query);
    }

    // Paginate
    const result = paginateResults(transactions, query.page, query.limit);

    const apiResponse: ApiResponse<{
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

    return NextResponse.json(apiResponse);
  } catch (error: unknown) {
    logger.error('Transactions list error', error, {
      endpoint: '/api/financial/transactions',
      method: 'GET',
    });
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

    // Get user ID from auth context
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Kimlik doğrulama gerekli' },
        { status: 401 }
      );
    }

    const financeRecordData = {
      record_type: body.type as 'income' | 'expense',
      category: body.category,
      amount: body.amount,
      currency: (body.currency || 'TRY') as 'TRY' | 'USD' | 'EUR',
      description: body.description,
      transaction_date: body.date.toISOString(),
      payment_method: 'cash',
      receipt_number: '',
      receipt_file_id: '',
      related_to: '',
      created_by: userId,
      status: (body.status || 'pending') as 'pending' | 'approved' | 'rejected',
    };

    const recordId = await convexFinanceRecords.create(financeRecordData);

    // Create transaction from the created record data plus the ID
    const transaction: Transaction = {
      id: recordId,
      userId,
      type: financeRecordData.record_type,
      category: financeRecordData.category,
      amount: financeRecordData.amount,
      currency: financeRecordData.currency,
      description: financeRecordData.description,
      date: new Date(financeRecordData.transaction_date),
      status: financeRecordData.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };

    return NextResponse.json(
      {
        success: true,
        data: transaction,
        message: 'İşlem başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    logger.error('Transaction creation error', error, {
      endpoint: '/api/financial/transactions',
      method: 'POST',
    });
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
    const { searchParams } = new URL(request.url);
    
    // Get finance records from Convex
    const params = normalizeQueryParams(searchParams);
    const response = await convexFinanceRecords.list({
      ...params,
      record_type: query.type || undefined,
    });

    // Convert to transactions
    const filteredTransactions = filterTransactions(
      (response.documents || []).map(convertToTransaction),
      query
    );

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
      const category = tx.category as TransactionCategory;
      if (!stats.categories[category]) {
        stats.categories[category] = { income: 0, expense: 0, count: 0 };
      }
      stats.categories[category].count++;
      if (tx.type === 'income') {
        stats.categories[category].income += tx.amount;
      } else {
        stats.categories[category].expense += tx.amount;
      }
    });

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'İstatistikler başarıyla getirildi',
    });
  } catch (error: unknown) {
    logger.error('Transaction stats error', error, {
      endpoint: '/api/financial/transactions/stats',
      method: 'GET',
    });
    return NextResponse.json(
      { success: false, error: 'İstatistikler getirilemedi' },
      { status: 500 }
    );
  }
}

// Export handlers
export const GET = getTransactionsHandler;
export const GET_stats = getTransactionStatsHandler;
