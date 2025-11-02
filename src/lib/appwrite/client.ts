'use client';

import type { AppwriteError } from './types';

/**
 * Appwrite Client Instances
 * Provides client-side Appwrite SDK instances for browser/React components
 *
 * ⚠️ IMPORTANT: This file uses 'use client' directive for Next.js 13+ App Router
 *
 * WHY 'use client' IS REQUIRED:
 * - This module uses the browser-compatible Appwrite SDK (from 'appwrite' package)
 * - It's designed for client-side operations (authentication, user sessions, etc.)
 * - Next.js 13+ App Router requires explicit 'use client' for client-side code
 * - Without this directive, Next.js would try to run this code on the server
 *
 * WHEN TO USE THIS FILE:
 * ✅ React components (client components)
 * ✅ Browser-side authentication (login, logout, session management)
 * ✅ Client-side database queries (user-specific data)
 * ✅ File uploads from browser
 *
 * WHEN NOT TO USE THIS FILE:
 * ❌ Server Components (use @/lib/appwrite/server instead)
 * ❌ API Routes (use @/lib/appwrite/server instead)
 * ❌ Server Actions (use @/lib/appwrite/server instead)
 * ❌ Admin operations requiring API key (use @/lib/appwrite/server instead)
 *
 * SDK GUARD VALIDATION:
 * This module includes SDK usage validation to prevent accidental misuse.
 * Warnings will appear if the client SDK is used in the wrong context (e.g., server-side).
 * See @/lib/appwrite/sdk-guard.ts for details on validation logic.
 *
 * RELATED FILES:
 * @see /src/lib/appwrite/server.ts - Server-side SDK with API key (node-appwrite)
 * @see /src/lib/appwrite/config.ts - Shared configuration
 * @see /src/lib/api/appwrite-api.ts - API wrapper using this client
 * @see /src/lib/appwrite/sdk-guard.ts - SDK usage validation guard
 *
 * SDK PACKAGE:
 * This file uses 'appwrite' package (client SDK) from package.json
 * For server-side operations, server.ts uses 'node-appwrite' package
 *
 * @packageDocumentation
 */

import { Client, Account, Databases, Storage, Query } from 'appwrite';
import { appwriteConfig, validateAppwriteConfig, validateAppwriteConfigSafe } from './config';
import { validateClientSDKUsage } from './sdk-guard';

// Validation moved to lazy initialization - see initializeClient()
// validateAppwriteConfig(); // ❌ Removed to prevent import-time crash

// Safe validation at module load - warns but doesn't throw
validateAppwriteConfigSafe();

// SDK usage validation - ensures client SDK is used in browser context
validateClientSDKUsage();

/**
 * Client-side Appwrite client
 * Used in browser/React components
 *
 * Note: Configuration is validated lazily to prevent import-time crashes.
 * Call initializeClient() explicitly if you need strict validation.
 */
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

/**
 * Account service instance
 * For authentication operations
 */
export const account = new Account(client);

/**
 * Database service instance
 * For CRUD operations on collections
 */
export const databases = new Databases(client);

/**
 * Storage service instance
 * For file upload/download operations
 */
export const storage = new Storage(client);

/**
 * Export Query for convenience
 * Allows importing Query from this module instead of 'appwrite' package
 *
 * @example
 * ```typescript
 * import { databases, Query } from '@/lib/appwrite/client';
 *
 * const users = await databases.listDocuments(
 *   DATABASE_ID,
 *   COLLECTION_ID,
 *   [Query.equal('status', 'active')]
 * );
 * ```
 */
export { Query };

/**
 * Check if client is properly initialized with valid configuration
 * @returns true if client has valid endpoint and project ID, and is in correct environment
 */
export function isClientInitialized(): boolean {
  try {
    // Check if running in browser environment
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) {
      console.warn(
        '⚠️ isClientInitialized called from server context. Client SDK should only be used in browser.'
      );
      return false;
    }

    const hasConfig = !!(client && appwriteConfig.endpoint && appwriteConfig.projectId);
    if (!hasConfig) {
      console.warn('⚠️ Appwrite client is not properly configured');
    }
    return hasConfig;
  } catch {
    return false;
  }
}

/**
 * Explicitly initialize and validate the Appwrite client
 * Call this in your app initialization if you want strict validation
 * @throws Error if configuration is invalid
 */
export function initializeClient(): void {
  validateAppwriteConfig(); // This will throw if config is invalid
  console.log('✅ Appwrite client initialized successfully');
}

/**
 * Safe initialization with warnings instead of errors
 * Automatically called on first use if not explicitly initialized
 */
let isInitialized = false;
export function ensureClientInitialized(): boolean {
  if (!isInitialized) {
    isInitialized = true;
    return validateAppwriteConfigSafe();
  }
  return true;
}

/**
 * Error handling wrapper for Appwrite operations
 */
export async function handleAppwriteError<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (err: unknown) {
    const error = err as AppwriteError;
    console.error('Appwrite Error:', error);

    // Handle specific error types
    if (error.code === 401) {
      throw new Error('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
    } else if (error.code === 404) {
      throw new Error('Kayıt bulunamadı.');
    } else if (error.code === 429) {
      throw new Error('Çok fazla istek. Lütfen bekleyin.');
    } else if (error.code >= 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    }

    throw new Error(error.message || 'Beklenmeyen bir hata oluştu.');
  }
}

/**
 * Retry logic for failed requests
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: AppwriteError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err: unknown) {
      const error = err as AppwriteError;
      lastError = error;

      // Don't retry on authentication errors
      if (error.code === 401 || error.code === 403) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
}
