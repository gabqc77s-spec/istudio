# Documentación Técnica del Sistema V4 — Impulsa Studio

Este documento detalla la integración y el funcionamiento de los cuatro pilares del sistema V4: `index.html`, `showcase.js`, `content.json` y el modelo de IA.

## 1. El Núcleo: `src/showcase.js`
Es un motor de renderizado **Vanilla JS** orientado a datos. Su función es transformar un árbol JSON en una estructura DOM compleja con capacidades espaciales.

### Características Clave:
*   **Renderizado Recursivo:** La función `construir()` recorre el JSON creando `divs` y asignando propiedades CSS directamente a `element.style`.
*   **Sistema de Transformaciones Apilables:** Utiliza variables CSS (`--dyn-*`) para evitar colisiones entre efectos:
    ```css
    transform: var(--base-transform) var(--dyn-mouse-follow) var(--dyn-tilt) ...
    ```
*   **Gestión de Memoria:** Los bucles de animación (`requestAnimationFrame`) verifican `el.isConnected` para detenerse si el elemento es eliminado del DOM.
*   **Interacciones Especiales:** Implementa comportamientos que el CSS no puede manejar solo: `seguir-mouse`, `tilt`, `look-at`, `magnetico`, `paralaje`, `escribir` (typewriter), y `audio`.
*   **Acciones Remotas (`acciones`):** Permite que un evento en un elemento dispare cambios en otro elemento lejano usando su `data-path`.

## 2. La Fuente de Verdad: `src/content.json`
Contiene la definición completa de la aplicación.
*   **Estructura:** Árbol jerárquico donde cada llave es un contenedor.
*   **Palabras Reservadas:** `nombre`, `texto`, `hover`, `click`, `scroll`, `acciones`, etc., son interpretadas por el motor como comportamientos, no como estilos.
*   **Navegación:** Soporta un sistema de "Page Swapping" mediante la acción `tipo: "navegacion"`, permitiendo interfaces multi-página dentro de un solo archivo.

## 3. La Interfaz de Usuario: `index.html` (Raíz)
No contiene contenido estático de la aplicación, sino las herramientas de control:
*   **Scene Wrapper:** Contenedor con `perspective` y `preserve-3d` donde se monta el `#app`.
*   **Burbuja del Inyector:** Permite inyectar fragmentos JSON manualmente. Incluye un modo "Capturar" (Inspect) que extrae el JSON de un elemento al hacerle clic.
*   **Asistente IA:** Interfaz de chat conectada a Gemini. Permite adjuntar el contexto JSON de elementos específicos para peticiones precisas.
*   **Review Panel (Human-in-the-loop):** Intercepta las propuestas de la IA, las valida contra una lista blanca de propiedades CSS y permite al usuario aprobar o rechazar el cambio antes de aplicarlo.

## 4. El Cerebro: `src/ai_assistant.js`
Gestiona la comunicación con el modelo **Gemini 3.1 Flash Lite**.
*   **Context Priming:** Al abrir el chat, se envía automáticamente el contenido de `showcase.js`, `showcase.css` y `content.json` para que la IA entienda el motor.
*   **Tool Calling Simulado:** La IA responde con estructuras JSON que el asistente interpreta como llamadas a la función `inyectar_cambios_v4`.
*   **Validación de Salida:** Extrae bloques de código JSON de la respuesta de la IA para pasarlos al panel de revisión.

## 5. Estilos Base: `src/showcase.css`
Limitado exclusivamente a un reset agnóstico. **Ninguna regla visual (colores, tamaños, posiciones) debe existir en este archivo.** Todo el diseño visual debe ser dictado por el `content.json`.

---
*Este sistema permite una iteración rápida y generativa, donde la IA actúa como un arquitecto capaz de modificar la estructura espacial del sitio en tiempo real.*
