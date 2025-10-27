/**
 * Appwrite Configuration
 * Central configuration for Appwrite client initialization
 */

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  apiKey: process.env.APPWRITE_API_KEY || '',
} as const;

// Database configuration
export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || 'dernek_db';

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

// Storage Bucket IDs
export const STORAGE_BUCKETS = {
  DOCUMENTS: process.env.NEXT_PUBLIC_STORAGE_DOCUMENTS || 'documents',
  RECEIPTS: process.env.NEXT_PUBLIC_STORAGE_RECEIPTS || 'receipts',
  PHOTOS: process.env.NEXT_PUBLIC_STORAGE_PHOTOS || 'photos',
  REPORTS: process.env.NEXT_PUBLIC_STORAGE_REPORTS || 'reports',
} as const;

// Collection Schemas
export const COLLECTION_SCHEMAS = {
  USERS: {
    name: 'string',
    email: 'string',
    role: 'enum',
    avatar: 'string',
    isActive: 'boolean',
    labels: 'array',
  },
  BENEFICIARIES: {
    name: 'string',
    tc_no: 'string',
    phone: 'string',
    address: 'string',
    city: 'string',
    district: 'string',
    neighborhood: 'string',
    income_level: 'enum',
    family_size: 'integer',
    health_status: 'string',
    employment_status: 'string',
    notes: 'string',
    status: 'enum',
  },
  DONATIONS: {
    donor_name: 'string',
    donor_phone: 'string',
    donor_email: 'string',
    amount: 'float',
    currency: 'enum',
    donation_type: 'string',
    payment_method: 'string',
    donation_purpose: 'string',
    notes: 'string',
    receipt_number: 'string',
    receipt_file_id: 'string',
    status: 'enum',
  },
  AID_REQUESTS: {
    beneficiary_id: 'string',
    request_type: 'enum',
    description: 'string',
    amount_requested: 'float',
    priority: 'enum',
    status: 'enum',
    approved_by: 'string',
    approved_at: 'datetime',
  },
  SCHOLARSHIPS: {
    student_name: 'string',
    tc_no: 'string',
    school_name: 'string',
    grade: 'integer',
    scholarship_amount: 'float',
    scholarship_type: 'enum',
    start_date: 'datetime',
    end_date: 'datetime',
    status: 'enum',
  },
} as const;

/**
 * Validate configuration (throws error if invalid)
 * Use validateAppwriteConfigSafe() for non-throwing validation
 */
export function validateAppwriteConfig() {
  if (!appwriteConfig.endpoint) {
    throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined in environment variables');
  }
  if (!appwriteConfig.projectId) {
    throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined in environment variables');
  }
}

/**
 * Non-throwing validation - logs warnings instead of throwing errors
 * Safe to call at module import time
 */
export function validateAppwriteConfigSafe(): boolean {
  let isValid = true;
  
  if (!appwriteConfig.endpoint) {
    console.warn('⚠️ NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined. Appwrite client may not work properly.');
    isValid = false;
  }
  
  if (!appwriteConfig.projectId) {
    console.warn('⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined. Appwrite client may not work properly.');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Validate server-side configuration (throws error if invalid)
 * Use validateServerConfigSafe() for non-throwing validation
 */
export function validateServerConfig() {
  validateAppwriteConfig();
  if (!appwriteConfig.apiKey) {
    throw new Error('APPWRITE_API_KEY is not defined in environment variables');
  }
}

/**
 * Non-throwing server validation - logs warnings instead of throwing errors
 * Safe to call at module import time
 */
export function validateServerConfigSafe(): boolean {
  const clientValid = validateAppwriteConfigSafe();
  
  if (!appwriteConfig.apiKey) {
    console.warn('⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly.');
    return false;
  }
  
  return clientValid;
}
