import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';

function validateMeetingUpdate(data: any): { isValid: boolean; errors: string[] } {
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
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID parametresi gerekli' }, { status: 400 });
    }

    // Use getMeetings and filter by ID since getMeeting doesn't exist
    const response = await api.meetings.getMeetings({ limit: 1000 });
    const meeting = Array.isArray(response.data) ? 
      (response.data as any[]).find(m => m.$id === id) : null;
    
    if (!meeting) {
      return NextResponse.json({ success: false, error: 'Kayıt bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: meeting });
  } catch (error: any) {
    console.error('Get meeting error:', error);
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * PUT /api/meetings/[id]
 */
async function updateMeetingHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateMeetingUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.meetings.updateMeeting(id, body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Güncelleme başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Toplantı başarıyla güncellendi' });
  } catch (error: any) {
    console.error('Update meeting error:', error);
    return NextResponse.json({ success: false, error: 'Güncelleme işlemi başarısız' }, { status: 500 });
  }
}

/**
 * DELETE /api/meetings/[id]
 */
async function deleteMeetingHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await api.meetings.deleteMeeting(id);
    if (response.error) {
      return NextResponse.json({ success: false, error: response.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Toplantı başarıyla silindi' });
  } catch (error: any) {
    console.error('Delete meeting error:', error);
    return NextResponse.json({ success: false, error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}

export const PUT = withCsrfProtection(updateMeetingHandler);
export const DELETE = withCsrfProtection(deleteMeetingHandler);