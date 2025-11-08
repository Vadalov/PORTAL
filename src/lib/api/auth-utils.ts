import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import {
  getAuthSessionFromCookies,
  getUserFromSession,
  type AuthSession,
  type SessionUser,
} from '@/lib/auth/session';
import { getCsrfTokenHeader, validateCsrfToken } from '@/lib/csrf';
import { Permission, UserRole } from '@/types/auth';

export class ApiAuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 401, code = 'UNAUTHORIZED') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface RequireUserOptions {
  requiredPermission?: Permission;
  requiredAnyPermission?: Permission[];
  requiredRole?: UserRole;
}

const hasPermission = (user: SessionUser, permission?: Permission): boolean => {
  if (!permission) {
    return true;
  }

  return user.permissions.includes(permission) || user.role === UserRole.SUPER_ADMIN;
};

const hasAnyPermission = (user: SessionUser, permissions?: Permission[]): boolean => {
  if (!permissions || permissions.length === 0) {
    return true;
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  return permissions.some((perm) => user.permissions.includes(perm));
};

const hasRole = (user: SessionUser, role?: UserRole): boolean => {
  if (!role) {
    return true;
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  return user.role === role;
};

export async function verifyCsrfToken(request: NextRequest): Promise<void> {
  const headerName = getCsrfTokenHeader();
  const headerToken = request.headers.get(headerName);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('csrf-token')?.value || '';

  if (!headerToken || !validateCsrfToken(headerToken, cookieToken)) {
    throw new ApiAuthError('CSRF doğrulaması başarısız', 403, 'INVALID_CSRF');
  }
}

export async function requireAuthenticatedUser(
  options: RequireUserOptions = {}
): Promise<{ session: AuthSession; user: SessionUser }> {
  const session = await getAuthSessionFromCookies();
  if (!session) {
    throw new ApiAuthError('Oturum bulunamadı', 401, 'UNAUTHORIZED');
  }

  const user = await getUserFromSession(session);
  if (!user) {
    throw new ApiAuthError('Geçersiz veya süresi dolmuş oturum', 401, 'UNAUTHORIZED');
  }

  if (!hasRole(user, options.requiredRole)) {
    throw new ApiAuthError('Yetkisiz erişim', 403, 'FORBIDDEN');
  }

  if (!hasPermission(user, options.requiredPermission)) {
    throw new ApiAuthError('İzin bulunamadı', 403, 'FORBIDDEN');
  }

  if (!hasAnyPermission(user, options.requiredAnyPermission)) {
    throw new ApiAuthError('İzin bulunamadı', 403, 'FORBIDDEN');
  }

  return { session, user };
}

export function buildErrorResponse(error: unknown) {
  if (error instanceof ApiAuthError) {
    return {
      status: error.status,
      body: {
        success: false,
        error: error.message,
        code: error.code,
      },
    };
  }

  return null;
}
