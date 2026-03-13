import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        page.on("console", lambda msg: print(f"CONSOLE: [{msg.type}] {msg.text}"))

        try:
            await page.goto('http://localhost:5173', wait_until='networkidle')
        except:
            print("Server not running on 5173.")
            await browser.close()
            return

        # 1. Capture Hero Section
        await page.wait_for_timeout(3000) # Wait for animations
        await page.screenshot(path='verification/unified_1_hero.png')
        print("Captured Unified Hero")

        # 2. Scroll to Services and Capture
        await page.evaluate("window.scrollTo(0, 1200)")
        await page.wait_for_timeout(2000)
        await page.screenshot(path='verification/unified_2_services.png')
        print("Captured Unified Services")

        # 3. Scroll to Showcase and Trigger Exploded View
        await page.evaluate("window.scrollTo(0, 2400)")
        await page.wait_for_timeout(2000)
        await page.screenshot(path='verification/unified_3_showcase_normal.png')

        # Click Expand Architecture
        selector = 'div[data-path*="b1"]'
        try:
            await page.wait_for_selector(selector, timeout=5000, state='attached')
            await page.evaluate(f'document.querySelector(\'{selector}\').click()')
            await page.wait_for_timeout(2000)
            await page.screenshot(path='verification/unified_4_showcase_expanded.png')
            print("Captured Unified Showcase (Expanded)")
        except Exception as e:
            print(f"Failed to expand showcase: {e}")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('verification'):
        os.makedirs('verification')
    asyncio.run(verify())
