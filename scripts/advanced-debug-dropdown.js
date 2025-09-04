const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    await page.goto('http://localhost:3000/', { timeout: 15000 });

    const navItem = page.locator('[data-testid="rings-nav-item"]');
    await navItem.hover({ timeout: 5000 });

    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/fullpage-debug.png', fullPage: true });
    console.log('Screenshot taken: test-results/fullpage-debug.png');

    const bodyHTML = await page.evaluate(() => document.body.outerHTML);
    console.log('\nBODY HTML:\n', bodyHTML);

  } catch (error) {
    console.error('Error during dropdown test:', error);
    await page.screenshot({ path: 'test-results/dropdown-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
