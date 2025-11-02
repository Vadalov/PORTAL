#!/usr/bin/env node

/**
 * Appwrite Configuration Validator
 * Validates the appwrite.json file structure
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../appwrite.json');

console.log('🔍 Validating Appwrite Configuration...\n');

// Read the config file
let config;
try {
  const content = fs.readFileSync(CONFIG_FILE, 'utf8');
  config = JSON.parse(content);
  console.log('✅ Valid JSON format');
} catch (error) {
  console.error('❌ Invalid JSON format:', error.message);
  process.exit(1);
}

// Check required root fields
const requiredRootFields = ['projectId', 'projectName', 'databases', 'storage'];
let hasErrors = false;

console.log('\n📋 Checking root fields...');
requiredRootFields.forEach((field) => {
  if (config[field] === undefined) {
    console.error(`❌ Missing required field: ${field}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${field}: present`);
  }
});

// Check databases structure
if (config.databases && Array.isArray(config.databases)) {
  console.log('\n📚 Checking databases...');
  console.log(`✅ Found ${config.databases.length} database(s)`);

  config.databases.forEach((db, dbIndex) => {
    console.log(`\n  Database ${dbIndex + 1}: ${db.name || 'unnamed'}`);

    if (!db.databaseId) {
      console.error('  ❌ Missing databaseId');
      hasErrors = true;
    } else {
      console.log(`  ✅ databaseId: ${db.databaseId}`);
    }

    if (db.collections && Array.isArray(db.collections)) {
      console.log(`  ✅ Collections: ${db.collections.length}`);

      // Validate each collection
      db.collections.forEach((collection, colIndex) => {
        if (!collection.$id) {
          console.error(`    ❌ Collection ${colIndex + 1}: Missing $id`);
          hasErrors = true;
        }
        if (!collection.name) {
          console.error(`    ❌ Collection ${colIndex + 1}: Missing name`);
          hasErrors = true;
        }
        if (!collection.attributes || !Array.isArray(collection.attributes)) {
          console.error(`    ❌ Collection ${colIndex + 1}: Missing or invalid attributes`);
          hasErrors = true;
        }
      });
    } else {
      console.error('  ❌ Missing or invalid collections array');
      hasErrors = true;
    }
  });
} else {
  console.error('❌ Missing or invalid databases array');
  hasErrors = true;
}

// Check storage structure
if (config.storage && config.storage.buckets && Array.isArray(config.storage.buckets)) {
  console.log('\n💾 Checking storage buckets...');
  console.log(`✅ Found ${config.storage.buckets.length} bucket(s)`);

  config.storage.buckets.forEach((bucket, index) => {
    console.log(`  Bucket ${index + 1}: ${bucket.name || 'unnamed'}`);
    if (!bucket.$id) {
      console.error('    ❌ Missing $id');
      hasErrors = true;
    } else {
      console.log(`    ✅ $id: ${bucket.$id}`);
    }
  });
} else {
  console.error('❌ Missing or invalid storage.buckets array');
  hasErrors = true;
}

// Check projectId is not empty
if (config.projectId === '') {
  console.log(
    '\n⚠️  Warning: projectId is empty. Update it with your Appwrite project ID before deployment.'
  );
  console.log(
    '   You can update it in appwrite.json or the deploy script will do it automatically.'
  );
}

// Summary
console.log(`\n${'='.repeat(50)}`);
if (hasErrors) {
  console.error('❌ Validation failed! Please fix the errors above.');
  process.exit(1);
} else {
  console.log('✅ Configuration is valid!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update projectId in appwrite.json or .env.local');
  console.log('   2. Run: npm run appwrite:setup (for automatic setup)');
  console.log('   3. Or: npm run appwrite:deploy:quick (for interactive deployment)');
  process.exit(0);
}
