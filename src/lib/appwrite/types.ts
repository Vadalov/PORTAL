/**
 * Appwrite Error Type
 * Extends standard Error with Appwrite-specific properties
 */
export interface AppwriteError extends Error {
  code?: number;
  type?: string;
  response?: unknown;
  retryCount?: number; // Custom property for retry logic
}

/**
 * Type guard to check if an error is an AppwriteError
 */
export function isAppwriteError(error: unknown): error is AppwriteError {
  return error instanceof Error && ('code' in error || 'type' in error || 'response' in error);
}
