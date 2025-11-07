import { NextRequest, NextResponse } from 'next/server';
import { convexUsers } from '@/lib/convex/api';
import { InputSanitizer } from '@/lib/security';
import logger from '@/lib/logger';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';

function validateUser(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
  normalizedData?: Record<string, unknown>;
} {
  const errors: string[] = [];
  if (!data.name || (typeof data.name === 'string' && data.name.trim().length < 2)) {
    errors.push('Ad Soyad en az 2 karakter olmalıdır');
  }
  if (!data.email || typeof data.email !== 'string' || !InputSanitizer.validateEmail(data.email)) {
    errors.push('Geçerli bir e-posta zorunludur');
  }
  if (!data.role || !['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'].includes(data.role as string)) {
    errors.push('Geçersiz rol');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const normalizedData = {
    name: data.name as string,
    email: data.email as string,
    role: data.role as string,
    avatar: data.avatar as string | undefined,
    isActive: (data.isActive as boolean) ?? true,
    labels: (data.labels as string[]) ?? [],
  };

  return { isValid: true, errors: [], normalizedData };
}

/**
 * GET /api/users
 */
export async function GET(_request: NextRequest) {
  try {
    const response = await convexUsers.list();

    return NextResponse.json({
      success: true,
      data: response || [],
      total: Array.isArray(response) ? response.length : 0,
    });
  } catch (_error: unknown) {
    logger.error('List users error', _error, {
      endpoint: '/api/users',
      method: 'GET',
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
    if (!validation.isValid || !validation.normalizedData) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    // Handle password if provided
    let passwordHash: string | undefined;
    const userBody = body as Record<string, unknown>;
    if (userBody.password) {
      const password = userBody.password as string;
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { success: false, error: passwordValidation.error || 'Geçersiz şifre' },
          { status: 400 }
        );
      }
      passwordHash = await hashPassword(password);
    }

    const userData = {
      name: validation.normalizedData.name as string,
      email: validation.normalizedData.email as string,
      role: validation.normalizedData.role as string,
      avatar: validation.normalizedData.avatar as string | undefined,
      isActive: (validation.normalizedData.isActive as boolean) ?? true,
      labels: (validation.normalizedData.labels as string[]) || [],
      ...(passwordHash && { passwordHash }),
    };

    const response = await convexUsers.create(userData);

    return NextResponse.json(
      { success: true, data: response, message: 'Kullanıcı oluşturuldu' },
      { status: 201 }
    );
  } catch (_error: unknown) {
    logger.error('Create user error', _error, {
      endpoint: '/api/users',
      method: 'POST',
      email: (body as Record<string, unknown>)?.email,
    });
    
    const errorMessage = _error instanceof Error ? _error.message : '';
    if (errorMessage?.includes('already exists') || errorMessage?.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'Bu e-posta zaten kayıtlı' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Oluşturma işlemi başarısız' },
      { status: 500 }
    );
  }
}

