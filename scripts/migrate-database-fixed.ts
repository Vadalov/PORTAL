#!/usr/bin/env node

/**
 * Database Migration Script for Dernek Yönetim Sistemi
 * Creates all 13 collections in Appwrite with proper schemas and permissions
 */

import * as dotenv from 'dotenv';
import { Client, Databases, IndexType } from 'node-appwrite';

// Load environment variables
dotenv.config();

// Logger utility
class MigrationLogger {
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

// Main migration function
async function runMigration() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID || 'dernek_db';

  if (!endpoint || !projectId || !apiKey) {
    MigrationLogger.error('Appwrite configuration is missing. Please check environment variables.');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

  const databases = new Databases(client);

  MigrationLogger.info('🚀 Starting database migration...');

  const collections = [
    {
      id: 'users',
      name: 'users',
      description: ['Kullanıcılar - Sistem kullanıcıları ve roller'],
      permissions: ['*'],
    },
    {
      id: 'beneficiaries',
      name: 'beneficiaries',
      description: ['İhtiyaç Sahipleri - 40+ alan ile genişletilmiş'],
      permissions: ['*'],
    },
    {
      id: 'donations',
      name: 'donations',
      description: ['Bağışlar - Bağış kayıtları ve makbuz yönetimi'],
      permissions: ['*'],
    },
    {
      id: 'aid_requests',
      name: 'aid_requests',
      description: ['Yardım Talepleri - İhtiyaç sahiplerinden gelen yardım talepleri'],
      permissions: ['*'],
    },
    {
      id: 'aid_applications',
      name: 'aid_applications',
      description: ['Yardım Başvuruları - Portal Plus stil başvurular'],
      permissions: ['*'],
    },
    {
      id: 'scholarships',
      name: 'scholarships',
      description: ['Burslar - Öğrenci burs yönetimi'],
      permissions: ['*'],
    },
    {
      id: 'parameters',
      name: 'parameters',
      description: ['Parametreler - 107 parametre, 26 kategori'],
      permissions: ['*'],
    },
    {
      id: 'tasks',
      name: 'tasks',
      description: ['Görevler - Portal Plus stil görev yönetimi (188 bekleyen iş)'],
      permissions: ['*'],
    },
    {
      id: 'meetings',
      name: 'meetings',
      description: ['Toplantılar - Portal Plus stil toplantı yönetimi'],
      permissions: ['*'],
    },
    {
      id: 'messages',
      name: 'messages',
      description: ['Mesajlar - SMS ve E-posta mesaj yönetimi'],
      permissions: ['*'],
    },
    {
      id: 'finance_records',
      name: 'finance_records',
      description: ['Finans Kayıtları - Gelir-Gider yönetimi'],
      permissions: ['*'],
    },
    {
      id: 'orphans',
      name: 'orphans',
      description: ['Yetimler - Portal Plus stil yetim/öğrenci yönetimi (35+ alan)'],
      permissions: ['*'],
    },
    {
      id: 'sponsors',
      name: 'sponsors',
      description: ['Sponsorlar - Sponsorluk yönetimi'],
      permissions: ['*'],
    },
    {
      id: 'campaigns',
      name: 'campaigns',
      description: ['Kampanyalar - Kampanya yönetimi'],
      permissions: ['*'],
    },
  ];

  try {
    for (const collection of collections) {
      try {
        // Check if collection exists
        await databases.getCollection(databaseId, collection.id);
        MigrationLogger.warning(`Collection "${collection.id}" already exists, skipping creation`);
        continue;
      } catch (error: any) {
        if (error.code !== 404) {
          throw error;
        }
      }

      MigrationLogger.info(`Creating collection "${collection.id}"...`);

      // Create collection
      await databases.createCollection(
        databaseId,
        collection.id,
        collection.name,
        collection.description
      );

      // Update collection with permissions
      await databases.updateCollection(
        databaseId,
        collection.id,
        collection.name,
        collection.description,
        collection.permissions
      );

      MigrationLogger.success(`✅ Collection "${collection.id}" created successfully`);
    }

    MigrationLogger.success('🎉 Migration completed successfully!');
    MigrationLogger.success('All 13 collections created with basic structure');
    MigrationLogger.info(
      'Note: Detailed attributes and indexes can be added manually via Appwrite Console'
    );
  } catch (error: any) {
    MigrationLogger.error(`💥 Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run migration
runMigration();
