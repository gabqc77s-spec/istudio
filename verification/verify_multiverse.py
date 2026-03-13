from playwright.sync_api import sync_playwright
import time
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Iniciar en el primer universo (Corp)
        page.goto("http://localhost:5173")
        time.sleep(3) # Esperar renderizado
        page.screenshot(path="verification/multiverse_1_corp.png")

        # Ir al segundo universo (Lab)
        page.click('text="🧪 RESEARCH"')
        time.sleep(2) # Esperar transición cinemática
        page.screenshot(path="verification/multiverse_2_lab.png")

        # Ir al tercer universo (Showcase)
        page.click('text="💎 SHOWCASE"')
        time.sleep(2)
        page.screenshot(path="verification/multiverse_3_showcase.png")

        # Probar interacción de explosión en Showcase
        page.click('text="VIEW EXPLODED"')
        time.sleep(1.5)
        page.screenshot(path="verification/multiverse_3_showcase_exploded.png")

        # Ir al cuarto universo (Fintech)
        page.click('text="💳 FINTECH"')
        time.sleep(2)
        page.screenshot(path="verification/multiverse_4_fintech.png")

        # Probar navegación interna en Fintech
        page.click('text="View Transactions"')
        time.sleep(1)
        page.screenshot(path="verification/multiverse_4_fintech_internal.png")

        browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    run_verification()
