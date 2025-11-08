import { NextRequest, NextResponse } from 'next/server';
import { convexMessages, normalizeQueryParams } from '@/lib/convex/api';
import logger from '@/lib/logger';
import { Id } from '@/convex/_generated/dataModel';

function validateMessage(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
  normalizedData?: Record<string, unknown>;
} {
  const errors: string[] = [];
  if (!data.message_type || !['sms', 'email', 'internal'].includes(data.message_type as string)) {
    errors.push('Geçersiz mesaj türü');
  }
  if (!data.sender) {
    errors.push('Gönderen zorunludur');
  }
  if (!Array.isArray(data.recipients) || data.recipients.length === 0) {
    errors.push('En az bir alıcı seçilmelidir');
  }
  if (!data.content || (typeof data.content === 'string' && data.content.trim().length < 3)) {
    errors.push('İçerik en az 3 karakter olmalıdır');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const normalizedData = {
    ...data,
    status: (data.status as string) || 'draft',
  };

  return { isValid: true, errors: [], normalizedData };
}

/**
 * GET /api/messages
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = normalizeQueryParams(searchParams);

  try {
    const response = await convexMessages.list({
      ...params,
      sender: searchParams.get('sender') as Id<"users"> | undefined,
    });

    return NextResponse.json({
      success: true,
      data: response.documents || [],
      total: response.total || 0,
    });
  } catch (_error: unknown) {
    logger.error('List messages error', _error, {
      endpoint: '/api/messages',
      method: 'GET',
      params,
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
    if (!validation.isValid || !validation.normalizedData) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const messageData = {
      message_type: validation.normalizedData.message_type as 'sms' | 'email' | 'internal',
      sender: validation.normalizedData.sender as Id<"users">,
      recipients: validation.normalizedData.recipients as Id<"users">[],
      subject: validation.normalizedData.subject as string | undefined,
      content: validation.normalizedData.content as string,
      status: (validation.normalizedData.status || 'draft') as 'draft' | 'sent' | 'failed',
      is_bulk: (validation.normalizedData.is_bulk as boolean) || false,
      template_id: validation.normalizedData.template_id as string | undefined,
    };

    const response = await convexMessages.create(messageData);

    return NextResponse.json(
      { success: true, data: response, message: 'Mesaj taslağı oluşturuldu' },
      { status: 201 }
    );
  } catch (_error: unknown) {
    logger.error('Create message error', _error, {
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

export const POST = createMessageHandler;

