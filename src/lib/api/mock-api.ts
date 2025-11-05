// KafkasDer İhtiyaç Sahipleri Mock API
// Mock backend servisi - gerçek API entegrasyonu için değiştirilecek

import {
  Beneficiary,
  BeneficiaryQuickAdd,
  BeneficiaryListResponse,
  BeneficiarySearchParams,
  PhotoUploadResponse,
  MernisCheckResponse,
  BeneficiaryCategory,
  FundRegion,
  FileConnection,
  Country,
  City,
  BeneficiaryStatus,
  SponsorType,
} from '@/types/beneficiary';

import type {
  BeneficiaryDocument,
  QueryParams,
} from '@/types/database';

// Define ApiResponse type locally (legacy)
interface ApiResponse<T> {
  success?: boolean;
  data?: T | null;
  error?: string | null;
  message?: string;
}

// Simulated network delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// === LEGACY MOCK STORAGE (kept for backward compatibility) ===
const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'beneficiary-001',
    photo: 'https://via.placeholder.com/300x400/cccccc/666666?text=Ahmet+Yılmaz',
    sponsorType: SponsorType.BIREYSEL,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    nationality: 'Türkiye',
    identityNumber: '12345678901',
    mernisCheck: true,
    category: BeneficiaryCategory.YETIM_AILESI,
    fundRegion: FundRegion.AVRUPA,
    fileConnection: FileConnection.PARTNER_KURUM,
    fileNumber: 'AVYET001234',
    mobilePhone: '5551234567',
    mobilePhoneCode: '555',
    landlinePhone: '2121234567',
    internationalPhone: '+905551234567',
    email: 'ahmet.yilmaz@example.com',
    linkedOrphan: 'ORP-001',
    linkedCard: 'CARD-001',
    familyMemberCount: 4,
    country: Country.TURKIYE,
    city: City.ISTANBUL,
    district: 'Kadıköy',
    neighborhood: 'Moda',
    address: 'Moda Mahallesi, Kadıköy/İstanbul',
    consentStatement: 'Kişisel verilerimin işlenmesine rıza gösteriyorum.',
    deleteRecord: false,
    status: BeneficiaryStatus.AKTIF,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    createdBy: 'admin@test.com',
    updatedBy: 'admin@test.com',
  },
  {
    id: 'beneficiary-002',
    photo: 'https://via.placeholder.com/300x400/cccccc/666666?text=Fatma+Demir',
    sponsorType: SponsorType.KURUMSAL,
    firstName: 'Fatma',
    lastName: 'Demir',
    nationality: 'Suriye',
    identityNumber: undefined,
    mernisCheck: false,
    category: BeneficiaryCategory.MULTECI_AILE,
    fundRegion: FundRegion.SERBEST,
    fileConnection: FileConnection.CALISMA_SAHASI,
    fileNumber: 'SRMUL002345',
    mobilePhone: '5552345678',
    mobilePhoneCode: '555',
    landlinePhone: undefined,
    internationalPhone: '+905552345678',
    email: 'fatma.demir@example.com',
    linkedOrphan: undefined,
    linkedCard: 'CARD-002',
    familyMemberCount: 3,
    country: Country.TURKIYE,
    city: City.GAZIANTEP,
    district: 'Şahinbey',
    neighborhood: 'Şehitkamil',
    address: 'Şehitkamil Mahallesi, Şahinbey/Gaziantep',
    consentStatement: 'Kişisel verilerimin işlenmesine rıza gösteriyorum.',
    deleteRecord: false,
    status: BeneficiaryStatus.AKTIF,
    createdAt: '2024-02-10T14:20:00.000Z',
    updatedAt: '2024-02-10T14:20:00.000Z',
    createdBy: 'manager@test.com',
    updatedBy: 'manager@test.com',
  },
  {
    id: 'beneficiary-003',
    photo: 'https://via.placeholder.com/300x400/cccccc/666666?text=Mehmet+Kaya',
    sponsorType: SponsorType.BIREYSEL,
    firstName: 'Mehmet',
    lastName: 'Kaya',
    nationality: 'Türkiye',
    identityNumber: '98765432109',
    mernisCheck: true,
    category: BeneficiaryCategory.IHTIYAC_SAHIBI_COCUK,
    fundRegion: FundRegion.AVRUPA,
    fileConnection: FileConnection.PARTNER_KURUM,
    fileNumber: 'AVIHT003456',
    mobilePhone: '5553456789',
    mobilePhoneCode: '555',
    landlinePhone: '2169876543',
    internationalPhone: '+905553456789',
    email: 'mehmet.kaya@example.com',
    linkedOrphan: 'ORP-003',
    linkedCard: undefined,
    familyMemberCount: 2,
    country: Country.TURKIYE,
    city: City.ANKARA,
    district: 'Çankaya',
    neighborhood: 'Kızılay',
    address: 'Kızılay Mahallesi, Çankaya/Ankara',
    consentStatement: 'Kişisel verilerimin işlenmesine rıza gösteriyorum.',
    deleteRecord: false,
    status: BeneficiaryStatus.TASLAK,
    createdAt: '2024-03-05T09:15:00.000Z',
    updatedAt: '2024-03-05T09:15:00.000Z',
    createdBy: 'member@test.com',
    updatedBy: 'member@test.com',
  },
];

// === CLEAN BENEFICIARY STORAGE ===
const mockBeneficiaryDocs: BeneficiaryDocument[] = mockBeneficiaries.map((b) => ({
  _id: b.id,
  _creationTime: b.createdAt,
  _updatedAt: b.updatedAt,
  $permissions: [],
  $collectionId: 'beneficiaries',
  $databaseId: 'mock-db',
  name: `${b.firstName} ${b.lastName}`,
  tc_no: b.identityNumber || '',
  phone: b.mobilePhone || '',
  email: b.email || '',
  birth_date: undefined,
  gender: undefined,
  nationality: b.nationality,
  religion: undefined,
  marital_status: undefined,
  address: b.address || '',
  city: b.city || '',
  district: b.district || '',
  neighborhood: b.neighborhood || '',
  family_size: b.familyMemberCount || 1,
  children_count: undefined,
  orphan_children_count: undefined,
  elderly_count: undefined,
  disabled_count: undefined,
  income_level: undefined,
  income_source: undefined,
  has_debt: false,
  housing_type: undefined,
  has_vehicle: false,
  health_status: undefined,
  has_chronic_illness: undefined,
  chronic_illness_detail: undefined,
  has_disability: undefined,
  disability_detail: undefined,
  has_health_insurance: undefined,
  regular_medication: undefined,
  education_level: undefined,
  occupation: undefined,
  employment_status: undefined,
  aid_type: undefined,
  totalAidAmount: undefined,
  aid_duration: undefined,
  priority: undefined,
  reference_name: undefined,
  reference_phone: undefined,
  reference_relation: undefined,
  application_source: undefined,
  notes: undefined,
  previous_aid: false,
  other_organization_aid: false,
  emergency: false,
  contact_preference: undefined,
  status: (b.status as any) || 'TASLAK',
  approval_status: 'pending',
  approved_by: undefined,
  approved_at: undefined,
}));

// Generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// === BENEFICIARY API FUNCTIONS (LEGACY) ===

/**
 * Hızlı kayıt için beneficiary oluşturma (legacy)
 */
export const createBeneficiary = async (
  data: BeneficiaryQuickAdd
): Promise<ApiResponse<Beneficiary>> => {
  await delay();

  try {
    const newBeneficiary: Beneficiary = {
      id: generateId(),
      ...data,
      status: BeneficiaryStatus.TASLAK,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockBeneficiaries.push(newBeneficiary);
    return {
      success: true,
      data: newBeneficiary,
      message: 'İhtiyaç sahibi başarıyla oluşturuldu',
    };
  } catch (_error) {
    return {
      success: false,
      data: null,
      error: 'İhtiyaç sahibi oluşturulurken hata oluştu',
    };
  }
};

/**
 * Beneficiary güncelleme (legacy)
 */
export const updateBeneficiary = async (
  id: string,
  data: Partial<Beneficiary>
): Promise<ApiResponse<Beneficiary>> => {
  await delay();

  try {
    const index = mockBeneficiaries.findIndex((b) => b.id === id);

    if (index === -1) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı',
      };
    }

    const updatedBeneficiary: Beneficiary = {
      ...mockBeneficiaries[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockBeneficiaries[index] = updatedBeneficiary;

    return {
      success: true,
      data: updatedBeneficiary,
      message: 'İhtiyaç sahibi başarıyla güncellendi',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi güncellenirken hata oluştu',
    };
  }
};

/**
 * Tek beneficiary getirme (legacy)
 */
export const getBeneficiary = async (id: string): Promise<ApiResponse<Beneficiary>> => {
  await delay();

  try {
    const beneficiary = mockBeneficiaries.find((b) => b.id === id);

    if (!beneficiary) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı',
      };
    }

    return {
      success: true,
      data: beneficiary,
    };
  } catch (_error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi getirilirken hata oluştu',
    };
  }
};

/**
 * Beneficiary listesi getirme (sayfalama ve filtreleme ile) - legacy
 */
export const getBeneficiaries = async (
  params: BeneficiarySearchParams = {}
): Promise<ApiResponse<BeneficiaryListResponse>> => {
  await delay();

  try {
    const {
      search = '',
      category,
      fundRegion,
      status,
      country,
      city,
      page = 1,
      limit = 20,
    } = params;

    let filteredBeneficiaries = [...mockBeneficiaries];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBeneficiaries = filteredBeneficiaries.filter(
        (b) =>
          b.firstName.toLowerCase().includes(searchLower) ||
          b.lastName.toLowerCase().includes(searchLower) ||
          b.identityNumber?.includes(search) ||
          b.fileNumber.toLowerCase().includes(searchLower) ||
          b.id.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (category) {
      filteredBeneficiaries = filteredBeneficiaries.filter((b) => b.category === category);
    }

    // Fund region filter
    if (fundRegion) {
      filteredBeneficiaries = filteredBeneficiaries.filter((b) => b.fundRegion === fundRegion);
    }

    // Status filter
    if (status) {
      filteredBeneficiaries = filteredBeneficiaries.filter((b) => b.status === status);
    }

    // Country filter
    if (country) {
      filteredBeneficiaries = filteredBeneficiaries.filter((b) => b.country === country);
    }

    // City filter
    if (city) {
      filteredBeneficiaries = filteredBeneficiaries.filter((b) => b.city === city);
    }

    // Pagination
    const total = filteredBeneficiaries.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBeneficiaries = filteredBeneficiaries.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedBeneficiaries,
        total,
        page,
        limit,
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'İhtiyaç sahipleri listesi getirilirken hata oluştu',
    };
  }
};

/**
 * Beneficiary silme (legacy)
 */
export const deleteBeneficiary = async (id: string): Promise<ApiResponse<void>> => {
  await delay();

  try {
    const index = mockBeneficiaries.findIndex((b) => b.id === id);

    if (index === -1) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı',
      };
    }

    mockBeneficiaries.splice(index, 1);
    return {
      success: true,
      message: 'İhtiyaç sahibi başarıyla silindi',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi silinirken hata oluştu',
    };
  }
};

/**
 * Fotoğraf yükleme (legacy)
 */
export const uploadBeneficiaryPhoto = async (
  id: string,
  file: File
): Promise<ApiResponse<PhotoUploadResponse>> => {
  await delay(1000); // Fotoğraf yükleme daha uzun sürer

  try {
    // Mock fotoğraf URL'i oluştur
    const photoUrl = `https://via.placeholder.com/300x400/cccccc/666666?text=${encodeURIComponent(file.name)}`;

    // Beneficiary'yi güncelle
    const updateResult = await updateBeneficiary(id, { photo: photoUrl });

    if (!updateResult.success) {
      return {
        success: false,
        error: 'Fotoğraf yüklenirken hata oluştu',
      };
    }

    return {
      success: true,
      data: {
        success: true,
        photoUrl,
        message: 'Fotoğraf başarıyla yüklendi',
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Fotoğraf yüklenirken hata oluştu',
    };
  }
};

/**
 * Mernis kontrolü
 */
export const checkMernis = async (
  identityNumber: string
): Promise<ApiResponse<MernisCheckResponse>> => {
  await delay(2000); // Mernis kontrolü uzun sürer

  try {
    // Mock Mernis kontrolü
    // Gerçek implementasyonda Mernis API'si kullanılacak
    const isValid = identityNumber.length === 11 && /^\d{11}$/.test(identityNumber);

    if (!isValid) {
      return {
        success: true,
        data: {
          isValid: false,
          message: 'Geçersiz TC Kimlik No',
        },
      };
    }

    // Mock başarılı kontrol
    return {
      success: true,
      data: {
        isValid: true,
        message: 'Mernis kontrolü başarılı',
        data: {
          firstName: 'Mock',
          lastName: 'User',
          birthDate: new Date('1990-01-01'),
          nationality: 'Türkiye',
        },
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Mernis kontrolü yapılırken hata oluştu',
    };
  }
};

/**
 * Dosya numarası oluşturma
 */
export const generateFileNumber = async (
  category: string,
  fundRegion: string
): Promise<ApiResponse<string>> => {
  await delay();

  try {
    // Mock dosya numarası oluşturma
    const prefix = fundRegion === 'AVRUPA' ? 'AV' : 'SR';
    const categoryCode = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);

    const fileNumber = `${prefix}${categoryCode}${timestamp}`;

    return {
      success: true,
      data: fileNumber,
      message: 'Dosya numarası oluşturuldu',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Dosya numarası oluşturulurken hata oluştu',
    };
  }
};

/**
 * İstatistikler
 */
export const getBeneficiaryStats = async (): Promise<
  ApiResponse<{
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byFundRegion: Record<string, number>;
  }>
> => {
  await delay();

  try {
    const stats = {
      total: mockBeneficiaries.length,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byFundRegion: {} as Record<string, number>,
    };

    mockBeneficiaries.forEach((beneficiary) => {
      // Category stats
      stats.byCategory[beneficiary.category] = (stats.byCategory[beneficiary.category] || 0) + 1;

      // Status stats
      stats.byStatus[beneficiary.status] = (stats.byStatus[beneficiary.status] || 0) + 1;

      // Fund region stats
      stats.byFundRegion[beneficiary.fundRegion] =
        (stats.byFundRegion[beneficiary.fundRegion] || 0) + 1;
    });

    return {
      success: true,
      data: stats,
    };
  } catch (_error) {
    return {
      success: false,
      error: 'İstatistikler getirilirken hata oluştu',
    };
  }
};

/**
 * Export beneficiaries to CSV (legacy)
 */
export const exportBeneficiaries = async (
  params: BeneficiarySearchParams = {}
): Promise<ApiResponse<string>> => {
  await delay(2000); // Export işlemi uzun sürer

  try {
    const result = await getBeneficiaries({ ...params, limit: 10000 });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Veriler getirilemedi',
      };
    }

    // Mock CSV oluşturma
    const headers = [
      'ID',
      'Ad',
      'Soyad',
      'Kategori',
      'Fon Bölgesi',
      'Dosya Numarası',
      'Kimlik No',
      'Telefon',
      'Email',
      'Ülke',
      'Şehir',
      'Durum',
    ];

    const csvRows = [
      headers.join(','),
      ...result.data.data.map((b) =>
        [
          b.id,
          b.firstName,
          b.lastName,
          b.category,
          b.fundRegion,
          b.fileNumber,
          b.identityNumber || '',
          b.mobilePhone || '',
          b.email || '',
          b.country || '',
          b.city || '',
          b.status,
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    return {
      success: true,
      data: csvContent,
      message: 'CSV dosyası oluşturuldu',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'CSV export işlemi sırasında hata oluştu',
    };
  }
};

// === CLEAN API FUNCTIONS ===

// Simple Convex-style response type
interface ConvexResponse<T> {
  data: T | null;
  error: string | null;
  total?: number;
}

function toConvexResponse<T>(data: T | null, total?: number): ConvexResponse<T> {
  return {
    data,
    error: null,
    total,
  };
}

// Convex-style beneficiary functions
export async function createBeneficiaryDoc(
  data: Partial<BeneficiaryDocument>
): Promise<ConvexResponse<BeneficiaryDocument>> {
  await delay();

  const now = new Date().toISOString();
  const _id = generateId();
  const doc: BeneficiaryDocument = {
    _id,
    _creationTime: now,
    _updatedAt: now,
    $permissions: [],
    $collectionId: 'beneficiaries',
    $databaseId: 'mock-db',
    name: data.name || '',
    tc_no: data.tc_no || '',
    phone: data.phone || '',
    email: data.email,
    birth_date: data.birth_date,
    gender: data.gender,
    nationality: data.nationality,
    religion: data.religion,
    marital_status: data.marital_status,
    address: data.address || '',
    city: data.city || '',
    district: data.district || '',
    neighborhood: data.neighborhood || '',
    family_size: data.family_size ?? 1,
    children_count: data.children_count,
    orphan_children_count: data.orphan_children_count,
    elderly_count: data.elderly_count,
    disabled_count: data.disabled_count,
    income_level: data.income_level,
    income_source: data.income_source,
    has_debt: !!data.has_debt,
    housing_type: data.housing_type,
    has_vehicle: !!data.has_vehicle,
    health_status: data.health_status,
    has_chronic_illness: data.has_chronic_illness,
    chronic_illness_detail: data.chronic_illness_detail,
    has_disability: data.has_disability,
    disability_detail: data.disability_detail,
    has_health_insurance: data.has_health_insurance,
    regular_medication: data.regular_medication,
    education_level: data.education_level,
    occupation: data.occupation,
    employment_status: data.employment_status,
    aid_type: data.aid_type,
    totalAidAmount: data.totalAidAmount,
    aid_duration: data.aid_duration,
    priority: data.priority,
    reference_name: data.reference_name,
    reference_phone: data.reference_phone,
    reference_relation: data.reference_relation,
    application_source: data.application_source,
    notes: data.notes,
    previous_aid: !!data.previous_aid,
    other_organization_aid: !!data.other_organization_aid,
    emergency: !!data.emergency,
    contact_preference: data.contact_preference,
    status: data.status || 'TASLAK',
    approval_status: data.approval_status || 'pending',
    approved_by: data.approved_by,
    approved_at: data.approved_at,
  };

  mockBeneficiaryDocs.push(doc);
  return toConvexResponse(doc);
}

export async function getBeneficiaryDoc(
  id: string
): Promise<ConvexResponse<BeneficiaryDocument>> {
  await delay();

  const doc = mockBeneficiaryDocs.find((x) => x._id === id) || null;
  if (!doc) {
    return { data: null, error: 'İhtiyaç sahibi bulunamadı' };
  }
  return toConvexResponse(doc);
}

export async function getBeneficiaryDocs(
  params: QueryParams = {}
): Promise<ConvexResponse<BeneficiaryDocument[]>> {
  await delay();

  const { search = '', page = 1, limit = 20 } = params;

  let list = [...mockBeneficiaryDocs];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(s) ||
        b.tc_no?.includes(search) ||
        b._id.toLowerCase().includes(s)
    );
  }

  const total = list.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const documents = list.slice(start, end);

  return {
    data: documents,
    error: null,
    total,
  };
}

export async function updateBeneficiaryDoc(
  id: string,
  data: Partial<BeneficiaryDocument>
): Promise<ConvexResponse<BeneficiaryDocument>> {
  await delay();

  const idx = mockBeneficiaryDocs.findIndex((b) => b._id === id);
  if (idx === -1) {
    return { data: null, error: 'İhtiyaç sahibi bulunamadı' };
  }

  const now = new Date().toISOString();
  const updated: BeneficiaryDocument = {
    ...mockBeneficiaryDocs[idx],
    ...data,
    _updatedAt: now,
  };

  mockBeneficiaryDocs[idx] = updated;
  return toConvexResponse(updated);
}

export async function deleteBeneficiaryDoc(id: string): Promise<ConvexResponse<null>> {
  await delay();

  const before = mockBeneficiaryDocs.length;
  const filtered = mockBeneficiaryDocs.filter((b) => b._id !== id);
  const after = filtered.length;
  
  // Update the array
  mockBeneficiaryDocs.length = 0;
  mockBeneficiaryDocs.push(...filtered);

  return {
    data: null,
    error: before === after ? 'İhtiyaç sahibi bulunamadı' : null,
  };
}

// === SCHOLARSHIP MANAGEMENT MOCK DATA ===

import {
  Scholarship,
  Student,
  ScholarshipApplication,
  Payment,
  OrphanAssistance,
  ScholarshipType,
  ApplicationStatus,
  StudentStatus,
  PaymentStatus,
  EducationLevel,
  OrphanStatus,
  ScholarshipListResponse,
  StudentListResponse,
  ApplicationListResponse,
  ScholarshipSearchParams,
  StudentSearchParams,
  ApplicationSearchParams,
  ScholarshipStats,
  StudentStats,
} from '@/types/scholarship';

// Mock storage for scholarships
const mockScholarships: Scholarship[] = [
  {
    id: 'scholarship-001',
    name: 'Akademik Başarı Bursu',
    description: 'Yüksek akademik başarı gösteren öğrenciler için burs',
    type: ScholarshipType.ACADEMIC,
    amount: 5000,
    currency: 'TRY',
    duration: 12,
    maxRecipients: 50,
    requirements: ['GPA > 3.5', 'Üniversite öğrencisi'],
    eligibilityCriteria: ['Türk vatandaşı olmak', 'Üniversite öğrencisi olmak'],
    applicationDeadline: new Date('2024-12-31'),
    disbursementDate: new Date('2025-01-15'),
    isActive: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    createdBy: 'admin@test.com',
    updatedBy: 'admin@test.com',
  },
  {
    id: 'scholarship-002',
    name: 'İhtiyaç Sahibi Öğrenci Bursu',
    description: 'Mali durumu zayıf olan öğrenciler için burs',
    type: ScholarshipType.NEED_BASED,
    amount: 3000,
    currency: 'TRY',
    duration: 9,
    maxRecipients: 100,
    requirements: ['Aylık gelir < 5000 TL', 'Başarılı öğrenci'],
    eligibilityCriteria: ['Türk vatandaşı olmak', 'Öğrenci olmak'],
    applicationDeadline: new Date('2024-11-30'),
    isActive: true,
    createdAt: '2024-02-10T14:20:00.000Z',
    updatedAt: '2024-02-10T14:20:00.000Z',
    createdBy: 'manager@test.com',
    updatedBy: 'manager@test.com',
  },
];

// Mock storage for students
const mockStudents: Student[] = [
  {
    id: 'student-001',
    beneficiaryId: 'beneficiary-001',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    nationalId: '12345678901',
    birthDate: new Date('1998-05-15'),
    gender: 'MALE',
    email: 'ahmet.yilmaz@university.edu.tr',
    phone: '5551234567',
    address: 'Üniversite kampüsü yurt',
    city: 'İstanbul',
    country: 'Türkiye',
    educationLevel: EducationLevel.BACHELOR,
    institution: 'İstanbul Üniversitesi',
    department: 'Bilgisayar Mühendisliği',
    grade: '3. sınıf',
    gpa: 3.7,
    academicYear: '2024-2025',
    status: StudentStatus.ACTIVE,
    familyIncome: 4000,
    familySize: 4,
    isOrphan: false,
    documents: [],
    notes: 'Başarılı öğrenci',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    createdBy: 'admin@test.com',
    updatedBy: 'admin@test.com',
  },
];

// Mock storage for applications
const mockApplications: ScholarshipApplication[] = [
  {
    id: 'application-001',
    scholarshipId: 'scholarship-001',
    studentId: 'student-001',
    applicationDate: new Date('2024-03-01'),
    status: ApplicationStatus.APPROVED,
    personalStatement: 'Akademik başarılarımı paylaşmak istiyorum',
    documents: [],
    familySituation: 'Orta gelirli aile',
    financialNeed: 'Orta seviyede',
    academicAchievements: '3.7 GPA',
    priority: 1,
    assignedReviewer: 'admin@test.com',
    reviewNotes: 'Başarılı başvuru',
    reviewDate: new Date('2024-03-15'),
    decisionDate: new Date('2024-03-20'),
    createdAt: '2024-03-01T10:30:00.000Z',
    updatedAt: '2024-03-20T10:30:00.000Z',
    createdBy: 'student-001',
    updatedBy: 'admin@test.com',
  },
];

// Mock storage for payments
const _mockPayments: Payment[] = [
  {
    id: 'payment-001',
    applicationId: 'application-001',
    amount: 5000,
    currency: 'TRY',
    paymentDate: new Date('2024-04-01'),
    status: PaymentStatus.PAID,
    transactionId: 'TXN-001',
    bankAccount: '****1234',
    description: 'Akademik Başarı Bursu - Nisan 2024',
    processedBy: 'admin@test.com',
    processedAt: new Date('2024-04-01T10:00:00.000Z'),
    installments: 12,
    currentInstallment: 1,
    createdAt: '2024-03-20T10:30:00.000Z',
    updatedAt: '2024-04-01T10:00:00.000Z',
  },
];

// Mock storage for orphan assistance
const _mockOrphanAssistance: OrphanAssistance[] = [
  {
    id: 'orphan-001',
    studentId: 'student-001',
    orphanType: OrphanStatus.FULL_ORPHAN,
    guardianInfo: {
      name: 'Fatma Yılmaz',
      relationship: 'Teyze',
      age: 45,
      occupation: 'Ev hanımı',
      income: 2000,
      contactInfo: {
        phone: '5552345678',
      },
    },
    assistanceType: 'SCHOLARSHIP',
    amount: 3000,
    currency: 'TRY',
    startDate: new Date('2024-01-01'),
    status: 'ACTIVE',
    caseManager: 'admin@test.com',
    regularCheckups: true,
    nextCheckupDate: new Date('2024-12-01'),
    createdAt: '2024-01-01T10:30:00.000Z',
    updatedAt: '2024-01-01T10:30:00.000Z',
    createdBy: 'admin@test.com',
    updatedBy: 'admin@test.com',
  },
];

// === SCHOLARSHIP API FUNCTIONS ===

/**
 * Get all scholarships
 */
export const getScholarships = async (
  params: ScholarshipSearchParams = {}
): Promise<ApiResponse<ScholarshipListResponse>> => {
  await delay();

  try {
    const { search = '', type, isActive, page = 1, limit = 20 } = params;

    let filteredScholarships = [...mockScholarships];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredScholarships = filteredScholarships.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.id.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (type) {
      filteredScholarships = filteredScholarships.filter((s) => s.type === type);
    }

    // Active filter
    if (isActive !== undefined) {
      filteredScholarships = filteredScholarships.filter((s) => s.isActive === isActive);
    }

    // Pagination
    const total = filteredScholarships.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedScholarships = filteredScholarships.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedScholarships,
        total,
        page,
        limit,
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Burs listesi getirilirken hata oluştu',
    };
  }
};

/**
 * Get single scholarship
 */
export const getScholarship = async (id: string): Promise<ApiResponse<Scholarship>> => {
  await delay();

  try {
    const scholarship = mockScholarships.find((s) => s.id === id);

    if (!scholarship) {
      return {
        success: false,
        error: 'Burs bulunamadı',
      };
    }

    return {
      success: true,
      data: scholarship,
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Burs getirilirken hata oluştu',
    };
  }
};

/**
 * Create new scholarship
 */
export const createScholarship = async (
  data: Partial<Scholarship>
): Promise<ApiResponse<Scholarship>> => {
  await delay();

  try {
    const newScholarship: Scholarship = {
      id: generateId(),
      name: data.name || '',
      description: data.description || '',
      type: data.type || ScholarshipType.NEED_BASED,
      amount: data.amount || 0,
      currency: data.currency || 'TRY',
      duration: data.duration || 12,
      maxRecipients: data.maxRecipients || 1,
      requirements: data.requirements || [],
      eligibilityCriteria: data.eligibilityCriteria || [],
      applicationDeadline: data.applicationDeadline || new Date(),
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockScholarships.push(newScholarship);

    return {
      success: true,
      data: newScholarship,
      message: 'Burs başarıyla oluşturuldu',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Burs oluşturulurken hata oluştu',
    };
  }
};

/**
 * Update scholarship
 */
export const updateScholarship = async (
  id: string,
  data: Partial<Scholarship>
): Promise<ApiResponse<Scholarship>> => {
  await delay();

  try {
    const index = mockScholarships.findIndex((s) => s.id === id);

    if (index === -1) {
      return {
        success: false,
        error: 'Burs bulunamadı',
      };
    }

    const updatedScholarship: Scholarship = {
      ...mockScholarships[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user',
    };

    mockScholarships[index] = updatedScholarship;

    return {
      success: true,
      data: updatedScholarship,
      message: 'Burs başarıyla güncellendi',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Burs güncellenirken hata oluştu',
    };
  }
};

/**
 * Delete scholarship
 */
export const deleteScholarship = async (id: string): Promise<ApiResponse<void>> => {
  await delay();

  try {
    const index = mockScholarships.findIndex((s) => s.id === id);

    if (index === -1) {
      return {
        success: false,
        error: 'Burs bulunamadı',
      };
    }

    mockScholarships.splice(index, 1);

    return {
      success: true,
      message: 'Burs başarıyla silindi',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Burs silinirken hata oluştu',
    };
  }
};

// === STUDENT API FUNCTIONS ===

/**
 * Get all students
 */
export const getStudents = async (
  params: StudentSearchParams = {}
): Promise<ApiResponse<StudentListResponse>> => {
  await delay();

  try {
    const { search = '', status, educationLevel, isOrphan, city, page = 1, limit = 20 } = params;

    let filteredStudents = [...mockStudents];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) =>
          s.firstName.toLowerCase().includes(searchLower) ||
          s.lastName.toLowerCase().includes(searchLower) ||
          s.nationalId?.includes(search) ||
          s.institution.toLowerCase().includes(searchLower) ||
          s.id.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (status) {
      filteredStudents = filteredStudents.filter((s) => s.status === status);
    }

    // Education level filter
    if (educationLevel) {
      filteredStudents = filteredStudents.filter((s) => s.educationLevel === educationLevel);
    }

    // Orphan filter
    if (isOrphan !== undefined) {
      filteredStudents = filteredStudents.filter((s) => s.isOrphan === isOrphan);
    }

    // City filter
    if (city) {
      filteredStudents = filteredStudents.filter((s) => s.city === city);
    }

    // Pagination
    const total = filteredStudents.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedStudents,
        total,
        page,
        limit,
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Öğrenci listesi getirilirken hata oluştu',
    };
  }
};

/**
 * Get single student
 */
export const getStudent = async (id: string): Promise<ApiResponse<Student>> => {
  await delay();

  try {
    const student = mockStudents.find((s) => s.id === id);

    if (!student) {
      return {
        success: false,
        error: 'Öğrenci bulunamadı',
      };
    }

    return {
      success: true,
      data: student,
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Öğrenci getirilirken hata oluştu',
    };
  }
};

/**
 * Create new student
 */
export const createStudent = async (data: Partial<Student>): Promise<ApiResponse<Student>> => {
  await delay();

  try {
    const newStudent: Student = {
      id: generateId(),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      nationalId: data.nationalId,
      birthDate: data.birthDate || new Date(),
      gender: data.gender || 'MALE',
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country || 'Türkiye',
      educationLevel: data.educationLevel || EducationLevel.BACHELOR,
      institution: data.institution || '',
      department: data.department,
      grade: data.grade,
      gpa: data.gpa,
      academicYear: data.academicYear || '2024-2025',
      status: data.status || StudentStatus.ACTIVE,
      familyIncome: data.familyIncome,
      familySize: data.familySize,
      isOrphan: data.isOrphan || false,
      orphanStatus: data.orphanStatus,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianRelation: data.guardianRelation,
      documents: [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockStudents.push(newStudent);

    return {
      success: true,
      data: newStudent,
      message: 'Öğrenci başarıyla oluşturuldu',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Öğrenci oluşturulurken hata oluştu',
    };
  }
};

// === APPLICATION API FUNCTIONS ===

/**
 * Get all applications
 */
export const getApplications = async (
  params: ApplicationSearchParams = {}
): Promise<ApiResponse<ApplicationListResponse>> => {
  await delay();

  try {
    const {
      search = '',
      scholarshipId,
      studentId,
      status,
      assignedReviewer,
      page = 1,
      limit = 20,
    } = params;

    let filteredApplications = [...mockApplications];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = filteredApplications.filter(
        (a) =>
          a.id.toLowerCase().includes(searchLower) ||
          a.scholarshipId.toLowerCase().includes(searchLower) ||
          a.studentId.toLowerCase().includes(searchLower)
      );
    }

    // Scholarship filter
    if (scholarshipId) {
      filteredApplications = filteredApplications.filter((a) => a.scholarshipId === scholarshipId);
    }

    // Student filter
    if (studentId) {
      filteredApplications = filteredApplications.filter((a) => a.studentId === studentId);
    }

    // Status filter
    if (status) {
      filteredApplications = filteredApplications.filter((a) => a.status === status);
    }

    // Reviewer filter
    if (assignedReviewer) {
      filteredApplications = filteredApplications.filter(
        (a) => a.assignedReviewer === assignedReviewer
      );
    }

    // Pagination
    const total = filteredApplications.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedApplications,
        total,
        page,
        limit,
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Başvuru listesi getirilirken hata oluştu',
    };
  }
};

/**
 * Create new application
 */
export const createApplication = async (
  data: Partial<ScholarshipApplication>
): Promise<ApiResponse<ScholarshipApplication>> => {
  await delay();

  try {
    const newApplication: ScholarshipApplication = {
      id: generateId(),
      scholarshipId: data.scholarshipId || '',
      studentId: data.studentId || '',
      applicationDate: data.applicationDate || new Date(),
      status: data.status || ApplicationStatus.DRAFT,
      personalStatement: data.personalStatement,
      motivationLetter: data.motivationLetter,
      documents: [],
      familySituation: data.familySituation,
      financialNeed: data.financialNeed,
      academicAchievements: data.academicAchievements,
      extracurricularActivities: data.extracurricularActivities,
      references: data.references || [],
      priority: data.priority || 0,
      assignedReviewer: data.assignedReviewer,
      reviewNotes: data.reviewNotes,
      reviewDate: data.reviewDate,
      decisionDate: data.decisionDate,
      decisionNotes: data.decisionNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    mockApplications.push(newApplication);

    return {
      success: true,
      data: newApplication,
      message: 'Başvuru başarıyla oluşturuldu',
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Başvuru oluşturulurken hata oluştu',
    };
  }
};

// === STATISTICS FUNCTIONS ===

/**
 * Get scholarship statistics
 */
export const getScholarshipStats = async (): Promise<ApiResponse<ScholarshipStats>> => {
  await delay();

  try {
    const total = mockScholarships.length;
    const active = mockScholarships.filter((s) => s.isActive).length;
    const byType = mockScholarships.reduce(
      (acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      },
      {} as Record<ScholarshipType, number>
    );

    const totalBudget = mockScholarships.reduce((sum, s) => sum + s.amount * s.maxRecipients, 0);
    const approvedApplications = mockApplications.filter(
      (a) => a.status === ApplicationStatus.APPROVED
    ).length;
    const totalApplications = mockApplications.length;
    const approvalRate =
      totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;

    return {
      success: true,
      data: {
        total,
        active,
        byType,
        totalBudget,
        totalRecipients: approvedApplications,
        applicationsReceived: totalApplications,
        applicationsApproved: approvedApplications,
        approvalRate,
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'İstatistikler getirilirken hata oluştu',
    };
  }
};

/**
 * Get student statistics
 */
export const getStudentStats = async (): Promise<ApiResponse<StudentStats>> => {
  await delay();

  try {
    const total = mockStudents.length;
    const active = mockStudents.filter((s) => s.status === StudentStatus.ACTIVE).length;
    const byEducationLevel = mockStudents.reduce(
      (acc, s) => {
        acc[s.educationLevel] = (acc[s.educationLevel] || 0) + 1;
        return acc;
      },
      {} as Record<EducationLevel, number>
    );
    const orphans = mockStudents.filter((s) => s.isOrphan).length;
    const byStatus = mockStudents.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      },
      {} as Record<StudentStatus, number>
    );

    return {
      success: true,
      data: {
        total,
        active,
        byEducationLevel,
        orphans,
        byStatus,
      },
    };
  } catch (_error) {
    return {
      success: false,
      error: 'Öğrenci istatistikleri getirilirken hata oluştu',
    };
  }
};
