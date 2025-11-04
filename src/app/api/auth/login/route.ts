import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { authRateLimit } from '@/lib/rate-limit';
import logger from '@/lib/logger';
import { mockAuthApi } from '@/lib/api/mock-auth-api';
import { convexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import { verifyPassword } from '@/lib/auth/password';

// Get backend provider from environment
const getBackendProvider = () => {
  return (
    process.env.NEXT_PUBLIC_BACKEND_PROVIDER ||
    process.env.BACKEND_PROVIDER ||
    'convex'
  ).toLowerCase();
};

/**
 * POST /api/auth/login
 * Handle user login with Convex or Mock authentication
 * 
 * Convex-based authentication: Looks up user in Convex users collection
 * Mock authentication: Uses mock-auth-api for testing
 */
export const POST = authRateLimit(async (request: NextRequest) => {
  let email: string | undefined;
  const provider = getBackendProvider();

  try {
    const body = await request.json();
    email = body.email;
    const { password, rememberMe = false } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Use mock backend if configured
    if (provider === 'mock') {
      const mockResult = await mockAuthApi.login(email, password);
      
      // Generate CSRF token
      const csrfToken = generateCsrfToken();
      
      // Set session cookies
      const cookieStore = await cookies();
      
      // Mock session cookie (HttpOnly)
      const expireTime = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString();
      cookieStore.set(
        'auth-session',
        JSON.stringify({
          sessionId: mockResult.session.$id,
          userId: mockResult.user.id,
          secret: mockResult.session.secret,
          expire: expireTime,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
          path: '/',
        }
      );

      // CSRF token cookie
      cookieStore.set('csrf-token', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60,
        path: '/',
      });

      return NextResponse.json({
        success: true,
        data: {
          user: mockResult.user,
          session: {
            sessionId: mockResult.session.$id,
            expire: expireTime,
          },
        },
      });
    }

    // Convex-based authentication
    // Look up user by email in Convex
    const user = await convexHttp.query(api.auth.getUserByEmail, { email: email.toLowerCase() });

    if (!user) {
      logger.warn('Login failed - user not found', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login failed - inactive account', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Hesap aktif değil' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      logger.warn('Login failed - no password hash', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', {
        email: `${email?.substring(0, 3)}***`,
      });
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Map Convex user to our user format
    const role = (user.role || 'MEMBER') as UserRole;
    
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
      isActive: user.isActive,
      createdAt: user._creationTime,
      updatedAt: user._creationTime,
    };

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Set session cookies
    const cookieStore = await cookies();
    
    // Create session
    const expireTime = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Session cookie (HttpOnly)
    cookieStore.set(
      'auth-session',
      JSON.stringify({
        sessionId,
        userId: user._id,
        expire: expireTime.toISOString(),
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        path: '/',
      }
    );

    // CSRF token cookie
    cookieStore.set('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    // Update last login time
    try {
      await convexHttp.mutation(api.auth.updateLastLogin, { userId: user._id });
    } catch (error) {
      // Log but don't fail login if this fails
      logger.warn('Failed to update last login time', {
        error,
        userId: user._id,
      });
    }

    logger.info('User logged in successfully', {
      userId: user._id,
      email: `${email?.substring(0, 3)}***`,
      role,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        session: {
          sessionId,
          expire: expireTime.toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu';
    
    logger.error('Login error', error, {
      endpoint: '/api/auth/login',
      method: 'POST',
      email: `${email?.substring(0, 3)}***`,
    });
    
    // Check for invalid credentials
    if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credential') || errorMessage.toLowerCase().includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
});
