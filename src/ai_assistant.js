import { GoogleGenAI } from 'https://esm.run/@google/genai';

let API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;

let ai = null;
let chatHistory = [];

function initAI() {
    if (ai) return true;
    if (!API_KEY) API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("VITE_GEMINI_API_KEY no está configurada.");
        return false;
    }
    try {
        ai = new GoogleGenAI({
            apiKey: API_KEY,
        });
        return true;
    } catch (e) {
        console.error("Error al inicializar GoogleGenAI:", e);
        return false;
    }
}

export function setInitialContext(contentJson, showcaseCss, showcaseJs) {
    // Solo permitir setear contexto si el historial está vacío o es un reset
    chatHistory = [
        {
            role: 'user',
            parts: [{ text: `Hola. Este es el estado actual de mi aplicación V4:

1. content.json (Estado en Memoria):
${JSON.stringify(contentJson)}

2. showcase.css:
${showcaseCss}

3. showcase.js (Motor V4 con módulos: Follow, Tilt, Actions, Instances, LookAt, AutoAnimate, Parallax, Typewriter, Magnetic, Audio, Scroll):
${showcaseJs}

Analiza las capacidades interactivas y la estructura jerárquica.` }]
        },
        {
            role: 'model',
            parts: [{ text: "Entendido. He analizado el estado actual del motor V4 y su contenido. Estoy listo para realizar modificaciones precisas utilizando los módulos de interacción disponibles." }]
        }
    ];
    return true;
}

export async function sendMessage(message, attachedJson = null) {
    if (!initAI()) {
        return { type: 'error', text: "Error de configuración de IA." };
    }

    const config = {
        thinkingConfig: {
            thinkingLevel: 'MINIMAL',
        },
        systemInstruction: [
            {
                text: `Eres el Arquitecto de Impulsa V4, un ingeniero experto en interfaces 3D data-driven.
Tu objetivo es manipular el content.json para crear experiencias increíbles.

CAPACIDADES DEL MOTOR V4:
- "seguir-mouse": { "factor": 0.1, "suavizado": 0.1 } -> Desplazamiento reactivo.
- "tilt": { "max": 15, "perspectiva": 1000 } -> Inclinación 3D.
- "look-at": { "intensidad": 20 } -> Rotación que mira al mouse.
- "magnetico": { "fuerza": 0.5, "radio": 200 } -> Atracción de elementos.
- "escribir": { "velocidad": 50, "retraso": 0, "bucle": false } -> Efecto máquina de escribir.
- "auto-animar": { "tipo": "flotar"|"latir"|"girar", "duracion": 3, "intensidad": 10 } -> Ciclos constantes.
- "paralaje": { "factor": 0.2, "direccion": "vertical" } -> Reacción al scroll.
- "acciones": { "click"|"mouseenter": { "target": "path", "estilos": {...}, "tipo": "navegacion", "hacia": "path" } } -> Control remoto y Page Swapping.
- "instancias": { "cantidad": n, "plantilla": {...}, "variacion": {...} } -> Generación procedimental.

REGLAS DE SALIDA:
Debes responder con un objeto JSON que contenga una tool call a "inyectar_cambios_v4".
Puedes usar la propiedad "replace": true si quieres SOBREESCRIBIR toda la página (para cambios de tema total), o false (por defecto) para mezclar (merge).

Ejemplo:
{
  "tool_calls": [
    {
      "function": "inyectar_cambios_v4",
      "args": {
        "partial": { ... tu fragmento de json ... },
        "replace": false
      }
    }
  ]
}

Sé creativo, usa gradientes, transformaciones 3D, desenfoques y todas las capacidades del motor.`,
            }
        ],
    };

    const model = 'gemini-3.1-flash-lite-preview';

    let fullMessage = message;
    if (attachedJson) {
        fullMessage += "\n\nContexto del elemento seleccionado (JSON): " + JSON.stringify(attachedJson);
    }

    chatHistory.push({
        role: 'user',
        parts: [{ text: fullMessage }]
    });

    try {
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents: chatHistory,
        });

        let fullText = "";
        for await (const chunk of response) {
            fullText += chunk.text;
        }

        chatHistory.push({
            role: 'model',
            parts: [{ text: fullText }]
        });

        try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.tool_calls && data.tool_calls.length > 0) {
                    const call = data.tool_calls[0];
                    if (call.function === "inyectar_cambios_v4") {
                        return { type: 'review', text: '🎨 Propuesta arquitectónica lista.', data: call.args };
                    }
                }
            }
        } catch (e) {}

        return { type: 'text', text: fullText };
    } catch (error) {
        console.error("Error AI Chat:", error);
        return { type: 'error', text: "Error en la comunicación con el Arquitecto." };
    }
}
