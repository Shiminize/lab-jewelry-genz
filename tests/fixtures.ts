import { test as base } from '@playwright/test'

const ignoredConsolePattern = /(contentScript\.bundle\.js|chrome-extension:|117-[a-f0-9]+\.js)/i

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const consoleErrors: string[] = []

  page.on('console', (message) => {
    const type = message.type()
    const text = message.text()
    const location = message.location()
    const url = location?.url ?? ''

      if (ignoredConsolePattern.test(url) || ignoredConsolePattern.test(text)) {
        return
      }

      if (type === 'warning') {
        return
      }

    if (type === 'error') {
      if (text.includes('Failed to load resource') && url.includes('/products/')) {
        return
      }
      consoleErrors.push(`[${type}] ${text} @ ${url || '<no-url>'}`)
    }
  })

    await page.route('**/*', async (route) => {
      const url = route.request().url()
      if (/\/(login|studio)\?_rsc=/.test(url)) {
        await route.fulfill({ status: 204, body: '' })
        return
      }
      await route.continue()
    })

    await use(page)

    if (consoleErrors.length > 0) {
      await testInfo.attach('console-errors', {
        body: consoleErrors.join('\n'),
        contentType: 'text/plain',
      })
      throw new Error(`Console errors detected:\n${consoleErrors.join('\n')}`)
    }
  },
})

export const expect = test.expect
