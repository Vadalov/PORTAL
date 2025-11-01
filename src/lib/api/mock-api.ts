// KafkasDer İhtiyaç Sahipleri Mock API
// Mock backend servisi - gerçek API entegrasyonu için değiştirilecek

// Legacy mock types (used by some pages)
import { 
  Beneficiary, 
  BeneficiaryQuickAdd, 
  BeneficiaryListResponse, 
  BeneficiaryResponse,
  BeneficiarySearchParams,
  PhotoUploadResponse,
  MernisCheckResponse
} from '@/types/beneficiary';

// Appwrite-aligned types
import type { 
  BeneficiaryDocument, 
  AppwriteResponse, 
  QueryParams, 
  CreateDocumentData, 
  UpdateDocumentData 
} from '@/types/collections';

// Define ApiResponse type locally (legacy)
interface ApiResponse<T> {
  success?: boolean;
  data?: T | null;
  error?: string | null;
  message?: string;
}

// Simulated network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// === LEGACY MOCK STORAGE (kept for backward compatibility) ===
const mockBeneficiaries: Beneficiary[] = [
  {
    id: "beneficiary-001",
    photo: "https://via.placeholder.com/300x400/cccccc/666666?text=Ahmet+Yılmaz",
    sponsorType: "BIREYSEL" as any,
    firstName: "Ahmet",
    lastName: "Yılmaz",
    nationality: "Türkiye",
    identityNumber: "12345678901",
    mernisCheck: true,
    category: "YETIM_AILESI" as any,
    fundRegion: "AVRUPA" as any,
    fileConnection: "PARTNER_KURUM" as any,
    fileNumber: "AVYET001234",
    mobilePhone: "5551234567",
    mobilePhoneCode: "555",
    landlinePhone: "2121234567",
    internationalPhone: "+905551234567",
    email: "ahmet.yilmaz@example.com",
    linkedOrphan: "ORP-001",
    linkedCard: "CARD-001",
    familyMemberCount: 4,
    country: "TURKIYE" as any,
    city: "ISTANBUL" as any,
    district: "Kadıköy",
    neighborhood: "Moda",
    address: "Moda Mahallesi, Kadıköy/İstanbul",
    consentStatement: "Kişisel verilerimin işlenmesine rıza gösteriyorum.",
    deleteRecord: false,
    status: "AKTIF" as any,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-15T10:30:00.000Z",
    createdBy: "admin@test.com",
    updatedBy: "admin@test.com"
  },
  {
    id: "beneficiary-002",
    photo: "https://via.placeholder.com/300x400/cccccc/666666?text=Fatma+Demir",
    sponsorType: "KURUMSAL" as any,
    firstName: "Fatma",
    lastName: "Demir",
    nationality: "Suriye",
    identityNumber: undefined,
    mernisCheck: false,
    category: "MULTECI_AILE" as any,
    fundRegion: "SERBEST" as any,
    fileConnection: "CALISMA_SAHASI" as any,
    fileNumber: "SRMUL002345",
    mobilePhone: "5552345678",
    mobilePhoneCode: "555",
    landlinePhone: undefined,
    internationalPhone: "+905552345678",
    email: "fatma.demir@example.com",
    linkedOrphan: undefined,
    linkedCard: "CARD-002",
    familyMemberCount: 3,
    country: "TURKIYE" as any,
    city: "GAZIANTEP" as any,
    district: "Şahinbey",
    neighborhood: "Şehitkamil",
    address: "Şehitkamil Mahallesi, Şahinbey/Gaziantep",
    consentStatement: "Kişisel verilerimin işlenmesine rıza gösteriyorum.",
    deleteRecord: false,
    status: "AKTIF" as any,
    createdAt: "2024-02-10T14:20:00.000Z",
    updatedAt: "2024-02-10T14:20:00.000Z",
    createdBy: "manager@test.com",
    updatedBy: "manager@test.com"
  },
  {
    id: "beneficiary-003",
    photo: "https://via.placeholder.com/300x400/cccccc/666666?text=Mehmet+Kaya",
    sponsorType: "BIREYSEL" as any,
    firstName: "Mehmet",
    lastName: "Kaya",
    nationality: "Türkiye",
    identityNumber: "98765432109",
    mernisCheck: true,
    category: "IHTIYAC_SAHIBI_COCUK" as any,
    fundRegion: "AVRUPA" as any,
    fileConnection: "PARTNER_KURUM" as any,
    fileNumber: "AVIHT003456",
    mobilePhone: "5553456789",
    mobilePhoneCode: "555",
    landlinePhone: "2169876543",
    internationalPhone: "+905553456789",
    email: "mehmet.kaya@example.com",
    linkedOrphan: "ORP-003",
    linkedCard: undefined,
    familyMemberCount: 2,
    country: "TURKIYE" as any,
    city: "ANKARA" as any,
    district: "Çankaya",
    neighborhood: "Kızılay",
    address: "Kızılay Mahallesi, Çankaya/Ankara",
    consentStatement: "Kişisel verilerimin işlenmesine rıza gösteriyorum.",
    deleteRecord: false,
    status: "TASLAK" as any,
    createdAt: "2024-03-05T09:15:00.000Z",
    updatedAt: "2024-03-05T09:15:00.000Z",
    createdBy: "member@test.com",
    updatedBy: "member@test.com"
  }
];

// === APPWRITE-ALIGNED MOCK STORAGE ===
let mockAppwriteBeneficiaries: BeneficiaryDocument[] = mockBeneficiaries.map((b, idx) => ({
  $id: b.id,
  $createdAt: b.createdAt,
  $updatedAt: b.updatedAt,
  $permissions: [],
  $collectionId: "beneficiaries",
  $databaseId: "mock-db",
  name: `${b.firstName} ${b.lastName}`,
  tc_no: b.identityNumber || "",
  phone: b.mobilePhone || "",
  email: b.email || "",
  birth_date: undefined,
  gender: undefined,
  nationality: b.nationality,
  religion: undefined,
  marital_status: undefined,
  address: b.address || "",
  city: b.city || "",
  district: b.district || "",
  neighborhood: b.neighborhood || "",
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
  approved_at: undefined
}));

// Generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// === BENEFICIARY API FUNCTIONS (LEGACY) ===

/**
 * Hızlı kayıt için beneficiary oluşturma (legacy)
 */
export const createBeneficiary = async (data: BeneficiaryQuickAdd): Promise<ApiResponse<Beneficiary>> => {
  await delay();
  
  try {
    const newBeneficiary: Beneficiary = {
      id: generateId(),
      ...data,
      status: 'TASLAK' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user'
    };
    
    mockBeneficiaries.push(newBeneficiary);
    // sync to appwrite-style store
    mockAppwriteBeneficiaries.push({
      $id: newBeneficiary.id,
      $createdAt: newBeneficiary.createdAt!,
      $updatedAt: newBeneficiary.updatedAt!,
      $permissions: [],
      $collectionId: "beneficiaries",
      $databaseId: "mock-db",
      name: `${newBeneficiary.firstName} ${newBeneficiary.lastName}`,
      tc_no: newBeneficiary.identityNumber || "",
      phone: newBeneficiary.mobilePhone || "",
      email: newBeneficiary.email || "",
      birth_date: undefined,
      gender: undefined,
      nationality: newBeneficiary.nationality,
      religion: undefined,
      marital_status: undefined,
      address: newBeneficiary.address || "",
      city: newBeneficiary.city || "",
      district: newBeneficiary.district || "",
      neighborhood: newBeneficiary.neighborhood || "",
      family_size: newBeneficiary.familyMemberCount || 1,
      status: 'TASLAK',
      approval_status: 'pending'
    } as BeneficiaryDocument);
    
    return {
      success: true,
      data: newBeneficiary,
      error: null,
      message: 'İhtiyaç sahibi başarıyla oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: 'İhtiyaç sahibi oluşturulurken hata oluştu'
    };
  }
};

/**
 * Beneficiary güncelleme (legacy)
 */
export const updateBeneficiary = async (id: string, data: Partial<Beneficiary>): Promise<ApiResponse<Beneficiary>> => {
  await delay();
  
  try {
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı'
      };
    }
    
    const updatedBeneficiary: Beneficiary = {
      ...mockBeneficiaries[index],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    };
    
    mockBeneficiaries[index] = updatedBeneficiary;

    // sync to appwrite-style store
    const idx2 = mockAppwriteBeneficiaries.findIndex(b => b.$id === id);
    if (idx2 !== -1) {
      const legacy = updatedBeneficiary;
      mockAppwriteBeneficiaries[idx2] = {
        ...mockAppwriteBeneficiaries[idx2],
        $updatedAt: legacy.updatedAt!,
        name: `${legacy.firstName} ${legacy.lastName}`,
        tc_no: legacy.identityNumber || mockAppwriteBeneficiaries[idx2].tc_no,
        phone: legacy.mobilePhone || mockAppwriteBeneficiaries[idx2].phone,
        email: legacy.email || mockAppwriteBeneficiaries[idx2].email,
        nationality: legacy.nationality,
        address: legacy.address || mockAppwriteBeneficiaries[idx2].address,
        city: legacy.city || mockAppwriteBeneficiaries[idx2].city,
        district: legacy.district || mockAppwriteBeneficiaries[idx2].district,
        neighborhood: legacy.neighborhood || mockAppwriteBeneficiaries[idx2].neighborhood,
        family_size: legacy.familyMemberCount || mockAppwriteBeneficiaries[idx2].family_size,
        status: (legacy.status as any) || mockAppwriteBeneficiaries[idx2].status
      };
    }
    
    return {
      success: true,
      data: updatedBeneficiary,
      message: 'İhtiyaç sahibi başarıyla güncellendi'
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi güncellenirken hata oluştu'
    };
  }
};

/**
 * Tek beneficiary getirme (legacy)
 */
export const getBeneficiary = async (id: string): Promise<ApiResponse<Beneficiary>> => {
  await delay();
  
  try {
    const beneficiary = mockBeneficiaries.find(b => b.id === id);
    
    if (!beneficiary) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı'
      };
    }
    
    return {
      success: true,
      data: beneficiary
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi getirilirken hata oluştu'
    };
  }
};

/**
 * Beneficiary listesi getirme (sayfalama ve filtreleme ile) - legacy
 */
export const getBeneficiaries = async (params: BeneficiarySearchParams = {}): Promise<ApiResponse<BeneficiaryListResponse>> => {
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
      limit = 20
    } = params;
    
    let filteredBeneficiaries = [...mockBeneficiaries];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBeneficiaries = filteredBeneficiaries.filter(b => 
        b.firstName.toLowerCase().includes(searchLower) ||
        b.lastName.toLowerCase().includes(searchLower) ||
        b.identityNumber?.includes(search) ||
        b.fileNumber.toLowerCase().includes(searchLower) ||
        b.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (category) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.category === category);
    }
    
    // Fund region filter
    if (fundRegion) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.fundRegion === fundRegion);
    }
    
    // Status filter
    if (status) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.status === status);
    }
    
    // Country filter
    if (country) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.country === country);
    }
    
    // City filter
    if (city) {
      filteredBeneficiaries = filteredBeneficiaries.filter(b => b.city === city);
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
        limit
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahipleri listesi getirilirken hata oluştu'
    };
  }
};

/**
 * Beneficiary silme (legacy)
 */
export const deleteBeneficiary = async (id: string): Promise<ApiResponse<void>> => {
  await delay();
  
  try {
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    
    if (index === -1) {
      return {
        success: false,
        error: 'İhtiyaç sahibi bulunamadı'
      };
    }
    
    mockBeneficiaries.splice(index, 1);
    mockAppwriteBeneficiaries = mockAppwriteBeneficiaries.filter(b => b.$id !== id);
    
    return {
      success: true,
      message: 'İhtiyaç sahibi başarıyla silindi'
    };
  } catch (error) {
    return {
      success: false,
      error: 'İhtiyaç sahibi silinirken hata oluştu'
    };
  }
};

/**
 * Fotoğraf yükleme (legacy)
 */
export const uploadBeneficiaryPhoto = async (id: string, file: File): Promise<ApiResponse<PhotoUploadResponse>> => {
  await delay(1000); // Fotoğraf yükleme daha uzun sürer
  
  try {
    // Mock fotoğraf URL'i oluştur
    const photoUrl = `https://via.placeholder.com/300x400/cccccc/666666?text=${encodeURIComponent(file.name)}`;
    
    // Beneficiary'yi güncelle
    const updateResult = await updateBeneficiary(id, { photo: photoUrl });
    
    if (!updateResult.success) {
      return {
        success: false,
        error: 'Fotoğraf yüklenirken hata oluştu'
      };
    }
    
    return {
      success: true,
      data: {
        success: true,
        photoUrl,
        message: 'Fotoğraf başarıyla yüklendi'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Fotoğraf yüklenirken hata oluştu'
    };
  }
};

/**
 * Mernis kontrolü
 */
export const checkMernis = async (identityNumber: string): Promise<ApiResponse<MernisCheckResponse>> => {
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
          message: 'Geçersiz TC Kimlik No'
        }
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
          nationality: 'Türkiye'
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Mernis kontrolü yapılırken hata oluştu'
    };
  }
};

/**
 * Dosya numarası oluşturma
 */
export const generateFileNumber = async (category: string, fundRegion: string): Promise<ApiResponse<string>> => {
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
      message: 'Dosya numarası oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Dosya numarası oluşturulurken hata oluştu'
    };
  }
};

/**
 * İstatistikler
 */
export const getBeneficiaryStats = async (): Promise<ApiResponse<{
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byFundRegion: Record<string, number>;
}>> => {
  await delay();
  
  try {
    const stats = {
      total: mockBeneficiaries.length,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byFundRegion: {} as Record<string, number>
    };
    
    mockBeneficiaries.forEach(beneficiary => {
      // Category stats
      stats.byCategory[beneficiary.category] = (stats.byCategory[beneficiary.category] || 0) + 1;
      
      // Status stats
      stats.byStatus[beneficiary.status] = (stats.byStatus[beneficiary.status] || 0) + 1;
      
      // Fund region stats
      stats.byFundRegion[beneficiary.fundRegion] = (stats.byFundRegion[beneficiary.fundRegion] || 0) + 1;
    });
    
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      error: 'İstatistikler getirilirken hata oluştu'
    };
  }
};

/**
 * Export beneficiaries to CSV (legacy)
 */
export const exportBeneficiaries = async (params: BeneficiarySearchParams = {}): Promise<ApiResponse<string>> => {
  await delay(2000); // Export işlemi uzun sürer
  
  try {
    const result = await getBeneficiaries({ ...params, limit: 10000 });
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Veriler getirilemedi'
      };
    }
    
    // Mock CSV oluşturma
    const headers = [
      'ID', 'Ad', 'Soyad', 'Kategori', 'Fon Bölgesi', 'Dosya Numarası',
      'Kimlik No', 'Telefon', 'Email', 'Ülke', 'Şehir', 'Durum'
    ];
    
    const csvRows = [
      headers.join(','),
      ...result.data.data.map(b => [
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
        b.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    return {
      success: true,
      data: csvContent,
      message: 'CSV dosyası oluşturuldu'
    };
  } catch (error) {
    return {
      success: false,
      error: 'CSV export işlemi sırasında hata oluştu'
    };
  }
};

// === APPWRITE-ALIGNED MOCK API (NEW) ===

function toAppwriteResponse<T>(data: T | null, total?: number): AppwriteResponse<T> {
  return {
    data,
    error: null,
    total
  };
}

export async function appwriteCreateBeneficiary(data: CreateDocumentData<BeneficiaryDocument>): Promise<AppwriteResponse<BeneficiaryDocument>> {
  await delay();

  const now = new Date().toISOString();
  const $id = generateId();
  const doc: BeneficiaryDocument = {
    $id,
    $createdAt: now,
    $updatedAt: now,
    $permissions: [],
    $collectionId: "beneficiaries",
    $databaseId: "mock-db",
    // Map required core fields with safe fallbacks
    name: (data as any).name || (data as any).firstName || (data as any).lastName || 'Ad Soyad',
    tc_no: (data as any).tc_no || '',
    phone: (data as any).phone || '',
    email: (data as any).email,
    birth_date: (data as any).birth_date,
    gender: (data as any).gender,
    nationality: (data as any).nationality,
    religion: (data as any).religion,
    marital_status: (data as any).marital_status,
    address: (data as any).address || '',
    city: (data as any).city || '',
    district: (data as any).district || '',
    neighborhood: (data as any).neighborhood || '',
    family_size: (data as any).family_size ?? 1,
    children_count: (data as any).children_count,
    orphan_children_count: (data as any).orphan_children_count,
    elderly_count: (data as any).elderly_count,
    disabled_count: (data as any).disabled_count,
    income_level: (data as any).income_level,
    income_source: (data as any).income_source,
    has_debt: !!(data as any).has_debt,
    housing_type: (data as any).housing_type,
    has_vehicle: !!(data as any).has_vehicle,
    health_status: (data as any).health_status,
    has_chronic_illness: (data as any).has_chronic_illness,
    chronic_illness_detail: (data as any).chronic_illness_detail,
    has_disability: (data as any).has_disability,
    disability_detail: (data as any).disability_detail,
    has_health_insurance: (data as any).has_health_insurance,
    regular_medication: (data as any).regular_medication,
    education_level: (data as any).education_level,
    occupation: (data as any).occupation,
    employment_status: (data as any).employment_status,
    aid_type: (data as any).aid_type,
    totalAidAmount: (data as any).totalAidAmount,
    aid_duration: (data as any).aid_duration,
    priority: (data as any).priority,
    reference_name: (data as any).reference_name,
    reference_phone: (data as any).reference_phone,
    reference_relation: (data as any).reference_relation,
    application_source: (data as any).application_source,
    notes: (data as any).notes,
    previous_aid: !!(data as any).previous_aid,
    other_organization_aid: !!(data as any).other_organization_aid,
    emergency: !!(data as any).emergency,
    contact_preference: (data as any).contact_preference,
    status: (data as any).status || 'TASLAK',
    approval_status: (data as any).approval_status || 'pending',
    approved_by: (data as any).approved_by,
    approved_at: (data as any).approved_at
  };

  mockAppwriteBeneficiaries.push(doc);
  return toAppwriteResponse(doc);
}

export async function appwriteUpdateBeneficiary(id: string, data: UpdateDocumentData<BeneficiaryDocument>): Promise<AppwriteResponse<BeneficiaryDocument>> {
  await delay();

  const idx = mockAppwriteBeneficiaries.findIndex(b => b.$id === id);
  if (idx === -1) {
    return { data: null, error: 'İhtiyaç sahibi bulunamadı' };
  }

  const now = new Date().toISOString();
  const prev = mockAppwriteBeneficiaries[idx];
  const updated: BeneficiaryDocument = {
    ...prev,
    ...data,
    $updatedAt: now
  };

  mockAppwriteBeneficiaries[idx] = updated;
  return toAppwriteResponse(updated);
}

export async function appwriteGetBeneficiary(id: string): Promise<AppwriteResponse<BeneficiaryDocument>> {
  await delay();

  const b = mockAppwriteBeneficiaries.find(x => x.$id === id) || null;
  if (!b) {
    return { data: null, error: 'İhtiyaç sahibi bulunamadı' };
  }
  return toAppwriteResponse(b);
}

export async function appwriteGetBeneficiaries(params: QueryParams = {}): Promise<AppwriteResponse<BeneficiaryDocument[]>> {
  await delay();

  const {
    search = '',
    page = 1,
    limit = 20,
    orderBy,
    orderType = 'desc',
    filters = {}
  } = params;

  let list = [...mockAppwriteBeneficiaries];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(b => 
      b.name.toLowerCase().includes(s) ||
      b.tc_no?.includes(search) ||
      b.$id.toLowerCase().includes(s)
    );
  }

  // Simple filters support
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    list = list.filter((b: any) => b[key] === value);
  });

  // Order
  if (orderBy) {
    list.sort((a: any, b: any) => {
      const av = a[orderBy];
      const bv = b[orderBy];
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return orderType === 'desc' ? -res : res;
    });
  }

  const total = list.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const documents = list.slice(start, end);

  return {
    data: documents,
    error: null,
    total
  };
}

export async function appwriteDeleteBeneficiary(id: string): Promise<AppwriteResponse<null>> {
  await delay();

  const before = mockAppwriteBeneficiaries.length;
  mockAppwriteBeneficiaries = mockAppwriteBeneficiaries.filter(b => b.$id !== id);
  const after = mockAppwriteBeneficiaries.length;

  return {
    data: null,
    error: before === after ? 'İhtiyaç sahibi bulunamadı' : null
  };
}
