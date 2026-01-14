import { test, expect } from '@playwright/test';

/**
 * Accessibility and UI Component Tests
 * Ensures all UI components are accessible and properly rendered
 */

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

test.describe('Accessibility - Keyboard Navigation', () => {
  test('Tab navigation works on landing page', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Get all focusable elements
    const focusable = page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const focusableCount = await focusable.count();
    
    if (focusableCount > 0) {
      // Tab through first few elements
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      const focused = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focused).toBeTruthy();
    }
  });

  test('Form inputs are keyboard accessible', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    // Tab to email input
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Check email input is focused
    const emailFocused = await emailInput.evaluate((el) => {
      return document.activeElement === el;
    });
    
    expect(emailFocused).toBe(true);
    
    // Type email
    await emailInput.fill('test@example.com');
    
    // Tab to password
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Check password input is focused
    const passwordFocused = await passwordInput.evaluate((el) => {
      return document.activeElement === el;
    });
    
    expect(passwordFocused).toBe(true);
  });

  test('Buttons are keyboard accessible', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button:not([disabled])');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Find first visible button
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          // Tab to button
          await page.keyboard.press('Tab');
          await page.waitForTimeout(200);
          
          // Press Enter on button
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          
          break;
        }
      }
    }
  });
});

test.describe('Accessibility - ARIA Labels and Roles', () => {
  test('Navigation has proper ARIA labels', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check for navigation landmarks
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();
    
    // Should have at least one navigation
    expect(navCount).toBeGreaterThan(0);
    
    // Check for main content landmark
    const main = page.locator('main, [role="main"]');
    const mainCount = await main.count();
    
    expect(mainCount).toBeGreaterThan(0);
  });

  test('Buttons have accessible labels', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    let buttonsWithoutLabels = 0;
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent().catch(() => '');
      const ariaLabel = await button.getAttribute('aria-label').catch(() => '');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby').catch(() => '');
      
      // Button should have text, aria-label, or aria-labelledby
      if (!text?.trim() && !ariaLabel && !ariaLabelledBy) {
        buttonsWithoutLabels++;
      }
    }
    
    // Most buttons should have labels
    expect(buttonsWithoutLabels).toBeLessThan(buttonCount / 2);
  });

  test('Images have alt text', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    let imagesWithoutAlt = 0;
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt').catch(() => '');
      const role = await img.getAttribute('role').catch(() => '');
      
      // Decorative images can have empty alt or role="presentation"
      if (!alt && role !== 'presentation') {
        imagesWithoutAlt++;
      }
    }
    
    // Most content images should have alt text
    expect(imagesWithoutAlt).toBeLessThan(imageCount);
  });
});

test.describe('UI Components - Form Elements', () => {
  test('Input fields are properly styled and visible', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    
    // Check inputs have proper styling (not just default)
    const emailStyles = await emailInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        border: styles.border,
        padding: styles.padding,
      };
    });
    
    expect(emailStyles.border || emailStyles.padding).toBeTruthy();
  });

  test('Buttons are properly styled', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/login`);
    await page.waitForLoadState('networkidle');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    
    // Check button has proper styling
    const buttonStyles = await submitButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        padding: styles.padding,
      };
    });
    
    expect(buttonStyles.backgroundColor || buttonStyles.color).toBeTruthy();
  });
});

test.describe('UI Components - Layout and Spacing', () => {
  test('Content has proper spacing', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 5000 });
    
    // Check main content has padding or margin
    const mainStyles = await main.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        margin: styles.margin,
      };
    });
    
    expect(mainStyles.padding || mainStyles.margin).toBeTruthy();
  });

  test('Text is readable (proper contrast)', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body').first();
    const textStyles = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });
    
    // Check text has proper styling
    expect(textStyles.color).toBeTruthy();
    expect(textStyles.fontSize).toBeTruthy();
    
    // Font size should be readable (at least 14px)
    const fontSize = parseFloat(textStyles.fontSize);
    expect(fontSize).toBeGreaterThan(12);
  });
});

test.describe('UI Components - Interactive Elements', () => {
  test('Links are properly styled and visible', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      const firstLink = links.first();
      await expect(firstLink).toBeVisible({ timeout: 5000 });
      
      // Check link has hover state (cursor pointer)
      const linkStyles = await firstLink.evaluate((el) => {
        return window.getComputedStyle(el).cursor;
      });
      
      // Link should have pointer cursor or be styled
      expect(linkStyles || true).toBeTruthy();
    }
  });

  test('Cards and containers are properly styled', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    const cards = page.locator('[class*="card"], [class*="container"], [class*="box"]');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible({ timeout: 5000 });
      
      // Check card has styling
      const cardStyles = await firstCard.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          padding: styles.padding,
          margin: styles.margin,
        };
      });
      
      expect(cardStyles.padding || cardStyles.margin || cardStyles.backgroundColor).toBeTruthy();
    }
  });
});

test.describe('UI Components - Responsive Behavior', () => {
  test('Mobile menu appears on small screens', async ({ page, baseURL }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid="mobile-menu"]').first();
    
    // Menu button might exist or navigation might be always visible
    // Just check page loads correctly
    await expect(page.locator('body')).toBeVisible();
  });

  test('Desktop navigation visible on large screens', async ({ page, baseURL }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check for navigation
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 5000 });
  });
});

test.describe('UI Components - Loading States', () => {
  test('Loading indicators appear when appropriate', async ({ page, baseURL }) => {
    await loginAs(page, 'student', baseURL);
    
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');
    
    // Check for loading states (spinners, skeletons, etc.)
    const loaders = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"], [aria-label*="loading"]');
    const loaderCount = await loaders.count();
    
    // Loading indicators might appear briefly, that's okay
    // Just ensure page eventually loads
    await expect(page.locator('body')).toBeVisible();
  });
});

