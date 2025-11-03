import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import logger from '@/lib/logger';

/**
 * POST /api/auth/logout
 * Handle user logout and session cleanup
 */
export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all auth-related cookies
    cookieStore.set('auth-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    cookieStore.set('csrf-token', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    // Clear legacy Appwrite session cookie if exists
    const appwriteSessionCookie = cookieStore.get('appwrite-session');
    if (appwriteSessionCookie) {
      cookieStore.set('appwrite-session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı',
    });
  } catch (error: unknown) {
    logger.error('Logout error', error, {
      endpoint: '/api/auth/logout',
      method: 'POST',
    });

    // Even if there's an error, we should clear the cookies
    try {
      const cookieStore = await cookies();

      cookieStore.set('auth-session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      cookieStore.set('csrf-token', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });
    } catch (cleanupError) {
      logger.error('Error during cookie cleanup', cleanupError, {
        endpoint: '/api/auth/logout',
        method: 'POST',
      });
    }

    // Return success even if cleanup has issues
    return NextResponse.json({
      success: true,
      message: 'Çıkış işlemi tamamlandı',
    });
  }
}
