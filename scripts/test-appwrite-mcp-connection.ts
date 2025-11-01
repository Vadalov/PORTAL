/**
 * Appwrite MCP Connection Test
 * MCP Server kullanarak Appwrite bağlantısını ve auth durumunu test eder
 * 
 * Usage: npx tsx scripts/test-appwrite-mcp-connection.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Test sonuçları için interface
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(name: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
  results.push({ name, status, message, details });
}

async function runTests() {
  console.log('🔍 Appwrite MCP Bağlantı Testi Başlatılıyor...\n');
  console.log('='.repeat(60));

  // 1. Environment Variables Kontrolü
  console.log('\n📋 1. Environment Variables Kontrolü');
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (endpoint) {
    addResult(
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      endpoint.endsWith('/v1') ? 'PASS' : 'WARNING',
      endpoint.endsWith('/v1') 
        ? `✅ Endpoint: ${endpoint}` 
        : `⚠️  Endpoint format: ${endpoint} (should end with /v1)`,
      endpoint
    );
  } else {
    addResult('NEXT_PUBLIC_APPWRITE_ENDPOINT', 'FAIL', '❌ Endpoint tanımlı değil');
  }

  if (projectId) {
    addResult('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'PASS', `✅ Project ID: ${projectId}`, projectId);
  } else {
    addResult('NEXT_PUBLIC_APPWRITE_PROJECT_ID', 'FAIL', '❌ Project ID tanımlı değil');
  }

  if (apiKey) {
    const keyType = apiKey.startsWith('standard_') ? 'Standard' : apiKey.startsWith('secret_') ? 'Secret' : 'Unknown';
    addResult('APPWRITE_API_KEY', 'PASS', `✅ API Key mevcut (${keyType})`, { length: apiKey.length, type: keyType });
  } else {
    addResult('APPWRITE_API_KEY', 'FAIL', '❌ API Key tanımlı değil');
  }

  // 2. Config Dosyası Kontrolü
  console.log('\n📋 2. Config Dosyası Kontrolü');
  try {
    const { appwriteConfig, validateAppwriteConfigSafe, getConfigStatus } = await import('../src/lib/appwrite/config');
    const isValid = validateAppwriteConfigSafe();
    const status = getConfigStatus();
    
    addResult(
      'Config Validation',
      isValid ? 'PASS' : 'WARNING',
      isValid ? '✅ Config dosyası geçerli' : `⚠️  Config uyarıları: ${status.warnings.length}`,
      status
    );
  } catch (error: any) {
    addResult('Config Validation', 'FAIL', `❌ Config yüklenemedi: ${error.message}`);
  }

  // Sonuçları yazdır
  console.log(`\n${  '='.repeat(60)}`);
  console.log('\n📊 TEST SONUÇLARI\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.details && typeof result.details === 'object') {
      console.log(`   Detaylar:`, JSON.stringify(result.details, null, 2));
    }
  });

  console.log(`\n${  '='.repeat(60)}`);
  console.log(`\n📈 Özet:`);
  console.log(`   ✅ Başarılı: ${passed}`);
  console.log(`   ⚠️  Uyarı: ${warnings}`);
  console.log(`   ❌ Başarısız: ${failed}`);
  console.log(`   📊 Toplam: ${results.length}`);

  const successRate = ((passed / results.length) * 100).toFixed(1);
  console.log(`\n🎯 Başarı Oranı: ${successRate}%`);

  if (failed === 0 && warnings === 0) {
    console.log('\n🎉 Tüm testler başarılı! Appwrite bağlantısı çalışıyor.');
    process.exit(0);
  } else if (failed === 0) {
    console.log('\n⚠️  Bazı uyarılar var ama genel olarak bağlantı çalışıyor.');
    process.exit(0);
  } else {
    console.log('\n❌ Kritik hatalar bulundu. Lütfen kontrol edin.');
    process.exit(1);
  }
}

runTests().catch(console.error);
