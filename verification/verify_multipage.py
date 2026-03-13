import time
from playwright.sync_api import sync_playwright, expect

def verify_navigation(page):
    page.goto("http://localhost:5173")

    # Wait for the app to initialize
    page.wait_for_selector("#app > div")

    # Take screenshot of Home
    page.screenshot(path="verification/page_home.png")
    print("Screenshot of Home saved.")

    # Navigate to Architecture
    page.click("text=Arquitectura")
    time.sleep(1) # Wait for transition
    page.screenshot(path="verification/page_architecture.png")
    print("Screenshot of Architecture saved.")

    # Navigate to Showcase
    page.click("text=Showcase")
    time.sleep(1)
    page.screenshot(path="verification/page_showcase.png")
    print("Screenshot of Showcase saved.")

    # Navigate to Lab
    page.click("text=Laboratorio")
    time.sleep(1)
    page.screenshot(path="verification/page_lab.png")
    print("Screenshot of Lab saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a consistent viewport
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        try:
            verify_navigation(page)
        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()
