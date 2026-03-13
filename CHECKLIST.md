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

---

## Fase 7: La Experiencia del Administrador (UX Avanzada del Panel)

- [x] **Gestor de Bloques Visual (Drag & Drop):** Implementar `@hello-pangea/dnd` para permitir reordenar visualmente las secciones del sitio web directamente desde el panel (ej. mover el "Chatbot Demo" arriba del "Hero").
- [x] **Simulador Multidispositivo (Live Preview):** Añadir controles (Iconos de Monitor, Tablet, Móvil) en la barra superior. Al activarlos, el área de previsualización de la página se encoge usando `iframes` o CSS `transform` para emular tamaños de pantalla exactos sin salir del modo edición.
- [x] **Sistema de Historial (Deshacer/Rehacer):** Integrar `zundo` (Zustand Undo) para permitir viajar en el tiempo. Si se comete un error editando la página o colores, un botón de "Deshacer" (o Ctrl+Z) restaura el estado visual anterior.
- [x] **Gestor de Paletas Globales (Theming):** Añadir un selector de "Temas" predefinidos. Con un solo clic, se actualizan el color del fondo 3D, las partículas y las tipografías del HTML en conjunto.

---

## Fase 8: Editor Espacial 3D en Contexto (Manipulación In-Game)

- [x] **Controles Gizmo 3D:** Integrar `<TransformControls>` de `@react-three/drei`. Al hacer clic en un modelo 3D (como el teléfono) en el modo edición, aparecerán flechas visuales (Gizmos) para mover, rotar o escalar el objeto directamente con el ratón, sin usar *sliders* numéricos.
- [x] **Estudio de Iluminación Visual:** Añadir un panel de "Lighting" donde se puedan arrastrar luces (Spotlight, PointLight) sobre el canvas, ajustar su intensidad con el ratón y ver cómo cambian las sombras en tiempo real.
- [x] **Editor de Materiales:** Al hacer clic en una geometría 3D, el panel desplegará los atributos de su material (Rugosidad, Metalidad, Transparencia) para modificarlos visualmente.

---

## Fase 9: Biblioteca de Activos Integrada (Media Library)

- [x] **Subida de Archivos Nativa:** Reemplazar los inputs de URL por componentes de subida de archivos (Drag & Drop de imágenes al panel).
- [x] **Galería Visual en el Panel:** Crear una pestaña "Media" donde Gabriel o Paula puedan ver miniaturas de todos los logos, fondos y videos previamente subidos, seleccionándolos con un clic para inyectarlos en la web.
- [x] **Soporte de Modelos GLTF/GLB:** Permitir arrastrar y soltar archivos de modelos 3D (`.glb`) directamente al navegador, analizarlos y agregarlos al JSON para que se rendericen automáticamente en la escena.

---

## Fase 10: Auditoría Visual y Control de Rendimiento

- [x] **Visualizador de FPS y Memoria:** Integrar `<Stats />` y un monitor de memoria en el panel. Permitirá al administrador ver en tiempo real si agregar "10.000 partículas" más hará que la web sea lenta, antes de guardarla.
- [x] **Selector de Calidad Responsiva (LOD):** Añadir un control en el panel para definir "Niveles de Detalle" (Ej: "Bajo, Medio, Alto"). Al configurar un modelo complejo, el administrador podrá definir una versión de baja calidad que cargue automáticamente en celulares, optimizando el rendimiento.
- [x] **Modo "Wireframe / Debug":** Un botón en el panel que convierta toda la escena 3D en líneas (wireframe) y revele las "cajas de colisión", facilitando a Gabriel la depuración visual sin necesidad de consolas de desarrollo.

---

## Fase 11: Orquestación de Eventos (Action Builder)

- [x] **Constructor Lógico Visual:** Un panel donde puedas conectar "Triggers" (disparadores) con "Acciones". (Ejemplo: Si el usuario *hace clic* en el logo -> *entonces* cambiar el color de las partículas a rojo). Todo sin escribir JavaScript.
- [x] **Línea de Tiempo de Scroll (Scroll-Triggered Animations):** Interfaz para definir en qué porcentaje del scroll ocurre una animación 3D (Ej: al llegar al 50% de la página, el modelo del teléfono explota en sus componentes internos).

---

## Fase 12: Estudio de Post-Procesamiento Cinemático

- [x] **Integración de `@react-three/postprocessing`:** Activar el pipeline de efectos avanzados de cámara.
- [x] **Controles Visuales de Cámara:** Añadir al panel sliders para controlar el **Bloom** (brillo de luces neón), **Profundidad de Campo** (desenfocar el fondo para que resalte el modelo principal) y **Aberración Cromática** (efecto de lente de cámara real).
- [x] **Filtros de Color Dinámicos:** Poder aplicar LUTs (Tablas de Búsqueda de Color) o tintes (Noise/Vignette) desde el panel para darle a la página entera un "look" fílmico con un solo clic.

---

## Fase 13: Editor de Materiales y Shaders Node-Based

- [x] **Materiales Personalizables Avanzados:** Al seleccionar un modelo 3D, el panel permitirá cambiar su física: convertir un objeto de "plástico" a "vidrio esmerilado", "oro pulido" o "agua líquida" modificando los atributos del shader.
- [x] **Video Textures:** Un selector en el panel para inyectar un archivo de video y mapearlo como textura sobre cualquier objeto 3D de la escena (ej. proyectar un video de Impulsa Studio en una pared 3D virtual).

---

## Fase 14: Motor de Físicas Interactivas

- [x] **Integración de Motor de Físicas (Rapier/Cannon):** Agregar simulaciones de colisión y gravedad al entorno 3D.
- [x] **Toggles de Físicas en el Panel:** Poder marcar objetos como "Sólidos" o "Afectados por Gravedad". Permitirá crear efectos donde elementos de la página caen y chocan entre sí cuando el usuario interactúa con ellos.

---

## Fase 15: Navegación Espacial Inmersiva (Single Page Showroom)

- [x] **Orquestador de Eventos (Hovers & Clicks):** Desde el panel, poder asignar acciones a cualquier modelo 3D o tarjeta. Ej: "Al hacer clic en el teléfono de Eficell, oscurecer el fondo y abrir sus detalles de proyecto".
- [x] **Expansión de "Micro-Páginas" In-Game:** Sistema para que al hacer clic en un elemento (como un servicio), la cámara 3D vuele hacia un nuevo escenario dedicado (ej. una "sala" virtual), mostrando el contenido detallado de ese servicio sin que el navegador recargue la página ni cambie la URL.
- [x] **Modales 3D Inmersivos:** Controlar desde el panel la apertura de ventanas flotantes espaciales. Cuando el usuario hace clic en "Contacto", en lugar de ir a `/contacto`, un formulario holográfico se despliega suavemente frente a la cámara dentro de la misma escena 3D.