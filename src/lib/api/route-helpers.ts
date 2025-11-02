/**
 * Shared utilities for API route handlers
 * Reduces code duplication across API routes
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard API response type
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
  message?: string;
};

/**
 * Validation result type
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * Generic API operation that returns data or error
 * Flexible to support both mock and real API responses
 */
export type ApiOperation<T = any> = {
  data?: T | null;
  error?: string | null;
  total?: number;
};

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: string[]
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Handle common GET by ID pattern
 * @param id - Resource ID
 * @param getOperation - Function that fetches the resource
 * @param resourceName - Name of resource for error messages (e.g., 'Kullanıcı', 'Görev')
 */
export async function handleGetById<T>(
  id: string | undefined,
  getOperation: (id: string) => Promise<ApiOperation<T>>,
  resourceName: string = 'Kayıt'
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    if (!id) {
      return errorResponse('ID parametresi gerekli', 400);
    }

    const response = await getOperation(id);
    
    if (response.error || !response.data) {
      return errorResponse(`${resourceName} bulunamadı`, 404);
    }

    return successResponse(response.data as T);
  } catch (error: unknown) {
    console.error(`Get ${resourceName} error:`, error);
    return errorResponse('Veri alınamadı', 500);
  }
}

/**
 * Handle common UPDATE pattern
 * @param id - Resource ID
 * @param body - Update data
 * @param validate - Validation function
 * @param updateOperation - Function that updates the resource
 * @param resourceName - Name of resource for success message
 */
export async function handleUpdate<T, U = any>(
  id: string | undefined,
  body: U,
  validate: (data: U) => ValidationResult,
  updateOperation: (id: string, data: U) => Promise<ApiOperation<T>>,
  resourceName: string = 'Kayıt'
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    if (!id) {
      return errorResponse('ID parametresi gerekli', 400);
    }

    const validation = validate(body);
    if (!validation.isValid) {
      return errorResponse('Doğrulama hatası', 400, validation.errors);
    }

    const response = await updateOperation(id, body);
    
    if (response.error || !response.data) {
      return errorResponse(
        response.error || 'Güncelleme başarısız',
        400
      );
    }

    return successResponse(
      response.data as T,
      `${resourceName} güncellendi`
    );
  } catch (error: unknown) {
    console.error(`Update ${resourceName} error:`, error);
    return errorResponse('Güncelleme işlemi başarısız', 500);
  }
}

/**
 * Handle common DELETE pattern
 * @param id - Resource ID
 * @param deleteOperation - Function that deletes the resource
 * @param resourceName - Name of resource for success message
 */
export async function handleDelete(
  id: string | undefined,
  deleteOperation: (id: string) => Promise<ApiOperation>,
  resourceName: string = 'Kayıt'
): Promise<NextResponse<ApiResponse>> {
  try {
    if (!id) {
      return errorResponse('ID parametresi gerekli', 400);
    }

    const response = await deleteOperation(id);
    
    if (response.error) {
      return errorResponse(response.error, 400);
    }

    return successResponse(
      null,
      `${resourceName} silindi`
    );
  } catch (error: unknown) {
    console.error(`Delete ${resourceName} error:`, error);
    return errorResponse('Silme işlemi başarısız', 500);
  }
}

/**
 * Extract and await params from Next.js 15 async params
 */
export async function extractParams<T extends Record<string, string>>(
  params: Promise<T>
): Promise<T> {
  return await params;
}

/**
 * Parse JSON body with error handling
 */
export async function parseBody<T = any>(
  request: NextRequest
): Promise<{ data?: T; error?: string }> {
  try {
    const body = await request.json();
    return { data: body };
  } catch (error) {
    return { error: 'Geçersiz istek verisi' };
  }
}
