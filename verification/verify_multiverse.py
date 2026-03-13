import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})

        page.on("console", lambda msg: print(f"CONSOLE: [{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        try:
            await page.goto('http://localhost:5173', wait_until='networkidle')
        except:
            print("Server not running on 5173.")
            await browser.close()
            return

        # 1. NEXUS STRATEGY (Default)
        await page.wait_for_timeout(3000) # Wait for engine and typewriter
        await page.screenshot(path='verification/multiverse_1_corp.png')
        print("Captured Universe 1")

        # Function to find and click data-path elements
        async def click_path(path_suffix):
            selector = f'div[data-path*="{path_suffix}"]'
            try:
                # Use state='attached' because 3D elements often report 0x0 visibility
                await page.wait_for_selector(selector, timeout=5000, state='attached')

                # We use JS click because Playwright's click() refuses to click "invisible" 0x0 elements
                await page.evaluate(f'document.querySelector(\'{selector}\').click()')
                return True
            except Exception as e:
                print(f"Failed to find or click {path_suffix}: {e}")
                return False

        # 2. Switch to COGNITIVE LAB
        if await click_path('item2'):
            await page.wait_for_timeout(3000)
            await page.screenshot(path='verification/multiverse_2_lab.png')
            print("Captured Universe 2")

        # 3. Switch to AERO X
        if await click_path('item3'):
            await page.wait_for_timeout(3000)
            await page.screenshot(path='verification/multiverse_3_showcase.png')

            # Trigger Exploded View
            if await click_path('btn_expl'):
                await page.wait_for_timeout(2000)
                await page.screenshot(path='verification/multiverse_3_showcase_exploded.png')
            print("Captured Universe 3")

        # 4. Switch to QUANTUM FINANCE
        if await click_path('item4'):
            await page.wait_for_timeout(3000)
            await page.screenshot(path='verification/multiverse_4_fintech.png')

            # Internal Nav
            if await click_path('NAV_BTNS.btn'):
                await page.wait_for_timeout(2000)
                await page.screenshot(path='verification/multiverse_4_fintech_internal.png')
            print("Captured Universe 4")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('verification'):
        os.makedirs('verification')
    asyncio.run(verify())
