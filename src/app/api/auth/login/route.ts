import { NextRequest, NextResponse } from 'next/server';
import { ensureServerInitialized } from '@/lib/appwrite/server';
import { appwriteConfig } from '@/lib/appwrite/config';
import { generateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { authRateLimit } from '@/lib/rate-limit';
import logger from '@/lib/logger';
import { Client, Account } from 'node-appwrite';

/**
 * POST /api/auth/login
 * Handle user login with Appwrite authentication
 *
 * IMPORTANT: We use a temporary client with no auth to create user session,
 * then use that session to get user data.
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

    // Create a temporary client WITHOUT API key for user authentication
    // This allows us to create user sessions (server SDK with API key can't do this)
    const tempClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);
    // NO .setKey() - we need user-level authentication, not admin

    const tempAccount = new Account(tempClient);

    // Log for debugging
    logger.info('Attempting Appwrite login', {
      endpoint: appwriteConfig.endpoint,
      projectId: appwriteConfig.projectId,
      email: `${email.substring(0, 3)}***`,
    });

    // Authenticate with Appwrite - this creates a user session
    // node-appwrite v20+ requires object parameter: { email, password }
    const session = await tempAccount.createEmailPasswordSession({ email, password });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Now use the session to get the actual user data
    // Create a new client with the session
    const sessionClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setSession(session.secret); // Use session secret for authentication

    const sessionAccount = new Account(sessionClient);
    const user = await sessionAccount.get();

    // Map Appwrite user to our user format
    // Determine role from labels (priority: superadmin > admin > manager > member > viewer)
    let role: UserRole = UserRole.MEMBER;
    if (user.labels && user.labels.length > 0) {
      const labels = user.labels.map((l) => l.toLowerCase());
      if (labels.includes('superadmin')) {
        role = UserRole.SUPER_ADMIN;
      } else if (labels.includes('admin')) {
        role = UserRole.ADMIN;
      } else if (labels.includes('manager')) {
        role = UserRole.MANAGER;
      } else if (labels.includes('member')) {
        role = UserRole.MEMBER;
      } else if (labels.includes('viewer')) {
        role = UserRole.VIEWER;
      } else if (labels.includes('volunteer')) {
        role = UserRole.VOLUNTEER;
      } else {
        // Default to MEMBER if label doesn't match
        role = UserRole.MEMBER;
      }
    }

    const userData = {
      id: user.$id,
      email: user.email,
      name: user.name,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
      isActive: user.status !== false,
      createdAt: user.$createdAt,
      updatedAt: user.$updatedAt,
    };

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Set session cookies
    const cookieStore = await cookies();

    // Appwrite session cookie (HttpOnly)
    // Store session secret for middleware to use
    cookieStore.set(
      'appwrite-session',
      JSON.stringify({
        sessionId: session.$id,
        userId: user.$id,
        secret: session.secret, // CRITICAL: This is needed for session validation
        expire: session.expire,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
        path: '/',
      }
    );

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
    const appwriteError = error as {
      code?: number | string;
      message?: string;
      response?: { code?: number | string; message?: string };
      statusCode?: number;
    };
    const errorCode =
      appwriteError?.code || appwriteError?.response?.code || appwriteError?.statusCode;
    const errorMessage = appwriteError?.message || appwriteError?.response?.message || '';

    logger.error('Login error', error, {
      endpoint: '/api/auth/login',
      method: 'POST',
      email: `${email?.substring(0, 3)}***`, // Mask email for security
      errorCode,
      errorMessage: errorMessage?.substring(0, 50), // Limit message length
      ipAddress:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
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
    if (
      lowerMessage.includes('invalid') ||
      lowerMessage.includes('credential') ||
      lowerMessage.includes('password') ||
      lowerMessage.includes('email') ||
      lowerMessage.includes('user_not_found') ||
      lowerMessage.includes('user_invalid_credentials')
    ) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage || 'Giriş yapılırken bir hata oluştu' },
      {
        status:
          errorCode && typeof errorCode === 'number' && errorCode >= 400 && errorCode < 500
            ? errorCode
            : 500,
      }
    );
  }
});
