import { test, expect } from '@playwright/test';

test.describe('@concierge-localdb', () => {
  test('ready-to-ship earrings come from DB', async ({ request }) => {
    const port = process.env.PORT || '3002';
    const res = await request.get(`http://localhost:${port}/api/concierge/products?q=earrings`);
    expect(res.ok()).toBeTruthy();
    const items = await res.json();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    for (const p of items) expect((p.category || '').toLowerCase()).toContain('earring');
    expect(items.some((p: any) => p.readyToShip || (p.tags || []).includes('ready-to-ship'))).toBeTruthy();
  });
});
