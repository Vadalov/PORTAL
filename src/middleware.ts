import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { serverAccount } from '@/lib/appwrite/server';
import { ensureServerInitialized } from '@/lib/appwrite/server';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/types/auth';
import { appwriteConfig } from '@/lib/appwrite/config';
import logger from '@/lib/logger';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/auth',
  '/test-appwrite',
  '/_next',
  '/favicon.ico',
  '/api/csrf', // CSRF token endpoint is public
  '/api/auth/login', // Login endpoint is public (but requires CSRF token)
  '/api/auth/logout' // Logout endpoint is public
];

// Auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/auth'];

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
 * Check if server is properly initialized
 */
function isServerReady(): boolean {
  try {
    ensureServerInitialized();
    return true;
  } catch (error) {
    logger.error('Server initialization failed', error, {
      context: 'middleware',
      function: 'isServerReady'
    });
    return false;
  }
}

/**
 * CSRF validation is handled at the API route level
 * Middleware in Edge Runtime cannot use Node.js crypto module
 */

/**
 * Get user session from Appwrite
 */
async function getAppwriteSession(request: NextRequest): Promise<{ userId: string; $id: string; secret: string } | null> {
  try {
    if (!isServerReady()) {
      return null;
    }

    const sessionCookie = request.cookies.get('appwrite-session');
    if (!sessionCookie) {
      return null;
    }

    // Use the session cookie to get session info
    const sessionData = JSON.parse(sessionCookie.value);

    if (!sessionData.sessionId || !sessionData.secret) {
      return null;
    }

    // Validate session by checking expiration
    if (sessionData.expire) {
      const expireDate = new Date(sessionData.expire);
      if (expireDate < new Date()) {
        logger.warn('Session expired', {
          context: 'middleware',
          function: 'getAppwriteSession'
        });
        return null;
      }
    }

    // Return session data from cookie (trusted since it's HttpOnly)
    return {
      userId: sessionData.userId,
      $id: sessionData.sessionId,
      secret: sessionData.secret,
    };
  } catch (error) {
    logger.error('Appwrite session validation error', error, {
      context: 'middleware',
      function: 'getAppwriteSession',
      hasCookie: !!sessionCookie
    });
    return null;
  }
}

/**
 * Get user data from Appwrite session
 */
async function getUserFromSession(session: { userId: string; $id: string; secret: string } | null): Promise<{ id: string; email: string; name: string; role: string; permissions: string[] } | null> {
  try {
    if (!session || !session.userId || !session.secret) {
      return null;
    }

    // Create a client with the session to get user data
    const { Client, Account } = await import('node-appwrite');
    const sessionClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setSession(session.secret);

    const sessionAccount = new Account(sessionClient);
    const user = await sessionAccount.get();

    // Map Appwrite user to our user format
    const role = (user.labels?.[0]?.toUpperCase() || 'MEMBER') as UserRole;
    return {
      id: user.$id,
      email: user.email,
      name: user.name,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
    };
  } catch (error) {
    logger.error('User data retrieval error', error, {
      context: 'middleware',
      function: 'getUserFromSession',
      sessionId: session?.$id
    });
    return null;
  }
}

/**
 * Check if user has required permission
 */
function hasRequiredPermission(user: { id: string; email: string; name: string; role: string; permissions: string[] } | null, route: RouteRule): boolean {
  if (!user) return false;

  // Check role requirement first
  if (route.requiredRole && user.role !== route.requiredRole) {
    return false;
  }

  // Check specific permission
  if (route.requiredPermission && !user.permissions.includes(route.requiredPermission)) {
    return false;
  }

  // Check if user has any of the required permissions
  if (route.requiredAnyPermission) {
    const hasAnyPermission = route.requiredAnyPermission.some(permission =>
      user.permissions.includes(permission)
    );
    if (!hasAnyPermission) {
      return false;
    }
  }

  return true;
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): RouteRule | null {
  return protectedRoutes.find(route => pathname.startsWith(route.path)) || null;
}

/**
 * Check if API route requires authentication
 */
function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some(route => pathname.startsWith(route));
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP header for additional security
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.appwrite.io wss://*.appwrite.io;"
  );

  return response;
}

/**
 * Main middleware function
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add security headers to all responses
  const response = addSecurityHeaders(NextResponse.next());

  // Allow public routes first (before CSRF check)
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If authenticated and trying to access auth pages, redirect to dashboard
    const sessionCookie = request.cookies.get('appwrite-session');
    if (sessionCookie && authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/genel', request.url));
    }
    return response;
  }

  // CSRF protection is handled at the API route level
  // (Middleware runs in Edge Runtime and cannot use Node.js crypto module)

  // Get Appwrite session
  const appwriteSession = await getAppwriteSession(request);
  const user = appwriteSession ? await getUserFromSession(appwriteSession) : null;

  // API route protection
  if (pathname.startsWith('/api/')) {
    // Skip auth check for public API routes
    if (pathname === '/api/csrf' || pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
      return response;
    }

    // Require authentication for protected API routes
    if (isProtectedApiRoute(pathname)) {
      if (!user) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized', code: 'AUTHENTICATION_REQUIRED' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    return response;
  }

  // Protected page routes
  const protectedRoute = isProtectedRoute(pathname);
  if (protectedRoute) {
    // Require authentication
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check permissions
    if (!hasRequiredPermission(user, protectedRoute)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
          code: 'INSUFFICIENT_PERMISSIONS'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Redirect to login if not authenticated for any other protected route
  if (!user && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
