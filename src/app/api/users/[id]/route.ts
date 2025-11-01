import { NextRequest } from 'next/server';
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

function validateUserUpdate(data: any): ValidationResult {
  const errors: string[] = [];
  if (data.name && data.name.trim().length < 2) errors.push('Ad Soyad en az 2 karakter olmalıdır');
  if (data.email && !InputSanitizer.validateEmail(data.email)) errors.push('Geçersiz e-posta');
  if (data.role && !['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'].includes(data.role)) errors.push('Geçersiz rol');
  return { isValid: errors.length === 0, errors };
}

/**
 * GET /api/users/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  return handleGetById(id, api.users.getUser, 'Kullanıcı');
}

/**
 * PATCH /api/users/[id]
 */
async function updateUserHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  const body = await request.json();
  return handleUpdate(id, body, validateUserUpdate, api.users.updateUser, 'Kullanıcı');
}

/**
 * DELETE /api/users/[id]
 */
async function deleteUserHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await extractParams(params);
  return handleDelete(id, api.users.deleteUser, 'Kullanıcı');
}

export const PATCH = withCsrfProtection(updateUserHandler);
export const DELETE = withCsrfProtection(deleteUserHandler);