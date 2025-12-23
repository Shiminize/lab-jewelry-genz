#!/usr/bin/env node
import { chromium } from 'playwright'
import fs from 'fs/promises'
import path from 'path'

async function main() {
  const baseUrl = process.env.WIDGET_BASE_URL || 'http://localhost:3000'
  const dateStamp = new Date().toISOString().slice(0, 10)
  const evidenceDir = path.resolve('docs/concierge_v1/launch_evidence', dateStamp)
  await fs.mkdir(evidenceDir, { recursive: true })

  const requestLog = []
  const consoleLogs = []

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.on('dialog', (dialog) => dialog.accept().catch(() => { }))

  page.on('console', (msg) => consoleLogs.push({ type: msg.type(), text: msg.text() }))

  await page.addInitScript(() => {
    window.__auroraEvents = []
    window.addEventListener('aurora-widget-event', (event) => {
      window.__auroraEvents.push({ timestamp: Date.now(), ...event.detail })
    })
  })

  await page.goto(baseUrl, { waitUntil: 'networkidle' })

  const widgetButton = page.getByRole('button', { name: /Concierge/i })
  await widgetButton.click()
  const widget = page.locator('#glowglitch-aurora-widget')
  await widget.waitFor({ state: 'visible' })

  async function capture(label, urlSubstring, action) {
    try {
      const [req] = await Promise.all([
        page.waitForEvent('requestfinished', {
          predicate: (r) => r.url().includes(urlSubstring),
          timeout: 30000,
        }),
        action(),
      ])
      const res = await req.response()
      const headers = req.headers()
      let json = null
      try {
        json = await res.json()
      } catch { }
      requestLog.push(
        `${label}: ${JSON.stringify({
          url: req.url(),
          requestId: headers['x-request-id'] || null,
          status: res.status(),
          body: json,
        })}`
      )
      return { req, res, json }
    } catch (error) {
      requestLog.push(`${label}: timeout or missing request for ${urlSubstring}`)
      return null
    }
  }

  const screenshot = (name) => widget.screenshot({ path: path.join(evidenceDir, name) })

  // Ready-to-ship -> shortlist add/remove
  const rts = widget.getByRole('button', { name: /Ready to ship/i })
  await capture('find_product', '/api/support/products', () => rts.click({ force: true }))
  await widget.getByText('Here are ready-to-ship pieces', { exact: false }).waitFor({ timeout: 20000 })
  await screenshot('01_products.png')

  const saveButtons = widget.getByRole('button', { name: /Save to shortlist/i })
  await capture('shortlist_add', '/api/support/shortlist', () => saveButtons.first().click())
  await widget.getByText('You now have 1 item saved.', { exact: false }).waitFor({ timeout: 15000 })
  await screenshot('02_shortlist_added.png')

  const shortlistToggle = widget.getByRole('button', { name: /Shortlist \\(1\\)/i }).first()
  await shortlistToggle.click({ force: true })
  await widget.getByText(/Share or clear your shortlist/i).waitFor({ timeout: 10000 })
  // Go to checkout CTA should be present when items exist
  await widget.getByRole('button', { name: /Go to checkout/i }).first().waitFor({ timeout: 10000 })
  await screenshot('02b_shortlist_drawer.png')
  await widget.getByLabel('Close shortlist').click()

  const removeButtons = widget.getByRole('button', { name: /^Remove$/i })
  await capture('shortlist_remove', '/api/support/shortlist', () => removeButtons.first().click()).catch(() =>
    requestLog.push('shortlist_remove: no remove button')
  )
  await screenshot('03_shortlist_removed.png')

  // Track order -> timeline -> text updates
  const trackLink = widget.getByRole('button', { name: 'Track my order' })
  await trackLink.click()
  await widget.getByPlaceholder('GG-12345').fill('GG-12345')
  await capture('order_status', '/api/support/order-status', () =>
    widget.getByRole('button', { name: /Check status/i }).click()
  )
  await widget.getByText('Here’s your latest order status', { exact: false }).waitFor({ timeout: 20000 })
  await screenshot('04_order_timeline.png')

  const textUpdates = widget.getByRole('button', { name: /Text me updates/i })
  await capture('order_updates', '/api/support/order-updates', () => textUpdates.click())
  await screenshot('05_order_updates.png')

  // Returns -> escalation form
  await widget.getByRole('button', { name: 'Returns & resizing' }).click()
  await capture('returns', '/api/support/returns', () =>
    widget.getByRole('button', { name: /Start a return/i }).click()
  )
  await screenshot('06_return_result.png')

  // Escalation (stylist) from either return follow-up or direct quick link
  const emailInput = widget.getByPlaceholder('you@example.com')
  await emailInput.fill('aurora.audit@example.com')
  await widget.getByPlaceholder('Your name').fill('Alex Audit')
  await widget.getByPlaceholder('Share vision, sizing updates, or deadlines.').fill('Shortlist + returns follow-up')
  const stylistButtons = widget.getByRole('button', { name: /Invite stylist|Send my request/i })
  await capture('stylist', '/api/support/stylist', () => stylistButtons.first().click())
  await screenshot('07_stylist.png')

  // CSAT
  const csatButton = widget.getByRole('button', { name: /Great|👍/ })
  await capture('csat', '/api/support/csat', () => csatButton.click()).catch(() =>
    requestLog.push('csat: missing csat prompt')
  )
  await screenshot('08_csat.png')

  // Analytics events snapshot
  const events = await page.evaluate(() => window.__auroraEvents ?? [])
  await fs.writeFile(path.join(evidenceDir, 'analytics_events.json'), JSON.stringify(events, null, 2))

  await browser.close()
  await fs.writeFile(path.join(evidenceDir, 'journeys_request_ids.txt'), requestLog.join('\n'))
  await fs.writeFile(path.join(evidenceDir, 'console_logs.json'), JSON.stringify(consoleLogs, null, 2))
}

main().catch((error) => {
  console.error('Verification script failed', error)
  process.exitCode = 1
})
