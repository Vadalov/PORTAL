/**
 * Appwrite Backend Setup Script
 * Creates all necessary collections and storage buckets
 * 
 * Usage: npx tsx scripts/setup-appwrite.ts
 */

import { Client, Databases, Storage, Permission, Role, IndexType } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Type definitions
interface AttributeDefinition {
  key: string;
  type: string;
  required?: boolean;
  array?: boolean;
  default?: any;
  options?: string[];
}

interface IndexDefinition {
  key: string;
  type: string;
  attributes: string[];
  orders?: string[];
}

// Appwrite SDK type constants
const AttributeType = {
  String: 'string',
  Integer: 'integer',
  Double: 'double',
  Boolean: 'boolean',
  DateTime: 'datetime',
  Email: 'email',
  URL: 'url',
  IP: 'ip',
  Enum: 'enum',
} as const;

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || 'dernek_db';

// Collection IDs
const COLLECTIONS = {
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
const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  RECEIPTS: 'receipts',
  PHOTOS: 'photos',
  REPORTS: 'reports',
} as const;

async function setupDatabase() {
  try {
    console.log('📦 Creating database...');
    
    try {
      await databases.get(DATABASE_ID);
      console.log(`✅ Database '${DATABASE_ID}' already exists`);
    } catch (error: unknown) {
      const appwriteError = error as { code?: number; message?: string };
      if (appwriteError.code === 404) {
        const db = await databases.create(DATABASE_ID, DATABASE_ID);
        console.log(`✅ Database '${DATABASE_ID}' created`);
      } else {
        throw error;
      }
    }
  } catch (error: unknown) {
    const appwriteError = error as { message?: string };
    console.error('❌ Database setup failed:', appwriteError.message || error);
    throw error;
  }
}

async function createCollection(collectionId: string, collectionName: string, attributes: AttributeDefinition[], indexes: IndexDefinition[] = []) {
  try {
    // Check if collection exists
    try {
      await databases.getCollection(DATABASE_ID, collectionId);
      console.log(`✅ Collection '${collectionId}' already exists`);
      return;
    } catch (error: unknown) {
      const appwriteError = error as { code?: number };
      if (appwriteError.code !== 404) throw error;
    }

    // Create collection
    console.log(`📝 Creating collection '${collectionId}'...`);
    await databases.createCollection(
      DATABASE_ID,
      collectionId,
      collectionName,
      // Permissions for all roles
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    // Add attributes
    for (const attr of attributes) {
      try {
        // Use the low-level client.call to create attributes because the node-appwrite SDK exposes per-type methods
        const body: any = {
          type: attr.type,
          key: attr.key,
          required: attr.required || false,
          array: attr.array || false,
        };
        if (attr.default !== undefined) body.default = attr.default;
        if (attr.options !== undefined) body.options = attr.options;

        await client.call(
          'post',
          `/databases/${DATABASE_ID}/collections/${collectionId}/attributes` as any,
          { 'content-type': 'application/json' },
          body
        );

        console.log(`  ✓ Attribute '${attr.key}' created`);
      } catch (error: any) {
        // Handle both SDK-style error.code and fetch-style response status
        const appwriteError = error as { code?: number; response?: { status?: number }; message?: string };
        const status = appwriteError.code ?? appwriteError.response?.status;
        if (status !== 409) { // 409 = attribute already exists
          console.warn(`  ⚠ Attribute '${attr.key}': ${appwriteError.message || error}`);
        }
      }
    }

    // Add indexes
    for (const index of indexes) {
      try {
        await databases.createIndex(DATABASE_ID, collectionId, index.key, index.type as any, index.attributes, index.orders || undefined);
        console.log(`  ✓ Index '${index.key}' created`);
      } catch (error: any) {
        if (error.code !== 409) { // 409 = index already exists
          console.warn(`  ⚠ Index '${index.key}': ${error.message}`);
        }
      }
    }

    console.log(`✅ Collection '${collectionId}' ready`);
  } catch (error: any) {
    console.error(`❌ Collection '${collectionId}' setup failed:`, error.message);
    throw error;
  }
}

async function createBucket(bucketId: string, bucketName: string) {
  try {
    try {
      await storage.getBucket(bucketId);
      console.log(`✅ Bucket '${bucketId}' already exists`);
      return;
    } catch (error: any) {
      if (error.code !== 404) throw error;
    }

    console.log(`📦 Creating bucket '${bucketId}'...`);
    await storage.createBucket(
      bucketId,
      bucketName,
      // Permissions - tighten defaults: only authenticated users
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // not encrypted
      false, // antivirus disabled
      20 * 1024 * 1024, // 20 MB max file size (stricter default)
      ['jpg', 'jpeg', 'png', 'pdf'] // allowed extensions (stricter default)
    );
    console.log(`✅ Bucket '${bucketId}' created`);
  } catch (error: any) {
    console.error(`❌ Bucket '${bucketId}' setup failed:`, error.message);
    throw error;
  }
}

async function setupCollections() {
  // Users collection
  await createCollection(COLLECTIONS.USERS, 'Users', [
    { key: 'name', type: AttributeType.String, required: true },
    { key: 'email', type: AttributeType.String, required: true },
    { key: 'role', type: AttributeType.String, required: true },
    { key: 'avatar', type: AttributeType.String, required: false },
    { key: 'isActive', type: AttributeType.Boolean, required: true, default: true },
    { key: 'labels', type: AttributeType.String, required: false, array: true },
  ]);

  // Beneficiaries collection
  await createCollection(COLLECTIONS.BENEFICIARIES, 'Beneficiaries', [
    { key: 'photo', type: AttributeType.String, required: false },
    { key: 'sponsorType', type: AttributeType.String, required: true },
    { key: 'firstName', type: AttributeType.String, required: true },
    { key: 'lastName', type: AttributeType.String, required: true },
    { key: 'nationality', type: AttributeType.String, required: false },
    { key: 'identityNumber', type: AttributeType.String, required: false },
    { key: 'mernisCheck', type: AttributeType.Boolean, required: false, default: false },
    { key: 'category', type: AttributeType.String, required: true },
    { key: 'fundRegion', type: AttributeType.String, required: false },
    { key: 'fileConnection', type: AttributeType.String, required: false },
    { key: 'fileNumber', type: AttributeType.String, required: false },
    { key: 'mobilePhone', type: AttributeType.String, required: false },
    { key: 'email', type: AttributeType.String, required: false },
    { key: 'familyMemberCount', type: AttributeType.Integer, required: false },
    { key: 'country', type: AttributeType.String, required: false },
    { key: 'city', type: AttributeType.String, required: false },
    { key: 'district', type: AttributeType.String, required: false },
    { key: 'neighborhood', type: AttributeType.String, required: false },
    { key: 'address', type: AttributeType.String, required: false },
    { key: 'status', type: AttributeType.String, required: true },
    { key: 'createdBy', type: AttributeType.String, required: false },
    { key: 'updatedBy', type: AttributeType.String, required: false },
  ]);

  // Donations collection
  await createCollection(COLLECTIONS.DONATIONS, 'Donations', [
    { key: 'donor_name', type: AttributeType.String, required: true },
    { key: 'donor_phone', type: AttributeType.String, required: false },
    { key: 'donor_email', type: AttributeType.String, required: false },
    { key: 'amount', type: AttributeType.Double, required: true },
    { key: 'currency', type: AttributeType.String, required: true },
    { key: 'donation_type', type: AttributeType.String, required: false },
    { key: 'payment_method', type: AttributeType.String, required: false },
    { key: 'donation_purpose', type: AttributeType.String, required: false },
    { key: 'notes', type: AttributeType.String, required: false },
    { key: 'receipt_number', type: AttributeType.String, required: false },
    { key: 'receipt_file_id', type: AttributeType.String, required: false },
    { key: 'status', type: AttributeType.String, required: true },
  ]);

  // Tasks collection
  await createCollection(COLLECTIONS.TASKS, 'Tasks', [
    { key: 'title', type: AttributeType.String, required: true },
    { key: 'description', type: AttributeType.String, required: false },
    { key: 'status', type: AttributeType.String, required: true, default: 'pending' },
    { key: 'priority', type: AttributeType.String, required: false },
    { key: 'assigned_to', type: AttributeType.String, required: false },
    { key: 'category', type: AttributeType.String, required: false },
    { key: 'completed_at', type: AttributeType.DateTime, required: false },
    { key: 'is_read', type: AttributeType.Boolean, required: false, default: false },
  ]);

  // Meetings collection
  await createCollection(COLLECTIONS.MEETINGS, 'Meetings', [
    { key: 'title', type: AttributeType.String, required: true },
    { key: 'description', type: AttributeType.String, required: false },
    { key: 'meeting_date', type: AttributeType.DateTime, required: true },
    { key: 'location', type: AttributeType.String, required: false },
    { key: 'organizer', type: AttributeType.String, required: true },
    { key: 'participants', type: AttributeType.String, required: false, array: true },
    { key: 'status', type: AttributeType.String, required: true, default: 'scheduled' },
    { key: 'meeting_type', type: AttributeType.String, required: false },
  ]);

  // Messages collection
  await createCollection(COLLECTIONS.MESSAGES, 'Messages', [
    { key: 'subject', type: AttributeType.String, required: true },
    { key: 'content', type: AttributeType.String, required: true },
    { key: 'message_type', type: AttributeType.String, required: true },
    { key: 'sender', type: AttributeType.String, required: true },
    { key: 'recipients', type: AttributeType.String, required: false, array: true },
    { key: 'status', type: AttributeType.String, required: true, default: 'draft' },
    { key: 'is_bulk', type: AttributeType.Boolean, required: false, default: false },
    { key: 'sent_at', type: AttributeType.DateTime, required: false },
  ]);

  // Aid Applications collection
  await createCollection(COLLECTIONS.AID_APPLICATIONS, 'Aid Applications', [
    { key: 'applicant_name', type: AttributeType.String, required: true },
    { key: 'application_date', type: AttributeType.DateTime, required: true },
    { key: 'stage', type: AttributeType.String, required: true },
    { key: 'status', type: AttributeType.String, required: true },
    { key: 'description', type: AttributeType.String, required: false },
  ]);

  // Parameters collection (for enums and system parameters)
  await createCollection(COLLECTIONS.PARAMETERS, 'Parameters', [
    { key: 'category', type: AttributeType.String, required: true },
    { key: 'name_tr', type: AttributeType.String, required: true },
    { key: 'name_en', type: AttributeType.String, required: false },
    { key: 'value', type: AttributeType.String, required: true },
    { key: 'order', type: AttributeType.Integer, required: false },
    { key: 'is_active', type: AttributeType.Boolean, required: true, default: true },
  ]);
}

async function setupStorage() {
  await createBucket(STORAGE_BUCKETS.DOCUMENTS, 'Documents');
  await createBucket(STORAGE_BUCKETS.RECEIPTS, 'Receipts');
  await createBucket(STORAGE_BUCKETS.PHOTOS, 'Photos');
  await createBucket(STORAGE_BUCKETS.REPORTS, 'Reports');
}

async function main() {
  console.log('🚀 Starting Appwrite backend setup...\n');

  try {
    // Validate configuration
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT not configured');
    }
    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID not configured');
    }
    if (!process.env.APPWRITE_API_KEY) {
      throw new Error('APPWRITE_API_KEY not configured');
    }

    console.log('✅ Configuration loaded\n');

    // Setup database
    await setupDatabase();
    console.log('');

    // Setup collections
    console.log('📚 Setting up collections...\n');
    await setupCollections();
    console.log('');

    // Setup storage
    console.log('💾 Setting up storage buckets...\n');
    await setupStorage();
    console.log('');

    console.log('✨ Appwrite backend setup completed successfully!\n');
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
