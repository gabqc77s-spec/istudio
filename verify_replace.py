from playwright.sync_api import Page, expect, sync_playwright
import time
import json

def test_replace_state(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5173")

    # Wait for the engine to load
    page.wait_for_selector("[data-path='pagina_principal']")

    # 1. Prepare a completely different page JSON
    maintenance_page = {
        "pagina_mantenimiento": {
            "nombre": "Pagina de Mantenimiento",
            "width": "100%",
            "height": "100vh",
            "background": "rgb(255, 0, 0)", # Red for visibility
            "display": "flex",
            "align-items": "center",
            "justify-content": "center",
            "texto": "SITIO REEMPLAZADO"
        }
    }

    print("Injecting total replacement...")
    # Inject using the replace flag (JSON uses lowercase true)
    payload = json.dumps({ 'partial': maintenance_page, 'replace': True })
    page.evaluate(f"window.inyectar_cambios_v4({payload})")
    time.sleep(1)

    # 2. Verify that 'pagina_principal' is GONE
    count_principal = page.locator("[data-path='pagina_principal']").count()
    print(f"Original page count: {count_principal}")
    assert count_principal == 0, "The original page was NOT removed during replacement!"

    # 3. Verify that 'pagina_mantenimiento' IS THERE
    new_page = page.locator("[data-path='pagina_mantenimiento']")
    expect(new_page).to_be_visible()

    text = new_page.evaluate("el => el.textContent")
    print(f"New page text: {text}")
    assert "SITIO REEMPLAZADO" in text, "The new page content is incorrect!"

    # 4. Verify background color
    bg = new_page.evaluate("el => getComputedStyle(el).backgroundColor")
    print(f"New page background: {bg}")
    assert "rgb(255, 0, 0)" in bg, f"Background style was not applied correctly. Got {bg}"

    print("Total state replacement verified successfully!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_replace_state(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
