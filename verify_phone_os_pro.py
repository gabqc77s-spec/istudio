from playwright.sync_api import Page, expect, sync_playwright
import time

def test_full_phone_experience(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5173")

    # Wait for the phone section to load
    page.wait_for_selector("[data-path*='telefono_contenedor']")

    # 1. Test Horizontal Paging with Snap
    # Use first() to avoid strict mode violation if needed, but better to use exact path
    springboard = page.locator("div[data-nombre='Springboard (Home Screen)']")
    springboard.scroll_into_view_if_needed()

    print("Simulating horizontal swipe...")
    box = springboard.bounding_box()
    # Swipe left to see second page
    page.mouse.move(box["x"] + box["width"] - 50, box["y"] + box["height"] / 2)
    page.mouse.down()
    page.mouse.move(box["x"] + 50, box["y"] + box["height"] / 2, steps=20)
    page.mouse.up()
    time.sleep(1.5) # Wait for snap transition

    # Verify we are on page 2 (Settings icon should be visible)
    icon_settings = page.locator("text=Ajustes")
    expect(icon_settings).to_be_visible()

    # Swipe back to page 1
    page.mouse.move(box["x"] + 50, box["y"] + box["height"] / 2)
    page.mouse.down()
    page.mouse.move(box["x"] + box["width"] - 50, box["y"] + box["height"] / 2, steps=20)
    page.mouse.up()
    time.sleep(1.5)

    # 2. Test App Launch (Mail)
    print("Launching Mail app...")
    page.get_by_text("Mail").click()
    time.sleep(1)

    app_mail = page.locator("[data-path$='app_mail']")
    opacity = app_mail.evaluate("el => getComputedStyle(el).opacity")
    assert float(opacity) > 0.9, f"App Mail failed to launch. Opacity: {opacity}"

    # 3. Test Physical Home Button Reset
    print("Clicking physical Home Button...")
    home_btn = page.locator("[data-path$='home_button']")
    home_btn.click()
    time.sleep(1)

    # Verify app is closed
    opacity_closed = app_mail.evaluate("el => getComputedStyle(el).opacity")
    assert float(opacity_closed) < 0.1, f"App Mail failed to close via Home Button. Opacity: {opacity_closed}"

    # 4. Take visual confirmation screenshot
    page.evaluate("document.querySelector('[data-path*=\"telefono_contenedor\"]').scrollIntoView()")
    time.sleep(1)
    page.screenshot(path="phone_os_verified.png")

    print("Comprehensive Phone OS verification successful!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_full_phone_experience(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
