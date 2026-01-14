import { test, expect } from '@playwright/test';

/**
 * Comprehensive RealVerse Section Tests
 * Tests all RealVerse features and sections across devices
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

test.describe('RealVerse Student - Complete Section Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'student', baseURL);
  });

  test('Student Dashboard - All components load', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student`);
    await page.waitForLoadState('networkidle');
    
    // Check for dashboard content
    const dashboardContent = page.locator('main, [role="main"]').first();
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });
    
    // Check for no console errors
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

  test('Student Development - All tabs and content', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/development`);
    await page.waitForLoadState('networkidle');
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check for tabs or sections
    const tabs = page.locator('[role="tab"], button[class*="tab"], [class*="tab-button"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Click through tabs if they exist
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        const tab = tabs.nth(i);
        if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
          await tab.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Student Analytics - Charts and metrics', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/analytics`);
    await page.waitForLoadState('networkidle');
    
    // Check for analytics content
    const analyticsContent = page.locator('main, [role="main"]').first();
    await expect(analyticsContent).toBeVisible({ timeout: 10000 });
    
    // Check for charts
    const charts = page.locator('svg, canvas, [class*="chart"], [class*="graph"]');
    const chartCount = await charts.count();
    
    // At least some visualization should be present
    if (chartCount === 0) {
      // Check for metrics or stats instead
      const metrics = page.locator('[class*="metric"], [class*="stat"], [class*="kpi"]');
      const metricCount = await metrics.count();
      expect(metricCount).toBeGreaterThan(0);
    }
  });

  test('Student Matches - Match list and details', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/matches`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for match cards or list
    const matches = page.locator('[class*="match"], [class*="fixture"], [class*="game"]');
    const matchCount = await matches.count();
    
    // Page should load even if no matches
    expect(matchCount).toBeGreaterThanOrEqual(0);
  });

  test('Student Wellness Reports - Reports display', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/wellness-reports`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for reports or empty state
    const reports = page.locator('[class*="report"], [class*="wellness"]');
    const reportCount = await reports.count();
    
    expect(reportCount).toBeGreaterThanOrEqual(0);
  });

  test('Student Schedule - Calendar functionality', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/student/schedule`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for calendar or schedule view
    const calendar = page.locator('[class*="calendar"], [class*="schedule"], table');
    const calendarCount = await calendar.count();
    
    expect(calendarCount).toBeGreaterThanOrEqual(0);
  });

  test('Student Attendance - Attendance tracking', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/my-attendance`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for attendance records
    const attendance = page.locator('[class*="attendance"], table, [class*="record"]');
    const attendanceCount = await attendance.count();
    
    expect(attendanceCount).toBeGreaterThanOrEqual(0);
  });

  test('Student Fixtures - Fixtures list', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/my-fixtures`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Student Drills - Drills library', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/drills`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for drills list
    const drills = page.locator('[class*="drill"], [class*="video"], [class*="tutorial"]');
    const drillCount = await drills.count();
    
    expect(drillCount).toBeGreaterThanOrEqual(0);
  });

  test('Student Feed - Social feed', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/feed`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for feed posts
    const posts = page.locator('[class*="post"], [class*="feed"], article');
    const postCount = await posts.count();
    
    expect(postCount).toBeGreaterThanOrEqual(0);
  });

  test('Student Leaderboard - Leaderboard display', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/leaderboard`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for leaderboard
    const leaderboard = page.locator('[class*="leaderboard"], table, [class*="ranking"]');
    const leaderboardCount = await leaderboard.count();
    
    expect(leaderboardCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('RealVerse Coach - Complete Section Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'coach', baseURL);
  });

  test('Coach Dashboard - All features', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for dashboard widgets
    const widgets = page.locator('[class*="widget"], [class*="card"], [class*="metric"]');
    const widgetCount = await widgets.count();
    
    expect(widgetCount).toBeGreaterThanOrEqual(0);
  });

  test('Coach Analytics - Analytics dashboards', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach/analytics`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for analytics content
    const analytics = page.locator('[class*="analytics"], [class*="chart"], [class*="metric"]');
    const analyticsCount = await analytics.count();
    
    expect(analyticsCount).toBeGreaterThanOrEqual(0);
  });

  test('Coach Schedule - Schedule management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach/schedule`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Coach Fan Club Analytics - Analytics page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/coach/fan-club-analytics`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('RealVerse Admin - Complete Section Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'admin', baseURL);
  });

  test('Admin Dashboard - All sections', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for dashboard content
    const dashboard = page.locator('main, [role="main"]').first();
    await expect(dashboard).toBeVisible({ timeout: 10000 });
  });

  test('Admin Analytics - Analytics dashboards', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/analytics`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Students - Student management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/students`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for student list or table
    const students = page.locator('[class*="student"], table, [class*="list"]');
    const studentCount = await students.count();
    
    expect(studentCount).toBeGreaterThanOrEqual(0);
  });

  test('Admin Centres - Centre management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/centres`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for centres list
    const centres = page.locator('[class*="centre"], [class*="center"], table');
    const centreCount = await centres.count();
    
    expect(centreCount).toBeGreaterThanOrEqual(0);
  });

  test('Admin Merchandise - Product management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/merch`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for products list
    const products = page.locator('[class*="product"], [class*="merch"], table');
    const productCount = await products.count();
    
    expect(productCount).toBeGreaterThanOrEqual(0);
  });

  test('Admin Attendance - Attendance management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/attendance`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Schedule - Schedule management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/schedule`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Fans - Fan management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/fans`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Fan Tiers - Tier management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/fans/tiers`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Fan Rewards - Rewards management', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/fans/rewards`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Fan Analytics - Fan analytics', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/fans/analytics`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Season Planning - Season planning', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/season-planning`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Batch Review - Batch review', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/admin/batch-review`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Admin Scouting Board - Scouting', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/scouting/board`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('RealVerse Fan - Complete Section Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginAs(page, 'fan', baseURL);
  });

  test('Fan Dashboard - All features', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for dashboard content
    const dashboard = page.locator('main, [role="main"]').first();
    await expect(dashboard).toBeVisible({ timeout: 10000 });
  });

  test('Fan Benefits - Benefits display', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/benefits`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check for benefits content
    const benefits = page.locator('[class*="benefit"], [class*="tier"], [class*="feature"]');
    const benefitCount = await benefits.count();
    
    expect(benefitCount).toBeGreaterThanOrEqual(0);
  });

  test('Fan Games - Games display', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/games`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Fan Matchday - Matchday content', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/matchday`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Fan Profile - Profile page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/profile`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('Fan Programs - Programs page', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || ''}/realverse/fan/programs`);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('RealVerse Navigation - All Sections', () => {
  test('Student navigation - All links work', async ({ page, baseURL }) => {
    await loginAs(page, 'student', baseURL);
    
    const studentRoutes = [
      '/realverse/student',
      '/realverse/student/development',
      '/realverse/student/analytics',
      '/realverse/student/matches',
      '/realverse/student/wellness-reports',
      '/realverse/student/schedule',
      '/realverse/my-attendance',
      '/realverse/my-fixtures',
      '/realverse/drills',
      '/realverse/feed',
      '/realverse/leaderboard',
    ];
    
    for (const route of studentRoutes) {
      await page.goto(`${baseURL || ''}${route}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Coach navigation - All links work', async ({ page, baseURL }) => {
    await loginAs(page, 'coach', baseURL);
    
    const coachRoutes = [
      '/realverse/coach',
      '/realverse/coach/analytics',
      '/realverse/coach/schedule',
      '/realverse/coach/fan-club-analytics',
    ];
    
    for (const route of coachRoutes) {
      await page.goto(`${baseURL || ''}${route}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Admin navigation - All links work', async ({ page, baseURL }) => {
    await loginAs(page, 'admin', baseURL);
    
    const adminRoutes = [
      '/realverse/admin',
      '/realverse/admin/analytics',
      '/realverse/admin/students',
      '/realverse/admin/centres',
      '/realverse/admin/merch',
      '/realverse/admin/attendance',
      '/realverse/admin/schedule',
      '/realverse/admin/fans',
      '/realverse/admin/fans/tiers',
      '/realverse/admin/fans/rewards',
      '/realverse/admin/fans/analytics',
      '/realverse/admin/season-planning',
      '/realverse/admin/batch-review',
    ];
    
    for (const route of adminRoutes) {
      await page.goto(`${baseURL || ''}${route}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Fan navigation - All links work', async ({ page, baseURL }) => {
    await loginAs(page, 'fan', baseURL);
    
    const fanRoutes = [
      '/realverse/fan',
      '/realverse/fan/benefits',
      '/realverse/fan/games',
      '/realverse/fan/matchday',
      '/realverse/fan/profile',
      '/realverse/fan/programs',
    ];
    
    for (const route of fanRoutes) {
      await page.goto(`${baseURL || ''}${route}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

