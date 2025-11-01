import { useAuthStore } from '@/stores/authStore';
import type { Permission, UserRole } from '@/types/auth';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
  };
}

export function usePermission(permission: Permission): boolean {
  return useAuthStore((state) => state.hasPermission(permission));
}

export function useRole(role: UserRole): boolean {
  return useAuthStore((state) => state.hasRole(role));
}
