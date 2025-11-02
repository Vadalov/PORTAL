import { NextRequest } from 'next/server';
import { aidApplicationsApi as api } from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import {
  handleGetById,
  handleUpdate,
  handleDelete,
  extractParams,
  type ValidationResult,
} from '@/lib/api/route-helpers';
import { AidApplicationDocument } from '@/types/collections';

function validateApplicationUpdate(data: Partial<AidApplicationDocument>): ValidationResult {
  const errors: string[] = [];
  if (data.stage && !['draft', 'under_review', 'approved', 'ongoing', 'completed'].includes(data.stage)) errors.push('Geçersiz aşama');
  if (data.status && !['open', 'closed'].includes(data.status)) errors.push('Geçersiz durum');
  return { isValid: errors.length === 0, errors };
}
  
/**
 * GET /api/aid-applications/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    return handleGetById(id, api.getAidApplication, 'Başvuru');
  } catch (error) {
    logger.error('Aid application operation error', error, {
      endpoint: '/api/aid-applications/[id]',
      method: 'GET',
      applicationId: id
    });
    throw error;
  }
}
  
/**
 * PATCH /api/aid-applications/[id]
 */
async function updateApplicationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    const body = await request.json();
    return handleUpdate(id, body, validateApplicationUpdate, api.updateAidApplication, 'Başvuru');
  } catch (error) {
    logger.error('Aid application operation error', error, {
      endpoint: '/api/aid-applications/[id]',
      method: 'PATCH',
      applicationId: id
    });
    throw error;
  }
}
  
/**
 * DELETE /api/aid-applications/[id]
 */
async function deleteApplicationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    return handleDelete(id, api.deleteAidApplication, 'Başvuru');
  } catch (error) {
    logger.error('Aid application operation error', error, {
      endpoint: '/api/aid-applications/[id]',
      method: 'DELETE',
      applicationId: id
    });
    throw error;
  }
}
  
export const PATCH = withCsrfProtection(updateApplicationHandler);
export const DELETE = withCsrfProtection(deleteApplicationHandler);
