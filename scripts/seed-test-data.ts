/**
 * Test Data Seeding Script for Dernek Yönetim Sistemi
 * Inserts sample data into Appwrite collections
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Query } from 'node-appwrite';

// Load environment variables
dotenv.config();

// Appwrite configuration
const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  apiKey: process.env.APPWRITE_API_KEY || '',
  databaseId: process.env.NEXT_PUBLIC_DATABASE_ID || 'dernek_db',
};

// Logger utility
class SeederLogger {
  private static log(
    prefix: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    const timestamp = new Date().toISOString();
    const color = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
    }[type];

    const reset = '\x1b[0m';
    console.log(`${color}[${timestamp}] ${prefix}: ${message}${reset}`);
  }

  static info(message: string) {
    this.log('INFO', message, 'info');
  }
  static success(message: string) {
    this.log('SUCCESS', message, 'success');
  }
  static warning(message: string) {
    this.log('WARNING', message, 'warning');
  }
  static error(message: string) {
    this.log('ERROR', message, 'error');
  }
}

// Sample data generators
const generateSampleData = {
  // Users sample data
  users: () => [
    {
      userID: 'admin-001',
      userName: 'Yönetici Admin',
      role: 'admin',
      fullName: 'Admin Kullanıcı',
      eMail: 'admin@dernek.com',
      avatarUrl: null,
      disabled: false,
      createdAt: new Date().toISOString(),
    },
    {
      userID: 'user-001',
      userName: 'yardim-ekibi',
      role: 'user',
      fullName: 'Yardım Ekibi Üyesi',
      eMail: 'yardim@dernek.com',
      avatarUrl: null,
      disabled: false,
      createdAt: new Date().toISOString(),
    },
    {
      userID: 'viewer-001',
      userName: 'gözlemci',
      role: 'viewer',
      fullName: 'Gözlemci Kullanıcı',
      eMail: 'gozlemci@dernek.com',
      avatarUrl: null,
      disabled: false,
      createdAt: new Date().toISOString(),
    },
  ],

  // Beneficiaries sample data
  beneficiaries: () => [
    {
      userID: 'beneficiary-001',
      mode: 'rural',
      name: 'Ahmet Yılmaz',
      mudurluk: 'Ankara İl Dernek',
      phone: '0532 123 4567',
      address: 'Kızılay Mahallesi, Çankaya/Ankara',
      need: 'Gıda Yardımı',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      userID: 'beneficiary-002',
      mode: 'urban',
      name: 'Fatma Demir',
      mudurluk: 'İstanbul İl Dernek',
      phone: '0533 987 6543',
      address: 'Kadıköy Mahallesi, Kadıköy/İstanbul',
      need: 'Eğitim Yardımı',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  // Donations sample data
  donations: () => [
    {
      donationID: 'donation-001',
      userID: 'donor-001',
      amount: 500.0,
      campaign: 'Ramazan Yardım Kampanyası',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
    {
      donationID: 'donation-002',
      userID: 'donor-002',
      amount: 1000.0,
      campaign: 'Yetim Destek Kampanyası',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  ],

  // Tasks sample data
  tasks: () => [
    {
      taskID: 'task-001',
      title: 'Yeni bağışçı araştırması',
      description: 'Bölgedeki potansiyel bağışçıların araştırılması',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      taskID: 'task-002',
      title: 'Toplantı hazırlıkları',
      description: 'Aylık toplantı için gündem hazırlama',
      status: 'completed',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  // Meetings sample data
  meetings: () => [
    {
      meetingID: 'meeting-001',
      title: 'Aylık Yönetim Kurulu Toplantısı',
      description: 'Dernek faaliyetlerinin değerlendirilmesi',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      location: 'Dernek Merkezi',
      mode: 'in-person',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    },
    {
      meetingID: 'meeting-002',
      title: 'Proje Değerlendirme Toplantısı',
      description: 'Devam eden projelerin gözden geçirilmesi',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Online (Zoom)',
      mode: 'online',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    },
  ],
};

// Database seeding class
class DatabaseSeeder {
  private client: Client;
  private databases: Databases;
  private databaseId: string;

  constructor() {
    if (!config.endpoint || !config.projectId || !config.apiKey) {
      throw new Error('Appwrite configuration is missing. Please check environment variables.');
    }

    this.client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);

    this.databases = new Databases(this.client);
    this.databaseId = config.databaseId;
  }

  // Check if data already exists
  private async dataExists(
    collectionId: string,
    searchField: string,
    searchValue: string
  ): Promise<boolean> {
    try {
      const result = await this.databases.listDocuments(this.databaseId, collectionId, [
        Query.equal(searchField, searchValue),
      ]);
      return result.total > 0;
    } catch {
      return false;
    }
  }

  // Seed a single collection
  private async seedCollection(
    collectionId: string,
    data: Record<string, unknown>[],
    searchField: string = 'userID'
  ): Promise<void> {
    try {
      let seededCount = 0;
      let skippedCount = 0;

      for (const item of data) {
        // Check if data already exists
        if (await this.dataExists(collectionId, searchField, item[searchField] as string)) {
          SeederLogger.warning(`Skipping existing ${collectionId}: ${item[searchField]}`);
          skippedCount++;
          continue;
        }

        // Create document
        await this.databases.createDocument(
          this.databaseId,
          collectionId,
          item[searchField] as string,
          item
        );

        seededCount++;
      }

      SeederLogger.success(`✅ ${collectionId}: ${seededCount} seeded, ${skippedCount} skipped`);
    } catch (error) {
      const err = error as { message?: string };
      SeederLogger.error(`❌ Failed to seed ${collectionId}: ${err.message}`);
      throw error;
    }
  }

  // Main seeding function
  public async seed(): Promise<void> {
    SeederLogger.info('🌱 Starting database seeding...');
    const startTime = Date.now();

    try {
      // Seed users first (dependency for other collections)
      await this.seedCollection('users', generateSampleData.users(), 'userID');

      // Seed other collections
      await this.seedCollection('beneficiaries', generateSampleData.beneficiaries(), 'userID');
      await this.seedCollection('donations', generateSampleData.donations(), 'donationID');
      await this.seedCollection('tasks', generateSampleData.tasks(), 'taskID');
      await this.seedCollection('meetings', generateSampleData.meetings(), 'meetingID');

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      SeederLogger.success(`🎉 Seeding completed successfully in ${duration.toFixed(2)}s`);
      SeederLogger.info('Sample data has been added to all collections');
    } catch (error) {
      const err = error as { message?: string };
      SeederLogger.error(`💥 Seeding failed: ${err.message}`);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    const seeder = new DatabaseSeeder();
    await seeder.seed();
  } catch (error) {
    const err = error as { message?: string };
    SeederLogger.error(`💥 Fatal error: ${err.message}`);
    process.exit(1);
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  main();
}

export { DatabaseSeeder, generateSampleData };
