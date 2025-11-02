import { NextRequest, NextResponse } from 'next/server';
import {
  getScholarships,
  getScholarship,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getScholarshipStats
} from '@/lib/api/mock-api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import {
  ScholarshipType,
  ScholarshipSearchParams
} from '@/types/scholarship';

// TypeScript interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

interface ScholarshipData {
  name?: string;
  description?: string;
  type?: ScholarshipType;
  amount?: number;
  currency?: string;
  duration?: number;
  maxRecipients?: number;
  requirements?: string[];
  eligibilityCriteria?: string[];
  applicationDeadline?: Date;
  isActive?: boolean;
}

/**
 * Parse query parameters for pagination and filtering
 */
function parseQueryParams(request: NextRequest): ScholarshipSearchParams {
  const { searchParams } = new URL(request.url);

  return {
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') as ScholarshipType || undefined,
    isActive: searchParams.get('isActive') === 'true' ? true : 
              searchParams.get('isActive') === 'false' ? false : undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100
  };
}

/**
 * Validate scholarship data
 */
function validateScholarshipData(data: ScholarshipData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Burs adı en az 3 karakter olmalıdır');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Açıklama en az 10 karakter olmalıdır');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Burs tutarı 0\'dan büyük olmalıdır');
  }

  if (!data.duration || data.duration <= 0) {
    errors.push('Süre 0\'dan büyük olmalıdır');
  }

  if (!data.maxRecipients || data.maxRecipients <= 0) {
    errors.push('Maksimum alıcı sayısı 0\'dan büyük olmalıdır');
  }

  // Type validation
  if (data.type && !Object.values(ScholarshipType).includes(data.type)) {
    errors.push('Geçersiz burs tipi');
  }

  // Deadline validation
  if (data.applicationDeadline && data.applicationDeadline <= new Date()) {
    errors.push('Başvuru tarihi gelecekte olmalıdır');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * GET /api/scholarships
 * List scholarships with pagination and filters
 */
async function getScholarshipsHandler(request: NextRequest) {
  try {
    const params = parseQueryParams(request);

    const result = await getScholarships(params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Burs listesi alınamadı' },
        { status: 500 }
      );
    }

    const response: ApiResponse<unknown> = {
      success: true,
      data: result.data?.data || [],
      total: result.data?.total || 0,
      message: `${result.data?.total || 0} burs bulundu`
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Scholarships list error:', error);

    return NextResponse.json(
      { success: false, error: 'Listeleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scholarships
 * Create new scholarship
 */
async function createScholarshipHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as ScholarshipData;

    // Validate input
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Veri bulunamadı' },
        { status: 400 }
      );
    }

    // Validate scholarship data
    const validation = validateScholarshipData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Doğrulama hatası', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Set defaults and create scholarship
    const scholarshipData: Partial<ScholarshipData> = {
      ...body,
      currency: body.currency || 'TRY',
      requirements: body.requirements || [],
      eligibilityCriteria: body.eligibilityCriteria || [],
      isActive: body.isActive ?? true,
      applicationDeadline: body.applicationDeadline || new Date()
    };

    const result = await createScholarship(scholarshipData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Burs oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'Burs başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Scholarship creation error:', error);

    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scholarships/stats
 * Get scholarship statistics
 */
async function getScholarshipStatsHandler(request: NextRequest) {
  try {
    const result = await getScholarshipStats();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'İstatistikler alınamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'İstatistikler başarıyla getirildi'
    });
  } catch (error: unknown) {
    console.error('Scholarship stats error:', error);

    return NextResponse.json(
      { success: false, error: 'İstatistikler alınamadı' },
      { status: 500 }
    );
  }
}

// Export handlers with CSRF protection
export const GET = getScholarshipsHandler;
export const POST = withCsrfProtection(createScholarshipHandler);
export const GET_stats = getScholarshipStatsHandler;