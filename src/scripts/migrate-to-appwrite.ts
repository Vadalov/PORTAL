/**
 * Migration Script: Mock Data to Appwrite
 * Migrates existing mock JSON data to Appwrite collections
 */

import { serverDatabases, serverUsers } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { ID } from 'node-appwrite';
import { createUserLabels } from '@/lib/appwrite/permissions';
import { UserRole } from '@/types/auth';

// Mock data is no longer available, we'll only create test users

/**
 * Migrate users from mock data to Appwrite
 * Note: Mock data is no longer available, this function is kept for reference
 */
export async function migrateUsers() {
  console.log('Mock users migration skipped - data no longer available');
  console.log('Use createTestUsers() instead');
}

/**
 * Migrate beneficiaries from mock data to Appwrite
 * Note: Mock data is no longer available, this function is kept for reference
 */
export async function migrateBeneficiaries() {
  console.log('Mock beneficiaries migration skipped - data no longer available');
}

/**
 * Migrate donations from mock data to Appwrite
 * Note: Mock data is no longer available, this function is kept for reference
 */
export async function migrateDonations() {
  console.log('Mock donations migration skipped - data no longer available');
}

/**
 * Create test users for development
 */
export async function createTestUsers() {
  console.log('Creating test users...');

  const testUsers = [
    {
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
    {
      email: 'manager@test.com',
      password: 'manager123',
      name: 'Manager User',
      role: UserRole.MANAGER,
    },
    {
      email: 'member@test.com',
      password: 'member123',
      name: 'Member User',
      role: UserRole.MEMBER,
    },
    {
      email: 'viewer@test.com',
      password: 'viewer123',
      name: 'Viewer User',
      role: UserRole.VIEWER,
    },
  ];

  for (const user of testUsers) {
    try {
      // Create user in Appwrite Auth
      const appwriteUser = await serverUsers.create(
        ID.unique(),
        user.email,
        user.password,
        user.name
      );

      // Create user document in database
      await serverDatabases.createDocument(DATABASE_ID, COLLECTIONS.USERS, appwriteUser.$id, {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: true,
        labels: createUserLabels(user.role),
      });

      console.log(`Created test user: ${user.name} (${user.email})`);
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 409) {
        console.log(`Test user ${user.email} already exists, skipping...`);
      } else {
        console.error(`Error creating test user ${user.name}:`, err.message);
      }
    }
  }

  console.log('Test users creation completed!');
}

/**
 * Run complete migration
 */
export async function runMigration() {
  console.log('Starting Appwrite migration...');

  try {
    await migrateUsers();
    await migrateBeneficiaries();
    await migrateDonations();
    await createTestUsers();

    console.log('Migration completed successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('Manager: manager@test.com / manager123');
    console.log('Member: member@test.com / member123');
    console.log('Viewer: viewer@test.com / viewer123');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration().catch(console.error);
}
