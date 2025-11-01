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
import logger from '@/lib/logger';

function validateTaskUpdate(data: any): ValidationResult {
  const errors: string[] = [];
  if (data.title && data.title.trim().length < 3) {
    errors.push('Görev başlığı en az 3 karakter olmalıdır');
  }
  if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Geçersiz öncelik değeri');
  }
  if (data.status && !['pending', 'in_progress', 'completed', 'cancelled'].includes(data.status)) {
    errors.push('Geçersiz durum');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/tasks/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    return handleGetById(id, api.tasks.getTask, 'Görev');
  } catch (error) {
    logger.error('Task operation error', error, {
      endpoint: '/api/tasks/[id]',
      method: request.method,
      taskId: id
    });
    throw error;
  }
}

/**
 * PUT /api/tasks/[id]
 */
async function updateTaskHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    const body = await request.json();
    return handleUpdate(id, body, validateTaskUpdate, api.tasks.updateTask, 'Görev');
  } catch (error) {
    logger.error('Task operation error', error, {
      endpoint: '/api/tasks/[id]',
      method: request.method,
      taskId: id
    });
    throw error;
  }
}

/**
 * DELETE /api/tasks/[id]
 */
async function deleteTaskHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    return handleDelete(id, api.tasks.deleteTask, 'Görev');
  } catch (error) {
    logger.error('Task operation error', error, {
      endpoint: '/api/tasks/[id]',
      method: request.method,
      taskId: id
    });
    throw error;
  }
}

export const PUT = withCsrfProtection(updateTaskHandler);
export const DELETE = withCsrfProtection(deleteTaskHandler);
