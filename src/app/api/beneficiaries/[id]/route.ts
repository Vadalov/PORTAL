import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';

/**
 * Validate beneficiary data for updates
 */
function validateBeneficiaryUpdate(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Optional fields validation (only if provided)
  if (data.name && data.name.trim().length < 2) {
    errors.push('Ad Soyad en az 2 karakter olmalıdır');
  }

  if (data.tc_no && !/^\d{11}$/.test(data.tc_no)) {
    errors.push('TC Kimlik No 11 haneli olmalıdır');
  }

  if (data.phone && !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.phone)) {
    errors.push('Geçerli bir telefon numarası giriniz');
  }

  if (data.address && data.address.trim().length < 10) {
    errors.push('Adres en az 10 karakter olmalıdır');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Geçerli bir email adresi giriniz');
  }

  if (data.status && !['TASLAK', 'AKTIF', 'PASIF', 'SILINDI'].includes(data.status)) {
    errors.push('Geçersiz durum değeri');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * GET /api/beneficiaries/[id]
 * Get beneficiary by ID
 */
async function getBeneficiaryHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parametresi gerekli' },
        { status: 400 }
      );
    }

    const response = await api.beneficiaries.getBeneficiary(id);

    if (response.error) {
      return NextResponse.json(
        { success: false, error: 'Kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Kayıt başarıyla getirildi',
    });
  } catch (error: any) {
    logger.error('Get beneficiary error', error, {
      endpoint: '/api/beneficiaries/[id]',
      method: request.method,
      beneficiaryId: id
    });
    
    return NextResponse.json(
      { success: false, error: 'Veri alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/beneficiaries/[id]
 * Update beneficiary
 */
async function updateBeneficiaryHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parametresi gerekli' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Veri bulunamadı' },
        { status: 400 }
      );
    }

    // Validate update data
    const validation = validateBeneficiaryUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const response = await api.beneficiaries.updateBeneficiary(id, body);

    if (response.error) {
      return NextResponse.json(
        { success: false, error: 'Güncelleme başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'İhtiyaç sahibi başarıyla güncellendi',
    });
  } catch (error: any) {
    logger.error('Update beneficiary error', error, {
      endpoint: '/api/beneficiaries/[id]',
      method: request.method,
      beneficiaryId: id
    });
    
    // Handle duplicate TC number
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      return NextResponse.json(
        { success: false, error: 'Bu TC Kimlik No zaten kayıtlı' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Güncelleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beneficiaries/[id]
 * Delete beneficiary
 */
async function deleteBeneficiaryHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parametresi gerekli' },
        { status: 400 }
      );
    }

    const response = await api.beneficiaries.deleteBeneficiary(id);

    if (response.error) {
      return NextResponse.json(
        { success: false, error: 'Silme işlemi başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'İhtiyaç sahibi başarıyla silindi',
    });
  } catch (error: any) {
    logger.error('Delete beneficiary error', error, {
      endpoint: '/api/beneficiaries/[id]',
      method: request.method,
      beneficiaryId: id
    });
    
    return NextResponse.json(
      { success: false, error: 'Silme işlemi başarısız' },
      { status: 500 }
    );
  }
}

// Export handlers with CSRF protection for state-changing operations
export const GET = getBeneficiaryHandler;
export const PUT = withCsrfProtection(updateBeneficiaryHandler);
export const DELETE = withCsrfProtection(deleteBeneficiaryHandler);
