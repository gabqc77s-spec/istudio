from playwright.sync_api import Page, expect, sync_playwright
import time

def test_tech_lab(page: Page):
    page.goto("http://localhost:5173")

    # Esperar al laboratorio
    lab = page.locator('[data-path="pagina_principal.LABORATORIO_TECNOLOGICO"]')
    lab.scroll_into_view_if_needed()

    # Verificar elementos
    titulo = page.locator('[data-path="pagina_principal.LABORATORIO_TECNOLOGICO.titulo_lab"]')
    cubo = page.locator('[data-path="pagina_principal.LABORATORIO_TECNOLOGICO.cubo_cubo_combinado"]') # Nota: verificar path exacto

    # El motor genera paths anidados, el cubo es hijo directo del LAB
    cubo = page.locator('[data-path="pagina_principal.LABORATORIO_TECNOLOGICO.cubo_combinado"]')
    expect(cubo).to_be_visible()

    # Tomar captura de la mezcla
    page.screenshot(path="verification/tech_lab_demo.png")
    print("Captura guardada en verification/tech_lab_demo.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_tech_lab(page)
        finally:
            browser.close()
