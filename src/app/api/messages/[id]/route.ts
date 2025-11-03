import { NextRequest, NextResponse } from 'next/server';
import { convexMessages } from '@/lib/convex/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import { extractParams } from '@/lib/api/route-helpers';
import { Id } from '@/convex/_generated/dataModel';

function validateMessageUpdate(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.message_type && !['sms', 'email', 'internal'].includes(data.message_type as string)) {
    errors.push('Geçersiz mesaj türü');
  }
  if (data.content && typeof data.content === 'string' && data.content.trim().length < 3) {
    errors.push('İçerik en az 3 karakter olmalıdır');
  }
  if (data.status && !['draft', 'sent', 'failed'].includes(data.status as string)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/messages/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    const message = await convexMessages.get(id as Id<"messages">);
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error('Get message error', error, {
      endpoint: '/api/messages/[id]',
      method: 'GET',
      messageId: id,
    });
    return NextResponse.json(
      { success: false, error: 'Veri alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/messages/[id]
 */
async function updateMessageHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await extractParams(params);
  try {
    const body = await request.json() as Record<string, unknown>;
    
    const validation = validateMessageUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    const messageData: Parameters<typeof convexMessages.update>[1] = {
      subject: body.subject as string | undefined,
      content: body.content as string | undefined,
      status: body.status as 'draft' | 'sent' | 'failed' | undefined,
      sent_at: body.sent_at as string | undefined,
    };

    const updated = await convexMessages.update(id as Id<"messages">, messageData);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Mesaj başarıyla güncellendi',
    });
  } catch (error) {
    logger.error('Update message error', error, {
      endpoint: '/api/messages/[id]',
      method: 'PUT',
      messageId: id,
    });
    
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Güncelleme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/[id]
 */
async function deleteMessageHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await extractParams(params);
  try {
    await convexMessages.remove(id as Id<"messages">);

    return NextResponse.json({
      success: true,
      message: 'Mesaj başarıyla silindi',
    });
  } catch (error) {
    logger.error('Delete message error', error, {
      endpoint: '/api/messages/[id]',
      method: 'DELETE',
      messageId: id,
    });
    
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Mesaj bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Silme işlemi başarısız' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/[id]/send
 * Note: Implemented via PUT with status change to keep routes simple
 */
async function sendMessageHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await extractParams(params);
  try {
    // Update message status to 'sent'
    const updated = await convexMessages.update(id as Id<"messages">, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Mesaj gönderildi',
    });
  } catch (error: unknown) {
    logger.error('Send message error', error, {
      endpoint: '/api/messages/[id]',
      method: 'POST',
      messageId: id,
    });
    return NextResponse.json(
      { success: false, error: 'Gönderim işlemi başarısız' },
      { status: 500 }
    );
  }
}

export const PUT = withCsrfProtection(updateMessageHandler);
export const DELETE = withCsrfProtection(deleteMessageHandler);
export const POST = withCsrfProtection(sendMessageHandler);
