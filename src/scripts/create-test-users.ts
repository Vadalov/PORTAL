/**
 * Create Test Users Script
 * Creates test users in Appwrite database for development
 */

import { serverUsers } from '@/lib/appwrite/server';
import { UserRole } from '@/types/auth';
import { ID } from 'node-appwrite';

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const testUsers: TestUser[] = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin User',
    role: UserRole.ADMIN
  },
  {
    email: 'manager@test.com',
    password: 'manager123',
    name: 'Manager User',
    role: UserRole.MANAGER
  },
  {
    email: 'member@test.com',
    password: 'member123',
    name: 'Member User',
    role: UserRole.MEMBER
  },
  {
    email: 'viewer@test.com',
    password: 'viewer123',
    name: 'Viewer User',
    role: UserRole.VIEWER
  }
];

export async function createTestUsers() {
  console.log('Creating test users...');

  for (const user of testUsers) {
    try {
      // Create new user (will fail if user already exists)
      const newUser = await serverUsers.create(
        ID.unique(),
        user.email,
        undefined, // no phone
        user.password,
        user.name
      );

      // Update user labels with role
      await serverUsers.updateLabels(newUser.$id, [user.role.toLowerCase()]);

      console.log(`✅ Created user: ${user.name} (${user.role})`);

    } catch (error: unknown) {
      // Check if it's a duplicate user error
      const err = error as { code?: number; message?: string };
      if (err.code === 409 || err.message?.includes('already exists')) {
        console.log(`⚠️ User ${user.email} already exists, skipping...`);
      } else {
        console.error(`❌ Failed to create user ${user.email}:`, err.message);
      }
    }
  }

  console.log('Test users creation completed!');
}

// Run if executed directly
if (require.main === module) {
  createTestUsers().catch(console.error);
}
