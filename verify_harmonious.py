
import asyncio
from playwright.async_api import async_playwright
import os
import http.server
import threading
import time
import json

PORT = 8082

class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = SilentHandler
    httpd = http.server.HTTPServer(("", PORT), handler)
    httpd.serve_forever()

async def verify_harmonious_v4():
    # Start server
    thread = threading.Thread(target=start_server, daemon=True)
    thread.start()
    time.sleep(1)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 3000}) # Tall to see all sections

        print("Loading Harmonious Master Site...")
        await page.goto(f"http://localhost:{PORT}/index.html", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Take full page screenshot of the default state
        await page.screenshot(path="harmonious_full_master.png")
        print("Captured harmonious_full_master.png")

        # --- THEME SWITCH TEST ---
        themes = ["glass", "organic", "studio", "cyber"]
        for theme in themes:
            print(f"Applying theme: {theme}")
            await page.click(f".dock-item[data-site='{theme}']")
            await page.wait_for_timeout(2000) # Wait for CSS transition

            # Verify background change
            bg = await page.evaluate("window.getComputedStyle(document.querySelector('[data-path=\"pagina_principal\"]')).background")
            print(f"Theme {theme} background: {bg[:50]}...")

            await page.screenshot(path=f"harmonious_theme_{theme}.png")
            print(f"Captured harmonious_theme_{theme}.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_harmonious_v4())
