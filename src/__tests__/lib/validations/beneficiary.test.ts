import { describe, it, expect } from 'vitest';
import { beneficiarySchema } from '@/lib/validations/beneficiary';
import { BeneficiaryCategory, FundRegion, FileConnection } from '@/types/beneficiary';

describe('Beneficiary Validations', () => {
  describe('Quick Add Schema', () => {
    it('should validate complete beneficiary quick add data', () => {
      const validData = {
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.BAGIMSIZ,
        fileNumber: '2024-001',
        birthDate: '2000-01-01',
        city: 'İstanbul',
        district: 'Kadıköy',
      };

      const result = beneficiarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject incomplete data (missing required fields)', () => {
      const invalidData = {
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        // Missing firstName, lastName, etc.
      };

      const result = beneficiarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidData = {
        category: 'INVALID_CATEGORY' as BeneficiaryCategory,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.BAGIMSIZ,
        fileNumber: '2024-001',
      };

      const result = beneficiarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const validData = {
        category: BeneficiaryCategory.IHTIYAC_SAHIBI_AILE,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        nationality: 'Türkiye',
        fundRegion: FundRegion.SERBEST,
        fileConnection: FileConnection.BAGIMSIZ,
        fileNumber: '2024-001',
        birthDate: '2000-01-01',
        city: 'İstanbul',
        district: 'Kadıköy',
        identityNumber: '10000000146', // Valid TC Kimlik No
        mernisCheck: true,
      };

      const result = beneficiarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
