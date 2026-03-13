# Guía de Implementación JSON V4 — Impulsa Studio

Este documento es el manual oficial para el modelo de IA y desarrolladores sobre cómo utilizar las capacidades extendidas del motor V4 mediante el archivo `content.json`. Estas funciones superan las capacidades del CSS estándar.

---

## 1. Propiedades de Contenido y Estructura Base

### `texto`
Inserta contenido HTML dentro del contenedor.
```json
"mi_elemento": {
  "texto": "Hola <span style='color:purple;'>Mundo</span>"
}
```

### `nombre`
Etiqueta interna para identificación en el inspector. No afecta al renderizado visual.
```json
"hero": { "nombre": "Sección Principal" }
```

---

## 2. Interacciones Simples (Toggle y Hover)

### `click`
Define estilos que se activan/desactivan al hacer clic (toggle).
```json
"acordeon": {
  "height": "50px",
  "click": { "height": "200px" }
}
```

### `hover`
Aplica estilos mientras el mouse está sobre el elemento.
```json
"boton": {
  "background": "blue",
  "hover": { "background": "red", "transform": "scale(1.1)" }
}
```

### `hover-hermanos`
Define qué les sucede a los hermanos de un elemento cuando este recibe un hover (ideal para efectos de enfoque/desenfoque).
```json
"icono": {
  "hover-hermanos": { "opacity": "0.3", "filter": "blur(5px)" }
}
```

---

## 3. Funciones Espaciales Avanzadas

### `seguir-mouse`
Hace que el elemento flote siguiendo el cursor del mouse.
*   `factor`: Intensidad del movimiento (0.1 a 0.5 recomendado).
*   `suavizado`: Qué tan "pesado" se siente el movimiento (0.01 a 0.1).
```json
"orbe": {
  "seguir-mouse": { "factor": 0.2, "suavizado": 0.05 }
}
```

### `tilt`
Efecto de inclinación 3D según la posición del mouse dentro del elemento.
*   `max`: Ángulo máximo de rotación en grados.
*   `perspectiva`: Profundidad del efecto (1000 a 2000 recomendado).
```json
"tarjeta": {
  "tilt": { "max": 20, "perspectiva": 1500 }
}
```

### `scroll`
Crea un carrusel o área de desplazamiento controlada por JS (no usa scroll nativo).
*   `direccion`: "horizontal", "vertical" o "ambos".
*   `fade`: Intensidad del desvanecimiento en los bordes (0.1 a 0.3).
*   `fade-min`: Opacidad mínima de los elementos lejanos.
```json
"galeria": {
  "scroll": { "direccion": "horizontal", "fade": 0.2, "fade-min": 0.3 }
}
```

---

## 4. El Sistema de Acciones (Control Remoto)

La propiedad `acciones` permite que un evento en el elemento actual afecte a un elemento remoto mediante su `data-path`.

### Estructura de una acción:
*   `target`: El path jerárquico del elemento a modificar (ej: `pagina_principal.hero`).
*   `estilos`: Objeto con las propiedades CSS a cambiar.
*   `texto`: (Opcional) Cambia el contenido HTML del objetivo.

### Ejemplo: Navegación de Páginas (Nido de Páginas)
Este ejemplo muestra cómo un botón puede "cambiar de página" ocultando un contenedor y mostrando otro.
```json
"btn_navegar": {
  "texto": "Entrar",
  "acciones": {
    "click": [
      {
        "target": "pagina_principal.contenedor_maestro.seccion_inicio",
        "estilos": { "display": "none", "opacity": "0" }
      },
      {
        "target": "pagina_principal.contenedor_maestro.seccion_dashboard",
        "estilos": { "display": "flex", "opacity": "1" }
      }
    ]
  }
}
```

### Ejemplo: Navegación de Página Completa (Page Swapper)
Usa el `tipo: "navegacion"` para intercambiar secciones macro con efectos de transición.
```json
"btn_cambio_pagina": {
  "acciones": {
    "click": {
      "tipo": "navegacion",
      "desde": "pagina_principal.seccion_actual",
      "hacia": "pagina_principal.seccion_nueva",
      "efecto": "slide"
    }
  }
}
```

---

## 5. Funciones Procedimentales y Animación

### `instancias`
Genera múltiples copias de un elemento automáticamente. Útil para fondos, partículas o listas.
*   `cantidad`: Número de copias.
*   `plantilla`: El objeto JSON que se replicará.
*   `variacion`: Objeto con rangos de aleatoriedad (ej: `transform`, `opacity`).
```json
"fondo_estrellas": {
  "instancias": {
    "cantidad": 50,
    "plantilla": { "width": "2px", "height": "2px", "background": "white", "position": "absolute" },
    "variacion": { "left": 1000, "top": 800 }
  }
}
```

### `look-at`
Hace que el elemento "mire" o rote hacia la posición del mouse en 3D.
```json
"ojo_3d": {
  "look-at": { "intensidad": 30, "suavizado": 0.1 }
}
```

### `auto-animar`
Aplica una animación cíclica automática sin necesidad de CSS keyframes.
*   `tipo`: "flotar", "latir" o "girar".
*   `duracion`: Tiempo en segundos del ciclo.
*   `intensidad`: Fuerza del movimiento o escala.
```json
"logo_flotante": {
  "auto-animar": { "tipo": "flotar", "duracion": 4, "intensidad": 20 }
}
```

---

## 6. Reglas de Oro para la IA

1.  **Paths Precisos**: El `target` debe ser el path completo desde la raíz del JSON (ej: `pagina_principal.header.logo`).
2.  **Unidades**: Siempre incluir unidades en los estilos (px, %, deg, etc.).
3.  **Transiciones**: Para que las acciones se vean fluidas, el elemento `target` debe tener una propiedad `transition` definida en su estado base en el JSON.
4.  **Jerarquía**: El motor procesa los elementos en orden. Asegúrate de que los contenedores que actúan como "padres" de navegación tengan `position: relative` o `absolute`.
