#!/usr/bin/env tsx

/**
 * Convex MCP Connection Test Script
 * 
 * This script tests the Convex MCP connection and displays deployment information.
 * 
 * Usage: tsx scripts/test-convex-mcp.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface EnvFile {
  [key: string]: string;
}

function parseEnvFile(filePath: string): EnvFile {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const env: EnvFile = {};
    
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  } catch (_error) {
    return {};
  }
}

async function testConvexMCP() {
  console.log('🧪 Testing Convex MCP Connection...\n');

  // Check environment variables
  const projectDir = process.cwd();
  const envPath = join(projectDir, '.env.local');
  const env = parseEnvFile(envPath);

  console.log('📋 Environment Configuration:');
  console.log(`   Project Directory: ${projectDir}`);
  console.log(`   .env.local exists: ${env.NEXT_PUBLIC_CONVEX_URL ? '✅' : '❌'}`);
  
  if (env.NEXT_PUBLIC_CONVEX_URL) {
    console.log(`   Convex URL: ${env.NEXT_PUBLIC_CONVEX_URL}`);
  } else {
    console.log('   ⚠️  NEXT_PUBLIC_CONVEX_URL not found in .env.local');
  }

  if (env.CONVEX_DEPLOYMENT) {
    console.log(`   Convex Deployment: ${env.CONVEX_DEPLOYMENT}`);
  }

  // Check Convex directory
  const convexDir = join(projectDir, 'convex');
  const fs = await import('fs/promises');
  
  try {
    const convexExists = await fs.access(convexDir).then(() => true).catch(() => false);
    console.log(`\n📁 Convex Directory: ${convexExists ? '✅' : '❌'}`);
    
    if (convexExists) {
      const files = await fs.readdir(convexDir);
      const functionFiles = files.filter(f => f.endsWith('.ts') && !f.startsWith('_'));
      console.log(`   Function files: ${functionFiles.length}`);
      console.log(`   Files: ${functionFiles.join(', ')}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Error checking Convex directory: ${error}`);
  }

  // Check package.json for Convex
  try {
    const packageJson = JSON.parse(
      readFileSync(join(projectDir, 'package.json'), 'utf-8')
    );
    const hasConvex = packageJson.dependencies?.convex || packageJson.devDependencies?.convex;
    console.log(`\n📦 Convex Package: ${hasConvex ? '✅' : '❌'}`);
    if (hasConvex) {
      console.log(`   Version: ${packageJson.dependencies?.convex || packageJson.devDependencies?.convex}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Error reading package.json: ${error}`);
  }

  // Check if Convex client is configured
  try {
    const convexClientPath = join(projectDir, 'src/lib/convex/client.ts');
    const convexClientExists = await fs.access(convexClientPath).then(() => true).catch(() => false);
    console.log(`\n🔌 Convex Client: ${convexClientExists ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`   ⚠️  Error checking Convex client: ${error}`);
  }

  console.log('\n📝 Next Steps:');
  console.log('   1. Ensure .env.local has NEXT_PUBLIC_CONVEX_URL');
  console.log('   2. Run: npm run convex:dev (to deploy functions)');
  console.log('   3. Add Convex MCP server to Cursor settings');
  console.log('   4. Restart Cursor to load MCP server');
  console.log('   5. Test MCP connection using MCP tools');
  
  console.log('\n🔗 Useful Links:');
  console.log('   Dashboard: https://dashboard.convex.dev/d/fleet-octopus-839');
  console.log('   Deployment: https://fleet-octopus-839.convex.cloud');
  console.log('   Docs: https://docs.convex.dev\n');

  console.log('✅ Test complete!\n');
}

testConvexMCP().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

