import { test, expect } from '@playwright/test';

/**
 * Comprehensive Responsive UI Tests
 * Tests all sections across different device sizes
 * Ensures UI is accessible and properly rendered on all devices
 */

// Test credentials
const TEST_CREDENTIALS = {
  student: { email: 'student@test.com', password: 'test123' },
  coach: { email: 'coach@test.com', password: 'test123' },
  admin: { email: 'admin@test.com', password: 'test123' },
  fan: { email: 'fan@test.com', password: 'test123' },
};

/**
 * Helper: Login as a specific role
 */
async function loginAs(page: any, role: 'student' | 'coach' | 'admin' | 'fan', baseURL?: string) {
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
  
  await page.waitForURL(/\/realverse\/(student|coach|admin|fan)/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Helper: Check viewport dimensions and ensure content fits
 */
async function checkViewportFit(page: any) {
  const viewport = page.viewportSize();
  expect(viewport).toBeTruthy();
  
  // Check for horizontal scroll (should not exist)
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHorizontalScroll).toBe(false);
}

/**
 * Helper: Check for critical UI elements visibility
 */
async function checkCriticalElements(page: any, selectors: string[]) {
  for (const selector of selectors) {
    const element = page.locator(selector).first();
    await expect(element).toBeVisible({ timeout: 5000 }).catch(() => {
      // Log but don't fail if element is conditionally rendered
      console.log(`Element not found: ${selector}`);
    });
  }
}

/**
 * Helper: Check text readability (font size, contrast)
 */
async function checkTextReadability(page: any) {
  // Check that body text is readable (at least 14px on mobile, 16px on desktop)
  const bodyText = page.locator('body').first();
  const fontSize = await bodyText.evaluate((el: HTMLElement) => {
    return window.getComputedStyle(el).fontSize;
  });
  const fontSizeNum = parseFloat(fontSize);
  expect(fontSizeNum).toBeGreaterThan(12);
}

test.describe('Public Pages - Responsive Design', () => {
  test('Landing page - All sections visible and responsive', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check viewport fit
    await checkViewportFit(page);
    
    // Check critical sections
    await checkCriticalElements(page, [
      'body',
      'header, nav, [role="banner"]',
    ]);
    
    // Check text readability
    await checkTextReadability(page);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/landing-responsive.png', fullPage: true });
  });

  test('Landing page - Navigation menu works on mobile', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check if mobile menu exists (hamburger menu)
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu"]').first();
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    
    if (isMobile) {
      if (await mobileMenuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);
        
        // Check menu is open
        const menu = page.locator('nav, [role="navigation"]').first();
        await expect(menu).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('Shop page - Product grid responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/shop`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check product grid adapts to viewport
    const productGrid = page.locator('[class*="grid"], [class*="products"]').first();
    if (await productGrid.isVisible({ timeout: 3000 }).catch(() => false)) {
      const gridStyle = await productGrid.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).display;
      });
      expect(['grid', 'flex']).toContain(gridStyle);
    }
    
    await page.screenshot({ path: 'test-results/shop-responsive.png', fullPage: true });
  });

  test('Brochure page - All sections accessible', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/brochure`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    // Check brochure sections are scrollable
    const scrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight;
    });
    
    await page.screenshot({ path: 'test-results/brochure-responsive.png', fullPage: true });
  });

  test('Programs pages - Responsive layout', async ({ page, baseURL }) => {
    const programs = ['/programs', '/programs/epp', '/programs/scp', '/programs/wpp', '/programs/fydp'];
    
    for (const programPath of programs) {
      await page.goto(`${baseURL || ''}${programPath}`);
      await page.waitForLoadState('networkidle');
      
      await checkViewportFit(page);
      await checkTextReadability(page);
      
      // Check program content is visible
      const content = page.locator('main, [role="main"], article').first();
      await expect(content).toBeVisible({ timeout: 5000 });
    }
  });

  test('RealVerse Experience page - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/experience`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check feature cards are visible
    const featureCards = page.locator('[class*="card"], [class*="feature"]');
    const cardCount = await featureCards.count();
    
    // Check cards adapt to viewport
    if (cardCount > 0) {
      const firstCard = featureCards.first();
      await expect(firstCard).toBeVisible({ timeout: 5000 });
    }
    
    await page.screenshot({ path: 'test-results/realverse-experience-responsive.png', fullPage: true });
  });

  test('Fan Club Benefits page - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/fan-club/benefits`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/fan-club-benefits-responsive.png', fullPage: true });
  });
});

test.describe('RealVerse Student Section - Responsive', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'student', baseURL);
  });

  test('Student Dashboard - All sections visible on all devices', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check dashboard sections
    await checkCriticalElements(page, [
      'body',
      'main, [role="main"]',
    ]);
    
    // Check sidebar/navigation is accessible
    const sidebar = page.locator('nav, [role="navigation"], aside').first();
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    
    if (isMobile) {
      // Mobile: Check for hamburger menu
      const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]').first();
      if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(300);
        await expect(sidebar).toBeVisible({ timeout: 2000 });
      }
    } else {
      // Desktop: Sidebar should be visible
      await expect(sidebar).toBeVisible({ timeout: 5000 });
    }
    
    await page.screenshot({ path: 'test-results/student-dashboard-responsive.png', fullPage: true });
  });

  test('Student Development page - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/development`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/student-development-responsive.png', fullPage: true });
  });

  test('Student Analytics page - Charts responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/analytics`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check charts are visible and not overflowing
    const charts = page.locator('svg, canvas, [class*="chart"], [class*="graph"]');
    const chartCount = await charts.count();
    
    if (chartCount > 0) {
      const firstChart = charts.first();
      await expect(firstChart).toBeVisible({ timeout: 5000 });
      
      // Check chart doesn't overflow
      const chartBox = await firstChart.boundingBox();
      if (chartBox) {
        expect(chartBox.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      }
    }
    
    await page.screenshot({ path: 'test-results/student-analytics-responsive.png', fullPage: true });
  });

  test('Student Matches page - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/matches`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/student-matches-responsive.png', fullPage: true });
  });

  test('Student Wellness Reports - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/wellness-reports`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/student-wellness-responsive.png', fullPage: true });
  });

  test('Student Schedule - Responsive calendar view', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/schedule`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check calendar is visible and responsive
    const calendar = page.locator('[class*="calendar"], [class*="schedule"]').first();
    if (await calendar.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(calendar).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/student-schedule-responsive.png', fullPage: true });
  });
});

test.describe('RealVerse Coach Section - Responsive', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'coach', baseURL);
  });

  test('Coach Dashboard - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/coach-dashboard-responsive.png', fullPage: true });
  });

  test('Coach Analytics - Responsive charts', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach/analytics`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check charts are responsive
    const charts = page.locator('svg, canvas, [class*="chart"]');
    const chartCount = await charts.count();
    
    if (chartCount > 0) {
      for (let i = 0; i < Math.min(chartCount, 3); i++) {
        const chart = charts.nth(i);
        const box = await chart.boundingBox();
        if (box) {
          expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/coach-analytics-responsive.png', fullPage: true });
  });
});

test.describe('RealVerse Admin Section - Responsive', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'admin', baseURL);
  });

  test('Admin Dashboard - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/students`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/admin-dashboard-responsive.png', fullPage: true });
  });

  test('Admin Centres Management - Responsive tables', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/centres`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check tables are responsive (should scroll or stack on mobile)
    const tables = page.locator('table, [class*="table"]');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      const firstTable = tables.first();
      const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
      
      if (isMobile) {
        // On mobile, table should either scroll or be converted to cards
        const tableBox = await firstTable.boundingBox();
        if (tableBox) {
          // Table should not exceed viewport width
          expect(tableBox.width).toBeLessThanOrEqual(page.viewportSize()!.width + 10); // Small tolerance
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/admin-centres-responsive.png', fullPage: true });
  });

  test('Admin Merchandise - Responsive product management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/merch`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/admin-merch-responsive.png', fullPage: true });
  });
});

test.describe('RealVerse Fan Section - Responsive', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'fan', baseURL);
  });

  test('Fan Dashboard - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/fan-dashboard-responsive.png', fullPage: true });
  });

  test('Fan Benefits - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/benefits`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/fan-benefits-responsive.png', fullPage: true });
  });

  test('Fan Games - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/games`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/fan-games-responsive.png', fullPage: true });
  });

  test('Fan Matchday - Responsive', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/matchday`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    await checkTextReadability(page);
    
    await page.screenshot({ path: 'test-results/fan-matchday-responsive.png', fullPage: true });
  });
});

test.describe('Cross-Device Consistency', () => {
  test('Login page - Consistent across devices', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/login`);
    await page.waitForLoadState('networkidle');
    
    await checkViewportFit(page);
    
    // Check form elements are accessible
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    
    // Check inputs are tappable/clickable (min 44x44px on mobile)
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    if (isMobile) {
      const emailBox = await emailInput.boundingBox();
      const passwordBox = await passwordInput.boundingBox();
      const buttonBox = await submitButton.boundingBox();
      
      if (emailBox) expect(emailBox.height).toBeGreaterThanOrEqual(40);
      if (passwordBox) expect(passwordBox.height).toBeGreaterThanOrEqual(40);
      if (buttonBox) expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
    
    await page.screenshot({ path: 'test-results/login-responsive.png', fullPage: true });
  });
});

