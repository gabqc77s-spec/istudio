from playwright.sync_api import Page, expect, sync_playwright

def test_v4_engine_cleanup(page: Page):
    # Navigate to the app
    page.goto("http://localhost:5173")

    # Verify bubbles are still there
    injector_btn = page.locator("#injector-btn")
    ai_bubble = page.locator("#ai-bubble")

    expect(injector_btn).to_be_visible()
    expect(ai_bubble).to_be_visible()

    # Open AI panel
    ai_bubble.click()
    ai_panel = page.locator("#ai-panel")
    expect(ai_panel).to_be_visible()

    # The logo element has data-path="pagina_principal.header_nav.logo"
    logo = page.locator('[data-path="pagina_principal.header_nav.logo"]')
    expect(logo).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/v4_cleanup_verification.png")
    print("Screenshot saved to verification/v4_cleanup_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_v4_engine_cleanup(page)
        finally:
            browser.close()
