import { NextRequest, NextResponse } from 'next/server';
import { serverAccount, ensureServerInitialized } from '@/lib/appwrite/server';
import { generateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { authRateLimit } from '@/lib/rate-limit';
import logger from '@/lib/logger';

/**
 * POST /api/auth/login
 * Handle user login with Appwrite authentication
 */
export const POST = authRateLimit(async (request: NextRequest) => {
  let email: string | undefined;
  try {
    // Ensure server is initialized
    ensureServerInitialized();

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

    // Authenticate with Appwrite
    const session = await serverAccount.createEmailPasswordSession(email, password);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Get user data
    const user = await serverAccount.get();

    // Map Appwrite user to our user format
    const role = (user.labels?.[0]?.toUpperCase() || 'MEMBER') as UserRole;
    const userData = {
      id: user.$id,
      email: user.email,
      name: user.name,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
      isActive: true,
      createdAt: user.$createdAt,
      updatedAt: user.$updatedAt,
    };

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Set session cookies
    const cookieStore = await cookies();
    
    // Appwrite session cookie (HttpOnly)
    cookieStore.set('appwrite-session', JSON.stringify({
      sessionId: session.$id,
      userId: user.$id,
      expire: session.expire,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/',
    });

    // CSRF token cookie (not HttpOnly)
    cookieStore.set('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        session: {
          sessionId: session.$id,
          expire: session.expire,
        },
      },
    });

  } catch (error: unknown) {
    const appwriteError = error as any;
    const errorCode = appwriteError?.code || appwriteError?.response?.code || appwriteError?.statusCode;
    const errorMessage = appwriteError?.message || appwriteError?.response?.message || '';
    
    logger.error('Login error', error, {
      endpoint: '/api/auth/login',
      method: 'POST',
      email: email?.substring(0, 3) + '***', // Mask email for security
      errorCode,
      errorMessage: errorMessage?.substring(0, 50), // Limit message length
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      // Password asla loglanmamalı!
    });
    
    // Handle specific Appwrite errors
    // Appwrite returns 401 for invalid credentials
    if (errorCode === 401 || errorCode === '401') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }
    
    // Rate limiting
    if (errorCode === 429 || errorCode === '429') {
      return NextResponse.json(
        { success: false, error: 'Çok fazla deneme. Lütfen bekleyin.' },
        { status: 429 }
      );
    }
    
    // Check for credential-related error messages
    const lowerMessage = errorMessage.toLowerCase();
    if (lowerMessage.includes('invalid') || 
        lowerMessage.includes('credential') || 
        lowerMessage.includes('password') ||
        lowerMessage.includes('email') ||
        lowerMessage.includes('user_not_found') ||
        lowerMessage.includes('user_invalid_credentials')) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage || 'Giriş yapılırken bir hata oluştu' },
      { status: errorCode && typeof errorCode === 'number' && errorCode >= 400 && errorCode < 500 ? errorCode : 500 }
    );
  }
});
