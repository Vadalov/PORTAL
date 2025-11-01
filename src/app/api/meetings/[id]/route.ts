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

function validateMeetingUpdate(data: any): ValidationResult {
  const errors: string[] = [];
  if (data.title && data.title.trim().length < 3) {
    errors.push('Toplantı başlığı en az 3 karakter olmalıdır');
  }
  if (data.status && !['scheduled', 'ongoing', 'completed', 'cancelled'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/meetings/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  return handleGetById(id, api.meetings.getMeeting, 'Toplantı');
}

/**
 * PUT /api/meetings/[id]
 */
async function updateMeetingHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  const body = await request.json();
  return handleUpdate(id, body, validateMeetingUpdate, api.meetings.updateMeeting, 'Toplantı');
}

/**
 * DELETE /api/meetings/[id]
 */
async function deleteMeetingHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  return handleDelete(id, api.meetings.deleteMeeting, 'Toplantı');
}

export const PUT = withCsrfProtection(updateMeetingHandler);
export const DELETE = withCsrfProtection(deleteMeetingHandler);