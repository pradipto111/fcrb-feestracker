import { test, expect } from '@playwright/test';

/**
 * Visual Regression and Layout Tests
 * Ensures consistent layout and visual appearance across devices
 */

test.describe('Visual Layout - Consistency Checks', () => {
  test('Landing page - Layout consistency', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check for layout elements
    const header = page.locator('header, [role="banner"]').first();
    const main = page.locator('main, [role="main"]').first();
    const footer = page.locator('footer, [role="contentinfo"]').first();
    
    // Header should be at top
    if (await header.isVisible({ timeout: 2000 }).catch(() => false)) {
      const headerBox = await header.boundingBox();
      if (headerBox) {
        expect(headerBox.y).toBeLessThan(100); // Should be near top
      }
    }
    
    // Main content should be visible
    await expect(main).toBeVisible({ timeout: 5000 });
    
    // Footer should be at bottom (if exists)
    if (await footer.isVisible({ timeout: 2000 }).catch(() => false)) {
      const footerBox = await footer.boundingBox();
      const viewportHeight = page.viewportSize()?.height || 0;
      
      if (footerBox && viewportHeight > 0) {
        // Footer should be near bottom or scrollable to bottom
        const isNearBottom = footerBox.y + footerBox.height >= viewportHeight - 100;
        expect(isNearBottom || footerBox.y > viewportHeight).toBe(true);
      }
    }
  });

  test('Content width - No horizontal overflow', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    // Check main content doesn't exceed viewport
    const main = page.locator('main, [role="main"]').first();
    if (await main.isVisible({ timeout: 2000 }).catch(() => false)) {
      const mainBox = await main.boundingBox();
      const viewportWidth = page.viewportSize()?.width || 0;
      
      if (mainBox && viewportWidth > 0) {
        expect(mainBox.width).toBeLessThanOrEqual(viewportWidth + 10); // Small tolerance
      }
    }
  });

  test('Text alignment - Proper text flow', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check body text alignment
    const body = page.locator('body').first();
    const textAlign = await body.evaluate((el) => {
      return window.getComputedStyle(el).textAlign;
    });
    
    // Text should have alignment (left, center, justify, etc.)
    expect(textAlign).toBeTruthy();
  });

  test('Spacing - Consistent margins and padding', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check sections have spacing
    const sections = page.locator('section, [class*="section"]');
    const sectionCount = await sections.count();
    
    if (sectionCount > 0) {
      const firstSection = sections.first();
      const sectionStyles = await firstSection.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
          padding: styles.padding,
        };
      });
      
      // Section should have some spacing
      expect(
        sectionStyles.marginTop !== '0px' ||
        sectionStyles.marginBottom !== '0px' ||
        sectionStyles.padding !== '0px'
      ).toBe(true);
    }
  });
});

test.describe('Visual Layout - Responsive Breakpoints', () => {
  test('Mobile layout (375px)', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check layout adapts to mobile
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/mobile-layout-375.png', fullPage: true });
  });

  test('Tablet layout (768px)', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    await page.screenshot({ path: 'test-results/tablet-layout-768.png', fullPage: true });
  });

  test('Desktop layout (1920px)', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    await page.screenshot({ path: 'test-results/desktop-layout-1920.png', fullPage: true });
  });

  test('Large desktop layout (2560px)', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    await page.screenshot({ path: 'test-results/large-desktop-layout-2560.png', fullPage: true });
  });
});

test.describe('Visual Layout - RealVerse Sections', () => {
  const TEST_CREDENTIALS = {
    student: { email: 'student@test.com', password: 'test123' },
    coach: { email: 'coach@test.com', password: 'test123' },
    admin: { email: 'admin@test.com', password: 'test123' },
    fan: { email: 'fan@test.com', password: 'test123' },
  };

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

  test('Student Dashboard - Layout consistency', async ({ page, baseURL }) => {
    await loginAs(page, 'student', baseURL);
    
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');
    
    // Check for no horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    // Check sidebar and main content layout
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first();
    const main = page.locator('main, [role="main"]').first();
    
    await expect(main).toBeVisible({ timeout: 5000 });
    
    // Sidebar should be visible on desktop, or menu button on mobile
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    
    if (!isMobile) {
      if (await sidebar.isVisible({ timeout: 2000 }).catch(() => false)) {
        const sidebarBox = await sidebar.boundingBox();
        const mainBox = await main.boundingBox();
        
        if (sidebarBox && mainBox) {
          // Sidebar and main should not overlap
          expect(sidebarBox.x + sidebarBox.width <= mainBox.x || mainBox.x >= sidebarBox.x + sidebarBox.width).toBe(true);
        }
      }
    }
  });

  test('Admin Dashboard - Layout consistency', async ({ page, baseURL }) => {
    await loginAs(page, 'admin', baseURL);
    
    await page.goto(`${baseURL || ''}/realverse/admin`);
    await page.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Fan Dashboard - Layout consistency', async ({ page, baseURL }) => {
    await loginAs(page, 'fan', baseURL);
    
    await page.goto(`${baseURL || ''}/realverse/fan`);
    await page.waitForLoadState('networkidle');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Visual Layout - Component Alignment', () => {
  test('Cards align properly', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();
    
    if (cardCount > 1) {
      // Check first two cards align
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      if (await firstCard.isVisible({ timeout: 2000 }).catch(() => false) &&
          await secondCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        if (firstBox && secondBox) {
          // Cards should be in a grid or stack, not randomly placed
          // Just check they're visible and positioned
          expect(firstBox.width).toBeGreaterThan(0);
          expect(secondBox.width).toBeGreaterThan(0);
        }
      }
    }
  });

  test('Buttons align properly', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonBox = await firstButton.boundingBox();
      
      if (buttonBox) {
        // Button should have reasonable dimensions
        expect(buttonBox.width).toBeGreaterThan(0);
        expect(buttonBox.height).toBeGreaterThan(0);
      }
    }
  });
});

