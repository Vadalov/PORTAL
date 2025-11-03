#!/usr/bin/env tsx
/**
 * Test script to verify Convex migration
 * 
 * This script tests that:
 * 1. Convex functions are properly deployed
 * 2. API routes correctly use Convex
 * 3. Data can be created and retrieved
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL is not set in .env.local');
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

async function testUsers() {
  console.log('\n📋 Testing Users API...');
  
  try {
    // Test list
    const users = await convex.query(api.users.list);
    console.log(`✅ Users list: ${users.length} users found`);
    
    // Test create
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      role: 'VIEWER',
      isActive: true,
    };
    
    const created = await convex.mutation(api.users.create, testUser);
    console.log(`✅ User created: ${created._id}`);
    
    // Test get
    const retrieved = await convex.query(api.users.get, { id: created._id });
    if (retrieved?.email === testUser.email) {
      console.log(`✅ User retrieved: ${retrieved.email}`);
    } else {
      console.error('❌ User retrieval failed');
    }
    
    // Test update
    const updated = await convex.mutation(api.users.update, {
      id: created._id,
      name: 'Updated Test User',
    });
    if (updated?.name === 'Updated Test User') {
      console.log(`✅ User updated: ${updated.name}`);
    } else {
      console.error('❌ User update failed');
    }
    
    // Test remove
    await convex.mutation(api.users.remove, { id: created._id });
    console.log(`✅ User deleted`);
    
    return true;
  } catch (error) {
    console.error('❌ Users API test failed:', error);
    return false;
  }
}

async function testBeneficiaries() {
  console.log('\n📋 Testing Beneficiaries API...');
  
  try {
    // Test list
    const response = await convex.query(api.beneficiaries.list, { limit: 10 });
    console.log(`✅ Beneficiaries list: ${response.total || 0} total, ${response.documents?.length || 0} returned`);
    
    // Test create
    const testBeneficiary = {
      name: 'Test Beneficiary',
      tc_no: `1234567890${Date.now() % 100}`.substring(0, 11),
      phone: '5551234567',
      address: 'Test Address',
      city: 'Istanbul',
      district: 'Test District',
      neighborhood: 'Test Neighborhood',
      family_size: 3,
      status: 'TASLAK' as const,
    };
    
    const created = await convex.mutation(api.beneficiaries.create, testBeneficiary);
    console.log(`✅ Beneficiary created: ${created._id}`);
    
    // Test get
    const retrieved = await convex.query(api.beneficiaries.get, { id: created._id });
    if (retrieved?.name === testBeneficiary.name) {
      console.log(`✅ Beneficiary retrieved: ${retrieved.name}`);
    } else {
      console.error('❌ Beneficiary retrieval failed');
    }
    
    // Test remove
    await convex.mutation(api.beneficiaries.remove, { id: created._id });
    console.log(`✅ Beneficiary deleted`);
    
    return true;
  } catch (error) {
    console.error('❌ Beneficiaries API test failed:', error);
    return false;
  }
}

async function testDonations() {
  console.log('\n📋 Testing Donations API...');
  
  try {
    // Test list
    const response = await convex.query(api.donations.list, { limit: 10 });
    console.log(`✅ Donations list: ${response.total || 0} total, ${response.documents?.length || 0} returned`);
    
    // Test create
    const testDonation = {
      donor_name: 'Test Donor',
      donor_phone: '5551234567',
      amount: 1000,
      currency: 'TRY' as const,
      donation_type: 'cash',
      payment_method: 'cash',
      status: 'pending' as const,
    };
    
    const created = await convex.mutation(api.donations.create, testDonation);
    console.log(`✅ Donation created: ${created._id}`);
    
    // Test get
    const retrieved = await convex.query(api.donations.get, { id: created._id });
    if (retrieved?.donor_name === testDonation.donor_name) {
      console.log(`✅ Donation retrieved: ${retrieved.donor_name}`);
    } else {
      console.error('❌ Donation retrieval failed');
    }
    
    // Test remove
    await convex.mutation(api.donations.remove, { id: created._id });
    console.log(`✅ Donation deleted`);
    
    return true;
  } catch (error) {
    console.error('❌ Donations API test failed:', error);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n📋 Testing Next.js API Routes...');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    // Test beneficiaries endpoint
    const beneficiariesRes = await fetch(`${baseUrl}/api/beneficiaries?limit=5`);
    const beneficiariesData = await beneficiariesRes.json();
    
    if (beneficiariesData.success) {
      console.log(`✅ GET /api/beneficiaries: ${beneficiariesData.total || 0} beneficiaries`);
    } else {
      console.error('❌ GET /api/beneficiaries failed:', beneficiariesData.error);
      return false;
    }
    
    // Test donations endpoint
    const donationsRes = await fetch(`${baseUrl}/api/donations?limit=5`);
    const donationsData = await donationsRes.json();
    
    if (donationsData.success) {
      console.log(`✅ GET /api/donations: ${donationsData.total || 0} donations`);
    } else {
      console.error('❌ GET /api/donations failed:', donationsData.error);
      return false;
    }
    
    // Test tasks endpoint
    const tasksRes = await fetch(`${baseUrl}/api/tasks?limit=5`);
    const tasksData = await tasksRes.json();
    
    if (tasksData.success) {
      console.log(`✅ GET /api/tasks: ${tasksData.total || 0} tasks`);
    } else {
      console.error('❌ GET /api/tasks failed:', tasksData.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ API endpoints test failed:', error);
    console.warn('⚠️  Make sure the Next.js dev server is running (npm run dev)');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Convex Migration Tests...');
  console.log(`📍 Convex URL: ${CONVEX_URL}`);
  
  const results = {
    users: false,
    beneficiaries: false,
    donations: false,
    apiEndpoints: false,
  };
  
  // Test Convex functions directly
  results.users = await testUsers();
  results.beneficiaries = await testBeneficiaries();
  results.donations = await testDonations();
  
  // Test Next.js API routes (optional, requires dev server)
  try {
    results.apiEndpoints = await testAPIEndpoints();
  } catch (_error) {
    console.warn('⚠️  API endpoints test skipped (dev server may not be running)');
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`  Users: ${results.users ? '✅' : '❌'}`);
  console.log(`  Beneficiaries: ${results.beneficiaries ? '✅' : '❌'}`);
  console.log(`  Donations: ${results.donations ? '✅' : '❌'}`);
  console.log(`  API Endpoints: ${results.apiEndpoints ? '✅' : '⚠️'}`);
  
  const allPassed = results.users && results.beneficiaries && results.donations;
  
  if (allPassed) {
    console.log('\n✅ All core tests passed! Migration looks good.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);

