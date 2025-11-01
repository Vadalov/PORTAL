import Constants from 'expo-constants';

// Appwrite configuration
export const APPWRITE_ENDPOINT =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
  'https://cloud.appwrite.io/v1';

export const APPWRITE_PROJECT_ID =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
  '';

// Database IDs
export const DATABASE_ID =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_DATABASE_ID ||
  process.env.EXPO_PUBLIC_DATABASE_ID ||
  'dernek_db';

// Collection IDs
export const COLLECTIONS = {
  USERS: 'users',
  BENEFICIARIES: 'beneficiaries',
  DONATIONS: 'donations',
  AID_REQUESTS: 'aid_requests',
  AID_APPLICATIONS: 'aid_applications',
  SCHOLARSHIPS: 'scholarships',
  PARAMETERS: 'parameters',
  TASKS: 'tasks',
  MEETINGS: 'meetings',
  MESSAGES: 'messages',
  FINANCE_RECORDS: 'finance_records',
  ORPHANS: 'orphans',
  SPONSORS: 'sponsors',
  CAMPAIGNS: 'campaigns',
} as const;

// Storage bucket IDs
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  RECEIPTS: 'receipts',
  PHOTOS: 'photos',
  REPORTS: 'reports',
} as const;

// Validate configuration
export function validateAppwriteConfig() {
  if (!APPWRITE_PROJECT_ID) {
    throw new Error('Appwrite Project ID is not configured');
  }
  if (!APPWRITE_ENDPOINT) {
    throw new Error('Appwrite Endpoint is not configured');
  }
}
