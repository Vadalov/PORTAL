import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import {
  Budget,
  BudgetQuery,
  CreateBudgetInput,
  BudgetPeriod,
  ApiResponse,
} from '@/types/financial';
import { readOnlyRateLimit, dataModificationRateLimit } from '@/lib/rate-limit';

// Mock data store
const budgets: Budget[] = [
  {
    id: '1',
    userId: 'user-1',
    name: '2024 Kasım Bütçesi',
    period: 'monthly',
    year: 2024,
    month: 11,
    categories: {
      donation: { planned: 10000, actual: 5000 },
      administrative: { planned: 2000, actual: 1200 },
      program_expenses: { planned: 5000, actual: 3500 },
    },
    totalPlanned: 17000,
    totalActual: 9700,
    status: 'active',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

function parseQueryParams(request: NextRequest): BudgetQuery {
  const { searchParams } = new URL(request.url);

  return {
    period: (searchParams.get('period') as BudgetPeriod) || undefined,
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined,
    month: searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined,
    status: searchParams.get('status') || undefined,
  };
}

function filterBudgets(budgets: Budget[], query: BudgetQuery): Budget[] {
  let filtered = [...budgets];

  if (query.period) {
    filtered = filtered.filter((budget) => budget.period === query.period);
  }

  if (query.year) {
    filtered = filtered.filter((budget) => budget.year === query.year);
  }

  if (query.month) {
    filtered = filtered.filter((budget) => budget.month === query.month);
  }

  if (query.status) {
    filtered = filtered.filter((budget) => budget.status === query.status);
  }

  return filtered;
}

/**
 * GET /api/financial/budgets
 * List budgets
 */
async function getBudgetsHandler(request: NextRequest) {
  try {
    const query = parseQueryParams(request);
    const filteredBudgets = filterBudgets(budgets, query);

    const response: ApiResponse<Budget[]> = {
      success: true,
      data: filteredBudgets,
      message: `${filteredBudgets.length} bütçe bulundu`,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Budgets list error:', error);
    return NextResponse.json({ success: false, error: 'Bütçeler listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/financial/budgets
 * Create new budget
 */
async function createBudgetHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBudgetInput;

    if (!body) {
      return NextResponse.json({ success: false, error: 'Veri bulunamadı' }, { status: 400 });
    }

    const totalPlanned = Object.values(body.categories).reduce((sum, cat) => sum + cat.planned, 0);

    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      userId: 'user-1',
      name: body.name,
      period: body.period,
      year: body.year,
      month: body.month,
      categories: body.categories,
      totalPlanned,
      totalActual: 0,
      status: body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    budgets.unshift(newBudget);

    return NextResponse.json(
      {
        success: true,
        data: newBudget,
        message: 'Bütçe başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Budget creation error:', error);
    return NextResponse.json({ success: false, error: 'Bütçe oluşturulamadı' }, { status: 500 });
  }
}

/**
 * GET /api/financial/budgets/stats
 * Get budget statistics
 */
async function getBudgetStatsHandler(request: NextRequest) {
  try {
    const query = parseQueryParams(request);
    const filteredBudgets = filterBudgets(budgets, query);

    const stats = {
      totalBudgets: filteredBudgets.length,
      activeBudgets: filteredBudgets.filter((b) => b.status === 'active').length,
      draftBudgets: filteredBudgets.filter((b) => b.status === 'draft').length,
      completedBudgets: filteredBudgets.filter((b) => b.status === 'completed').length,
      totalPlanned: filteredBudgets.reduce((sum, b) => sum + b.totalPlanned, 0),
      totalActual: filteredBudgets.reduce((sum, b) => sum + b.totalActual, 0),
      averageUtilization: 0,
      budgetVariance: 0,
    };

    stats.averageUtilization =
      stats.totalPlanned > 0 ? (stats.totalActual / stats.totalPlanned) * 100 : 0;

    stats.budgetVariance =
      stats.totalPlanned > 0
        ? ((stats.totalActual - stats.totalPlanned) / stats.totalPlanned) * 100
        : 0;

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Bütçe istatistikleri başarıyla getirildi',
    });
  } catch (error: unknown) {
    console.error('Budget stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Bütçe istatistikleri getirilemedi' },
      { status: 500 }
    );
  }
}

export const GET = readOnlyRateLimit(getBudgetsHandler);
export const POST = withCsrfProtection(dataModificationRateLimit(createBudgetHandler));
export const GET_stats = readOnlyRateLimit(getBudgetStatsHandler);
