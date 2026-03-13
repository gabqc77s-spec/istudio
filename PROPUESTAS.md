# Propuestas de Mejora: Arquitectura Generativa Dinámica (iStudio 3D)

Para alcanzar el objetivo de tener un **panel de configuración que controle todos los escenarios posibles** (contenido, efectos, interacciones, posicionamiento y comportamiento 3D) sin "hardcodear" la página ni realizar manipulaciones directas del DOM, es necesario reestructurar la arquitectura actual.

El enfoque debe cambiar de "Un sitio web de Astro con un Canvas 3D de fondo" a **"Una aplicación React (SPA o hidratada) donde Astro solo provee el marco (Shell), y todo el estado y renderizado (HTML + 3D) es orquestado por React"**.

Aquí están las mejoras propuestas para lograr este control total:

---

## 1. Unificación del Estado Global (Single Source of Truth)

Actualmente, el estado está fragmentado. `config.js` tiene valores iniciales, `Scene.jsx` maneja algunos, y el DOM de Astro tiene información estática en duro.

**Mejora:**
- Utilizar una librería de gestión de estado ligero (como **Zustand** o **Jotai**) o el Context API de React.
- El `ConfigPanel` actualizará este estado global.
- **Tanto el Canvas 3D como el contenido HTML leerán de este mismo estado de forma reactiva.**

*Beneficio:* Al cambiar un valor en el panel (ej. "Duración de transición"), automáticamente todos los componentes (React-Three-Fiber y HTML) reaccionarán sin necesidad de `document.getElementById()`.

---

## 2. Migrar el HTML estático de Astro a Componentes de React

Las secciones `.page-section` actualmente viven en `index.astro` y se controlan de manera torpe desde `CameraManager.jsx` y `Scene.jsx`.

**Mejora:**
- Mover todo el contenido HTML de `<div class="page-section">` a un componente o múltiples componentes de React (ej. `HtmlOverlay.jsx`).
- Renderizar este HTML encima del Canvas (fuera del Canvas, o usando `<Html>` de `@react-three/drei` si se requiere vinculación espacial 3D).
- El contenido de estas secciones (títulos, descripciones, tarjetas) no estará escrito en el código, sino que **provendrá del estado global (`config`)**.

*Ejemplo Estructural:*
```javascript
// El estado global (config) definiría:
sections: [
  { id: 'hero', content: { title: '...', subtitle: '...' }, layout: { align: 'center' } },
  { id: 'services', cards: [{ title: '...', desc: '...' }] }
]
// HtmlOverlay iteraría sobre 'sections' para renderizarlas.
```

---

## 3. Parametrización Total de los Efectos 3D

Para controlar "todos los efectos", las variables en `Starfield` y la Cámara deben ser completamente dinámicas.

**Mejora:**
- **Fondos Intercambiables:** En lugar de tener solo un `Starfield`, el estado global puede tener una propiedad `backgroundType: 'stars' | 'particles' | 'fluid'`. `Scene.jsx` renderizará el componente adecuado según la elección.
- **Parametrización de Shaders/Materiales:** Exponer propiedades al panel de control como `opacity`, `speed`, `dispersion`, `bloom` (brillo), y pasarlas como props a los materiales (`PointMaterial` o `ShaderMaterial` personalizados).
- **Post-Procesamiento (Postprocessing):** Implementar `@react-three/postprocessing`. El panel de control puede tener toggles para encender/apagar efectos como Bloom, Noise, Chromatic Aberration, etc.

---

## 4. Control de Navegación y Animación Basado en Datos

Actualmente, el `CameraManager.jsx` tiene las coordenadas estáticas en un objeto `sectionMap`.

**Mejora:**
- Las coordenadas de cámara (y rotación) para cada sección deben vivir en la configuración global (`config`).
- El panel de control puede tener una interfaz para **"Guardar posición actual de cámara"**, permitiendo al usuario navegar libremente en 3D, ubicar la cámara y presionar un botón para asignarla a la Sección 2.
- Las animaciones GSAP ya no leerán de `dataset.sectionCoord` del DOM, sino que responderán a cambios en la variable `currentSectionIndex` del estado global de React.

---

## 5. Eliminar Vanilla JS y Manipulaciones Directas del DOM

Todo código que utilice `document.querySelector` o manipule `style` directamente debe ser eliminado.

**Mejora:**
- **Efecto Máquina de Escribir (Typewriter):** Convertir `src/scripts/engine.js` en un custom hook de React (`useTypewriter`) o un componente `<Typewriter text={config.introText} />`.
- **Botones de Navegación Móvil:** Moverlos desde Astro hacia un componente de React. Así, cuando se haga clic en "Next", simplemente se llama a una función `nextSection()` que actualiza el estado global, y tanto la cámara como el HTML reaccionan a ese cambio de estado.
- **Efecto de Tarjeta Interactiva:** Modificar `InteractiveCard.jsx` para que use el estado del ratón global (que ya se captura en `Scene.jsx`) en lugar de añadir event listeners individuales que manipulan variables CSS de manera imperativa.

---

## 6. Evolución del Panel de Configuración (CMS Visual)

El `ConfigPanel` actual es rudimentario. Para manipular *todos* los escenarios, debe escalar.

**Mejora:**
- Implementar **Leva** (`npm install leva`) u otra librería de GUI especializada. Leva se integra perfectamente con React y `@react-three/fiber`, generando automáticamente controles deslizantes, selectores de color e interruptores basados en el esquema de datos proporcionado.
- Permitir **importar/exportar archivos JSON**. En lugar de usar `prompt`, permitir que el usuario descargue un `config.json` y lo suba para restaurar un estado de la página completamente diferente.
- El panel debe incluir pestañas u organización (Contenido, Estilos, Cámara, Efectos 3D, Post-Procesamiento).

## Resumen del Nuevo Flujo de Datos

1. **ConfigPanel / Leva** modifica -> **Estado Global (Zustand)**
2. **Estado Global** es leído por:
   - **Scene.jsx** (Actualiza color de fondo, cantidad de partículas, etc.)
   - **CameraManager.jsx** (Lee la nueva duración de transición, o las nuevas coordenadas)
   - **HtmlOverlay.jsx** (Renderiza los nuevos textos, alineaciones y oculta/muestra secciones basadas en `currentSectionIndex`)
3. Todo se actualiza de manera **Declarativa**, eliminando por completo los errores de sincronización entre Astro y React.