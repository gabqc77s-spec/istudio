from playwright.sync_api import Page, expect, sync_playwright
import time

def test_actions_system(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5173")

    # Wait for the engine to load
    page.wait_for_selector("[data-path='pagina_principal']")

    # 1. Test Toggle Universo Button (Click)
    universo = page.locator("[data-path='pagina_principal.laboratorio_3d.universo']")
    toggle_btn = page.get_by_text("Toggle Universo")

    # Initial opacity should be 1
    # Note: opacity might be set by the fade scroll system, but in lab it should be 1

    print("Clicking Toggle Universo...")
    toggle_btn.click()
    time.sleep(1)

    # Check if styles were applied
    opacity = universo.evaluate("el => getComputedStyle(el).opacity")
    print(f"Universo Opacity after click: {opacity}")
    assert float(opacity) < 1.0, f"Action failed to apply opacity. Got {opacity}"

    # Click again to untoggle
    print("Untoggling Universo...")
    toggle_btn.click()
    time.sleep(1)
    opacity_restored = universo.evaluate("el => getComputedStyle(el).opacity")
    print(f"Universo Opacity after untoggle: {opacity_restored}")
    assert float(opacity_restored) > 0.9, "Action failed to restore original opacity"

    # 2. Test Alerta Planeta (Hover)
    planeta = page.locator("[data-path='pagina_principal.laboratorio_3d.universo.planeta_central']")
    alerta_btn = page.get_by_text("Alerta Planeta")

    print("Hovering Alerta Planeta...")
    alerta_btn.hover()
    time.sleep(1)

    # Check for box-shadow change
    shadow = planeta.evaluate("el => getComputedStyle(el).boxShadow")
    print(f"Planeta Shadow on hover: {shadow}")
    assert "rgb(239, 68, 68)" in shadow or "#ef4444" in shadow, "Hover action failed to change color"

    print("Actions system verified successfully!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_actions_system(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
