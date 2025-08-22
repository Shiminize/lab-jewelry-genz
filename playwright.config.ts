import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration with Vision Mode E2E Testing
 * CLAUDE_RULES Compliant: Visual validation + Performance testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3001', // Use optimized server

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Visual testing configuration for CSS 3D Customizer */
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    /* Video recording for debugging visual issues */
    video: 'retain-on-failure',
    
    /* Increased timeouts for image sequence loading */
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  
  /* Global test timeout for complex visual validations */
  timeout: 60000,
  
  /* Visual testing configuration */
  expect: {
    /* Strict visual comparison thresholds */
    toHaveScreenshot: {
      threshold: 0.1,        // 10% pixel difference threshold
      maxDiffPixels: 1000,   // Maximum different pixels allowed
      animations: 'disabled' // Disable animations for consistent screenshots
    },
    
    /* Performance thresholds for CLAUDE_RULES compliance */
    timeout: 10000
  },

  /* Configure projects for major browsers with visual testing */
  projects: [
    // Desktop Visual Testing
    {
      name: 'visual-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }, // Consistent viewport for visual comparisons
      },
      testMatch: '**/visual/**/*.spec.ts'
    },
    
    {
      name: 'visual-firefox', 
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/visual/**/*.spec.ts'
    },
    
    {
      name: 'visual-webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: '**/visual/**/*.spec.ts'
    },

    // Mobile Visual Testing
    {
      name: 'visual-mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 }, // Consistent mobile viewport
      },
      testMatch: '**/visual/**/*.spec.ts'
    },
    
    {
      name: 'visual-mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
      testMatch: '**/visual/**/*.spec.ts'
    },

    // Standard functional testing (existing)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/visual/**/*.spec.ts'
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/visual/**/*.spec.ts'
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/visual/**/*.spec.ts'
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: '**/visual/**/*.spec.ts'
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: '**/visual/**/*.spec.ts'
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'PORT=3001 npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for server startup
  },
});