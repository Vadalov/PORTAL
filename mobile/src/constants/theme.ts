export const colors = {
  // Primary colors
  primary: '#1e40af', // blue-800
  primaryLight: '#3b82f6', // blue-500
  primaryDark: '#1e3a8a', // blue-900

  // Accent colors
  accent: '#10b981', // emerald-500
  accentLight: '#34d399', // emerald-400

  // Text colors
  text: '#111827', // gray-900
  textSecondary: '#6b7280', // gray-500
  textLight: '#9ca3af', // gray-400

  // Background colors
  background: '#f9fafb', // gray-50
  backgroundSecondary: '#f3f4f6', // gray-100
  surface: '#ffffff',

  // Border colors
  border: '#e5e7eb', // gray-200
  borderLight: '#f3f4f6', // gray-100

  // Status colors
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  destructive: '#dc2626', // red-600

  // Semantic colors
  income: '#10b981', // emerald-500
  expense: '#ef4444', // red-500
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};
