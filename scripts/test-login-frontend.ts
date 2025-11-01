/**
 * Frontend Login Test with Playwright
 * Browser'da login yapmayı test eder
 * 
 * Usage: npx tsx scripts/test-login-frontend.ts
 */

import { chromium } from 'playwright';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const EMAIL = 'isahamid@gmail.com';
const PASSWORD = 'vadalov95';

async function testFrontendLogin() {
  console.log('🌐 Frontend Login Test Başlatılıyor...\n');
  console.log('='.repeat(60));
  console.log(`📧 Email: ${EMAIL}`);
  console.log(`🔑 Password: ${PASSWORD.replace(/./g, '*')}`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login sayfasına git
    console.log('1️⃣  Login sayfasına gidiliyor...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log('✅ Login sayfası yüklendi');

    // Email ve password alanlarını doldur
    console.log('\n2️⃣  Form dolduruluyor...');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    console.log('✅ Form dolduruldu');

    // Login butonuna tıkla
    console.log('\n3️⃣  Login butonuna tıklanıyor...');
    await page.click('button[type="submit"]');
    
    // Başarılı login sonrası yönlendirmeyi bekle
    await page.waitForURL('**/genel**', { timeout: 10000 });
    console.log('✅ Login başarılı, yönlendirme yapıldı');

    // Kullanıcı bilgilerini kontrol et
    console.log('\n4️⃣  Kullanıcı bilgileri kontrol ediliyor...');
    
    // Auth store'dan kullanıcı bilgisini al
    const userInfo = await page.evaluate(() => {
      const authStore = (window as any).__ZUSTAND_STORE__?.auth;
      return authStore?.getState?.()?.user || null;
    });

    if (userInfo) {
      console.log('✅ Kullanıcı bilgileri alındı:');
      console.log('   ID:', userInfo.id);
      console.log('   Email:', userInfo.email);
      console.log('   Name:', userInfo.name);
      console.log('   Role:', userInfo.role);
    } else {
      // Alternatif: localStorage'dan kontrol et
      const stored = await page.evaluate(() => {
        return localStorage.getItem('auth-storage');
      });
      
      if (stored) {
        const parsed = JSON.parse(stored);
        const user = parsed?.state?.user;
        if (user) {
          console.log('✅ Kullanıcı bilgileri (localStorage):');
          console.log('   ID:', user.id);
          console.log('   Email:', user.email);
          console.log('   Name:', user.name);
          console.log('   Role:', user.role);
        }
      }
    }

    // Sayfanın başarıyla yüklendiğini kontrol et
    const currentUrl = page.url();
    console.log('\n5️⃣  Sayfa kontrolü...');
    console.log('   Current URL:', currentUrl);
    
    if (currentUrl.includes('/genel')) {
      console.log('✅ Dashboard sayfasına yönlendirme başarılı');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Frontend login testi başarılı!');
    console.log('\n💡 Browser açık kalacak, manuel kontrol edebilirsiniz.');
    console.log('   Kapatmak için 10 saniye bekleyin...');

    // 10 saniye bekle (manuel kontrol için)
    await page.waitForTimeout(10000);

    await browser.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Hata oluştu:', error.message);
    console.error('\n📸 Screenshot alınıyor...');
    
    await page.screenshot({ path: 'login-error.png', fullPage: true });
    console.error('   Screenshot kaydedildi: login-error.png');

    await browser.close();
    process.exit(1);
  }
}

testFrontendLogin();

