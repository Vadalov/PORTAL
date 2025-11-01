import { NextRequest } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import {
  handleGetById,
  handleUpdate,
  handleDelete,
  extractParams,
  type ValidationResult,
} from '@/lib/api/route-helpers';
import logger from '@/lib/logger';

function validateDonationUpdate(data: any): ValidationResult {
  const errors: string[] = [];
  if (data.amount !== undefined && Number(data.amount) <= 0) {
    errors.push('Bağış tutarı pozitif olmalıdır');
  }
  if (data.currency && !['TRY', 'USD', 'EUR'].includes(data.currency)) {
    errors.push('Geçersiz para birimi');
  }
  if (data.donor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.donor_email)) {
    errors.push('Geçersiz e-posta');
  }
  if (data.donor_phone && !/^[0-9\s\-\+\(\)]{10,15}$/.test(data.donor_phone)) {
    errors.push('Geçersiz telefon numarası');
  }
  if (data.status && !['pending', 'completed', 'cancelled'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/donations/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let id: string;
  try {
    id = (await extractParams(params)).id;
    return handleGetById(id, api.donations.getDonation, 'Bağış');
  } catch (error) {
    logger.error('Donation operation error', error, {
      endpoint: '/api/donations/[id]',
      method: 'GET',
      donationId: id || 'unknown'
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

/**
 * PUT /api/donations/[id]
 */
async function updateDonationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let id: string;
  try {
    id = (await extractParams(params)).id;
    const body = await request.json();
    return handleUpdate(id, body, validateDonationUpdate, api.donations.updateDonation, 'Bağış');
  } catch (error) {
    logger.error('Donation operation error', error, {
      endpoint: '/api/donations/[id]',
      method: 'PUT',
      donationId: id || 'unknown'
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

/**
 * DELETE /api/donations/[id]
 */
async function deleteDonationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let id: string;
  try {
    id = (await extractParams(params)).id;
    return handleDelete(id, api.donations.deleteDonation, 'Bağış');
  } catch (error) {
    logger.error('Donation operation error', error, {
      endpoint: '/api/donations/[id]',
      method: 'DELETE',
      donationId: id || 'unknown'
    });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export const PUT = withCsrfProtection(updateDonationHandler);
export const DELETE = withCsrfProtection(deleteDonationHandler);
