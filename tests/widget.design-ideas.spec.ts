import { test, expect } from '@playwright/test';

test.describe('Quick Start & Empty State wiring', () => {
  test('Design ideas returns curated products', async ({ request }) => {
    const res = await request.get('http://localhost:3002/api/concierge/products?featured=true&readyToShip=true&limit=6');
    expect(res.ok()).toBeTruthy();
    const items = await res.json();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  test('Clicking "Design ideas" renders non-empty results', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.getByRole('button', { name: /Design ideas/i }).click();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCountGreaterThan(0, { timeout: 2000 });
  });

  test('Empty-state CTA "ready-to-ship rings" yields items', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('widget:setFilters', { detail: { tags: ['__none__'] } }));
    });
    await page.getByRole('button', { name: /Try ready-to-ship rings/i }).click();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCountGreaterThan(0, { timeout: 2000 });
  });
});
