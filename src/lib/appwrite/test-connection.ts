/**
 * Appwrite Connection Test
 * Run this file to verify Appwrite connection
 * Usage: node -r tsx/register src/lib/appwrite/test-connection.ts
 */

// Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// Now import after env is loaded
import { Client, Account } from 'appwrite';

async function testConnection() {
  console.log('🔍 Testing Appwrite Connection...\n');

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

  // Validate configuration
  if (!endpoint || !projectId) {
    console.error('❌ Configuration error: Missing endpoint or project ID');
    console.log('   Endpoint:', endpoint || 'NOT SET');
    console.log('   Project ID:', projectId || 'NOT SET');
    return;
  }

  // 1. Check configuration
  console.log('📋 Configuration:');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project ID: ${projectId}\n`);

  // Create client
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const account = new Account(client);

  // 2. Test connection with account endpoint
  console.log('🔌 Testing connection...');

  // 3. Test account endpoint (will fail if no session, but proves connection works)
  try {
    console.log('\n👤 Testing account endpoint...');
    const accountData = await account.get();
    console.log('   ✅ Account data retrieved:', accountData);
  } catch (error : unknown {
    // Expected to fail if not logged in
    if (error.code === 401) {
      console.log('   ℹ️  No active session (expected for fresh setup)');
      console.log('   ✅ Connection to Appwrite is working!');
    } else {
      console.error('   ❌ Unexpected error:', error.message);
    }
  }

  console.log('\n✨ Connection test complete!\n');
  console.log('Next steps:');
  console.log('  1. Run setup-mcp-appwrite.sh to configure MCP');
  console.log('  2. Create database and collections via MCP');
  console.log('  3. Continue with Sprint 2 (Authentication)');
}

// Run test if executed directly
if (require.main === module) {
  testConnection().catch(console.error);
}

export { testConnection };
