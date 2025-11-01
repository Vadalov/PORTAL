import { NextRequest, NextResponse } from 'next/server';
import { DashboardMetrics } from '@/types/financial';
import { dashboardRateLimit } from '@/lib/rate-limit';

/**
 * GET /api/financial/dashboard
 * Get dashboard metrics and KPIs
 */
async function getDashboardHandler(request: NextRequest) {
   
  try {
    // Mock data - in real app, these would come from actual calculations
    const currentMonthData = {
      income: 25000,
      expense: 18000,
      balance: 7000,
      transactionCount: 45,
      budgetUtilization: 72.5,
    };

    const previousMonthData = {
      income: 22000,
      expense: 16500,
      balance: 5500,
      transactionCount: 38,
      budgetUtilization: 68.2,
    };

    const yearlyData = {
      totalIncome: 280000,
      totalExpense: 195000,
      netBalance: 85000,
      budgetVariance: 5.3,
    };

    // Calculate trends
    const incomeTrend = currentMonthData.income > previousMonthData.income ? 'up' : 'down';
    const expenseTrend = currentMonthData.expense > previousMonthData.expense ? 'up' : 'down';
    const balanceTrend = currentMonthData.balance > previousMonthData.balance ? 'up' : 'down';

    const incomePercentage =
      previousMonthData.income > 0
        ? ((currentMonthData.income - previousMonthData.income) / previousMonthData.income) * 100
        : 0;

    const expensePercentage =
      previousMonthData.expense > 0
        ? ((currentMonthData.expense - previousMonthData.expense) / previousMonthData.expense) * 100
        : 0;

    const balancePercentage =
      previousMonthData.balance > 0
        ? ((currentMonthData.balance - previousMonthData.balance) / previousMonthData.balance) * 100
        : 0;

    // Generate alerts
    const alerts = {
      budgetOverspend: currentMonthData.budgetUtilization > 100,
      lowBalance: currentMonthData.balance < 5000,
      pendingInvoices: 3,
      overdueInvoices: 1,
    };

    const dashboardMetrics: DashboardMetrics = {
      currentMonth: currentMonthData,
      previousMonth: previousMonthData,
      yearly: yearlyData,
      trends: {
        incomeTrend,
        expenseTrend,
        balanceTrend,
        percentage:
          Math.round(
            (Math.abs(incomePercentage + expensePercentage + balancePercentage) / 3) * 100
          ) / 100,
      },
      alerts,
    };

    return NextResponse.json({
      success: true,
      data: dashboardMetrics,
      message: 'Dashboard verileri başarıyla getirildi',
    });
  } catch (error: unknown) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Dashboard verileri getirilemedi' },
      { status: 500 }
    );
  }
}

export const GET = dashboardRateLimit(getDashboardHandler);
