
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test('verify AI Assistant UI is present and draggable', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  const aiBubble = page.locator('#ai-bubble');
  await expect(aiBubble).toBeVisible();

  const initialBox = await aiBubble.boundingBox();

  // Drag it
  // Ensure we are scrolling to the bubble first if it's far away
  await aiBubble.scrollIntoViewIfNeeded();

  await page.evaluate(() => {
    const bubble = document.getElementById('ai-bubble');
    const rect = bubble.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    bubble.dispatchEvent(new MouseEvent('mousedown', { clientX: startX, clientY: startY, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 500, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });

  const newBox = await aiBubble.boundingBox();
  expect(newBox.x).not.toBe(initialBox.x);

  // Open panel
  await aiBubble.click();
  await expect(page.locator('#ai-panel')).toBeVisible();

  await page.screenshot({ path: 'ai_assistant_ui_verification.png' });
});
