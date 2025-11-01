import { describe, it, expect } from 'vitest';
import {
  createBeneficiary,
  getBeneficiary,
  getBeneficiaries,
  updateBeneficiary,
  deleteBeneficiary,
  uploadBeneficiaryPhoto,
  checkMernis,
} from '@/lib/api/mock-api';
import type { BeneficiaryQuickAdd, BeneficiaryStatus } from '@/types/beneficiary';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Mock API', () => {
  describe('createBeneficiary', () => {
    it('should create a new beneficiary', async () => {
      const beneficiaryData: BeneficiaryQuickAdd = {
        category: 'assistance' as any,
        firstName: 'Test',
        lastName: 'User',
        nationality: 'TC',
        mernisCheck: true,
        fundRegion: 'ankara' as any,
        fileConnection: 'physical' as any,
        fileNumber: '123',
        identityNumber: '12345678901',
      };

      const result = await createBeneficiary(beneficiaryData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.firstName).toBe('Test');
      }
    });

    it('should handle invalid data', async () => {
      const invalidData: BeneficiaryQuickAdd = {
        category: 'assistance' as any,
        firstName: '',
        lastName: '',
        nationality: 'TC',
        mernisCheck: false,
        fundRegion: 'ankara' as any,
        fileConnection: 'physical' as any,
        fileNumber: '',
      };

      const result = await createBeneficiary(invalidData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('getBeneficiary', () => {
    it('should get beneficiary by id', async () => {
      const result = await getBeneficiary('123');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle non-existent beneficiary', async () => {
      const result = await getBeneficiary('non-existent');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('getBeneficiaries', () => {
    it('should list beneficiaries with default params', async () => {
      const result = await getBeneficiaries();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.data).toBeDefined();
        expect(Array.isArray(result.data.data)).toBe(true);
      }
    });

    it('should filter beneficiaries by search params', async () => {
      const searchParams = {
        search: 'test',
        status: 'active' as BeneficiaryStatus,
      };

      const result = await getBeneficiaries(searchParams);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('updateBeneficiary', () => {
    it('should update existing beneficiary', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      const result = await updateBeneficiary('123', updateData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.firstName).toBe('Updated');
      }
    });

    it('should handle update of non-existent beneficiary', async () => {
      const updateData = { firstName: 'Test' };
      const result = await updateBeneficiary('non-existent', updateData);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('deleteBeneficiary', () => {
    it('should delete existing beneficiary', async () => {
      const result = await deleteBeneficiary('123');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle delete of non-existent beneficiary', async () => {
      const result = await deleteBeneficiary('non-existent');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe('uploadBeneficiaryPhoto', () => {
    it('should upload photo for beneficiary', async () => {
      // Mock File object
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await uploadBeneficiaryPhoto('123', mockFile);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('checkMernis', () => {
    it('should validate TC Kimlik No', async () => {
      const result = await checkMernis('12345678901');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid TC Kimlik No', async () => {
      const result = await checkMernis('invalid');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });
});