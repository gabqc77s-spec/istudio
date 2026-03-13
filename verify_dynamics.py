from playwright.sync_api import Page, expect, sync_playwright
import time

def test_dynamics(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5173")

    # Wait for the engine to load
    page.wait_for_selector("[data-path='pagina_principal']")

    # Scroll to the laboratory section
    # Based on the content.json, it should be after seccion_hero, seccion_dispositivo_3d, seccion_bento_grid, seccion_faq
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    time.sleep(2)

    # Verify the laboratory section exists
    lab_title = page.get_by_text("Laboratorio V4 Dinámico")
    expect(lab_title).to_be_visible()

    # Take a screenshot of the laboratory section
    # We try to center it
    page.evaluate("document.querySelector('[data-nombre=\"Laboratorio de Dinámicas\"]').scrollIntoView()")
    time.sleep(1)
    page.screenshot(path="verification_dynamics.png")

    print("Screenshot saved to verification_dynamics.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_dynamics(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
