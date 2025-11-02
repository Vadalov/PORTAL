import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import { MessageDocument } from '@/types/collections';

function validateMessage(data: Partial<MessageDocument>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.message_type || !['sms', 'email', 'internal'].includes(data.message_type)) {
    errors.push('Geçersiz mesaj türü');
  }
  if (!data.sender || typeof data.sender !== 'string') {
    errors.push('Gönderen zorunludur');
  }
  if (!Array.isArray(data.recipients) || data.recipients.length === 0) {
    errors.push('En az bir alıcı seçilmelidir');
  }
  if (!data.content || data.content.trim().length < 3) {
    errors.push('İçerik en az 3 karakter olmalıdır');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/messages
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;

  const filters: Record<string, string | number | boolean | undefined> = {};
  const message_type = searchParams.get('message_type');
  const status = searchParams.get('status');
  const sender = searchParams.get('sender');
  const is_bulk = searchParams.get('is_bulk');

  if (message_type) filters.message_type = message_type;
  if (status) filters.status = status;
  if (sender) filters.sender = sender;
  if (is_bulk !== null) filters.is_bulk = is_bulk === 'true';

  try {
    const response = await api.messages.getMessages({ page, limit, search, filters });

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.total ?? 0,
    });
  } catch (error: unknown) {
    logger.error('List messages error', error, {
      endpoint: '/api/messages',
      method: 'GET',
      page,
      limit,
      filters,
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/messages
 */
async function createMessageHandler(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
    const validation = validateMessage(body as Record<string, unknown>);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const response = await api.messages.createMessage(body as Partial<MessageDocument>);
    if (response.error || !response.data) {
      return NextResponse.json(
        { success: false, error: response.error || 'Oluşturma başarısız' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: response.data, message: 'Mesaj taslağı oluşturuldu' },
      { status: 201 }
    );
  } catch (error: unknown) {
    logger.error('Create message error', error, {
      endpoint: '/api/messages',
      method: 'POST',
      messageType: (body as Record<string, unknown>)?.message_type,
      recipientCount: Array.isArray((body as Record<string, unknown>)?.recipients)
        ? ((body as Record<string, unknown>)?.recipients as unknown[]).length
        : 0,
    });
    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

export const POST = withCsrfProtection(createMessageHandler);
