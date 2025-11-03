import { NextRequest, NextResponse } from 'next/server';
import { convexBeneficiaries } from '@/lib/convex/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import { BeneficiaryFormData } from '@/types/beneficiary';
import { extractParams } from '@/lib/api/route-helpers';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Validate beneficiary data for updates
 */
function validateBeneficiaryUpdate(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const beneficiaryData = data as Record<string, unknown>;

  // Optional fields validation (only if provided)
  if (
    beneficiaryData.name &&
    typeof beneficiaryData.name === 'string' &&
    beneficiaryData.name.trim().length < 2
  ) {
    errors.push('Ad Soyad en az 2 karakter olmalıdır');
  }

  if (
    beneficiaryData.tc_no &&
    typeof beneficiaryData.tc_no === 'string' &&
    !/^\d{11}$/.test(beneficiaryData.tc_no)
  ) {
    errors.push('TC Kimlik No 11 haneli olmalıdır');
  }

  if (
    beneficiaryData.phone &&
    typeof beneficiaryData.phone === 'string' &&
    !/^[0-9\s\-\+\(\)]{10,15}$/.test(beneficiaryData.phone)
  ) {
    errors.push('Geçerli bir telefon numarası giriniz');
  }

  if (
    beneficiaryData.address &&
    typeof beneficiaryData.address === 'string' &&
    beneficiaryData.address.trim().length < 10
  ) {
    errors.push('Adres en az 10 karakter olmalıdır');
  }

  if (
    beneficiaryData.email &&
    typeof beneficiaryData.email === 'string' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(beneficiaryData.email)
  ) {
    errors.push('Geçerli bir email adresi giriniz');
  }

  if (
    beneficiaryData.status &&
    typeof beneficiaryData.status === 'string' &&
    !['TASLAK', 'AKTIF', 'PASIF', 'SILINDI'].includes(beneficiaryData.status)
  ) {
    errors.push('Geçersiz durum değeri');
  }

  return {
    isValid: errors.length === 0,
    errors,
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
  const { id } = await extractParams(params);

  try {
    const beneficiary = await convexBeneficiaries.get(id as Id<"beneficiaries">);
    
    if (!beneficiary) {
      return NextResponse.json(
        { success: false, error: 'İhtiyaç sahibi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: beneficiary,
    });
  } catch (error: unknown) {
    logger.error('Get beneficiary error', error, {
      endpoint: '/api/beneficiaries/[id]',
      method: request.method,
      beneficiaryId: id,
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
  const { id } = await extractParams(params);

  try {
    const body = (await request.json()) as Partial<BeneficiaryFormData>;

    const validation = validateBeneficiaryUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const updated = await convexBeneficiaries.update(id as Id<"beneficiaries">, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'İhtiyaç sahibi başarıyla güncellendi',
    });
  } catch (error: unknown) {
    logger.error('Update beneficiary error', error, {
      endpoint: '/api/beneficiaries/[id]',
      method: request.method,
      beneficiaryId: id,
    });
    
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'İhtiyaç sahibi bulunamadı' },
        { status: 404 }
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
  const { id } = await extractParams(params);

  try {
    await convexBeneficiaries.remove(id as Id<"beneficiaries">);

    return NextResponse.json({
      success: true,
      message: 'İhtiyaç sahibi başarıyla silindi',
    });
  } catch (error: unknown) {
    logger.error('Delete beneficiary error', error, {
      endpoint: '/api/beneficiaries/[id]',
      method: request.method,
      beneficiaryId: id,
    });
    
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'İhtiyaç sahibi bulunamadı' },
        { status: 404 }
      );
    }

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
