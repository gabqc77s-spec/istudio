import { test } from '@playwright/test';

test('capture ui', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('#ai-bubble');
  await page.waitForTimeout(2000); // Wait for priming
  await page.screenshot({ path: 'ai_interface_complete.png' });

  await page.click('#close-ai');
  await page.click('#injector-btn');
  await page.screenshot({ path: 'manual_injector_ui.png' });
});
