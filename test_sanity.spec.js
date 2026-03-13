import { test, expect } from '@playwright/test';

test('UI elements are present and functional', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Check bubbles
  const injectorBtn = page.locator('#injector-btn');
  const aiBubble = page.locator('#ai-bubble');

  await expect(injectorBtn).toBeVisible();
  await expect(aiBubble).toBeVisible();

  // Open AI panel
  await aiBubble.click();
  const aiPanel = page.locator('#ai-panel');
  await expect(aiPanel).toBeVisible();

  // Check attachment button
  const attachBtn = page.locator('#ai-attach');
  await expect(attachBtn).toBeVisible();

  // Check if initial context message was sent (priming)
  // Since it's a fetch, wait a bit
  await page.waitForTimeout(1000);
  const messages = await page.innerText('#ai-messages');
  expect(messages).toContain('Arquitecto IA');
});
