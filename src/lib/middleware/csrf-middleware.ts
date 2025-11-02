/**
 * CSRF Protection Middleware for API Routes
 * Validates CSRF tokens on state-changing requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken, getCsrfTokenHeader } from '@/lib/csrf';

/**
 * Wrap API route handler with CSRF protection
 */
export function withCsrfProtection<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const method = request.method.toUpperCase();

    // Only check CSRF for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfTokenFromHeader = request.headers.get(getCsrfTokenHeader());
      const csrfTokenFromCookie = request.cookies.get('csrf-token')?.value;

      // Validate CSRF token
      if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
        return NextResponse.json(
          {
            success: false,
            error: 'CSRF token missing',
            code: 'CSRF_TOKEN_MISSING',
          },
          { status: 403 }
        );
      }

      if (!validateCsrfToken(csrfTokenFromHeader, csrfTokenFromCookie)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid CSRF token',
            code: 'CSRF_TOKEN_INVALID',
          },
          { status: 403 }
        );
      }
    }

    // CSRF validation passed, proceed to handler
    return handler(request, ...args);
  };
}
