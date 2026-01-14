import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * RealVerse - FC Real Bengaluru
 * Comprehensive testing across all devices and sections
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },
    // Tablet devices
    {
      name: 'chromium-tablet',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'chromium-tablet-landscape',
      use: { ...devices['iPad Pro landscape'] },
    },
    // Mobile devices
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'chromium-mobile-landscape',
      use: { ...devices['iPhone 13 landscape'] },
    },
    {
      name: 'chromium-mobile-small',
      use: { ...devices['iPhone SE'] },
    },
    // Android devices
    {
      name: 'chromium-android',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'chromium-android-landscape',
      use: { ...devices['Pixel 5 landscape'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

