/**
 * TC Number Security Utilities
 * 
 * This module provides secure handling of Turkish National ID (TC) numbers:
 * - Deterministic hashing for indexing and searching
 * - Masking for logging and display
 * - Access control helpers
 * 
 * KVKK/GDPR Compliance:
 * - TC numbers are hashed at rest using SHA-256 with a salt
 * - Only authorized roles can access TC number data
 * - All access is logged for audit trails
 */

import type { QueryCtx, MutationCtx } from "./_generated/server";

// Fallback salt for TC number hashing if not found in system_settings
const DEFAULT_TC_HASH_SALT = "PORTAL_TC_SALT_2024";

/**
 * Get TC hash salt from system_settings with fallback to default
 */
async function getTcHashSalt(ctx: QueryCtx | MutationCtx): Promise<string> {
  try {
    const setting = await ctx.db
      .query("system_settings")
      .withIndex("by_category_key", (q) =>
        q.eq("category", "security").eq("key", "tc_hash_salt")
      )
      .first();
    
    if (setting && typeof setting.value === "string" && setting.value.length > 0) {
      return setting.value;
    }
  } catch {
    // If setting doesn't exist or error occurs, use fallback
  }
  return DEFAULT_TC_HASH_SALT;
}

/**
 * Hash a TC number deterministically for storage and indexing
 * Uses SHA-256 with salt for security while maintaining searchability
 * 
 * Note: Uses Web Crypto API which is available in Convex runtime
 * 
 * @param ctx - Convex query or mutation context
 * @param tcNo - TC number to hash (11 digits)
 * @returns Hexadecimal hash string (64 characters)
 */
export async function hashTcNumber(
  ctx: QueryCtx | MutationCtx,
  tcNo: string
): Promise<string> {
  if (!tcNo || tcNo.length !== 11 || !/^\d{11}$/.test(tcNo)) {
    throw new Error("Invalid TC number format");
  }
  
  // Get salt from system_settings or use fallback
  const salt = await getTcHashSalt(ctx);
  
  // Create deterministic hash using salt
  const data = `${salt}:${tcNo}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Use Web Crypto API (available in Convex)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Mask TC number for logging and display
 * Shows only first 3 and last 2 digits: 123*********
 */
export function maskTcNumber(tcNo: string | null | undefined): string {
  if (!tcNo || tcNo.length !== 11) {
    return "***";
  }
  return `${tcNo.substring(0, 3)}${'*'.repeat(6)}${tcNo.substring(9)}`;
}

/**
 * Validate TC number format (11 digits)
 */
export function validateTcNumber(tcNo: string): boolean {
  return /^\d{11}$/.test(tcNo);
}

/**
 * Check if user has permission to access TC number data
 * Only ADMIN, MANAGER, and SUPER_ADMIN roles can access TC numbers
 */
export function canAccessTcNumber(userRole: string): boolean {
  const allowedRoles = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'];
  return allowedRoles.includes(userRole);
}

/**
 * Get user role from Convex context
 * Helper to extract user role for authorization checks
 * 
 * Note: Convex auth uses tokenIdentifier which typically contains the user's email
 * We need to look up the user by email to get their role
 */
export async function getUserRole(
  ctx: QueryCtx | MutationCtx
): Promise<{ role: string; userId: string } | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  try {
    // tokenIdentifier is typically the user's email
    // Use indexed query to find user by email (scalable, doesn't load all users)
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => 
        q.eq("email", identity.tokenIdentifier)
      )
      .first();
    
    if (user && user.isActive) {
      return { role: user.role || 'MEMBER', userId: user._id };
    }
  } catch (_error) {
    // If user lookup fails, return null
    return null;
  }

  return null;
}

/**
 * Require authentication and specific role to access TC number data
 * Throws error if user is not authenticated or doesn't have required role
 */
export async function requireTcNumberAccess(
  ctx: QueryCtx | MutationCtx
): Promise<{ role: string; userId: string }> {
  const userInfo = await getUserRole(ctx);
  
  if (!userInfo) {
    throw new Error("Unauthorized: Authentication required");
  }
  
  if (!canAccessTcNumber(userInfo.role)) {
    throw new Error("Unauthorized: Insufficient permissions to access TC number data");
  }
  
  return userInfo;
}

/**
 * Log audit trail for TC number access
 * Uses console.warn to comply with linting rules
 */
export function logTcNumberAccess(
  action: string,
  userInfo: { role: string; userId: string },
  maskedTc: string,
  additionalInfo?: string
): void {
  const info = additionalInfo ? ` - ${additionalInfo}` : '';
  console.warn(`[AUDIT] ${action} by user ${userInfo.userId} (${userInfo.role}) - TC: ${maskedTc}${info}`);
}

