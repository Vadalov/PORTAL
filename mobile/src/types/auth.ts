export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'MEMBER'
  | 'VIEWER'
  | 'VOLUNTEER';

export type Permission =
  // Donations
  | 'donations:view'
  | 'donations:create'
  | 'donations:edit'
  | 'donations:delete'
  | 'donations:approve'
  | 'donations:export'
  | 'donations:reports'
  // Beneficiaries
  | 'beneficiaries:view'
  | 'beneficiaries:create'
  | 'beneficiaries:edit'
  | 'beneficiaries:delete'
  | 'beneficiaries:export'
  // Aid & Applications
  | 'aid:view'
  | 'aid:create'
  | 'aid:approve'
  | 'aid:distribute'
  // Scholarships
  | 'scholarships:view'
  | 'scholarships:create'
  | 'scholarships:edit'
  | 'scholarships:approve'
  // Finance
  | 'finance:view'
  | 'finance:create'
  | 'finance:edit'
  | 'finance:reports'
  | 'finance:approve'
  // Users & Settings
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'settings:view'
  | 'settings:edit'
  // Tasks & Meetings
  | 'tasks:view'
  | 'tasks:create'
  | 'tasks:edit'
  | 'meetings:view'
  | 'meetings:create'
  // Messages
  | 'messages:view'
  | 'messages:send'
  | 'messages:bulk';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'donations:view', 'donations:create', 'donations:edit', 'donations:delete', 'donations:approve', 'donations:export', 'donations:reports',
    'beneficiaries:view', 'beneficiaries:create', 'beneficiaries:edit', 'beneficiaries:delete', 'beneficiaries:export',
    'aid:view', 'aid:create', 'aid:approve', 'aid:distribute',
    'scholarships:view', 'scholarships:create', 'scholarships:edit', 'scholarships:approve',
    'finance:view', 'finance:create', 'finance:edit', 'finance:reports', 'finance:approve',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'settings:view', 'settings:edit',
    'tasks:view', 'tasks:create', 'tasks:edit',
    'meetings:view', 'meetings:create',
    'messages:view', 'messages:send', 'messages:bulk',
  ],
  ADMIN: [
    'donations:view', 'donations:create', 'donations:edit', 'donations:approve', 'donations:export', 'donations:reports',
    'beneficiaries:view', 'beneficiaries:create', 'beneficiaries:edit', 'beneficiaries:export',
    'aid:view', 'aid:create', 'aid:approve', 'aid:distribute',
    'scholarships:view', 'scholarships:create', 'scholarships:edit', 'scholarships:approve',
    'finance:view', 'finance:create', 'finance:edit', 'finance:reports',
    'users:view', 'users:create', 'users:edit',
    'settings:view',
    'tasks:view', 'tasks:create', 'tasks:edit',
    'meetings:view', 'meetings:create',
    'messages:view', 'messages:send', 'messages:bulk',
  ],
  MANAGER: [
    'donations:view', 'donations:create', 'donations:edit', 'donations:export',
    'beneficiaries:view', 'beneficiaries:create', 'beneficiaries:edit',
    'aid:view', 'aid:create',
    'scholarships:view', 'scholarships:create', 'scholarships:edit',
    'finance:view', 'finance:reports',
    'users:view',
    'tasks:view', 'tasks:create', 'tasks:edit',
    'meetings:view', 'meetings:create',
    'messages:view', 'messages:send',
  ],
  MEMBER: [
    'donations:view', 'donations:create',
    'beneficiaries:view',
    'aid:view',
    'scholarships:view',
    'finance:view',
    'tasks:view', 'tasks:create',
    'meetings:view',
    'messages:view', 'messages:send',
  ],
  VIEWER: [
    'donations:view',
    'beneficiaries:view',
    'aid:view',
    'scholarships:view',
    'tasks:view',
    'meetings:view',
    'messages:view',
  ],
  VOLUNTEER: [
    'beneficiaries:view',
    'aid:view',
    'tasks:view',
    'messages:view',
  ],
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}
