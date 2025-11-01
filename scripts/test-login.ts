/**
 * Login Test Script
 * Yeni oluşturulan kullanıcı ile login testi
 * 
 * Usage: npx tsx scripts/test-login.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const EMAIL = 'isahamid@gmail.com';
const PASSWORD = 'vadalov95';

async function testLogin() {
  console.log('🔐 Login Test Başlatılıyor...\n');
  console.log('='.repeat(60));
  console.log(`📧 Email: ${EMAIL}`);
  console.log(`🔑 Password: ${PASSWORD.replace(/./g, '*')}`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  try {
    // 1. CSRF Token al
    console.log('1️⃣  CSRF Token alınıyor...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!csrfResponse.ok) {
      throw new Error(`CSRF endpoint hatası: ${csrfResponse.status}`);
    }

    const csrfData = await csrfResponse.json();
    if (!csrfData.success || !csrfData.token) {
      throw new Error('CSRF token alınamadı');
    }

    console.log('✅ CSRF Token alındı');

    // 2. Login yap
    console.log('\n2️⃣  Login yapılıyor...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfData.token,
      },
      credentials: 'include',
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
        rememberMe: false,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('❌ Login başarısız!');
      console.error('Status:', loginResponse.status);
      console.error('Response:', loginData);
      process.exit(1);
    }

    if (!loginData.success) {
      console.error('❌ Login başarısız!');
      console.error('Error:', loginData.error);
      process.exit(1);
    }

    console.log('✅ Login başarılı!');
    console.log('\n📊 Kullanıcı Bilgileri:');
    console.log('   ID:', loginData.data.user.id);
    console.log('   Email:', loginData.data.user.email);
    console.log('   Name:', loginData.data.user.name);
    console.log('   Role:', loginData.data.user.role);
    console.log('   Permissions:', loginData.data.user.permissions.length, 'izin');

    // 3. Session kontrolü
    console.log('\n3️⃣  Session kontrol ediliyor...');
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      if (sessionData.success) {
        console.log('✅ Session aktif');
        console.log('   User ID:', sessionData.data.userId);
        console.log('   Expires At:', sessionData.data.expiresAt);
      } else {
        console.log('⚠️  Session verisi alınamadı');
      }
    } else {
      console.log('⚠️  Session endpoint yanıt vermedi');
    }

    console.log(`\n${  '='.repeat(60)}`);
    console.log('🎉 Tüm testler başarılı!');
    console.log('\n💡 Frontend\'de login yapmak için:');
    console.log(`   1. ${BASE_URL}/login adresine gidin`);
    console.log(`   2. Email: ${EMAIL}`);
    console.log(`   3. Password: ${PASSWORD.replace(/./g, '*')}`);
    console.log('   4. "Giriş Yap" butonuna tıklayın');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Hata oluştu:', error.message);
    console.error('\n💡 Kontrol edin:');
    console.error('   1. Dev server çalışıyor mu? (npm run dev)');
    console.error(`   2. ${BASE_URL} erişilebilir mi?`);
    console.error('   3. Appwrite bağlantısı aktif mi?');
    process.exit(1);
  }
}

testLogin();

