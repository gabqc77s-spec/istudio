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

export async function sendMessage(message) {
    if (!initAI()) {
        return { type: 'error', text: "Error de configuración de IA." };
    }

    const config = {
        thinkingConfig: {
            thinkingLevel: 'MINIMAL',
        },
        systemInstruction: [
            {
                text: `Eres el arquitecto de Impulsa. Cada vez que el usuario pida una funcionalidad, debes interactuar con él para comprender totalmente su petición con detalle sin asumir lo que necesita. Debes responder con el fragmento de JSON que debe añadirse o modificarse.
Respeta la estructura lógica y técnica del programa.
Debes señalar correctamente dónde y cómo se debe implementar.


TU UNICA SALIDA DEBE UNA FUCTION CALL VALIDA:
Ejemplo de un requerimiento:
Requerimiento: Necesito que "Motor UI Espacial." tenga ahora colores celestes y rosados
Respuesta:
{ "tool_calls": [ { "function": "inyectar_cambios_v4", "args": { "partial": { "pagina_principal": { "seccion_hero": { "contenedor_titulos": { "titulo_principal": { "background-image": "linear-gradient(135deg, #991b1b, #ef4444)" } } } } } } } ] }

Explicación:
El bloque exacto dentro de content.json donde se define el elemento que contiene el texto "Motor UI Espacial." es el siguiente:
// Dentro de "seccion_hero"
"contenedor_titulos": {
    "display": "flex",
    "flex-direction": "column",
    "align-items": "center",
    "transform-style": "preserve-3d",
    "cursor": "pointer",
    "transition": "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    "hover": {
        "transform": "rotateX(5deg) rotateY(-5deg) scale(1.05)"
    },

    "titulo_fondo": {
        "texto": "NATIVE",
        // ... otras propiedades
    },

    "titulo_principal": {
        "texto": "Motor UI <span style='color: #fff;'>Espacial.</span>",
        "font-size": "5.5rem",
        "font-weight": "800",
        "color": "transparent",
        "background-image": "linear-gradient(135deg, #a855f7, #ec4899)", // <-- ESTA ES LA PROPIEDAD A MODIFICAR
        "text-align": "center",
        "line-height": "1.1",
        "letter-spacing": "-0.04em",
        "transform": "translateZ(50px)",
        "text-shadow": "0 20px 40px rgba(0,0,0,0.5)"
    },

    "subtitulo": {
        // ... otras propiedades
    }
},

En caso de ser un requerimiento con un div con el dom actual:
Requerimiento:
<div data-path="pagina_principal.seccion_hero.contenedor_titulos.titulo_principal" style="z-index: 4; font-size: 5.5rem; font-weight: 800; color: transparent; background-image: linear-gradient(135deg, rgb(168, 85, 247), rgb(236, 72, 153)); background-clip: text; text-align: center; line-height: 1.1; letter-spacing: -0.04em; transform: translateZ(50px); text-shadow: rgba(0, 0, 0, 0.5) 0px 20px 40px;">Motor UI <span style="color: #fff;">Espacial.</span></div>
Necesito que "Motor UI Espacial." tenga ahora colores celestes y rosados

Respuesta:
{ "tool_calls": [ { "function": "inyectar_cambios_v4", "args": { "partial": { "pagina_principal": { "seccion_hero": { "contenedor_titulos": { "titulo_principal": { "background-image": "linear-gradient(135deg, #991b1b, #ef4444)" } } } } } } } ] }

La respuesta sigue siendo la misma ya que te muestra el elemento con todas sus propiedades para que puedas buscarla en content.json y entregar una "tool_calls" con la "function": "inyectar_cambios_v4" y el contenido JSON path válido.
`,
            }
        ],
    };

    const model = 'gemini-3.1-flash-lite-preview';

    // Añadir mensaje del usuario al historial
    chatHistory.push({
        role: 'user',
        parts: [{ text: message }]
    });

    try {
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents: chatHistory,
        });

        let fullText = "";
        for await (const chunk of response) {
            console.log(chunk.text);
            fullText += chunk.text;
        }

        // Añadir respuesta de la IA al historial para mantener el contexto
        chatHistory.push({
            role: 'model',
            parts: [{ text: fullText }]
        });

        // Intentar parsear el tool call del texto (ya que el usuario pidió que la salida SEA el tool call)
        try {
            // Buscamos algo que parezca un JSON en el texto
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.tool_calls && data.tool_calls.length > 0) {
                    const call = data.tool_calls[0];
                    if (call.function === "inyectar_cambios_v4") {
                        if (window.inyectar_cambios_v4) {
                            window.inyectar_cambios_v4(call.args);
                            return { type: 'function', text: '🎨 ¡Cambios arquitectónicos aplicados!', data: call.args };
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("No se pudo parsear tool call del texto de la IA", e);
        }

        return { type: 'text', text: fullText };
    } catch (error) {
        console.error("Error AI Chat:", error);
        return { type: 'error', text: "Lo siento, hubo un error procesando tu petición." };
    }
}
