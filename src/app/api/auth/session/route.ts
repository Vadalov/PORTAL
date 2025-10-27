import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/session
 * Get current session (for client-side auth state initialization)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');

    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        error: 'No active session',
      }, { status: 401 });
    }

    // Parse and validate session
    const sessionData = JSON.parse(sessionCookie.value);
    const expiresAt = new Date(sessionData.expire);

    // Check expiration
    if (expiresAt <= new Date()) {
      // Clear expired cookie
      cookieStore.delete('auth-session');

      return NextResponse.json({
        success: false,
        error: 'Session expired',
      }, { status: 401 });
    }

    // Return session info (without sensitive tokens)
    return NextResponse.json({
      success: true,
      data: {
        userId: sessionData.userId,
        expiresAt: sessionData.expire,
      },
    });
  } catch (error: any) {
    console.error('Session check error:', error);

    return NextResponse.json({
      success: false,
      error: 'Invalid session',
    }, { status: 401 });
  }
}
