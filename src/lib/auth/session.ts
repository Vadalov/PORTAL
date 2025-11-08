import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { Id } from '@/convex/_generated/dataModel';
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { ROLE_PERMISSIONS, UserRole, type Permission } from '@/types/auth';

export interface AuthSession {
  sessionId: string;
  userId: string;
  expire?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  labels?: string[];
}

/**
 * Parse serialized session cookie safely.
 */
export function parseAuthSession(cookieValue?: string): AuthSession | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookieValue) as AuthSession;
    if (!parsed?.sessionId || !parsed?.userId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Determine whether the provided session is expired.
 */
export function isSessionExpired(session: AuthSession | null): boolean {
  if (!session?.expire) {
    return false;
  }

  const expireDate = new Date(session.expire);
  return Number.isNaN(expireDate.getTime()) ? false : expireDate.getTime() < Date.now();
}

/**
 * Extract auth-session cookie from a NextRequest.
 */
export function getAuthSessionFromRequest(request: NextRequest): AuthSession | null {
  const cookieValue = request.cookies.get('auth-session')?.value;
  return parseAuthSession(cookieValue);
}

/**
 * Extract auth-session cookie using Next's cookies() helper.
 * Meant for API routes where NextRequest is not directly available.
 */
export async function getAuthSessionFromCookies(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get('auth-session')?.value;
  return parseAuthSession(cookieValue);
}

/**
 * Fetch the authenticated Convex user associated with the session.
 */
export async function getUserFromSession(session: AuthSession | null): Promise<SessionUser | null> {
  if (!session || isSessionExpired(session)) {
    return null;
  }

  // Handle development mock sessions
  if (session.userId.startsWith('mock-')) {
    const mockUserMap: Record<string, { email: string; name: string; role: UserRole }> = {
      'mock-admin-1': {
        email: 'admin@test.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      },
      'mock-admin-2': {
        email: 'admin@portal.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      },
      'mock-manager-1': {
        email: 'manager@test.com',
        name: 'Manager User',
        role: UserRole.MANAGER,
      },
      'mock-member-1': {
        email: 'member@test.com',
        name: 'Member User',
        role: UserRole.MEMBER,
      },
      'mock-viewer-1': {
        email: 'viewer@test.com',
        name: 'Viewer User',
        role: UserRole.VIEWER,
      },
    };

    const mockUser = mockUserMap[session.userId];
    if (!mockUser) {
      return null;
    }

    const role = mockUser.role as UserRole;
    return {
      id: session.userId,
      email: mockUser.email,
      name: mockUser.name,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
      isActive: true,
      labels: [],
    };
  }

  try {
    const user = await convexHttp.query(api.users.get, {
      id: session.userId as Id<'users'>,
    });

    if (!user || !user.isActive) {
      return null;
    }

    const role = (user.role || 'MEMBER') as UserRole;

    return {
      id: user._id,
      email: user.email || '',
      name: user.name || '',
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
      isActive: user.isActive,
      labels: user.labels || [],
    };
  } catch {
    return null;
  }
}

/**
 * Convenience helper to obtain session & user tuple for a request.
 */
export async function getRequestAuthContext(request: NextRequest): Promise<{
  session: AuthSession | null;
  user: SessionUser | null;
}> {
  const session = getAuthSessionFromRequest(request);
  const user = await getUserFromSession(session);
  return { session, user };
}
