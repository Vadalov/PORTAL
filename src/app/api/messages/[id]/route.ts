import { NextRequest } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import {
  handleGetById,
  handleUpdate,
  handleDelete,
  extractParams,
  errorResponse,
  successResponse,
  type ValidationResult,
} from '@/lib/api/route-helpers';

function validateMessageUpdate(data: any): ValidationResult {
  const errors: string[] = [];
  if (data.message_type && !['sms', 'email', 'internal'].includes(data.message_type)) {
    errors.push('Geçersiz mesaj türü');
  }
  if (data.content && data.content.trim().length < 3) {
    errors.push('İçerik en az 3 karakter olmalıdır');
  }
  if (data.status && !['draft', 'sent', 'failed'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/messages/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  return handleGetById(id, api.messages.getMessage, 'Mesaj');
}

/**
 * PUT /api/messages/[id]
 */
async function updateMessageHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  const body = await request.json();
  return handleUpdate(id, body, validateMessageUpdate, api.messages.updateMessage, 'Mesaj');
}

/**
 * DELETE /api/messages/[id]
 */
async function deleteMessageHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  return handleDelete(id, api.messages.deleteMessage, 'Mesaj');
}

/**
 * POST /api/messages/[id]/send
 * Note: Implemented via PUT with status change to keep routes simple
 */
async function sendMessageHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let id: string | undefined;
  try {
    id = (await extractParams(params)).id;
    if (!id) {
      return errorResponse('ID parametresi gerekli', 400);
    }

    const response = await api.messages.sendMessage(id);
    if (response.error || !response.data) {
      return errorResponse(response.error || 'Gönderim başarısız', 400);
    }
    
    return successResponse(response.data, 'Mesaj gönderildi');
  } catch (error: any) {
    logger.error('Send message error', error, {
      endpoint: '/api/messages/[id]',
      method: 'POST',
      messageId: id || 'unknown'
    });
    return errorResponse('Gönderim işlemi başarısız', 500);
  }
}

export const PUT = withCsrfProtection(updateMessageHandler);
export const DELETE = withCsrfProtection(deleteMessageHandler);
export const POST = withCsrfProtection(sendMessageHandler);
