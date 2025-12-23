import baseConfig from './playwright.config'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  ...baseConfig,
  testDir: '.',
  testMatch: ['tests/smoke/**/*.spec.ts', 'tests/visual/**/*.spec.ts'],
  use: {
    ...baseConfig.use,
  },
  webServer: baseConfig.webServer,
  projects: baseConfig.projects ?? [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
