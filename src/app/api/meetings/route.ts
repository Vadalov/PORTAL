import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import { MeetingDocument } from '@/types/collections';

function validateMeeting(data: Partial<MeetingDocument>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Toplantı başlığı en az 3 karakter olmalıdır');
  }
  if (!data.meeting_date) {
    errors.push('Toplantı tarihi zorunludur');
  }
  if (data.status && !['scheduled', 'ongoing', 'completed', 'cancelled'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/meetings
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;

  const filters: Record<string, string | number | boolean | undefined> = {};
  const status = searchParams.get('status');
  const meeting_type = searchParams.get('meeting_type');
  const organizer = searchParams.get('organizer');
  const date_from = searchParams.get('date_from');
  const date_to = searchParams.get('date_to');

  if (status) filters.status = status;
  if (meeting_type) filters.meeting_type = meeting_type;
  if (organizer) filters.organizer = organizer;
  if (date_from) filters.date_from = date_from;
  if (date_to) filters.date_to = date_to;

  try {
    const response = await api.meetings.getMeetings({ page, limit, search, filters });

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.total ?? 0,
    });
  } catch (error: unknown) {
    logger.error('List meetings error', error, {
      endpoint: '/api/meetings',
      method: 'GET',
      page,
      limit,
      filters
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/meetings
 */
async function createMeetingHandler(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
    const validation = validateMeeting(body as Record<string, unknown>);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.meetings.createMeeting(body as any);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Oluşturma başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Toplantı başarıyla oluşturuldu' }, { status: 201 });
  } catch (error: unknown) {
    logger.error('Create meeting error', error, {
      endpoint: '/api/meetings',
      method: 'POST',
      title: (body as any)?.title,
      meetingDate: (body as any)?.meeting_date
    });
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createMeetingHandler);