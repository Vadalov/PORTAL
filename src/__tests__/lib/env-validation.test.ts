import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    Object.assign(process.env, originalEnv);
  });

  describe('Client Environment Validation', () => {
    it('should validate client env variables (Convex)', async () => {
      // Set Convex URL (optional but recommended)
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';

      // Dynamic import to test validation
      const { validateClientEnv } = await import('@/lib/env-validation');
      expect(() => validateClientEnv()).not.toThrow();
    });

    it('should use default values for optional variables', async () => {
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';

      const { getClientEnv } = await import('@/lib/env-validation');
      const env = getClientEnv();
      expect(env.NEXT_PUBLIC_APP_NAME).toBe('Dernek Yönetim Sistemi');
      expect(env.NEXT_PUBLIC_APP_VERSION).toBe('1.0.0');
    });
  });

  describe('Server Environment Validation', () => {
    it('should validate server env variables', async () => {
      // Set Convex URL (optional but recommended)
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';
      // In development, secrets are optional
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process.env, 'CSRF_SECRET', {
        value: 'a'.repeat(32),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process.env, 'SESSION_SECRET', {
        value: 'b'.repeat(32),
        writable: true,
        configurable: true,
      });

      const { validateServerEnv } = await import('@/lib/env-validation');
      expect(() => validateServerEnv()).not.toThrow();
    });

    it('should validate secret length in production', async () => {
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process.env, 'CSRF_SECRET', {
        value: 'too-short', // Less than 32 chars
        writable: true,
        configurable: true,
      });
      Object.defineProperty(process.env, 'SESSION_SECRET', {
        value: 'b'.repeat(32),
        writable: true,
        configurable: true,
      });

      const { validateServerEnv } = await import('@/lib/env-validation');
      expect(() => validateServerEnv()).toThrow();
    });
  });

  describe('Feature Flags', () => {
    it('should parse boolean feature flags', async () => {
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';
      process.env.NEXT_PUBLIC_ENABLE_REALTIME = 'false';
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';

      const { getClientEnv } = await import('@/lib/env-validation');
      const env = getClientEnv();
      expect(env.NEXT_PUBLIC_ENABLE_REALTIME).toBe(false);
      expect(env.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should detect email configuration', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASSWORD = 'password';

      const { hasEmailConfig } = await import('@/lib/env-validation');
      const mockEnv = {
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_USER: 'test@gmail.com',
        SMTP_PASSWORD: 'password',
      } as any;
      expect(hasEmailConfig(mockEnv)).toBe(true);
    });

    it('should detect SMS configuration', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC123';
      process.env.TWILIO_AUTH_TOKEN = 'token123';
      process.env.TWILIO_PHONE_NUMBER = '+905551234567';

      const { hasSmsConfig } = await import('@/lib/env-validation');
      const mockEnv = {
        TWILIO_ACCOUNT_SID: 'AC123',
        TWILIO_AUTH_TOKEN: 'token123',
        TWILIO_PHONE_NUMBER: '+905551234567',
      } as any;
      expect(hasSmsConfig(mockEnv)).toBe(true);
    });
  });
});
