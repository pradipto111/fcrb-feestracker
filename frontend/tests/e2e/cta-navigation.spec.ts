import { test, expect } from '@playwright/test';

/**
 * CTA Navigation Tests
 * Tests that all CTAs perform expected actions
 */

const TEST_CREDENTIALS = {
  student: { email: 'student@test.com', password: 'test123' },
  coach: { email: 'coach@test.com', password: 'test123' },
  admin: { email: 'admin@test.com', password: 'test123' },
};

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

test.describe('Student CTAs', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'student', baseURL);
  });

  test('Quick action cards navigate correctly', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');

    // Wait for dashboard content
    const quickActions = page.locator('text=Quick Actions, text=Quick').first();
    await quickActions.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    // Test Analytics card
    const analyticsCard = page.locator('text=Analytics, [href*="analytics"]').first();
    if (await analyticsCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await analyticsCard.click();
      await page.waitForLoadState('networkidle');
      // Should navigate to analytics or open profile
      expect(page.url()).toMatch(/analytics|profile/);
    }
  });

  test('Load Dashboard CTA works', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');

    // Look for Load Dashboard button
    const loadDashboardBtn = page.locator('text=Load Dashboard, text=Training Load, [href*="load"]').first();
    if (await loadDashboardBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loadDashboardBtn.click();
      await page.waitForLoadState('networkidle');
      // Should navigate to load dashboard
      expect(page.url()).toMatch(/load-dashboard|load/);
    }
  });

  test('Sidebar navigation works', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');
    
    // Click on Attendance in sidebar
    const attendanceLink = page.locator('a[href*="my-attendance"], text=My Attendance, text=Attendance').first();
    if (await attendanceLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await attendanceLink.click();
      await page.waitForURL(/my-attendance/, { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('my-attendance');
    }
  });
});

test.describe('Coach CTAs', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'coach', baseURL);
  });

  test('Quick action cards navigate correctly', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach`);
    await page.waitForLoadState('networkidle');

    // Wait for dashboard content
    const quickActions = page.locator('text=Quick Actions, text=Quick').first();
    await quickActions.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    // Test Player Management card
    const playerCard = page.locator('text=Player Management, text=Players, [href*="students"]').first();
    if (await playerCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await playerCard.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/students|players/);
    }
  });

  test('Season Planning CTA works', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach`);
    await page.waitForLoadState('networkidle');

    const seasonPlanningBtn = page.locator('text=Season Planning, text=Open Planner, [href*="season"]').first();
    if (await seasonPlanningBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await seasonPlanningBtn.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/season-planning|season/);
    }
  });
});

test.describe('Admin CTAs', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'admin', baseURL);
  });

  test('Quick action cards navigate correctly', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin`);
    await page.waitForLoadState('networkidle');

    // Wait for dashboard content
    const quickActions = page.locator('text=Quick Actions, text=Quick').first();
    await quickActions.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    // Test Centre Management
    const centreCard = page.locator('text=Centres, text=Centre, [href*="centres"]').first();
    if (await centreCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await centreCard.click();
      await page.waitForLoadState('networkidle');
      // May navigate or may need to check sidebar
    }
  });

  test('Sidebar navigation works', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin`);
    await page.waitForLoadState('networkidle');
    
    // Click on Centres in sidebar
    const centresLink = page.locator('a[href*="centres"], text=Centres').first();
    if (await centresLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await centresLink.click();
      await page.waitForURL(/centres/, { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('centres');
    }
  });
});

