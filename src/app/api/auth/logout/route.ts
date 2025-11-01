import { NextRequest, NextResponse } from 'next/server';
import { ensureServerInitialized } from '@/lib/appwrite/server';
import { appwriteConfig } from '@/lib/appwrite/config';
import { cookies } from 'next/headers';
import logger from '@/lib/logger';
import { Client, Account } from 'node-appwrite';

/**
 * POST /api/auth/logout
 * Handle user logout and session cleanup
 */
export async function POST(_request: NextRequest) {
  try {
    // Ensure server is initialized
    ensureServerInitialized();

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');

    // If there's an active session, delete it from Appwrite
    let sessionData: { sessionId?: string; secret?: string } | null = null;
    if (sessionCookie) {
      try {
        sessionData = JSON.parse(sessionCookie.value);
        // To delete a session, we need to use the session itself (not admin account)
        if (sessionData?.sessionId && sessionData?.secret) {
          const sessionClient = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.projectId)
            .setSession(sessionData.secret);

          const sessionAccount = new Account(sessionClient);
          await sessionAccount.deleteSession(sessionData.sessionId);
        }
      } catch (error) {
        logger.error('Error deleting session from Appwrite', error, {
          endpoint: '/api/auth/logout',
          method: 'POST',
          sessionId: sessionData?.sessionId,
        });
        // Continue with cleanup even if Appwrite deletion fails
      }
    }

    // Clear all auth-related cookies
    cookieStore.set('appwrite-session', '', {
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

    // Clear any other potential auth cookies
    const authSessionCookie = cookieStore.get('auth-session');
    if (authSessionCookie) {
      cookieStore.set('auth-session', '', {
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

      cookieStore.set('appwrite-session', '', {
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
