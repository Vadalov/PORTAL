import { NextRequest, NextResponse } from 'next/server';
import {
  getApplications,
  createApplication,
  getScholarships,
  getStudents,
} from '@/lib/api/mock-api';
import { ApplicationStatus, StudentStatus } from '@/types/scholarship';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

interface ApplicationData {
  scholarshipId: string;
  studentId: string;
  status?: ApplicationStatus;
  personalStatement?: string;
  motivationLetter?: string;
  familySituation?: string;
  financialNeed?: string;
  academicAchievements?: string;
  extracurricularActivities?: string;
  priority?: number;
}

/**
 * Parse query parameters for pagination and filtering
 */
function parseQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  return {
    search: searchParams.get('search') || undefined,
    scholarshipId: searchParams.get('scholarshipId') || undefined,
    studentId: searchParams.get('studentId') || undefined,
    status: (searchParams.get('status') as ApplicationStatus) || undefined,
    assignedReviewer: searchParams.get('assignedReviewer') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
  };
}

/**
 * Validate application data
 */
function validateApplicationData(data: ApplicationData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.scholarshipId) {
    errors.push('Burs ID gerekli');
  }

  if (!data.studentId) {
    errors.push('Öğrenci ID gerekli');
  }

  // Priority validation
  if (data.priority !== undefined && data.priority < 0) {
    errors.push("Öncelik 0'dan küçük olamaz");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /api/scholarships/applications
 * List applications with pagination and filters
 */
async function getApplicationsHandler(request: NextRequest) {
  try {
    const params = parseQueryParams(request);

    const result = await getApplications(params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Başvuru listesi alınamadı' },
        { status: 500 }
      );
    }

    const response: ApiResponse<unknown> = {
      success: true,
      data: result.data?.data || [],
      total: result.data?.total || 0,
      message: `${result.data?.total || 0} başvuru bulundu`,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Applications list error:', error);

    return NextResponse.json(
      { success: false, error: 'Listeleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scholarships/applications
 * Create new application
 */
async function createApplicationHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as ApplicationData;

    // Validate input
    if (!body) {
      return NextResponse.json({ success: false, error: 'Veri bulunamadı' }, { status: 400 });
    }

    // Validate application data
    const validation = validateApplicationData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Doğrulama hatası',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Set defaults
    const applicationData: Partial<ApplicationData> = {
      ...body,
      status: body.status || ApplicationStatus.DRAFT,
      priority: body.priority || 0,
    };

    const result = await createApplication(applicationData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Başvuru oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'Başvuru başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Application creation error:', error);

    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scholarships/applications/scholarships
 * Get available scholarships for application
 */
async function getAvailableScholarshipsHandler(_request: NextRequest) {
  try {
    const result = await getScholarships({ isActive: true });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Burs listesi alınamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data?.data || [],
      message: 'Mevcut burslar başarıyla getirildi',
    });
  } catch (error: unknown) {
    console.error('Available scholarships error:', error);

    return NextResponse.json({ success: false, error: 'Burs listesi alınamadı' }, { status: 500 });
  }
}

/**
 * GET /api/scholarships/applications/students
 * Get students eligible for scholarships
 */
async function getEligibleStudentsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scholarshipId = searchParams.get('scholarshipId');

    const result = await getStudents({ status: StudentStatus.ACTIVE });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Öğrenci listesi alınamadı' },
        { status: 500 }
      );
    }

    const students = result.data?.data || [];

    // Filter by scholarship eligibility if scholarshipId provided
    if (scholarshipId) {
      // In a real implementation, this would filter based on scholarship criteria
      // For now, just return all active students
    }

    return NextResponse.json({
      success: true,
      data: students,
      message: 'Uygun öğrenciler başarıyla getirildi',
    });
  } catch (error: unknown) {
    console.error('Eligible students error:', error);

    return NextResponse.json(
      { success: false, error: 'Öğrenci listesi alınamadı' },
      { status: 500 }
    );
  }
}

// Export handlers with CSRF protection
export const GET = getApplicationsHandler;
export const GET_scholarships = getAvailableScholarshipsHandler;
export const GET_students = getEligibleStudentsHandler;
