import { NextRequest, NextResponse } from 'next/server';
import { serverAccount, ensureServerInitialized } from '@/lib/appwrite/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Handle user logout and session cleanup
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure server is initialized
    ensureServerInitialized();

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');

    // If there's an active session, delete it from Appwrite
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie.value);
        if (sessionData.sessionId) {
          await serverAccount.deleteSession(sessionData.sessionId);
        }
      } catch (error) {
        console.error('Error deleting session from Appwrite:', error);
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

  } catch (error: any) {
    console.error('Logout error:', error);
    
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
      console.error('Error during cookie cleanup:', cleanupError);
    }

    // Return success even if cleanup has issues
    return NextResponse.json({
      success: true,
      message: 'Çıkış işlemi tamamlandı',
    });
  }
}
