import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/types/auth';
import logger from '@/lib/logger';
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/auth',
  '/_next',
  '/favicon.ico',
  '/api/csrf', // CSRF token endpoint is public
  '/api/auth/login', // Login endpoint is public (but requires CSRF token)
  '/api/auth/logout', // Logout endpoint is public
];

// Auth routes that should redirect to dashboard if already authenticated
 
const _authRoutes = ['/login', '/auth'];

// API routes that require authentication (protected endpoints)
const protectedApiRoutes = [
  '/api/users',
  '/api/beneficiaries',
  '/api/donations',
  '/api/tasks',
  '/api/meetings',
  '/api/messages',
  '/api/aid-applications',
  '/api/storage',
];

// Route definitions for role-based access control
interface RouteRule {
  path: string;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  requiredAnyPermission?: Permission[];
}

// Protected routes with their permission requirements
const protectedRoutes: RouteRule[] = [
  // Dashboard routes
  { path: '/genel', requiredPermission: Permission.DASHBOARD_READ },
  { path: '/financial-dashboard', requiredPermission: Permission.FINANCIAL_READ },

  // User management
  { path: '/kullanici', requiredPermission: Permission.USERS_READ },

  // Beneficiaries
  { path: '/yardim', requiredPermission: Permission.BENEFICIARIES_READ },
  { path: '/yardim/basvurular', requiredPermission: Permission.AID_REQUESTS_READ },
  { path: '/yardim/liste', requiredPermission: Permission.BENEFICIARIES_READ },
  { path: '/yardim/nakdi-vezne', requiredPermission: Permission.BENEFICIARIES_CREATE },
  { path: '/yardim/ihtiyac-sahipleri', requiredPermission: Permission.BENEFICIARIES_READ },

  // Donations
  { path: '/bagis', requiredPermission: Permission.DONATIONS_READ },
  { path: '/bagis/liste', requiredPermission: Permission.DONATIONS_READ },
  { path: '/bagis/kumbara', requiredPermission: Permission.DONATIONS_CREATE },
  { path: '/bagis/raporlar', requiredPermission: Permission.REPORTS_READ },

  // Scholarships
  { path: '/burs', requiredPermission: Permission.SCHOLARSHIPS_READ },
  { path: '/burs/basvurular', requiredPermission: Permission.SCHOLARSHIPS_READ },
  { path: '/burs/ogrenciler', requiredPermission: Permission.SCHOLARSHIPS_READ },
  { path: '/burs/yetim', requiredPermission: Permission.SCHOLARSHIPS_READ },

  // Tasks & Meetings
  { path: '/is', requiredPermission: Permission.DASHBOARD_READ },
  { path: '/is/gorevler', requiredPermission: Permission.DASHBOARD_READ },
  { path: '/is/toplantilar', requiredPermission: Permission.DASHBOARD_READ },

  // Messaging
  { path: '/mesaj', requiredPermission: Permission.MESSAGING_READ },
  { path: '/mesaj/kurum-ici', requiredPermission: Permission.MESSAGING_READ },
  { path: '/mesaj/toplu', requiredPermission: Permission.MESSAGING_BULK },

  // Partners
  { path: '/partner', requiredPermission: Permission.PARTNERS_READ },
  { path: '/partner/liste', requiredPermission: Permission.PARTNERS_READ },

  // Financial
  { path: '/fon', requiredPermission: Permission.FINANCIAL_READ },
  { path: '/fon/gelir-gider', requiredPermission: Permission.FINANCIAL_READ },
  { path: '/fon/raporlar', requiredPermission: Permission.REPORTS_READ },

  // Settings (require admin role)
  { path: '/settings', requiredRole: UserRole.ADMIN },
  { path: '/ayarlar', requiredRole: UserRole.ADMIN },
  { path: '/ayarlar/parametreler', requiredRole: UserRole.ADMIN },
];

/**
 * Get user session from auth cookie
 */
async function getAuthSession(
  request: NextRequest
): Promise<{ userId: string; sessionId: string } | null> {
  const sessionCookie = request.cookies.get('auth-session');
  try {
    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);

    if (!sessionData.userId || !sessionData.sessionId) {
      return null;
    }

    // Validate session by checking expiration
    if (sessionData.expire) {
      const expireDate = new Date(sessionData.expire);
      if (expireDate < new Date()) {
        logger.warn('Session expired', {
          context: 'middleware',
          function: 'getAuthSession',
        });
        return null;
      }
    }

    return {
      userId: sessionData.userId,
      sessionId: sessionData.sessionId,
    };
  } catch (error) {
    logger.error('Session validation error', error, {
      context: 'middleware',
      function: 'getAuthSession',
      hasCookie: !!sessionCookie,
    });
    return null;
  }
}

/**
 * Get user data from Convex using session
 */
async function getUserFromSession(
  session: { userId: string; sessionId: string } | null
): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
} | null> {
  try {
    if (!session || !session.userId) {
      return null;
    }

    // Handle mock sessions (development)
    if (session.userId.startsWith('mock-')) {
      // Map mock user IDs to mock users
      const mockUserMap: { [key: string]: { email: string; name: string; role: string } } = {
        'mock-admin-1': { email: 'admin@test.com', name: 'Admin User', role: 'ADMIN' },
        'mock-admin-2': { email: 'admin@portal.com', name: 'Admin User', role: 'ADMIN' },
        'mock-manager-1': { email: 'manager@test.com', name: 'Manager User', role: 'MANAGER' },
        'mock-member-1': { email: 'member@test.com', name: 'Member User', role: 'MEMBER' },
        'mock-viewer-1': { email: 'viewer@test.com', name: 'Viewer User', role: 'VIEWER' },
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
      };
    }

    // Get user from Convex for real sessions
    const user = await convexHttp.query(api.users.get, { id: session.userId as any });

    if (!user || !user.isActive) {
      return null;
    }

    // Map Convex user to our user format
    const role = (user.role || 'MEMBER') as UserRole;

    return {
      id: user._id,
      email: user.email || '',
      name: user.name || '',
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
    };
  } catch (error) {
    logger.error('User data retrieval error', error, {
      context: 'middleware',
      function: 'getUserFromSession',
      sessionId: session?.sessionId,
    });
    return null;
  }
}

/**
 * Check if user has required permission
 */
function hasRequiredPermission(
  user: { id: string; email: string; name: string; role: string; permissions: string[] } | null,
  route: RouteRule
): boolean {
  if (!user) return false;

  // Check role requirement first
  if (route.requiredRole) {
    if (user.role !== route.requiredRole && user.role !== UserRole.SUPER_ADMIN) {
      return false;
    }
  }

  // Check permission requirement
  if (route.requiredPermission) {
    if (!user.permissions.includes(route.requiredPermission)) {
      return false;
    }
  }

  // Check any permission requirement
  if (route.requiredAnyPermission && route.requiredAnyPermission.length > 0) {
    const hasAny = route.requiredAnyPermission.some((perm) =>
      user.permissions.includes(perm)
    );
    if (!hasAny) {
      return false;
    }
  }

  return true;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith('/api/health')
  ) {
    return NextResponse.next();
  }

  // Check if it's a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some((route) => pathname.startsWith(route));

  // Check if it's a protected page route
  const matchingRoute = protectedRoutes.find((route) => pathname.startsWith(route.path));

  // If it's not a protected route, allow access
  if (!isProtectedApiRoute && !matchingRoute) {
    return NextResponse.next();
  }

  // Get user session
  const session = await getAuthSession(request);

  // If no session, redirect to login (for pages) or return 401 (for API)
  if (!session) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user data
  const user = await getUserFromSession(session);

  if (!user) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For page routes, check permissions
  if (matchingRoute) {
    if (!hasRequiredPermission(user, matchingRoute)) {
      logger.warn('Access denied', {
        context: 'middleware',
        userId: user.id,
        path: pathname,
        route: matchingRoute.path,
      });

      // Redirect to dashboard if user doesn't have permission
      return NextResponse.redirect(new URL('/genel', request.url));
    }
  }

  // Add user info to request headers for API routes
  if (isProtectedApiRoute) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-permissions', user.permissions.join(','));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
