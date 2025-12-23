import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT || '3100'
const HOST = '127.0.0.1'
const BASE_URL = `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run build && NEXT_DISABLE_MIDDLEWARE=1 HOSTNAME=${HOST} PORT=${PORT} npm run start`,
    url: BASE_URL,
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
