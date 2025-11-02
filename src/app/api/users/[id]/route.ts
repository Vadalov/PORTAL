import { NextRequest } from 'next/server';
import logger from '@/lib/logger';
import api from '@/lib/api';
import { withCsrfProtection } from '@/lib/middleware/csrf-middleware';
import { InputSanitizer } from '@/lib/security';
import {
  handleGetById,
  handleUpdate,
  handleDelete,
  extractParams,
  type ValidationResult,
} from '@/lib/api/route-helpers';
import { UserDocument } from '@/types/collections';

function validateUserUpdate(data: Partial<UserDocument>): ValidationResult {
  const errors: string[] = [];
  if (data.name && data.name.trim().length < 2) errors.push('Ad Soyad en az 2 karakter olmalıdır');
  if (data.email && !InputSanitizer.validateEmail(data.email)) errors.push('Geçersiz e-posta');
  if (data.role && !['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'].includes(data.role))
    errors.push('Geçersiz rol');
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/users/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let id: string | undefined;
  try {
    const { id: extractedId } = await extractParams(params);
    id = extractedId;
    return handleGetById(id, api.users.getUser, 'Kullanıcı');
  } catch (error) {
    logger.error('Get user error', error, {
      endpoint: '/api/users/[id]',
      method: 'GET',
      userId: id || 'unknown',
    });
    throw error;
  }
}

/**
 * PATCH /api/users/[id]
 */
async function updateUserHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const { id: extractedId } = await extractParams(params);
    id = extractedId;
    const body = await request.json();
    return handleUpdate(id, body, validateUserUpdate, api.users.updateUser, 'Kullanıcı');
  } catch (error) {
    logger.error('Update user error', error, {
      endpoint: '/api/users/[id]',
      method: 'PATCH',
      userId: id || 'unknown',
    });
    throw error;
  }
}

/**
 * DELETE /api/users/[id]
 */
async function deleteUserHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  try {
    const { id: extractedId } = await extractParams(params);
    id = extractedId;
    return handleDelete(id, api.users.deleteUser, 'Kullanıcı');
  } catch (error) {
    logger.error('Delete user error', error, {
      endpoint: '/api/users/[id]',
      method: 'DELETE',
      userId: id || 'unknown',
    });
    throw error;
  }
}

export const PATCH = withCsrfProtection(updateUserHandler);
export const DELETE = withCsrfProtection(deleteUserHandler);
