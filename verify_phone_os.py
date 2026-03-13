from playwright.sync_api import Page, expect, sync_playwright
import time

def test_phone_os(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5173")

    # Wait for the phone section to load
    page.wait_for_selector("[data-path*='telefono_contenedor']")

    # 1. Test Springboard Paging (Horizontal Scroll)
    springboard = page.locator("[data-path*='springboard_container']")
    springboard.scroll_into_view_if_needed()

    # Drag to next page
    print("Dragging springboard to next page...")
    box = springboard.bounding_box()
    page.mouse.move(box["x"] + box["width"] - 10, box["y"] + box["height"] / 2)
    page.mouse.down()
    page.mouse.move(box["x"] + 10, box["y"] + box["height"] / 2, steps=10)
    page.mouse.up()
    time.sleep(1)

    # 2. Open an App (Clima)
    print("Opening Clima app...")
    page.get_by_text("Clima").click()
    time.sleep(1)

    # Verify app is visible
    app_clima = page.locator("[data-path*='app_clima']")
    opacity = app_clima.evaluate("el => getComputedStyle(el).opacity")
    print(f"App Clima opacity: {opacity}")
    assert float(opacity) > 0.9, "App Clima failed to open"

    # 3. Test Home Button
    print("Clicking Home Button...")
    home_btn = page.locator("[data-path*='home_button']")
    home_btn.click()
    time.sleep(1)

    # Verify app is closed
    opacity_after = app_clima.evaluate("el => getComputedStyle(el).opacity")
    print(f"App Clima opacity after home: {opacity_after}")
    assert float(opacity_after) < 0.1, "App Clima failed to close via Home Button"

    print("Phone OS experience verified successfully!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_phone_os(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
