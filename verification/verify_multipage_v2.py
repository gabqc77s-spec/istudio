import time
from playwright.sync_api import sync_playwright, expect

def verify_navigation(page):
    page.goto("http://localhost:5173")

    # Wait for the app to initialize
    page.wait_for_selector("#app > div")
    time.sleep(2) # Give it a moment to render everything

    # Take screenshot of Home
    page.screenshot(path="verification/v4_1_home.png")
    print("Screenshot 1 (Home) saved.")

    # Navigate to Architecture using data-path to be precise
    page.locator('div[data-path="pagina_principal.header_nav.nav_blur.link_arch"]').click(force=True)
    time.sleep(1.5)
    page.screenshot(path="verification/v4_2_architecture.png")
    print("Screenshot 2 (Architecture) saved.")

    # Navigate to Showcase
    page.locator('div[data-path="pagina_principal.header_nav.nav_blur.link_show"]').click(force=True)
    time.sleep(1.5)
    page.screenshot(path="verification/v4_3_showcase.png")
    print("Screenshot 3 (Showcase) saved.")

    # Navigate to Lab
    page.locator('div[data-path="pagina_principal.header_nav.nav_blur.link_lab"]').click(force=True)
    time.sleep(1.5)
    page.screenshot(path="verification/v4_4_lab.png")
    print("Screenshot 4 (Lab) saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            verify_navigation(page)
        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()
