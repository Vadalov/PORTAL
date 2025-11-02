/**
 * Rollback Migration Script for Dernek Yönetim Sistemi
 * Removes all created collections and test data
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
class RollbackLogger {
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

// Collections to be dropped (in reverse dependency order)
const COLLECTIONS_TO_DROP = ['meetings', 'tasks', 'donations', 'beneficiaries', 'users'];

// Test data patterns to clean
const TEST_DATA_PATTERNS = [
  'admin-001',
  'user-001',
  'viewer-001',
  'beneficiary-001',
  'beneficiary-002',
  'donor-001',
  'donor-002',
  'task-001',
  'task-002',
  'meeting-001',
  'meeting-002',
];

// Database rollback class
class DatabaseRollback {
  private client: Client;
  private databases: Databases;
  private databaseId: string;

  constructor() {
    if (!config.endpoint || !config.projectId || !apiKey) {
      throw new Error('Appwrite configuration is missing. Please check environment variables.');
    }

    this.client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);

    this.databases = new Databases(this.client);
    this.databaseId = config.databaseId;
  }

  // Delete all documents with specific pattern
  private async deleteTestData(collectionId: string): Promise<void> {
    try {
      let deletedCount = 0;
      let remaining = true;
      let offset = 0;
      const limit = 100;

      while (remaining) {
        // Get documents with test data patterns
        const result = await this.databases.listDocuments(
          this.databaseId,
          collectionId,
          [],
          limit,
          offset
        );

        if (result.documents.length === 0) {
          remaining = false;
          break;
        }

        // Filter test data documents
        const testDocuments = result.documents.filter((doc) => {
          // Check if document ID matches test patterns
          const docId = doc.$id;
          return TEST_DATA_PATTERNS.some(
            (pattern) =>
              docId.includes(pattern) ||
              (doc.userID && doc.userID.includes(pattern)) ||
              (doc.donationID && doc.donationID.includes(pattern)) ||
              (doc.taskID && doc.taskID.includes(pattern)) ||
              (doc.meetingID && doc.meetingID.includes(pattern))
          );
        });

        // Delete found test documents
        for (const doc of testDocuments) {
          try {
            await this.databases.deleteDocument(this.databaseId, collectionId, doc.$id);
            deletedCount++;
          } catch (error: any) {
            RollbackLogger.warning(`Could not delete document ${doc.$id}: ${error.message}`);
          }
        }

        offset += limit;

        // If we got fewer than limit documents, we're done
        if (result.documents.length < limit) {
          remaining = false;
        }
      }

      if (deletedCount > 0) {
        RollbackLogger.success(`✅ Deleted ${deletedCount} test documents from ${collectionId}`);
      } else {
        RollbackLogger.info(`No test data found in ${collectionId}`);
      }
    } catch (error: any) {
      RollbackLogger.error(`❌ Failed to delete test data from ${collectionId}: ${error.message}`);
      throw error;
    }
  }

  // Check if collection exists
  private async collectionExists(collectionId: string): Promise<boolean> {
    try {
      await this.databases.getCollection(this.databaseId, collectionId);
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      throw error;
    }
  }

  // Drop a collection
  private async dropCollection(collectionId: string): Promise<void> {
    try {
      if (!(await this.collectionExists(collectionId))) {
        RollbackLogger.warning(`Collection "${collectionId}" does not exist, skipping`);
        return;
      }

      // First, delete all test data
      await this.deleteTestData(collectionId);

      // Then drop the collection
      await this.databases.deleteCollection(this.databaseId, collectionId);

      RollbackLogger.success(`✅ Dropped collection "${collectionId}"`);
    } catch (error: any) {
      RollbackLogger.error(`❌ Failed to drop collection "${collectionId}": ${error.message}`);
      throw error;
    }
  }

  // Main rollback function
  public async rollback(): Promise<void> {
    RollbackLogger.info('🔄 Starting database rollback...');
    const startTime = Date.now();

    try {
      // Get all collections in the database
      RollbackLogger.info('Fetching existing collections...');
      const collections = await this.databases.listCollections(this.databaseId);

      const existingCollections = collections.collections.map((c) => c.$id);
      RollbackLogger.info(
        `Found ${existingCollections.length} collections: ${existingCollections.join(', ')}`
      );

      // Drop collections in reverse dependency order
      for (const collectionId of COLLECTIONS_TO_DROP) {
        if (existingCollections.includes(collectionId)) {
          await this.dropCollection(collectionId);
        } else {
          RollbackLogger.warning(`Collection "${collectionId}" not found, skipping`);
        }
      }

      // Check for any remaining collections that might be from our migration
      const remainingCollections = await this.databases.listCollections(this.databaseId);
      if (remainingCollections.collections.length > 0) {
        RollbackLogger.warning('⚠️  Remaining collections found:');
        for (const collection of remainingCollections.collections) {
          RollbackLogger.warning(`   - ${collection.$id}`);
        }
        RollbackLogger.warning(
          'These may need to be manually removed if they were created by the migration'
        );
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      RollbackLogger.success(`🎉 Rollback completed successfully in ${duration.toFixed(2)}s`);
      RollbackLogger.info('All migration collections and test data have been removed');
    } catch (error: any) {
      RollbackLogger.error(`💥 Rollback failed: ${error.message}`);
      throw error;
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('\n⚠️  WARNING: This will permanently delete all migration data!');
    console.log('This action cannot be undone.\n');

    // Simple confirmation prompt
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Type "ROLLBACK" to confirm deletion: ', async (answer: string) => {
      if (answer !== 'ROLLBACK') {
        RollbackLogger.info('Rollback cancelled by user');
        rl.close();
        process.exit(0);
      }

      rl.close();

      try {
        const rollback = new DatabaseRollback();
        await rollback.rollback();
      } catch (error: any) {
        RollbackLogger.error(`💥 Fatal error: ${error.message}`);
        process.exit(1);
      }
    });
  } catch (error: any) {
    RollbackLogger.error(`💥 Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run rollback if this file is executed directly
if (require.main === module) {
  main();
}

export { DatabaseRollback, COLLECTIONS_TO_DROP, TEST_DATA_PATTERNS };
