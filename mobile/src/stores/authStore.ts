import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import * as SecureStore from 'expo-secure-store';
import { account } from '@/lib/appwrite/client';
import type { User, AuthState, LoginCredentials, AuthResponse, UserRole, Permission } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { Models } from 'appwrite';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

// Convert Appwrite user to our User type
function mapAppwriteUser(appwriteUser: Models.User<Models.Preferences>): User {
  const role = (appwriteUser.prefs?.role || 'VIEWER') as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name,
    role,
    permissions,
    phone: appwriteUser.phone || undefined,
    createdAt: appwriteUser.$createdAt,
    updatedAt: appwriteUser.$updatedAt,
  };
}

export const useAuthStore = create<AuthStore>()(
  immer((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email: string, password: string): Promise<AuthResponse> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Create email session
        await account.createEmailPasswordSession(email, password);

        // Get user details
        const appwriteUser = await account.get();
        const user = mapAppwriteUser(appwriteUser);

        // Store session info in secure store
        await SecureStore.setItemAsync('isAuthenticated', 'true');

        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
        });

        return { success: true, user };
      } catch (error: any) {
        console.error('Login error:', error);
        const errorMessage = error?.message || 'Giriş başarısız';

        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = errorMessage;
        });

        return { success: false, error: errorMessage };
      }
    },

    logout: async () => {
      try {
        // Delete current session
        await account.deleteSession('current');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear secure store
        await SecureStore.deleteItemAsync('isAuthenticated');

        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = null;
        });
      }
    },

    initializeAuth: async () => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        // Check if user has a session
        const isAuth = await SecureStore.getItemAsync('isAuthenticated');

        if (isAuth === 'true') {
          // Try to get current user
          const appwriteUser = await account.get();
          const user = mapAppwriteUser(appwriteUser);

          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } else {
          set((state) => {
            state.isAuthenticated = false;
            state.isLoading = false;
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await SecureStore.deleteItemAsync('isAuthenticated');

        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        });
      }
    },

    hasPermission: (permission: Permission): boolean => {
      const user = get().user;
      if (!user) return false;
      return user.permissions.includes(permission);
    },

    hasRole: (role: UserRole): boolean => {
      const user = get().user;
      if (!user) return false;
      return user.role === role;
    },
  }))
);
