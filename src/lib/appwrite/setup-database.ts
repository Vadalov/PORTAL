/**
 * Appwrite Database Setup Script
 * Creates database, collections, and storage buckets
 * Run this script to initialize your Appwrite project
 */

import { serverDatabases, serverStorage, serverUsers, handleServerError } from './server';
import { DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS } from './config';
import { ID, Permission, Role } from 'node-appwrite';

/**
 * Create the main database
 */
export async function createDatabase() {
  return await handleServerError(async () => {
    try {
      return await serverDatabases.get(DATABASE_ID);
    } catch (error : unknown {
      if (error.code === 404) {
        console.log('Creating database...');
        return await serverDatabases.create(DATABASE_ID, 'Dernek Yönetim Sistemi');
      }
      throw error;
    }
  });
}

/**
 * Create Users collection
 */
export async function createUsersCollection() {
  return await handleServerError(async () => {
    try {
      return await serverDatabases.getCollection(DATABASE_ID, COLLECTIONS.USERS);
    } catch (error : unknown {
      if (error.code === 404) {
        console.log('Creating users collection...');
        const collection = await serverDatabases.createCollection(
          DATABASE_ID,
          COLLECTIONS.USERS,
          'Kullanıcılar',
          [
            Permission.read(Role.any()),
            Permission.create(Role.team('admins')),
            Permission.update(Role.team('admins')),
            Permission.delete(Role.team('admins'))
          ]
        );

        // Add attributes
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.USERS, 'name', 255, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.USERS, 'email', 255, true);
        await serverDatabases.createEnumAttribute(DATABASE_ID, COLLECTIONS.USERS, 'role', ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER', 'VOLUNTEER'], true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.USERS, 'avatar', 500, false);
        await serverDatabases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.USERS, 'isActive', true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.USERS, 'labels', 1000, false);

        return collection;
      }
      throw error;
    }
  });
}

/**
 * Create Beneficiaries collection
 */
export async function createBeneficiariesCollection() {
  return await handleServerError(async () => {
    try {
      return await serverDatabases.getCollection(DATABASE_ID, COLLECTIONS.BENEFICIARIES);
    } catch (error : unknown {
      if (error.code === 404) {
        console.log('Creating beneficiaries collection...');
        const collection = await serverDatabases.createCollection(
          DATABASE_ID,
          COLLECTIONS.BENEFICIARIES,
          'İhtiyaç Sahipleri',
          [
            Permission.read(Role.any()),
            Permission.create(Role.team('members')),
            Permission.update(Role.team('members')),
            Permission.delete(Role.team('admins'))
          ]
        );

        // Add attributes
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'name', 255, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'tc_no', 11, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'phone', 20, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'address', 500, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'city', 100, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'district', 100, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'neighborhood', 100, true);
        await serverDatabases.createEnumAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'income_level', ['0-3000', '3000-5000', '5000-8000', '8000+'], true);
        await serverDatabases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'family_size', true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'health_status', 200, false);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'employment_status', 200, false);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'notes', 1000, false);
        await serverDatabases.createEnumAttribute(DATABASE_ID, COLLECTIONS.BENEFICIARIES, 'status', ['active', 'inactive', 'archived'], true);

        return collection;
      }
      throw error;
    }
  });
}

/**
 * Create Donations collection
 */
export async function createDonationsCollection() {
  return await handleServerError(async () => {
    try {
      return await serverDatabases.getCollection(DATABASE_ID, COLLECTIONS.DONATIONS);
    } catch (error : unknown {
      if (error.code === 404) {
        console.log('Creating donations collection...');
        const collection = await serverDatabases.createCollection(
          DATABASE_ID,
          COLLECTIONS.DONATIONS,
          'Bağışlar',
          [
            Permission.read(Role.any()),
            Permission.create(Role.team('members')),
            Permission.update(Role.team('members')),
            Permission.delete(Role.team('admins'))
          ]
        );

        // Add attributes
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'donor_name', 255, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'donor_phone', 20, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'donor_email', 255, false);
        await serverDatabases.createFloatAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'amount', true);
        await serverDatabases.createEnumAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'currency', ['TRY', 'USD', 'EUR'], true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'donation_type', 100, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'payment_method', 100, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'donation_purpose', 200, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'notes', 1000, false);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'receipt_number', 100, true);
        await serverDatabases.createStringAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'receipt_file_id', 100, false);
        await serverDatabases.createEnumAttribute(DATABASE_ID, COLLECTIONS.DONATIONS, 'status', ['pending', 'completed', 'cancelled'], true);

        return collection;
      }
      throw error;
    }
  });
}

/**
 * Create Storage Buckets
 */
export async function createStorageBuckets() {
  const buckets = [
    { id: STORAGE_BUCKETS.DOCUMENTS, name: 'Belgeler', permissions: [Permission.read(Role.any()), Permission.create(Role.team('members'))] },
    { id: STORAGE_BUCKETS.RECEIPTS, name: 'Makbuzlar', permissions: [Permission.read(Role.any()), Permission.create(Role.team('members'))] },
    { id: STORAGE_BUCKETS.PHOTOS, name: 'Fotoğraflar', permissions: [Permission.read(Role.any()), Permission.create(Role.team('members'))] },
    { id: STORAGE_BUCKETS.REPORTS, name: 'Raporlar', permissions: [Permission.read(Role.team('members')), Permission.create(Role.team('admins'))] },
  ];

  for (const bucket of buckets) {
    try {
      await serverStorage.getBucket(bucket.id);
      console.log(`Bucket ${bucket.name} already exists`);
    } catch (error : unknown {
      if (error.code === 404) {
        console.log(`Creating bucket ${bucket.name}...`);
        await serverStorage.createBucket(bucket.id, bucket.name, bucket.permissions);
      }
    }
  }
}

/**
 * Setup complete database structure
 */
export async function setupDatabase() {
  console.log('Setting up Appwrite database...');
  
  try {
    await createDatabase();
    await createUsersCollection();
    await createBeneficiariesCollection();
    await createDonationsCollection();
    await createStorageBuckets();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}
