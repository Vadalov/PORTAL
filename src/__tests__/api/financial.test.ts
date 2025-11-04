/**
 * Financial API Route Tests
 * Tests for financial transaction endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Convex API
vi.mock('@/convex/_generated/api', () => ({
  api: {
    financeRecords: {
      list: 'financeRecords:list',
      get: 'financeRecords:get',
      create: 'financeRecords:create',
    },
  },
}));

// Mock Convex functions
vi.mock('@/lib/convex/api', () => ({
  convexFinanceRecords: {
    list: vi.fn().mockResolvedValue({ documents: [], total: 0 }),
    get: vi.fn(),
    create: vi.fn().mockResolvedValue({ _id: 'new-record-id' }),
  },
  normalizeQueryParams: vi.fn((params) => params),
}));

vi.mock('@/lib/auth/get-user', () => ({
  getCurrentUserId: vi.fn().mockResolvedValue('current-user-id'),
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

describe('Financial API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/financial/transactions', () => {
    it('should return list of transactions', async () => {
      const { GET } = await import('@/app/api/financial/transactions/route');
      const { convexFinanceRecords } = await import('@/lib/convex/api');
      
      vi.mocked(convexFinanceRecords.list).mockResolvedValue({
        documents: [
          {
            _id: 'record-1',
            record_type: 'income',
            amount: 1000,
            currency: 'TRY',
            description: 'Test income',
          },
          {
            _id: 'record-2',
            record_type: 'expense',
            amount: 500,
            currency: 'TRY',
            description: 'Test expense',
          },
        ],
        total: 2,
      });

      const request = new NextRequest('http://localhost/api/financial/transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(2);
    });

    it('should filter by record type', async () => {
      const { GET } = await import('@/app/api/financial/transactions/route');
      
      const request = new NextRequest('http://localhost/api/financial/transactions?record_type=income');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should filter by date range', async () => {
      const { GET } = await import('@/app/api/financial/transactions/route');
      
      const request = new NextRequest(
        'http://localhost/api/financial/transactions?start_date=2024-01-01&end_date=2024-12-31'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/financial/transactions', () => {
    it('should reject request without required fields', async () => {
      const { POST } = await import('@/app/api/financial/transactions/route');
      
      const request = new NextRequest('http://localhost/api/financial/transactions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount: 1000 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid record type', async () => {
      const { POST } = await import('@/app/api/financial/transactions/route');
      
      const request = new NextRequest('http://localhost/api/financial/transactions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          record_type: 'invalid',
          amount: 1000,
          currency: 'TRY',
          description: 'Test',
          transaction_date: '2024-01-01',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject negative amount', async () => {
      const { POST } = await import('@/app/api/financial/transactions/route');
      
      const request = new NextRequest('http://localhost/api/financial/transactions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          record_type: 'income',
          amount: -1000,
          currency: 'TRY',
          description: 'Test',
          transaction_date: '2024-01-01',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid currency', async () => {
      const { POST } = await import('@/app/api/financial/transactions/route');
      
      const request = new NextRequest('http://localhost/api/financial/transactions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          record_type: 'income',
          amount: 1000,
          currency: 'INVALID',
          description: 'Test',
          transaction_date: '2024-01-01',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should create transaction with valid data', async () => {
      const { POST } = await import('@/app/api/financial/transactions/route');
      const { convexFinanceRecords } = await import('@/lib/convex/api');
      
      vi.mocked(convexFinanceRecords.create).mockResolvedValue({
        _id: 'new-record-id',
        record_type: 'income',
        amount: 1000,
        currency: 'TRY',
        description: 'Test income',
        transaction_date: '2024-01-01',
        created_by: 'current-user-id',
        status: 'pending',
      });

      const request = new NextRequest('http://localhost/api/financial/transactions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          record_type: 'income',
          amount: 1000,
          currency: 'TRY',
          description: 'Test income',
          transaction_date: '2024-01-01',
          category: 'Donation',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });
  });
});

