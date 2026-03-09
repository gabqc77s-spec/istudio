# Blueprint: iStudio Generative 3D Experience

## 1. Visión General

**La web es un entorno 3D vivo y en constante regeneración, no una página estática.** El usuario no se desplaza por una página, sino que viaja a través de un espacio 3D dinámico. La experiencia es un bucle continuo donde los efectos, las interacciones y el propio entorno evolucionan. El objetivo es crear una sensación de descubrimiento perpetuo, demostrando visualmente el concepto de transformación continua.

## 2. Estilo y Diseño

La estética será moderna, oscura y tecnológica, diseñada para hacer que los elementos interactivos y los efectos de "brillo" destaquen dentro del entorno 3D. Se utilizará una paleta de colores oscuros, tipografía expresiva, texturas sutiles y efectos de brillo (glow) para crear una atmósfera inmersiva y de alta calidad.

## 3. Plan de Implementación Actual

**Objetivo:** Restaurar la visibilidad de una sola sección a la vez y ampliar el panel de control con opciones para el posicionamiento del contenido.

**Pasos Detallados:**

1.  **Restaurar Invisibilidad:** Modificar `CameraManager.jsx` para que las secciones no activas vuelvan a ser completamente invisibles (`autoAlpha: 0`).
2.  **Ampliar Configuración Central:** Añadir propiedades de alineación (`justifyContent`, `textAlign`) al objeto `content` en `src/config.js`.
3.  **Añadir Controles de Posición al Panel:** Incorporar menús desplegables en `ConfigPanel.jsx` para controlar la alineación vertical y horizontal.
4.  **Aplicar Estilos Dinámicamente:** Modificar `Scene.jsx` para que el `useEffect` de contenido aplique los nuevos estilos de alineación a los contenedores de las secciones.

## 4. Hoja de Ruta

*   **[COMPLETADO]** Fundación del Diseño Visual.
*   **[COMPLETADO]** Entorno 3D Generativo.
*   **[COMPLETADO]** Panel de Configuración (Básico).
*   **[COMPLETADO]** Navegación Gestual Multi-direccional.
*   **[COMPLETADO]** Personalización de Contenido y Animación.
*   **[COMPLETADO]** Fondo 3D Interactivo.
*   **[COMPLETADO]** Mejora de Navegación y Persistencia de Ajustes.
*   **[EN PROGRESO]** **Control Avanzado de Contenido y Layout.**
*   **[PENDIENTE]** Navegación Móvil (Gestos Táctiles).
*   **[PENDIENTE]** Interacciones Contextuales.
