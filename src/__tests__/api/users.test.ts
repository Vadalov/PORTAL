/**
 * Users API Route Tests
 * Tests for user management endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Convex API
vi.mock('@/convex/_generated/api', () => ({
  api: {
    users: {
      list: 'users:list',
      get: 'users:get',
      create: 'users:create',
      update: 'users:update',
      remove: 'users:remove',
    },
  },
}));

// Mock Convex functions
vi.mock('@/lib/convex/api', () => ({
  convexUsers: {
    list: vi.fn().mockResolvedValue({ documents: [], total: 0 }),
    get: vi.fn(),
    create: vi.fn().mockResolvedValue({ _id: 'new-user-id' }),
    update: vi.fn().mockResolvedValue({ _id: 'user-id', name: 'Updated Name' }),
    remove: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUserId: vi.fn().mockResolvedValue('current-user-id'),
  getCurrentUser: vi.fn().mockResolvedValue({ _id: 'current-user-id', role: 'admin' }),
}));

vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  validatePasswordStrength: vi.fn().mockReturnValue({ valid: true }),
}));

vi.mock('@/lib/middleware/csrf-middleware', () => ({
  withCsrfProtection: (handler: any) => handler,
}));

vi.mock('@/lib/security', () => ({
  InputSanitizer: {
    sanitize: (data: any) => data,
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Users API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const { GET } = await import('@/app/api/users/route');
      const { convexUsers } = await import('@/lib/convex/api');
      
      vi.mocked(convexUsers.list).mockResolvedValue({
        documents: [
          { _id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          { _id: 'user-2', name: 'User 2', email: 'user2@example.com' },
        ],
        total: 2,
      });

      const request = new NextRequest('http://localhost/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(2);
    });

    it('should handle query parameters', async () => {
      const { GET } = await import('@/app/api/users/route');
      
      const request = new NextRequest('http://localhost/api/users?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should reject request without required fields', async () => {
      const { POST } = await import('@/app/api/users/route');
      
      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const { POST } = await import('@/app/api/users/route');
      
      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          role: 'user',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const { POST } = await import('@/app/api/users/route');
      const { validatePasswordStrength } = await import('@/lib/auth/password');
      
      vi.mocked(validatePasswordStrength).mockReturnValue({
        valid: false,
        error: 'Şifre çok zayıf',
      });

      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          password: '123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('şifre');
    });

    it('should create user with valid data', async () => {
      const { POST } = await import('@/app/api/users/route');
      const { convexUsers } = await import('@/lib/convex/api');
      
      vi.mocked(convexUsers.create).mockResolvedValue({
        _id: 'new-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });

      const request = new NextRequest('http://localhost/api/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          password: 'SecurePassword123!',
          isActive: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });
  });

  describe('GET /api/users/[id]', () => {
    it('should return user by id', async () => {
      const { GET } = await import('@/app/api/users/[id]/route');
      const { convexUsers } = await import('@/lib/convex/api');
      
      vi.mocked(convexUsers.get).mockResolvedValue({
        _id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
      });

      const request = new NextRequest('http://localhost/api/users/user-id');
      const response = await GET(request, {
        params: Promise.resolve({ id: 'user-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data._id).toBe('user-id');
    });

    it('should return 404 for non-existent user', async () => {
      const { GET } = await import('@/app/api/users/[id]/route');
      const { convexUsers } = await import('@/lib/convex/api');
      
      vi.mocked(convexUsers.get).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/users/non-existent');
      const response = await GET(request, {
        params: Promise.resolve({ id: 'non-existent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/users/[id]', () => {
    it('should update user', async () => {
      const { PUT } = await import('@/app/api/users/[id]/route');
      const { convexUsers } = await import('@/lib/convex/api');
      
      vi.mocked(convexUsers.update).mockResolvedValue({
        _id: 'user-id',
        name: 'Updated Name',
        email: 'test@example.com',
      });

      const request = new NextRequest('http://localhost/api/users/user-id', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name' }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'user-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('should delete user', async () => {
      const { DELETE } = await import('@/app/api/users/[id]/route');
      
      const request = new NextRequest('http://localhost/api/users/user-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'user-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

