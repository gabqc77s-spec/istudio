import { GoogleGenerativeAI } from "@google/generative-ai";

let API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;
let chat = null;

function initAI() {
  if (model) return true;

  // Re-intentar capturar la key por si no estaba lista en el top-level
  if (!API_KEY) API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("VITE_GEMINI_API_KEY no está configurada en import.meta.env");
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
  systemInstruction: "Eres el arquitecto de Impulsa. Cada vez que el usuario pida una funcionalidad, debes interactuar con él para comprender totalmente su petición con detalle sin asumir lo que necesita. Debes responder con el fragmento de JSON que debe añadirse o modificarse. Respeta la estructura lógica y técnica del programa. Debes señalar correctamente dónde y cómo se debe implementar. TU UNICA SALIDA DEBE SER LA ESTRUCTURA CON LA FUCTION CALL si vas a inyectar cambios.",
  tools: [
    {
      functionDeclarations: [
        {
          name: "inyectar_cambios_v4",
          description: "Modifica la interfaz inyectando un JSON parcial. Solo envía las propiedades que deseas cambiar, añadir o reemplazar. El motor realizará un deep-merge automático.",
          parameters: {
            type: "OBJECT",
            properties: {
              partial: {
                type: "OBJECT",
                description: "JSON parcial siguiendo la estructura de nodos de la app (ej: { 'pagina_principal': { 'seccion_hero': { ... } } })"
              }
            },
            required: ["partial"]
          }
        }
      ]
    }
  ]
});

    chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
    return true;
  } catch (e) {
    console.error("Error al inicializar GoogleGenAI:", e);
    return false;
  }
}

export async function sendMessage(message) {
  if (!initAI()) {
    return { type: 'error', text: "Error de configuración de IA. Verifica la API Key." };
  }
  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const calls = response.functionCalls();

    if (calls && calls.length > 0) {
      const call = calls[0];
      if (call.name === "inyectar_cambios_v4") {
        if (window.inyectar_cambios_v4) {
          window.inyectar_cambios_v4(call);
          let aiText = '🎨 ¡Cambios arquitectónicos aplicados!';
          try {
            const t = response.text();
            if (t && t.trim()) aiText = t;
          } catch(e) {}
          return { type: 'function', text: aiText, data: call };
        }
      }
    }

    let finalText = "He procesado tu solicitud.";
    try {
      const t = response.text();
      if (t && t.trim()) finalText = t;
    } catch(e) {}

    return { type: 'text', text: finalText };
  } catch (error) {
    console.error("Error AI Chat:", error);
    return { type: 'error', text: "Lo siento, hubo un error procesando tu petición." };
  }
}
