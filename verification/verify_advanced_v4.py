from playwright.sync_api import Page, expect, sync_playwright
import time

def test_advanced_interactions(page: Page):
    # Log console messages
    page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

    # Navegar a la app
    page.goto("http://localhost:5173")

    # Esperar a que el motor renderice
    # Intentar esperar por cualquier data-path primero para ver si carga algo
    page.wait_for_selector("[data-path]", timeout=10000)

    # Ahora buscar el específico
    page.wait_for_selector('[data-path="pagina_principal.DEMO_V4_AVANZADO"]', timeout=5000)

    # Verificar presencia de nuevos elementos
    orbe = page.locator('[data-path="pagina_principal.DEMO_V4_AVANZADO.orbe_seguidor"]')
    tarjeta = page.locator('[data-path="pagina_principal.DEMO_V4_AVANZADO.tarjeta_tilt"]')
    expect(orbe).to_be_visible()
    expect(tarjeta).to_be_visible()

    # Probar navegación remota (target)
    p1 = page.locator('[data-path="pagina_principal.DEMO_V4_AVANZADO.nido_paginas_macro.pagina_1"]')
    p2 = page.locator('[data-path="pagina_principal.DEMO_V4_AVANZADO.nido_paginas_macro.pagina_2"]')

    expect(p1).to_have_css("opacity", "1")

    # Click en botón para ir a Beta
    btn_beta = page.locator('[data-path="pagina_principal.DEMO_V4_AVANZADO.nido_paginas_macro.pagina_1.btn_ir_beta"]')
    btn_beta.click()

    # Esperar transición
    time.sleep(1)

    # Ahora P2 debe tener opacity 1
    expect(p2).to_have_css("opacity", "1")

    # Tomar captura
    page.locator('[data-path="pagina_principal.DEMO_V4_AVANZADO"]').scroll_into_view_if_needed()
    page.screenshot(path="verification/advanced_v4_demo.png")
    print("Captura guardada en verification/advanced_v4_demo.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_advanced_interactions(page)
        finally:
            browser.close()
