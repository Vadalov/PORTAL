import { NextRequest } from 'next/server';
import { aidApplicationsApi as api } from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import {
  handleGetById,
  handleUpdate,
  handleDelete,
  extractParams,
  type ValidationResult,
} from '@/lib/api/route-helpers';

function validateApplicationUpdate(data: any): ValidationResult {
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
  return handleGetById(id, api.getAidApplication, 'Başvuru');
}

/**
 * PATCH /api/aid-applications/[id]
 */
async function updateApplicationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  const body = await request.json();
  return handleUpdate(id, body, validateApplicationUpdate, api.updateAidApplication, 'Başvuru');
}

/**
 * DELETE /api/aid-applications/[id]
 */
async function deleteApplicationHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  return handleDelete(id, api.deleteAidApplication, 'Başvuru');
}

export const PATCH = withCsrfProtection(updateApplicationHandler);
export const DELETE = withCsrfProtection(deleteApplicationHandler);