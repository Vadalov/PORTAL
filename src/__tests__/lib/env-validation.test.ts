import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('Client Environment Validation', () => {
    it('should validate client env variables (Convex)', () => {
      // Set Convex URL (optional but recommended)
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';

      // Dynamic import to test validation
      import('@/lib/env-validation').then(({ validateClientEnv }) => {
        expect(() => validateClientEnv()).not.toThrow();
      });
    });

    it('should use default values for optional variables', () => {
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';

      import('@/lib/env-validation').then(({ getClientEnv }) => {
        const env = getClientEnv();
        expect(env.NEXT_PUBLIC_APP_NAME).toBe('Dernek Yönetim Sistemi');
        expect(env.NEXT_PUBLIC_APP_VERSION).toBe('1.0.0');
      });
    });
  });

  describe('Server Environment Validation', () => {
    it('should validate server env variables', () => {
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';
      process.env.NODE_ENV = 'development';
      // In development, secrets are optional
      process.env.CSRF_SECRET = 'a'.repeat(32);
      process.env.SESSION_SECRET = 'b'.repeat(32);

      import('@/lib/env-validation').then(({ validateServerEnv }) => {
        expect(() => validateServerEnv()).not.toThrow();
      });
    });

    it('should validate secret length in production', () => {
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';
      process.env.NODE_ENV = 'production';
      process.env.CSRF_SECRET = 'too-short'; // Less than 32 chars
      process.env.SESSION_SECRET = 'b'.repeat(32);

      import('@/lib/env-validation').then(({ validateServerEnv }) => {
        expect(() => validateServerEnv()).toThrow();
      });
    });
  });

  describe('Feature Flags', () => {
    it('should parse boolean feature flags', () => {
      process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test-project.convex.cloud';
      process.env.NEXT_PUBLIC_ENABLE_REALTIME = 'false';
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true';

      import('@/lib/env-validation').then(({ getClientEnv }) => {
        const env = getClientEnv();
        expect(env.NEXT_PUBLIC_ENABLE_REALTIME).toBe(false);
        expect(env.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(true);
      });
    });
  });

  describe('Helper Functions', () => {
    it('should detect email configuration', () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASSWORD = 'password';

      import('@/lib/env-validation').then(({ getServerEnv, hasEmailConfig }) => {
        const env = getServerEnv();
        expect(hasEmailConfig(env)).toBe(true);
      });
    });

    it('should detect SMS configuration', () => {
      process.env.TWILIO_ACCOUNT_SID = 'AC123';
      process.env.TWILIO_AUTH_TOKEN = 'token123';
      process.env.TWILIO_PHONE_NUMBER = '+905551234567';

      import('@/lib/env-validation').then(({ getServerEnv, hasSmsConfig }) => {
        const env = getServerEnv();
        expect(hasSmsConfig(env)).toBe(true);
      });
    });
  });
});
