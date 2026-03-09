# Checklist de Implementación: Motor de Showroom Impulsa Studio

Este es el listado de tareas técnicas paso a paso para transformar el sitio actual en el **Showroom Interactivo de Alta Calidad** con el **Panel Visual Extremo**. Este documento servirá como la hoja de ruta de Gabriel para la fase de "Desarrollo y Programación".

---

## Fase 1: Limpieza Arquitectónica (Deuda Técnica)
*Basado en los hallazgos del `ANALISIS.md`*

- [x] **Limpieza de Dependencias:** Eliminar en `package.json` las integraciones no utilizadas (`@astrojs/preact`, `@astrojs/solid-js`, `@astrojs/svelte`, `@astrojs/vue`).
- [x] **Refactorización de Navegación:** Mover los botones `.mobile-nav` (`Prev`/`Next`) de `index.astro` a un componente React para que compartan el mismo estado que el 3D.
- [x] **Refactorización de Efectos Vanilla JS:** Reescribir `src/scripts/engine.js` (efecto de máquina de escribir) como un Hook o Componente de React (`useTypewriter`).
- [x] **Limpieza de Manipulación DOM Inconsistente:** Limpiar lógicas inconsistentes, manteniendo temporalmente `document.querySelectorAll` en `Scene.jsx` y `CameraManager.jsx` con comentarios `TODO` para evitar romper la UI antes de implementar el Estado Global (Fase 2).
- [x] **Limpieza CSS:** Eliminar selectores huérfanos (`.canvas-container`) de `src/styles/global.css`.

---

## Fase 2: El Motor Data-Driven (Estado Global)

- [x] **Configurar Estado Global:** Instalar e inicializar Zustand o `@preact/signals-react`.
- [x] **Definir JSON Schema:** Crear la estructura de datos base (`src/config.json` o en el store) que defina páginas, secciones, y coordenadas de cámara.
- [x] **Refactorizar `CameraManager`:** Actualizar el componente para que mueva la cámara en base a `currentSectionId` (del estado global) en lugar de eventos de scroll directos.
- [x] **Factory de Secciones:** Crear un componente `SectionRenderer` que lea el JSON y renderice dinámicamente el HTML de las diferentes secciones (Hero, Portafolio, etc.).

---

## Fase 3: Orquestación del Showroom 3D

- [x] **Componente `PhoneDemo3D`:** Crear un modelo 3D de teléfono/tablet (`<primitive object={gltf.scene} />`) en React Three Fiber.
- [x] **Renderizado de Pantalla 3D:** Implementar `<Html>` o `<RenderTexture>` de `@react-three/drei` para proyectar sitios de clientes (como Eficell) en la pantalla del modelo 3D.
- [x] **Eventos de Interacción 3D (Hover/Click):** Conectar los "raycasters" del teléfono 3D para que actualicen el estado global cuando el usuario le hace clic (ej. "enfocar vista").
- [x] **Sistema de Señales Visuales (Signals):** Configurar el cambio de color de las partículas y el reposicionamiento de cámara fluido (con GSAP) sincronizado con el componente HTML en pantalla.

---

## Fase 4: Catálogo de Widgets (Demos en Vivo)

- [x] **Widget: Tarjetas Interactivas Dinámicas:** Refactorizar `InteractiveCard.jsx` para que reciba sus datos (título, descripción, icono) por props desde el JSON.
- [x] **Widget: Demo de Chatbot (Ej. Eficell):** Construir o integrar el componente del Chatbot funcional (con conexión a WebSockets o iFrame) aislándolo en su propio componente.
- [x] **Widget: App Mockup Android:** Desarrollar el componente visual que muestra la vista de "Agente de Soporte" en tiempo real.
- [x] **Registro de Componentes:** Agregar todos estos nuevos Widgets al `SectionRenderer` para que sean elegibles desde el panel.

---

## Fase 5: El Panel de Control Extremo (Edición Visual)

- [x] **Integrar Editor en Contexto:** Instalar y configurar una librería como `react-contenteditable`.
- [x] **Sistema de Autenticación de Admin:** Crear una ruta protegida o botón oculto (ej. Control+Shift+A) que active el "Modo Edición" en la web en vivo.
- [x] **Edición de Textos Inline:** Permitir hacer doble clic sobre los textos en pantalla para editarlos y guardar los cambios directamente al Store.
- [x] **Integrar `Theatre.js`:** Instalar `@theatre/core` y `@theatre/studio`. *(Solucionado mediante arquitectura Client-Only).*
- [x] **Coreografía Visual:** Conectar la cámara de React Three Fiber y las propiedades de las partículas a la línea de tiempo de Theatre.js para poder hacer keyframes visualmente.
- [x] **Integración de Mapas de Calor (Heatmaps):** Agregar script de tracking (ej. Hotjar o solución custom basada en clicks/coordenadas) y crear el botón toggle en el panel para visualizar las zonas calientes.

---

## Fase 6: Persistencia y Publicación

- [x] **API de Guardado:** Crear un endpoint (API Route en Astro o función Serverless) que reciba el JSON modificado desde el panel visual y lo guarde en el repositorio o Base de Datos.
- [x] **Botón de Publicar (Build Trigger):** Configurar el Webhook del hosting (Vercel/Netlify) para reconstruir la página estática con 1 clic.
- [x] **Pruebas de Performance (Lighthouse):** Ejecutar una auditoría de rendimiento completa antes del lanzamiento para asegurar tiempos de carga menores a 1 segundo para el HTML y optimización máxima del Canvas 3D.