import asyncio
from playwright.async_api import async_playwright

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})
        await page.goto('http://localhost:5173')
        await page.wait_for_timeout(2000)

        # Ir a Aero X
        await page.click('div[data-path*="item3"]')
        await page.wait_for_timeout(3000)

        # Hacer clic en coordenadas del botón si el selector falla
        # Primero necesitamos saber dónde debería estar el botón
        btn_info = await page.evaluate("""() => {
            const el = document.querySelector('[data-path*="btn_expl"]');
            if(!el) return null;
            const rect = el.getBoundingClientRect();
            return {
                path: el.dataset.path,
                rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
                visible: rect.width > 0
            };
        }""")
        print(f"Button Info: {btn_info}")

        if btn_info and btn_info['rect']['w'] > 0:
            await page.mouse.click(btn_info['rect']['x'] + btn_info['rect']['w']/2, btn_info['rect']['y'] + btn_info['rect']['h']/2)
            print("Clicked via mouse coordinates")
        else:
            # Forzar clic via JS si no tiene tamaño real para Playwright
            await page.evaluate("document.querySelector('[data-path*=\"btn_expl\"]').click()")
            print("Clicked via JS evaluation")

        await page.wait_for_timeout(1500)
        await page.screenshot(path='inspect_aero_x_click_force.png')
        await browser.close()

asyncio.run(inspect())
