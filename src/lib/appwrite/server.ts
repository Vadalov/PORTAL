/**
 * Appwrite Server Client
 * Server-side Appwrite SDK instances with API key
 * IMPORTANT: Only use in server components, API routes, or server actions
 *
 * SDK Guard: This module includes SDK usage validation to prevent
 * accidental use in browser context. Warnings will appear if used
 * incorrectly. See sdk-guard.ts for details.
 */

import { Client, Account, Databases, Storage, Users, Teams, Query } from 'node-appwrite';
import { appwriteConfig, validateServerConfig, validateServerConfigSafe } from './config';
import { validateServerSDKUsage } from './sdk-guard';

// Validation moved to lazy initialization - see initializeServerClient()
// validateServerConfig(); // ❌ Removed to prevent import-time crash

// Safe validation at module load - warns but doesn't throw
validateServerConfigSafe();
validateServerSDKUsage();

/**
 * Server-side Appwrite client
 * Uses API key for elevated permissions
 * IMPORTANT: Only use in server components, API routes, or server actions
 * 
 * Note: Configuration is validated lazily to prevent import-time crashes.
 * Call initializeServerClient() explicitly if you need strict validation.
 */
export const serverClient = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(appwriteConfig.apiKey);

/**
 * Server Account service
 */
export const serverAccount = new Account(serverClient);

/**
 * Server Database service
 */
export const serverDatabases = new Databases(serverClient);

/**
 * Server Storage service
 */
export const serverStorage = new Storage(serverClient);

/**
 * Server Users service (admin operations)
 */
export const serverUsers = new Users(serverClient);

/**
 * Server Teams service (admin operations)
 */
export const serverTeams = new Teams(serverClient);

/**
 * Export Query for convenience
 */
export { Query };

/**
 * Server-side error handling wrapper
 */
export async function handleServerError<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    console.error('Appwrite Server Error:', error);
    
    // Handle specific error types
    if (error.code === 401) {
      throw new Error('API key geçersiz veya eksik.');
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
 * Check if server client is properly initialized with valid configuration
 * @returns true if server client has valid endpoint, project ID, and API key
 */
export function isServerInitialized(): boolean {
  try {
    const isServer = typeof window === 'undefined';
    if (!isServer) {
      console.warn('⚠️ isServerInitialized called from browser context. Server SDK should only be used on server.');
      return false;
    }
    const hasConfig = !!(serverClient && appwriteConfig.endpoint && appwriteConfig.projectId && appwriteConfig.apiKey);
    if (!hasConfig) {
      console.warn('⚠️ Appwrite server client is not properly configured');
    }
    return hasConfig;
  } catch {
    return false;
  }
}

/**
 * Explicitly initialize and validate the Appwrite server client
 * Call this in your server initialization if you want strict validation
 * @throws Error if configuration is invalid
 */
export function initializeServerClient(): void {
  validateServerConfig(); // This will throw if config is invalid
  console.log('✅ Appwrite server client initialized successfully');
}

/**
 * Safe initialization with warnings instead of errors
 * Automatically called on first use if not explicitly initialized
 */
let _serverInitFlag = false;
export function ensureServerInitialized(): boolean {
  if (!_serverInitFlag) {
    _serverInitFlag = true;
    return validateServerConfigSafe();
  }
  return true;
}
