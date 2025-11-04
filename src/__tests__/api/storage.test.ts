/**
 * Storage API Route Tests
 * Tests for file upload and access endpoints
 * 
 * Note: These tests require Convex to be properly set up
 * Run `npx convex dev` before running tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Convex API
vi.mock('@/convex/_generated/api', () => ({
  api: {
    storage: {
      generateUploadUrl: 'storage:generateUploadUrl',
      storeFileMetadata: 'storage:storeFileMetadata',
      getFileUrl: 'storage:getFileUrl',
      getFileMetadata: 'storage:getFileMetadata',
    },
  },
}));

// Mock Convex functions
vi.mock('@/lib/convex/server', () => ({
  getConvexHttp: vi.fn(() => ({
    action: vi.fn().mockResolvedValue('https://upload-url.convex.cloud'),
    mutation: vi.fn().mockResolvedValue('file-metadata-id'),
    query: vi.fn().mockResolvedValue('https://file-url.convex.cloud'),
  })),
}));

vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUserId: vi.fn().mockResolvedValue('user-id-123'),
}));

vi.mock('@/lib/middleware/csrf-middleware', () => ({
  withCsrfProtection: (handler: any) => handler,
}));

vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Storage API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/storage/upload', () => {
    it('should reject invalid content type', async () => {
      const { POST } = await import('@/app/api/storage/upload/route');
      
      const request = new NextRequest('http://localhost/api/storage/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Geçersiz içerik türü');
    });

    it('should reject missing file', async () => {
      const { POST } = await import('@/app/api/storage/upload/route');
      
      const formData = new FormData();
      const request = new NextRequest('http://localhost/api/storage/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'content-type': 'multipart/form-data',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Dosya zorunludur');
    });

    it('should reject file larger than 10MB', async () => {
      const { POST } = await import('@/app/api/storage/upload/route');
      
      const formData = new FormData();
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });
      formData.append('file', largeFile);

      const request = new NextRequest('http://localhost/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Dosya boyutu çok büyük');
    });

    it('should reject unsupported file type', async () => {
      const { POST } = await import('@/app/api/storage/upload/route');
      
      const formData = new FormData();
      const file = new File(['content'], 'script.exe', {
        type: 'application/x-msdownload',
      });
      formData.append('file', file);

      const request = new NextRequest('http://localhost/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Desteklenmeyen dosya türü');
    });

    // Note: Full upload test would require mocking fetch for Convex fileStorage upload
    // This is a placeholder for future implementation
  });

  describe('GET /api/storage/files/[id]', () => {
    it('should return 404 for non-existent file', async () => {
      const { GET } = await import('@/app/api/storage/files/[id]/route');
      
      // Mock Convex query to return null
      const { getConvexHttp } = await import('@/lib/convex/server');
      vi.mocked(getConvexHttp).mockReturnValueOnce({
        query: vi.fn().mockResolvedValue(null),
      } as any);

      const request = new NextRequest('http://localhost/api/storage/files/non-existent');
      const response = await GET(request, {
        params: Promise.resolve({ id: 'non-existent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Dosya bulunamadı');
    });
  });
});

