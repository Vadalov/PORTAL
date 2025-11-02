import { NextRequest, NextResponse } from 'next/server';
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
import { MeetingDocument } from '@/types/collections';

function validateMeetingUpdate(data: Partial<MeetingDocument>): ValidationResult {
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
  let id: string | undefined;
  try {
    id = (await extractParams(params)).id;
    return handleGetById(id, api.meetings.getMeeting, 'Toplantı');
  } catch (error) {
    logger.error('Meeting operation error', error, {
      endpoint: '/api/meetings/[id]',
      method: 'GET',
      meetingId: id || 'unknown',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/meetings/[id]
 */
async function updateMeetingHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    id = (await extractParams(params)).id;
    const body = await request.json();
    return handleUpdate(id, body, validateMeetingUpdate, api.meetings.updateMeeting, 'Toplantı');
  } catch (error) {
    logger.error('Meeting operation error', error, {
      endpoint: '/api/meetings/[id]',
      method: request.method,
      meetingId: id || 'unknown',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/meetings/[id]
 */
async function deleteMeetingHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    id = (await extractParams(params)).id;
    return handleDelete(id, api.meetings.deleteMeeting, 'Toplantı');
  } catch (error) {
    logger.error('Meeting operation error', error, {
      endpoint: '/api/meetings/[id]',
      method: request.method,
      meetingId: id || 'unknown',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = withCsrfProtection(updateMeetingHandler);
export const DELETE = withCsrfProtection(deleteMeetingHandler);
