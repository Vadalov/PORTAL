import { NextRequest, NextResponse } from 'next/server';
import { Invoice, CreateInvoiceInput } from '@/types/financial';

// Mock data store
const invoices: Invoice[] = [
  {
    id: '1',
    userId: 'user-1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'ABC Derneği',
    clientEmail: 'info@abcdernegi.org',
    clientAddress: 'İstanbul, Türkiye',
    items: [
      {
        description: 'Danışmanlık Hizmeti',
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
      },
    ],
    subtotal: 5000,
    tax: 900,
    total: 5900,
    currency: 'TRY',
    issueDate: new Date('2024-11-01'),
    dueDate: new Date('2024-11-15'),
    status: 'sent',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

/**
 * GET /api/financial/invoices
 * List invoices
 */
async function getInvoicesHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientName = searchParams.get('client');

    let filteredInvoices = [...invoices];

    if (status) {
      filteredInvoices = filteredInvoices.filter((inv) => inv.status === status);
    }

    if (clientName) {
      filteredInvoices = filteredInvoices.filter((inv) =>
        inv.clientName.toLowerCase().includes(clientName.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredInvoices,
      message: `${filteredInvoices.length} fatura bulundu`,
    });
  } catch (error: unknown) {
    console.error('Invoices list error:', error);
    return NextResponse.json({ success: false, error: 'Faturalar listelenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/financial/invoices
 * Create new invoice
 */
async function createInvoiceHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateInvoiceInput;

    if (!body) {
      return NextResponse.json({ success: false, error: 'Veri bulunamadı' }, { status: 400 });
    }

    const subtotal = body.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.18; // %18 KDV
    const total = subtotal + tax;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}`,
      userId: 'user-1',
      invoiceNumber,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientAddress: body.clientAddress,
      items: body.items,
      subtotal,
      tax,
      total,
      currency: 'TRY',
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      status: body.status || 'draft',
      notes: body.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    invoices.unshift(newInvoice);

    return NextResponse.json(
      {
        success: true,
        data: newInvoice,
        message: 'Fatura başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ success: false, error: 'Fatura oluşturulamadı' }, { status: 500 });
  }
}

/**
 * GET /api/financial/invoices/stats
 * Get invoice statistics
 */
async function getInvoiceStatsHandler() {
  try {
    const stats = {
      totalInvoices: invoices.length,
      draftInvoices: invoices.filter((inv) => inv.status === 'draft').length,
      sentInvoices: invoices.filter((inv) => inv.status === 'sent').length,
      paidInvoices: invoices.filter((inv) => inv.status === 'paid').length,
      overdueInvoices: invoices.filter((inv) => inv.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      paidAmount: invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0),
      pendingAmount: invoices
        .filter((inv) => inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.total, 0),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Fatura istatistikleri başarıyla getirildi',
    });
  } catch (error: unknown) {
    console.error('Invoice stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Fatura istatistikleri getirilemedi' },
      { status: 500 }
    );
  }
}

export const GET = getInvoicesHandler;
export const GET_stats = getInvoiceStatsHandler;
