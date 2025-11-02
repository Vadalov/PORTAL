import { NextRequest } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import { BeneficiaryFormData } from '@/types/beneficiary';
import {
  handleGetById,
  handleUpdate,
  handleDelete,
  extractParams,
  handleApiError,
} from '@/lib/api/route-helpers';

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
    return await handleGetById(id, (id) => api.beneficiaries.getBeneficiary(id), 'İhtiyaç sahibi');
  } catch (error: unknown) {
    return handleApiError(
      error,
      logger,
      {
        endpoint: '/api/beneficiaries/[id]',
        method: request.method,
        beneficiaryId: id,
      },
      'Veri alınamadı'
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

    return await handleUpdate(
      id,
      body,
      validateBeneficiaryUpdate,
      (id, data) => api.beneficiaries.updateBeneficiary(id, data as Partial<BeneficiaryFormData>),
      'İhtiyaç sahibi'
    );
  } catch (error: unknown) {
    return handleApiError(
      error,
      logger,
      {
        endpoint: '/api/beneficiaries/[id]',
        method: request.method,
        beneficiaryId: id,
      },
      'Güncelleme işlemi başarısız'
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
    return await handleDelete(
      id,
      (id) => api.beneficiaries.deleteBeneficiary(id),
      'İhtiyaç sahibi'
    );
  } catch (error: unknown) {
    return handleApiError(
      error,
      logger,
      {
        endpoint: '/api/beneficiaries/[id]',
        method: request.method,
        beneficiaryId: id,
      },
      'Silme işlemi başarısız'
    );
  }
}

// Export handlers with CSRF protection for state-changing operations
export const GET = getBeneficiaryHandler;
export const PUT = withCsrfProtection(updateBeneficiaryHandler);
export const DELETE = withCsrfProtection(deleteBeneficiaryHandler);
