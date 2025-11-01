import { NextRequest, NextResponse } from 'next/server';
import { serverAccount, ensureServerInitialized } from '@/lib/appwrite/server';
import { generateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { authRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/auth/login
 * Handle user login with Appwrite authentication
 */
export const POST = authRateLimit(async (request: NextRequest) => {
  try {
    // Ensure server is initialized
    ensureServerInitialized();

    const { email, password, rememberMe = false } = await request.json();

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

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific Appwrite errors
    if (error.code === 401) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }
    
    if (error.code === 429) {
      return NextResponse.json(
        { success: false, error: 'Çok fazla deneme. Lütfen bekleyin.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
});
