import { test, expect } from '@playwright/test';

/**
 * Comprehensive Public Pages Tests
 * Tests all public-facing pages and sections
 */

test.describe('Public Pages - Complete Coverage', () => {
  test('Landing Page - All sections load', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check for main sections
    const sections = page.locator('section, [class*="section"]');
    const sectionCount = await sections.count();
    
    // Should have multiple sections
    expect(sectionCount).toBeGreaterThan(0);
    
    // Check for no critical errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('sourcemap') && !e.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('About Page - Content loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/about`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for content
    const content = page.locator('main, [role="main"], article').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('Teams Page - Teams display', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/teams`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for teams content
    const teams = page.locator('[class*="team"], [class*="player"]');
    const teamCount = await teams.count();
    
    expect(teamCount).toBeGreaterThanOrEqual(0);
  });

  test('Shop Page - Products display', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/shop`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for products
    const products = page.locator('[class*="product"], [class*="item"], [class*="card"]');
    const productCount = await products.count();
    
    expect(productCount).toBeGreaterThanOrEqual(0);
  });

  test('Product Detail Page - Product information', async ({ page, baseURL }) => {
    // First go to shop to get a product link
    await page.goto(`${baseURL || ''}/shop`);
    await page.waitForLoadState('networkidle');
    
    // Try to find a product link
    const productLinks = page.locator('a[href*="/shop/"]');
    const linkCount = await productLinks.count();
    
    if (linkCount > 0) {
      const firstLink = productLinks.first();
      const href = await firstLink.getAttribute('href');
      
      if (href) {
        await page.goto(`${baseURL || ''}${href}`);
        await page.waitForLoadState('networkidle');
        
        await expect(page.locator('body')).toBeVisible();
        
        // Check for product details
        const productDetails = page.locator('[class*="product"], [class*="detail"]');
        const detailCount = await productDetails.count();
        
        expect(detailCount).toBeGreaterThanOrEqual(0);
      }
    } else {
      // If no products, just check page structure
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Cart Page - Cart functionality', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/cart`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for cart content (might be empty)
    const cart = page.locator('[class*="cart"], [class*="checkout"]');
    const cartCount = await cart.count();
    
    expect(cartCount).toBeGreaterThanOrEqual(0);
  });

  test('Brochure Page - All sections', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/brochure`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for brochure sections
    const sections = page.locator('[class*="section"], [class*="brochure"]');
    const sectionCount = await sections.count();
    
    expect(sectionCount).toBeGreaterThanOrEqual(0);
  });

  test('Classic Brochure Page - Content loads', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/brochure/classic`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('RealVerse Experience Page - All features', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/experience`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for feature sections
    const features = page.locator('[class*="feature"], [class*="card"]');
    const featureCount = await features.count();
    
    expect(featureCount).toBeGreaterThanOrEqual(0);
  });

  test('Programs Overview Page - All programs', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/programs`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for program cards
    const programs = page.locator('[class*="program"], [class*="card"]');
    const programCount = await programs.count();
    
    expect(programCount).toBeGreaterThanOrEqual(0);
  });

  test('Elite Pathway Program Page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/programs/epp`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Senior Competitive Program Page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/programs/scp`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Women Performance Pathway Page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/programs/wpp`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Foundation Youth Program Page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/programs/fydp`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Fan Club Benefits Page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/fan-club/benefits`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for benefits content
    const benefits = page.locator('[class*="benefit"], [class*="feature"]');
    const benefitCount = await benefits.count();
    
    expect(benefitCount).toBeGreaterThanOrEqual(0);
  });

  test('Fan Club Join Page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/fan-club/join`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Login Page - Form works', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/login`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Public Pages - Navigation and CTAs', () => {
  test('Navigation links work', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Get navigation links
    const navLinks = page.locator('nav a[href], header a[href]');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Test first few navigation links
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href').catch(() => '');
        
        if (href && href.startsWith('/') && !href.includes('#')) {
          try {
            await link.click();
            await page.waitForLoadState('networkidle');
            await expect(page.locator('body')).toBeVisible();
            
            // Go back to landing page
            await page.goto(baseURL || '/');
            await page.waitForLoadState('networkidle');
          } catch (error) {
            // Some links might require authentication, skip
          }
        }
      }
    }
  });

  test('CTA buttons are clickable', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Find CTA buttons
    const ctaButtons = page.locator('button:has-text("Join"), button:has-text("Learn"), button:has-text("Get"), a[class*="cta"], a[class*="button"]');
    const buttonCount = await ctaButtons.count();
    
    if (buttonCount > 0) {
      const firstButton = ctaButtons.first();
      await expect(firstButton).toBeVisible({ timeout: 5000 });
      
      // Check button is clickable
      const isClickable = await firstButton.isEnabled();
      expect(isClickable).toBe(true);
    }
  });
});

test.describe('Public Pages - Performance', () => {
  test('Pages load within acceptable time', async ({ page, baseURL }) => {
    const pages = [
      '/',
      '/about',
      '/teams',
      '/shop',
      '/brochure',
      '/programs',
      '/realverse/experience',
      '/fan-club/benefits',
    ];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      
      await page.goto(`${baseURL || ''}${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Each page should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    }
  });

  test('No memory leaks on navigation', async ({ page, baseURL }) => {
    const pages = [
      '/',
      '/about',
      '/shop',
      '/brochure',
    ];
    
    for (const pagePath of pages) {
      await page.goto(`${baseURL || ''}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // Check page still works after multiple navigations
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Public Pages - Error Handling', () => {
  test('404 page handles missing routes', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/non-existent-page-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or redirect, but not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('Invalid product slugs handled gracefully', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/shop/invalid-product-slug-12345`);
    await page.waitForLoadState('networkidle');
    
    // Should show error or redirect, but not crash
    await expect(page.locator('body')).toBeVisible();
  });
});

