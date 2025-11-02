/**
 * Appwrite Permissions Helper
 * Maps application roles to Appwrite permissions
 */

import { Permission, Role } from 'appwrite';
import { UserRole } from '@/types/auth';

/**
 * Get Appwrite permissions for a user role
 */
export function getPermissionsForRole(role: UserRole): string[] {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return [
        Permission.read(Role.any()),
        Permission.write(Role.any()),
        Permission.delete(Role.any()),
        Permission.create(Role.any()),
      ];

    case UserRole.ADMIN:
      return [
        Permission.read(Role.any()),
        Permission.write(Role.team('admins')),
        Permission.delete(Role.team('admins')),
        Permission.create(Role.team('admins')),
      ];

    case UserRole.MANAGER:
      return [
        Permission.read(Role.any()),
        Permission.write(Role.team('managers')),
        Permission.create(Role.team('managers')),
      ];

    case UserRole.MEMBER:
      return [
        Permission.read(Role.any()),
        Permission.write(Role.team('members')),
        Permission.create(Role.team('members')),
      ];

    case UserRole.VOLUNTEER:
      return [Permission.read(Role.any()), Permission.create(Role.team('volunteers'))];

    case UserRole.VIEWER:
      return [Permission.read(Role.any())];

    default:
      return [Permission.read(Role.any())];
  }
}

/**
 * Get collection-specific permissions
 */
export function getCollectionPermissions(role: UserRole, collection: string): string[] {
  const basePermissions = getPermissionsForRole(role);

  // Add collection-specific restrictions
  switch (collection) {
    case 'users':
      if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
        return basePermissions;
      }
      return [Permission.read(Role.any())];

    case 'beneficiaries':
    case 'donations':
      if (role === UserRole.VIEWER) {
        return [Permission.read(Role.any())];
      }
      return basePermissions;

    case 'aid_requests':
    case 'scholarships':
      if (role === UserRole.VIEWER || role === UserRole.VOLUNTEER) {
        return [Permission.read(Role.any())];
      }
      return basePermissions;

    default:
      return basePermissions;
  }
}

/**
 * Get storage bucket permissions
 */
export function getStoragePermissions(role: UserRole, bucketId: string): string[] {
  switch (bucketId) {
    case 'documents':
    case 'photos':
      if (role === UserRole.VIEWER) {
        return [Permission.read(Role.any())];
      }
      return [Permission.read(Role.any()), Permission.create(Role.team('members'))];

    case 'receipts':
      if (role === UserRole.VIEWER) {
        return [Permission.read(Role.any())];
      }
      return [Permission.read(Role.any()), Permission.create(Role.team('members'))];

    case 'reports':
      if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
        return [
          Permission.read(Role.team('members')),
          Permission.create(Role.team('admins')),
          Permission.write(Role.team('admins')),
          Permission.delete(Role.team('admins')),
        ];
      }
      return [Permission.read(Role.team('members'))];

    default:
      return [Permission.read(Role.any())];
  }
}

/**
 * Check if user can perform action on collection
 */
export function canPerformAction(
  role: UserRole,
  action: 'read' | 'create' | 'update' | 'delete',
  collection: string
): boolean {
  const permissions = getCollectionPermissions(role, collection);

  switch (action) {
    case 'read':
      return permissions.some((p) => p.includes('read'));
    case 'create':
      return permissions.some((p) => p.includes('create'));
    case 'update':
      return permissions.some((p) => p.includes('write'));
    case 'delete':
      return permissions.some((p) => p.includes('delete'));
    default:
      return false;
  }
}

/**
 * Get team name for role
 */
export function getTeamName(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return 'admins';
    case UserRole.MANAGER:
      return 'managers';
    case UserRole.MEMBER:
      return 'members';
    case UserRole.VOLUNTEER:
      return 'volunteers';
    case UserRole.VIEWER:
      return 'viewers';
    default:
      return 'members';
  }
}

/**
 * Create user labels based on role and permissions
 */
export function createUserLabels(role: UserRole): string[] {
  const labels = [role.toLowerCase()];

  // Add permission-based labels
  if (canPerformAction(role, 'create', 'users')) {
    labels.push('user-manager');
  }

  if (canPerformAction(role, 'delete', 'beneficiaries')) {
    labels.push('beneficiary-manager');
  }

  if (canPerformAction(role, 'delete', 'donations')) {
    labels.push('donation-manager');
  }

  return labels;
}

/**
 * Validate user permissions for document access
 */
export function validateDocumentAccess(
  userRole: UserRole,
  documentCollection: string,
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  return canPerformAction(userRole, action, documentCollection);
}

/**
 * Get default permissions for new documents
 */
export function getDefaultDocumentPermissions(role: UserRole): string[] {
  return getPermissionsForRole(role);
}
