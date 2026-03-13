# Arquitectura V4 — Impulsa Studio

Este documento detalla la infraestructura técnica del motor **V4**, un sistema purista orientado a datos para la creación de interfaces espaciales 3D utilizando exclusivamente tecnologías nativas de la web.

## 1. Filosofía de Diseño
El motor V4 se basa en el principio de **Single Source of Truth (SSoT)**. No existe una capa de plantillas HTML o reglas CSS estáticas para los componentes; toda la estructura, el estilo y el comportamiento se derivan de un único archivo `content.json`.

## 2. El Motor de Renderizado (`showcase.js`)
El motor utiliza una estrategia de renderizado recursivo:
1.  **Parseo:** Recorre el objeto JSON raíz.
2.  **Virtualización DOM:** Crea elementos `div` para cada nodo.
3.  **Inyección de Estilos:** Cualquier propiedad no reservada se mapea directamente a `element.style.setProperty()`.
4.  **Preservación 3D:** Los contenedores utilizan `transform-style: preserve-3d` para permitir que las propiedades `translateZ` y `rotate` creen profundidad real en el espacio del navegador.

## 3. Sistema de Interacción
A diferencia de los frameworks tradicionales, V4 implementa su propia lógica de eventos:
*   **Scroll Controlado:** Un sistema de desplazamiento basado en JS que calcula límites de colisión y aplica efectos de *fade* (opacidad) dinámicos a los hijos según su posición relativa al contenedor.
*   **Hover-Hermanos:** Permite que un elemento actúe como disparador de estilos para todos sus nodos adyacentes, permitiendo efectos complejos de enfoque y desenfoque.
*   **Click-Toggle:** Un sistema de persistencia de estado de clics para gestionar interactividad como acordeones o interruptores sin escribir JS adicional.
*   **Seguimiento de Mouse:** Permite que los elementos orbiten o sigan la posición del cursor con suavidad configurable.
*   **Tilt 3D Genérico:** Efecto de inclinación espacial basado en la posición del mouse dentro del elemento, compatible con cualquier contenedor.
*   **Acciones Remotas (Target):** El sistema más potente de V4. Permite que un evento en el Elemento A modifique el Elemento B (especificado por su `data-path`). Esto habilita la creación de arquitecturas de "Nido de Páginas" y navegación compleja 100% dirigida por datos.
*   **Generación Procedimental (`instancias`):** Permite la replicación masiva de elementos con variaciones aleatorias controladas, eliminando la necesidad de definir manualmente cada nodo en el JSON.
*   **Look-at y Auto-animación:** Motores de movimiento en tiempo real que permiten que la interfaz cobre vida mediante rotaciones 3D dinámicas y ciclos de animación (flotación, latido, rotación) sin depender de CSS fijo.

## 4. Integración con Inteligencia Artificial
La edición del sitio se gestiona a través de un **Asistente IA Arquitectónico** (`ai_assistant.js`):
1.  **Contextualización:** La IA recibe el motor completo (`showcase.js`), los estilos base y el JSON actual como prompt de sistema.
2.  **Captura Espacial:** El usuario puede seleccionar elementos del canvas 3D. El motor extrae el fragmento JSON exacto envuelto en su jerarquía (`get_json_v4_por_path_jerarquico`) para que la IA entienda el contexto estructural.
3.  **Inyección Parcial:** La IA propone cambios en formato JSON. Estos se validan y se fusionan con el estado global mediante un `deepMerge`, lo que provoca un re-renderizado instantáneo de la interfaz.

## 5. Flujo de Control y Seguridad
Todas las modificaciones propuestas por la IA pasan por un **Review Panel** (`index.html`):
*   **Validación:** Se comprueba que las propiedades propuestas pertenezcan a una lista blanca de CSS válido.
*   **Confirmación Humana:** El usuario visualiza la propuesta y decide si aplicarla o rechazarla, enviando retroalimentación inmediata a la IA en caso de rechazo.

---
Para una guía detallada sobre cómo implementar estas funciones en el archivo de datos, consulte la **[Guía de Implementación JSON V4](./GUIA_JSON_V4.md)**.

*Este motor representa la evolución final desde WebGL/React hacia una arquitectura web purista, optimizada para rendimiento y facilidad de edición generativa.*
