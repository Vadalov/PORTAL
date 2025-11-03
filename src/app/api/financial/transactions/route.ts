import { NextRequest, NextResponse } from 'next/server';
import { convexFinanceRecords, normalizeQueryParams } from '@/lib/convex/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import {
  TransactionQuery,
  CreateTransactionInput,
  TransactionType,
  TransactionCategory,
  ApiResponse,
} from '@/types/financial';
import { Id } from '@/convex/_generated/dataModel';

// Helper to convert finance_record from Convex to Transaction format
function convertToTransaction(record: any): any {
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
    appwriteId: record._id,
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
function filterTransactions(transactions: any[], query: TransactionQuery): any[] {
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
      created_by: query.userId ? (query.userId as Id<"users">) : undefined,
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
      data: any[];
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

    // TODO: Get user ID from auth context
    const userId = 'user-1' as Id<"users">; // In real app, get from auth

    const financeRecordData = {
      record_type: body.type as 'income' | 'expense',
      category: body.category,
      amount: body.amount,
      currency: (body.currency || 'TRY') as 'TRY' | 'USD' | 'EUR',
      description: body.description,
      transaction_date: body.date.toISOString(),
      payment_method: body.paymentMethod,
      receipt_number: body.receiptNumber,
      receipt_file_id: body.receiptFileId,
      related_to: body.relatedTo,
      created_by: userId,
      status: (body.status || 'pending') as 'pending' | 'approved' | 'rejected',
    };

    const response = await convexFinanceRecords.create(financeRecordData);

    // Convert back to Transaction format for response
    const transaction = convertToTransaction(response);

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
export const POST = withCsrfProtection(createTransactionHandler);
export const GET_stats = getTransactionStatsHandler;
