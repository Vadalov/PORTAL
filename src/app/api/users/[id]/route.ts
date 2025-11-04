import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { convexUsers } from '@/lib/convex/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import { InputSanitizer } from '@/lib/security';
import { extractParams } from '@/lib/api/route-helpers';
import { Id } from '@/convex/_generated/dataModel';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';

function validateUserUpdate(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.name && typeof data.name === 'string' && data.name.trim().length < 2) {
    errors.push('Ad Soyad en az 2 karakter olmalıdır');
  }
  if (data.email && typeof data.email === 'string' && !InputSanitizer.validateEmail(data.email)) {
    errors.push('Geçersiz e-posta');
  }
  if (data.role && !['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'].includes(data.role as string)) {
    errors.push('Geçersiz rol');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/users/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  try {
    const user = await convexUsers.get(id as Id<"users">);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user error', error, {
      endpoint: '/api/users/[id]',
      method: 'GET',
      userId: id,
    });
    return NextResponse.json(
      { success: false, error: 'Veri alınamadı' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 */
async function updateUserHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await extractParams(params);
  try {
    const body = await request.json() as Record<string, unknown>;
    
    const validation = validateUserUpdate(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama hatası', details: validation.errors },
        { status: 400 }
      );
    }

    // Handle password update if provided
    let passwordHash: string | undefined;
    if (body.password) {
      const password = body.password as string;
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { success: false, error: passwordValidation.error || 'Geçersiz şifre' },
          { status: 400 }
        );
      }
      passwordHash = await hashPassword(password);
    }

    const userData: Parameters<typeof convexUsers.update>[1] = {
      name: body.name as string | undefined,
      email: body.email as string | undefined,
      role: body.role as string | undefined,
      avatar: body.avatar as string | undefined,
      isActive: body.isActive as boolean | undefined,
      labels: body.labels as string[] | undefined,
      ...(passwordHash && { passwordHash }),
    };

    const updated = await convexUsers.update(id as Id<"users">, userData);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Kullanıcı başarıyla güncellendi',
    });
  } catch (error) {
    logger.error('Update user error', error, {
      endpoint: '/api/users/[id]',
      method: 'PATCH',
      userId: id,
    });
    
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
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
 * DELETE /api/users/[id]
 */
async function deleteUserHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await extractParams(params);
  try {
    await convexUsers.remove(id as Id<"users">);

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
    });
  } catch (error) {
    logger.error('Delete user error', error, {
      endpoint: '/api/users/[id]',
      method: 'DELETE',
      userId: id,
    });
    
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Silme işlemi başarısız' },
      { status: 500 }
    );
  }
}

export const PATCH = withCsrfProtection(updateUserHandler);
export const DELETE = withCsrfProtection(deleteUserHandler);
