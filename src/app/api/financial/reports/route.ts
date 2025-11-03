import { NextRequest, NextResponse } from 'next/server';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import { FinancialReport, ReportType, ReportQuery, TransactionCategory } from '@/types/financial';

// Mock data store
const reports: FinancialReport[] = [];

function parseQueryParams(request: NextRequest): ReportQuery {
  const { searchParams } = new URL(request.url);

  return {
    type: (searchParams.get('type') as ReportType) || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  };
}

function generateMockReport(type: ReportType, startDate: Date, endDate: Date): FinancialReport {
  const months = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  // Generate monthly data for the date range
  for (let year = startYear; year <= endYear; year++) {
    const startMonth = year === startYear ? startDate.getMonth() : 0;
    const endMonth = year === endYear ? endDate.getMonth() : 11;

    for (let month = startMonth; month <= endMonth; month++) {
      const monthName = new Date(year, month).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
      });

      months.push({
        month: monthName,
        income: Math.random() * 10000 + 5000,
        expense: Math.random() * 8000 + 2000,
        balance: 0, // Will be calculated
      });
    }
  }

  // Calculate balances
  months.forEach((month) => {
    month.balance = month.income - month.expense;
  });

  // Calculate pie chart data
  const categories = Object.values(TransactionCategory);
  const pieChartData = categories.map((category) => ({
    category,
    amount: Math.random() * 5000 + 1000,
    percentage: Math.random() * 25 + 5,
  }));

  // Calculate summary
  const totalIncome = months.reduce((sum, month) => sum + month.income, 0);
  const totalExpense = months.reduce((sum, month) => sum + month.expense, 0);
  const netBalance = totalIncome - totalExpense;

  return {
    id: `report-${Date.now()}`,
    userId: 'user-1',
    type,
    title: `${type} Raporu - ${startDate.toLocaleDateString('tr-TR')} / ${endDate.toLocaleDateString('tr-TR')}`,
    dateRange: { startDate, endDate },
    data: {
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        transactionCount: months.length,
      },
      categories: Object.fromEntries(
        Object.values(TransactionCategory).map((category) => [
          category,
          {
            income: Math.random() * 5000 + 1000,
            expense: Math.random() * 3000 + 500,
            count: Math.floor(Math.random() * 50) + 10,
          },
        ])
      ),
      trends: {
        monthlyData: months,
      },
      charts: {
        pieChartData,
        lineChartData: months.map((month) => ({
          date: month.month,
          balance: month.balance,
          income: month.income,
          expense: month.expense,
        })),
      },
    },
    generatedAt: new Date(),
    createdAt: new Date(),
  };
}

/**
 * GET /api/financial/reports
 * List or generate reports
 */
async function getReportsHandler(request: NextRequest) {
  try {
    const query = parseQueryParams(request);

    // Generate a new report if parameters provided
    if (query.type && query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      const newReport = generateMockReport(query.type, startDate, endDate);
      reports.unshift(newReport);

      return NextResponse.json({
        success: true,
        data: [newReport],
        message: 'Rapor başarıyla oluşturuldu',
      });
    }

    // Return existing reports
    return NextResponse.json({
      success: true,
      data: reports,
      message: `${reports.length} rapor bulundu`,
    });
  } catch (error: unknown) {
    console.error('Reports error:', error);
    return NextResponse.json({ success: false, error: 'Raporlar işlenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/financial/reports
 * Generate a new report
 */
async function generateReportHandler(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.startDate || !body.endDate) {
      return NextResponse.json({ success: false, error: 'Eksik parametreler' }, { status: 400 });
    }

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const newReport = generateMockReport(body.type, startDate, endDate);

    reports.unshift(newReport);

    return NextResponse.json(
      {
        success: true,
        data: newReport,
        message: 'Rapor başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Report generation error:', error);
    return NextResponse.json({ success: false, error: 'Rapor oluşturulamadı' }, { status: 500 });
  }
}

export const GET = getReportsHandler;
export const POST = withCsrfProtection(generateReportHandler);
