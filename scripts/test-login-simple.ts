/**
 * Simple Login Test
 * API endpoint'ini test eder
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'isahamid@gmail.com';
const PASSWORD = 'vadalov95';

async function testLogin() {
  console.log('🔐 Login Test\n');
  console.log('='.repeat(60));
  
  try {
    // CSRF Token al
    console.log('1. CSRF Token alınıyor...');
    const csrfRes = await fetch(`${BASE_URL}/api/csrf`);
    const csrfData = await csrfRes.json();
    console.log('✅ CSRF Token:', `${csrfData.token?.substring(0, 20)  }...`);
    
    // Login yap
    console.log('\n2. Login yapılıyor...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfData.token,
      },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    
    const result = await loginRes.json();
    
    if (result.success) {
      console.log('✅ Login BAŞARILI!');
      console.log('\n📊 Kullanıcı Bilgileri:');
      console.log('   ID:', result.data.user.id);
      console.log('   Email:', result.data.user.email);
      console.log('   Name:', result.data.user.name);
      console.log('   Role:', result.data.user.role);
      console.log('   Permissions:', result.data.user.permissions.length, 'adet');
      console.log('\n🎉 Tüm yetkilere sahip admin kullanıcı ile giriş yapıldı!');
    } else {
      console.log('❌ Login başarısız:', result.error);
    }
  } catch (error: any) {
    console.log('❌ Hata:', error.message);
  }
}

testLogin();

