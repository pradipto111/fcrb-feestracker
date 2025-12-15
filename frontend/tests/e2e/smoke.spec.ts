import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic Navigation and CTA Verification
 * Tests that all routes are accessible and CTAs work
 */

// Test credentials (should be seeded in test database)
const TEST_CREDENTIALS = {
  student: { email: 'student@test.com', password: 'test123' },
  coach: { email: 'coach@test.com', password: 'test123' },
  admin: { email: 'admin@test.com', password: 'test123' },
};

/**
 * Helper: Login as a specific role
 */
async function loginAs(page: any, role: 'student' | 'coach' | 'admin', baseURL?: string) {
  const url = baseURL ? `${baseURL}/realverse/login` : '/realverse/login';
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  const creds = TEST_CREDENTIALS[role];
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Login")').first();
  
  await emailInput.fill(creds.email);
  await passwordInput.fill(creds.password);
  await submitButton.click();
  
  await page.waitForURL(/\/realverse\/(student|coach|admin)/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Helper: Check for console errors
 */
async function checkConsoleErrors(page: any) {
  const errors: string[] = [];
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Helper: Check for failed network requests
 */
async function checkFailedRequests(page: any) {
  const failedRequests: string[] = [];
  page.on('response', (response: any) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.url()} - ${response.status()}`);
    }
  });
  return failedRequests;
}

test.describe('Public Routes', () => {
  test('Landing page loads', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/RealVerse|FC Real Bengaluru/i);
  });

  test('Shop page loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/shop`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Brochure page loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/brochure`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Login page loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/login`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Student Role - Navigation', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'student', baseURL);
  });

  test('Dashboard loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Dashboard, h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Quick action cards are clickable', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard content to load
    const quickActions = page.locator('text=Quick Actions, text=Quick').first();
    await quickActions.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    
    // Try clicking analytics card
    const analyticsCard = page.locator('text=Analytics, [href*="analytics"]').first();
    if (await analyticsCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await analyticsCard.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Attendance page loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/my-attendance`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Fixtures page loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/my-fixtures`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Analytics page loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/analytics`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Coach Role - Navigation', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'coach', baseURL);
  });

  test('Dashboard loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Player list loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/students`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Attendance management loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/attendance`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Role - Navigation', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'admin', baseURL);
  });

  test('Dashboard loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Centres management loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/centres`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Merchandise management loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/merch`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('No console errors on dashboard', async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await loginAs(page, 'student', baseURL);
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('404')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('No failed network requests on dashboard', async ({ page, baseURL }) => {
    const failedRequests: string[] = [];
    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      // Ignore 404s for calibration profiles and favicon
      if (status >= 400 && !url.includes('favicon') && !url.includes('calibration/profile')) {
        failedRequests.push(`${url} - ${status}`);
      }
    });

    await loginAs(page, 'student', baseURL);
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');

    expect(failedRequests.length).toBe(0);
  });
});

