import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import logger from '@/lib/logger';
import { TaskDocument } from '@/types/collections';

function validateTask(data: Partial<TaskDocument>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length < 3) {
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
 * GET /api/tasks
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;

  const filters: Record<string, string> = {};
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const assigned_to = searchParams.get('assigned_to');

  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (assigned_to) filters.assigned_to = assigned_to;

  try {
    const response = await api.tasks.getTasks({ page, limit, search, filters });

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.total ?? 0,
    });
  } catch (error: unknown) {
    logger.error('List tasks error', error, {
      endpoint: '/api/tasks',
      method: 'GET',
      page,
      limit,
      filters
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 */
async function createTaskHandler(request: NextRequest) {
  let body: any = null;
  try {
    body = await request.json();
    const validation = validateTask(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }

    const response = await api.tasks.createTask(body);
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Oluşturma başarısız' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data, message: 'Görev başarıyla oluşturuldu' }, { status: 201 });
  } catch (error: unknown) {
    logger.error('Create task error', error, {
      endpoint: '/api/tasks',
      method: 'POST',
      title: body?.title
    });
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createTaskHandler);
