import { NextRequest, NextResponse } from 'next/server';
import { getStudents, createStudent } from '@/lib/api/mock-api';
import { StudentStatus, EducationLevel } from '@/types/scholarship';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

interface StudentData {
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  birthDate?: Date;
  gender?: 'MALE' | 'FEMALE';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  educationLevel?: EducationLevel;
  institution?: string;
  department?: string;
  grade?: string;
  gpa?: number;
  academicYear?: string;
  status?: StudentStatus;
  familyIncome?: number;
  familySize?: number;
  isOrphan?: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  notes?: string;
}

/**
 * Parse query parameters for pagination and filtering
 */
function parseQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  return {
    search: searchParams.get('search') || undefined,
    status: (searchParams.get('status') as StudentStatus) || undefined,
    educationLevel: (searchParams.get('educationLevel') as EducationLevel) || undefined,
    isOrphan:
      searchParams.get('isOrphan') === 'true'
        ? true
        : searchParams.get('isOrphan') === 'false'
          ? false
          : undefined,
    city: searchParams.get('city') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
  };
}

/**
 * Validate student data
 */
function validateStudentData(data: StudentData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push('Ad en az 2 karakter olmalıdır');
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push('Soyad en az 2 karakter olmalıdır');
  }

  if (!data.institution || data.institution.trim().length < 3) {
    errors.push('Eğitim kurumu en az 3 karakter olmalıdır');
  }

  // GPA validation
  if (data.gpa !== undefined && (data.gpa < 0 || data.gpa > 4)) {
    errors.push('GPA 0-4 arasında olmalıdır');
  }

  // Family income validation
  if (data.familyIncome !== undefined && data.familyIncome < 0) {
    errors.push("Aile geliri 0'dan küçük olamaz");
  }

  // Family size validation
  if (data.familySize !== undefined && data.familySize <= 0) {
    errors.push("Aile büyüklüğü 0'dan büyük olmalıdır");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * GET /api/students
 * List students with pagination and filters
 */
async function getStudentsHandler(request: NextRequest) {
  try {
    const params = parseQueryParams(request);

    const result = await getStudents(params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Öğrenci listesi alınamadı' },
        { status: 500 }
      );
    }

    const response: ApiResponse<unknown> = {
      success: true,
      data: result.data?.data || [],
      total: result.data?.total || 0,
      message: `${result.data?.total || 0} öğrenci bulundu`,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Students list error:', error);

    return NextResponse.json(
      { success: false, error: 'Listeleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create new student
 */
async function createStudentHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as StudentData;

    // Validate input
    if (!body) {
      return NextResponse.json({ success: false, error: 'Veri bulunamadı' }, { status: 400 });
    }

    // Validate student data
    const validation = validateStudentData(body);
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
    const studentData: Partial<StudentData> = {
      ...body,
      country: body.country || 'Türkiye',
      educationLevel: body.educationLevel || EducationLevel.BACHELOR,
      academicYear: body.academicYear || '2024-2025',
      status: body.status || StudentStatus.ACTIVE,
      isOrphan: body.isOrphan || false,
    };

    const result = await createStudent(studentData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Öğrenci oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'Öğrenci başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Student creation error:', error);

    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

// Export handlers with CSRF protection
export const GET = getStudentsHandler;
