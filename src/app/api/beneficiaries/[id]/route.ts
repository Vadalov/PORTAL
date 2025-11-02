import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import { BeneficiaryFormData } from '@/types/beneficiary';
import { handleGetById, handleUpdate, handleDelete, extractParams, handleApiError } from '@/lib/api/route-helpers';

/**
 * Validate beneficiary data for updates
 */
function validateBeneficiaryUpdate(data: BeneficiaryFormData): { isValid: boolean; errors: string[] } {
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
  const { id } = await extractParams(params);
  
  try {
    return await handleGetById(
      id,
      (id) => api.beneficiaries.getBeneficiary(id),
      'İhtiyaç sahibi'
    );
  } catch (error: unknown) {
    return handleApiError(
      error,
      logger,
      {
        endpoint: '/api/beneficiaries/[id]',
        method: request.method,
        beneficiaryId: id
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
    const body = await request.json();
    
    return await handleUpdate(
      id,
      body,
      validateBeneficiaryUpdate,
      (id, data) => api.beneficiaries.updateBeneficiary(id, data),
      'İhtiyaç sahibi'
    );
  } catch (error: unknown) {
    return handleApiError(
      error,
      logger,
      {
        endpoint: '/api/beneficiaries/[id]',
        method: request.method,
        beneficiaryId: id
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
        beneficiaryId: id
      },
      'Silme işlemi başarısız'
    );
  }
}

// Export handlers with CSRF protection for state-changing operations
export const GET = getBeneficiaryHandler;
export const PUT = withCsrfProtection(updateBeneficiaryHandler);
export const DELETE = withCsrfProtection(deleteBeneficiaryHandler);
