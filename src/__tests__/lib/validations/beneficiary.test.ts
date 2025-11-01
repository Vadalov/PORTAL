import { describe, it, expect } from 'vitest';
import { beneficiarySchema } from '@/lib/validations/beneficiary';

describe('Beneficiary Validations', () => {
  describe('Quick Add Schema', () => {
    it('should validate complete beneficiary quick add data', () => {
      const validData = {
        category: 'BIREY',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'TURKIYE',
        fundRegion: 'ULKE_ICI',
        fileConnection: 'BAGIMSIZ',
        fileNumber: '2024-001',
      };

      const result = beneficiarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject incomplete data (missing required fields)', () => {
      const invalidData = {
        category: 'BIREY',
        // Missing firstName, lastName, etc.
      };

      const result = beneficiarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidData = {
        category: 'INVALID_CATEGORY',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'TURKIYE',
        fundRegion: 'ULKE_ICI',
        fileConnection: 'BAGIMSIZ',
        fileNumber: '2024-001',
      };

      const result = beneficiarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const validData = {
        category: 'BIREY',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'TURKIYE',
        fundRegion: 'ULKE_ICI',
        fileConnection: 'BAGIMSIZ',
        fileNumber: '2024-001',
        identityNumber: '12345678901',
        mernisCheck: true,
      };

      const result = beneficiarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
