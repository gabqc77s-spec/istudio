# Plan de Implementación: Motor de Showroom Impulsa Studio

Este documento detalla el paso a paso técnico para construir el **Panel de Control de Impulsa Studio**, el cual te permitirá agregar "todo lo que se te ocurra" (secciones, modelos 3D, chatbots, demos interactivas) a tu página web **solo con clics**, sin necesidad de tocar el código fuente (`.js` o `.astro`) una vez que el motor esté terminado.

---

## Fase 1: Cimientos del Motor Data-Driven (Semanas 1-2)

El objetivo de esta fase es dejar de escribir HTML a mano y pasar a un sistema donde un archivo JSON dicte qué se dibuja en la pantalla.

### Paso 1: Implementar el Estado Global (Zustand)
- Instalar `zustand` en el proyecto.
- Crear un *Store* global (`src/store/useStore.js`) que contenga un gran objeto JSON llamado `siteConfig`.
- Este `siteConfig` tendrá un arreglo `sections: []`.

### Paso 2: Crear el "Factory Pattern" (El Motor de Componentes)
- En React, crear un componente `SectionRenderer.jsx`.
- Este componente leerá el JSON y decidirá qué dibujar.
  ```jsx
  // Ejemplo simplificado:
  switch(type) {
    case 'hero': return <HeroBlock data={content} />
    case 'portfolio-3d': return <PhoneDemo3D url={content.url} />
    case 'chatbot-demo': return <LiveChatbotWidget apiKey={content.key} />
  }
  ```
- **Resultado de Fase 1:** Si Gabriel edita manualmente el archivo JSON, la página cambia automáticamente sin que Gabriel toque el HTML o CSS.

---

## Fase 2: El Panel de Configuración Visual (Semanas 3-4)

Aquí es donde construimos la interfaz gráfica (UI) para que **Paula o Gabriel puedan hacer los cambios "solo con clics"**, sin mirar el JSON.

### Paso 3: Integrar una Interfaz Administrativa (Leva o React-Admin)
- Instalar `leva` (para un panel flotante rápido) o construir un panel "dashboard" oculto en la ruta `/admin`.
- Conectar este panel directamente al `useStore.js` de Zustand.
- **Funcionalidades del Panel:**
  - Botón: "Añadir Nueva Sección".
  - Dropdown: Seleccionar el tipo de bloque (Texto, Tarjetas, Demo de App, Teléfono 3D).
  - Inputs de texto: Para títulos y descripciones.
  - Sliders: Para mover la cámara 3D o cambiar colores de partículas.

### Paso 4: Sincronización del 3D en Tiempo Real
- En lugar del `CameraManager` actual (que usa IDs estáticos), el panel tendrá un botón: "Guardar vista actual de cámara".
- Puedes navegar por el 3D con el ratón, encontrar un ángulo perfecto para mostrar el "Teléfono 3D de Eficell", y hacer clic en guardar. Esas coordenadas se guardan automáticamente en la configuración de esa sección.

---

## Fase 3: Librería de Widgets y Demos Vivas (Mes 2)

Para que puedas agregar "todo lo que se te ocurra", necesitas un catálogo de componentes pre-programados.

### Paso 5: Registrar Componentes Complejos (Widgets)
Gabriel programará componentes aislados y los "registrará" en el Motor (Factory Pattern del Paso 2). Ejemplos:
- **Widget A (Mockup Android):** Un modelo de teléfono 3D que recibe una URL por props y carga un iFrame.
- **Widget B (Chatbot Interactivo):** La ventana de chat que se conecta al WebSocket de Impulsa.
- **Widget C (Calculadora de Presupuesto B2B):** Un formulario dinámico.

### Paso 6: Composición desde el Panel
Una vez que Gabriel programó el Widget C (Calculadora), este aparece en el Dropdown del panel de control de Paula. Paula puede hacer clic en "Añadir a Sección 'Transformación Digital'", y la calculadora aparecerá mágicamente en la web, totalmente funcional.

---

## Fase 4: Persistencia y Publicación a 1 Clic (Mes 3)

Actualmente, si recargas la página, los cambios del panel se pierden porque solo viven en la memoria del navegador.

### Paso 7: Backend Ligero (Persistencia)
- Crear una pequeña base de datos gratuita (ej. Supabase o Firebase) o usar una API Route de Astro (`src/pages/api/saveConfig.js`) que guarde el JSON final en el servidor.
- Añadir un gran botón "PUBLICAR" en el Panel de Control.
- Al hacer clic, el panel envía el nuevo JSON al servidor.

### Paso 8: Revalidación (ISR o Build Triggers)
- Si usan Vercel o Netlify (hosting gratuito y rápido), configurar un "Deploy Hook" (un enlace web).
- Cuando Paula hace clic en "PUBLICAR", el servidor guarda el JSON y "llama" a ese enlace.
- Vercel reconstruye automáticamente el sitio web en milisegundos con los nuevos datos, y el sitio web de Impulsa Studio se actualiza a nivel mundial.

---

## Fase 5: El Panel de Siguiente Nivel (Edición Visual Extrema)

Una vez que el motor base funciona, el panel "tradicional" (Leva o React-Admin con formularios JSON) puede sentirse desconectado de la página real. Para que Gabriel y Paula tengan **el mejor flujo de trabajo posible**, el panel de control debe evolucionar hacia un **Editor Visual en Contexto (WYSIWYG 3D)**.

### Paso 9: Edición Directa en Pantalla (In-Context Editing)
- **El Problema:** Llenar campos de texto en un lado de la pantalla y ver cómo se actualiza en el otro lado es ineficiente.
- **La Solución:** Implementar bibliotecas como `react-contenteditable`.
- **Cómo Funciona:** Paula no entra a una página `/admin`. Ella entra a la web normal (`impulsa.cl`), inicia sesión con su cuenta y, automáticamente, la web "cobra vida" para edición. Si hace doble clic en el título de la página principal, puede escribir el nuevo texto directamente sobre el diseño final. Todo se sincroniza con el Zustand Store y luego con la Base de Datos.

### Paso 10: Control de Coreografía 3D (Theatre.js Studio)
- **El Problema:** Usar *sliders* en un panel para mover una cámara 3D o cambiar colores de partículas requiere "adivinar" números.
- **La Solución:** Integrar la extensión de estudio de `Theatre.js` exclusiva para administradores.
- **Cómo Funciona:** Gabriel y Paula tendrán una **línea de tiempo visual** (como en Adobe Premiere o After Effects) incrustada en el propio navegador.
  - Arrastras la cámara con el ratón al ángulo perfecto del Teléfono de Eficell y haces clic en el "Fotograma Clave" (Keyframe).
  - Mueves el ratón, cambias el color del fondo, y haces otro Keyframe.
  - El panel guarda esta coreografía visual en el JSON de forma transparente, sin que Gabriel tenga que calcular derivadas trigonométricas de la cámara.

### Paso 11: Analíticas Visuales Integradas (El Mapa de Calor)
- **El Problema:** Ver estadísticas en Google Analytics son números abstractos; no te dicen *dónde* está mirando el cliente corporativo en tu Showroom.
- **La Solución:** Integrar los datos analíticos **dentro del propio panel de control**.
- **Cómo Funciona:** Cuando Paula o Gabriel inician sesión en modo edición, pueden activar un botón de "Mapa de Calor" (Heatmap).
  - La misma página de Impulsa Studio se coloreará en las zonas donde los usuarios hacen más clic o pasan más tiempo el ratón.
  - Esto le permitirá a Paula saber inmediatamente si el "Chatbot de Eficell" está generando interés, o si deben cambiarlo de posición, y puede hacerlo arrastrándolo a otra sección con un simple "Drag and Drop".

---

## El Flujo Final (La Promesa Cumplida)

1. Paula entra a `impulsa.cl` e inicia sesión directamente en la web.
2. Hace clic en el botón "Añadir Cliente" (que solo aparece para administradores). Escribe "Eficell".
3. En el menú "Tipo de Exhibición", selecciona "Dispositivo 3D Interactivo".
4. Pega la URL de la app de Eficell.
5. Ajusta el color de fondo a naranja usando un selector visual de color.
6. Hace clic en **PUBLICAR**.
7. ¡Listo! La web de Impulsa Studio ahora tiene una nueva sección de 1 millón de dólares, navegable, fluida, y con un efecto 3D impresionante, lograda en 2 minutos sin escribir una sola línea de código.