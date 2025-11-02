import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import { InputSanitizer } from '@/lib/security';
import logger from '@/lib/logger';
import { UserDocument } from '@/types/collections';

function validateUser(data: Partial<UserDocument>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length < 2) errors.push('Ad Soyad en az 2 karakter olmalıdır');
  if (!data.email || !InputSanitizer.validateEmail(data.email)) errors.push('Geçerli bir e-posta zorunludur');
  if (!data.role || !['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'].includes(data.role)) errors.push('Geçersiz rol');
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/users
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || undefined;
  try {
    const response = await api.users.getUsers({ page, limit, search, orderBy: '$createdAt' });
    return NextResponse.json({ success: true, data: response.data, total: response.total ?? 0 });
  } catch (error: unknown) {
    logger.error('List users error', error, {
      endpoint: '/api/users',
      method: 'GET',
      page,
      limit,
      search
    });
    return NextResponse.json({ success: false, error: 'Veri alınamadı' }, { status: 500 });
  }
}

/**
 * POST /api/users
 */
async function createUserHandler(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
    const validation = validateUser(body as Record<string, unknown>);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: 'Doğrulama hatası', details: validation.errors }, { status: 400 });
    }
    const response = await api.users.createUser({ ...(body as any), isActive: true });
    if (response.error || !response.data) {
      return NextResponse.json({ success: false, error: response.error || 'Oluşturma başarısız' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: response.data, message: 'Kullanıcı oluşturuldu' }, { status: 201 });
  } catch (error: unknown) {
    logger.error('Create user error', error, {
      endpoint: '/api/users',
      method: 'POST',
      email: (body as any)?.email // Safe to log email for debugging
    });
    return NextResponse.json({ success: false, error: 'Oluşturma işlemi başarısız' }, { status: 500 });
  }
}

export const POST = withCsrfProtection(createUserHandler);