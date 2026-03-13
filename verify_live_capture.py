from playwright.sync_api import Page, expect, sync_playwright
import time
import json

def test_live_capture(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5173")

    # Wait for the engine to load
    page.wait_for_selector("[data-path='pagina_principal']")

    # 1. Inject a new property manually via the global API
    new_injected_json = {
        "pagina_principal": {
            "seccion_hero": {
                "contenedor_titulos": {
                    "titulo_principal": {
                        "border": "5px solid lime"
                    }
                }
            }
        }
    }

    page.evaluate(f"window.inyectar_cambios_v4({json.dumps(new_injected_json)})")
    time.sleep(1)

    # 2. Use the hierarchical capture tool to retrieve the live state
    path = "pagina_principal.seccion_hero.contenedor_titulos.titulo_principal"
    captured_json = page.evaluate(f"window.get_json_v4_por_path_jerarquico('{path}')")

    # Check if the lime border is present in the captured JSON
    assert "5px solid lime" in json.dumps(captured_json), "The injected property was not captured in the live state!"

    # 3. Test instance path resolution
    # Get all paths
    all_paths = page.evaluate("Array.from(document.querySelectorAll('[data-path]')).map(el => el.dataset.path)")
    print(f"Sample paths: {all_paths[:20]}")

    instance_path = next((p for p in all_paths if ":ins" in p), None)
    print(f"Testing instance path: {instance_path}")

    instance_json = page.evaluate(f"window.get_json_v4_por_path_jerarquico('{instance_path}')")

    # Check if instances map back to their template
    assert instance_json is not None, f"Failed to resolve instance path: {instance_path}"
    print(f"Resolved Instance JSON keys: {json.dumps(instance_json, indent=1)}")

    print("Live capture and instance resolution verified!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_live_capture(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
