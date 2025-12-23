import { test, expect } from '@playwright/test';

test.describe('@concierge-atlas', () => {
  test('ready-to-ship rings under $300 are curated from Atlas', async ({ request }) => {
    const url = 'http://localhost:3002/api/concierge/products?category=ring&readyToShip=true&priceLt=300';
    const res = await request.get(url);
    expect(res.ok()).toBeTruthy();
    const items = await res.json();
    expect(Array.isArray(items)).toBe(true);
    // Validate that results match the filters
    for (const p of items) {
      expect((p.category||'').toLowerCase()).toContain('ring');
      expect(p.readyToShip).toBe(true);
      if (typeof p.price === 'number') {
        expect(p.price).toBeLessThan(300); // Under $300
        expect(p.price).toBeGreaterThan(0); // Sanity check
      }
    }
    // Log the count for evidence
    console.log(`Found ${items.length} ready-to-ship rings under $300`);
  });
});

