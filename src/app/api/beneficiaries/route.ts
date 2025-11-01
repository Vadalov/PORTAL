import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { QueryParams, BeneficiaryDocument, CreateDocumentData } from '@/types/collections';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';

// TypeScript interfaces
interface BeneficiaryFilters {
  status?: string;
  priority?: string;
  category?: string;
  city?: string;
}

interface ParsedQueryParams extends Omit<QueryParams, 'filters'> {
  filters?: BeneficiaryFilters;
}

interface ApiResponse {
  data?: unknown;
  error?: string;
  total?: number;
}

interface BeneficiaryData {
  name?: string;
  tc_no?: string;
  phone?: string;
  address?: string;
  email?: string;
  status?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  family_size?: number;
  [key: string]: unknown;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Parse query parameters for pagination and filtering
 */
function parseQueryParams(request: NextRequest): ParsedQueryParams {
  const { searchParams } = new URL(request.url);

  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100
    search: searchParams.get('search') || undefined,
    orderBy: searchParams.get('orderBy') || undefined,
    orderType: (searchParams.get('orderType') as 'asc' | 'desc') || 'desc',
    filters: {
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
    },
  };
}

/**
 * Validate beneficiary data
 */
function validateBeneficiaryData(data: BeneficiaryData): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Ad Soyad en az 2 karakter olmalıdır');
  }

  if (!data.tc_no || !/^\d{11}$/.test(data.tc_no)) {
    errors.push('TC Kimlik No 11 haneli olmalıdır');
  }

  if (!data.phone || !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.phone)) {
    errors.push('Geçerli bir telefon numarası giriniz');
  }

  if (!data.address || data.address.trim().length < 10) {
    errors.push('Adres en az 10 karakter olmalıdır');
  }

  // Email validation (optional but if provided must be valid)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Geçerli bir email adresi giriniz');
  }

  // Status validation
  if (data.status && !['TASLAK', 'AKTIF', 'PASIF', 'SILINDI'].includes(data.status)) {
    errors.push('Geçersiz durum değeri');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /api/beneficiaries
 * List beneficiaries with pagination and filters
 */
async function getBeneficiariesHandler(request: NextRequest) {
  const params = parseQueryParams(request);
  try {
    // Build filters for Appwrite query
    const filters: BeneficiaryFilters = {};
    if (params.filters?.status) {
      filters.status = params.filters.status;
    }
    if (params.filters?.city) {
      filters.city = params.filters.city;
    }

    const queryParams: ParsedQueryParams = {
      ...params,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };

    const response = (await api.beneficiaries.getBeneficiaries(queryParams as QueryParams)) as ApiResponse;

    if (response.error) {
      return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
    }

    // Handle different response structures
    const data = response.data;
    const beneficiaries = Array.isArray(data)
      ? data
      : (data as Record<string, unknown>)?.data || [];
    const total = Array.isArray(data) ? data.length : (data as Record<string, number>)?.total || 0;

    return NextResponse.json({
      success: true,
      data: beneficiaries,
      total,
      message: `${total} kayıt bulundu`,
    });
  } catch (error: unknown) {
    logger.error('Beneficiaries list error', error, {
      endpoint: '/api/beneficiaries',
      method: 'GET',
      page: params.page,
      limit: params.limit,
      filters: params.filters
    });

    return NextResponse.json(
      { success: false, error: 'Listeleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beneficiaries
 * Create new beneficiary
 */
async function createBeneficiaryHandler(request: NextRequest) {
  let body: BeneficiaryData | null = null;
  try {
    body = (await request.json()) as BeneficiaryData;

    // Validate input
    if (!body) {
      return NextResponse.json({ success: false, error: 'Veri bulunamadı' }, { status: 400 });
    }

    // Validate beneficiary data
    const validation = validateBeneficiaryData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    // Set default status if not provided
    const beneficiaryData: CreateDocumentData<BeneficiaryDocument> = {
      name: body.name || '',
      tc_no: body.tc_no || '',
      phone: body.phone || '',
      address: body.address || '',
      city: body.city || '',
      district: body.district || '',
      neighborhood: body.neighborhood || '',
      family_size: body.family_size || 1,
      status: (body.status as BeneficiaryDocument['status']) || 'TASLAK',
      email: body.email,
    };

    const response = (await api.beneficiaries.createBeneficiary(beneficiaryData)) as ApiResponse;

    if (response.error) {
      return NextResponse.json({ success: false, error: 'Kayıt oluşturulamadı' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: response.data,
        message: 'İhtiyaç sahibi başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    logger.error('Beneficiary creation error', error, {
      endpoint: '/api/beneficiaries',
      method: 'POST',
      tcNo: `${body?.tc_no?.substring(0, 3)  }***` // Mask TC number for privacy
    });

    // Handle duplicate TC number
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage?.includes('duplicate') || errorMessage?.includes('unique')) {
      return NextResponse.json(
        { success: false, error: 'Bu TC Kimlik No zaten kayıtlı' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

// Export handlers with CSRF protection
export const GET = getBeneficiariesHandler;
export const POST = withCsrfProtection(createBeneficiaryHandler);
