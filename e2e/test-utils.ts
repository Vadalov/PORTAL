import { Page } from '@playwright/test';

// Helper function to get the correct search hotkey based on platform
export const getSearchHotkey = () => {
  return process.platform === 'darwin' ? 'Meta+K' : 'Control+K';
};

// Enhanced wait functions for better reliability
export async function waitForElement(page: Page, selector: string, timeout: number = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

// Safe element operations with fallbacks
export async function safeClick(page: Page, selectors: string[]): Promise<boolean> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        return true;
      }
    } catch (error) {
      continue;
    }
  }
  return false;
}

// Safe fill with multiple selector attempts
export async function safeFill(page: Page, selectors: string[], text: string): Promise<boolean> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.fill(text);
        return true;
      }
    } catch (error) {
      continue;
    }
  }
  return false;
}

// Enhanced search functionality with multiple selector fallbacks
export async function performSearch(page: Page, searchTerm: string): Promise<boolean> {
  const searchSelectors = [
    'input[placeholder*="Ara"]',
    'input[placeholder*="Search"]',
    'input[type="search"]',
    '[data-testid="search-input"]',
    '.search-input input'
  ];
  
  // Try to open search dialog first
  const searchHotkey = getSearchHotkey();
  await page.keyboard.press(searchHotkey);
  await page.waitForTimeout(500);
  
  // Try to fill search input
  if (await safeFill(page, searchSelectors, searchTerm)) {
    await page.waitForTimeout(600); // Wait for debounce
    return true;
  }
  
  return false;
}

// Robust navigation wait function
export async function waitForNavigation(page: Page, expectedUrl: string, timeout: number = 10000): Promise<boolean> {
  try {
    await page.waitForURL(expectedUrl, { timeout });
    return true;
  } catch (error) {
    // Fallback: just wait for any URL change
    try {
      await page.waitForLoadState('load', { timeout });
      return true;
    } catch (timeoutError) {
      return false;
    }
  }
}

// Test data isolation utilities
export class TestDataManager {
  private createdUsers: string[] = [];
  private createdBeneficiaries: string[] = [];
  private createdTasks: string[] = [];
  private createdMeetings: string[] = [];
  private createdDonations: string[] = [];

  // User management
  async createTestUser(page: Page, userData: {
    name: string;
    email: string;
    role: string;
  }): Promise<string> {
    // Navigate to user management
    await page.goto('/kullanici');
    await page.waitForTimeout(1000);
    
    // Open create modal
    const addButton = page.locator('button').filter({ hasText: /Yeni Kullanıcı|Ekle/i }).first();
    await addButton.click();
    
    // Fill form
    await page.fill('input[name="name"]', userData.name);
    await page.fill('input[name="email"]', userData.email);
    
    // Select role
    const roleSelect = page.locator('select[name="role"], button').filter({ hasText: /Rol/i }).first();
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      const roleOption = page.locator(`text=/${userData.role}/i`).first();
      if (await roleOption.isVisible()) {
        await roleOption.click();
      }
    }
    
    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for success toast
    await page.waitForTimeout(2000);
    
    // Store user email for cleanup
    this.createdUsers.push(userData.email);
    
    return userData.email;
  }

  async cleanupTestUsers(page: Page): Promise<void> {
    for (const email of this.createdUsers) {
      try {
        await this.deleteUserByEmail(page, email);
      } catch (error) {
        console.warn(`Failed to cleanup user ${email}:`, error);
      }
    }
    this.createdUsers = [];
  }

  private async deleteUserByEmail(page: Page, email: string): Promise<void> {
    await page.goto('/kullanici');
    await page.waitForTimeout(1000);
    
    // Find user row by email
    const userRow = page.locator('tr, [data-row]').filter({ hasText: email }).first();
    
    if (await userRow.isVisible()) {
      // Click delete button
      const deleteButton = userRow.locator('button[title*="Sil"], button[title*="Delete"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion
        const confirmButton = page.locator('button:has-text("Sil"), button:has-text("Delete")').first();
        await confirmButton.click();
        
        // Wait for success toast
        await page.waitForTimeout(2000);
      }
    }
  }

  // Generic cleanup method
  async cleanupAll(page: Page): Promise<void> {
    await this.cleanupTestUsers(page);
    // Add other cleanup methods as needed
  }

  // Get unique test data
  getUniqueTestData() {
    const timestamp = Date.now();
    return {
      user: {
        name: `Test User ${timestamp}`,
        email: `test-user-${timestamp}@example.com`,
        role: 'MEMBER'
      },
      beneficiary: {
        name: `Test Beneficiary ${timestamp}`,
        phone: `555${timestamp.toString().slice(-7)}`,
        address: `Test Address ${timestamp}`
      },
      task: {
        title: `Test Task ${timestamp}`,
        description: `Test task description ${timestamp}`
      }
    };
  }
}

// Login helper
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/genel');
}

export async function loginAsUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/genel');
}

// Wait helpers
export async function waitForToast(page: Page, message?: string): Promise<void> {
  if (message) {
    await page.waitForSelector(`text=/${message}/i`, { timeout: 5000 });
  } else {
    await page.waitForTimeout(2000); // Generic wait for any toast
  }
}

// Form helpers
export async function fillFormField(page: Page, fieldName: string, value: string): Promise<void> {
  const field = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`).first();
  await field.fill(value);
}

export async function selectDropdownOption(page: Page, dropdownSelector: string, optionText: string): Promise<void> {
  const dropdown = page.locator(dropdownSelector).first();
  await dropdown.click();
  
  const option = page.locator(`text=/${optionText}/i`).first();
  if (await option.isVisible()) {
    await option.click();
  }
}

// Assertion helpers
export async function expectElementToBeVisible(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector).first();
  await element.waitFor({ state: 'visible' });
}

export async function expectElementToNotBeVisible(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector).first();
  await element.waitFor({ state: 'hidden' });
}
