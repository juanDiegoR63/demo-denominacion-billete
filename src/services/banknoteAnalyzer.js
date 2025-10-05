import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = import.meta.env.VITE_GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o-mini";

/**
 * Analiza una imagen de un billete y determina su denominación
 * @param {string} imageDataUrl - La imagen en formato base64 data URL
 * @returns {Promise<Object>} - Objeto con la denominación y confianza del análisis
 */
export async function analyzeBanknote(imageDataUrl) {
  try {
    if (!token) {
      throw new Error("Token de GitHub no configurado. Por favor, verifica tu archivo .env");
    }

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token)
    );

    // Extraer solo la parte base64 de la imagen
    const base64Image = imageDataUrl.split(',')[1];

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: `Eres un asistente especializado en identificar billetes colombianos para personas con discapacidad visual. 

REGLAS DE IDENTIFICACIÓN DE BILLETES COLOMBIANOS:
- 100,000 pesos: Color VERDE predominante
- 50,000 pesos: Color MORADO/VIOLETA predominante
- 20,000 pesos: Color NARANJA predominante
- 10,000 pesos: Color ROJO SUAVE/ROSADO predominante
- 5,000 pesos: Color CAFÉ/MARRÓN predominante
- 2,000 pesos: Color AZUL CLARO predominante

Todos los billetes son PESOS COLOMBIANOS.

Tu respuesta debe ser en formato JSON con esta estructura EXACTA:
{
  "esBillete": true/false,
  "denominacion": "100000" o "50000" o "20000" o "10000" o "5000" o "2000" o "desconocido",
  "color": "verde/morado/naranja/rojo/café/azul",
  "confianza": "alto/medio/bajo",
  "mensajeVoz": "Mensaje claro y conciso para leer en voz alta",
  "instrucciones": "Si no es un billete o la foto está mal tomada, da instrucciones claras de cómo mejorar la foto"
}

Ejemplo si ES un billete:
{
  "esBillete": true,
  "denominacion": "50000",
  "color": "morado",
  "confianza": "alto",
  "mensajeVoz": "Billete de cincuenta mil pesos colombianos",
  "instrucciones": ""
}

Ejemplo si NO es un billete:
{
  "esBillete": false,
  "denominacion": "desconocido",
  "color": "",
  "confianza": "bajo",
  "mensajeVoz": "No se detectó un billete en la imagen",
  "instrucciones": "Por favor coloque el billete completo frente a la cámara en un lugar bien iluminado y tome la foto nuevamente"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analiza esta imagen e identifica si es un billete colombiano y su denominación."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 600,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message || "Error en la respuesta del modelo");
    }

    const content = response.body.choices[0].message.content;
    
    // Intentar parsear la respuesta JSON
    try {
      const result = JSON.parse(content);
      return {
        success: true,
        data: result
      };
    } catch (parseError) {
      // Si no es JSON válido, intentar extraer información del texto
      return {
        success: true,
        data: {
          esBillete: false,
          denominacion: "desconocido",
          color: "",
          confianza: "bajo",
          mensajeVoz: "No se pudo procesar la imagen correctamente",
          instrucciones: "Por favor intente tomar la foto nuevamente con mejor iluminación"
        }
      };
    }

  } catch (error) {
    console.error("Error al analizar el billete:", error);
    return {
      success: false,
      error: error.message || "Error desconocido al analizar la imagen"
    };
  }
}

/**
 * Verifica que el servicio esté disponible
 * @returns {Promise<boolean>}
 */
export async function checkServiceAvailability() {
  try {
    if (!token) {
      return false;
    }

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token)
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "user", content: "Hello" }
        ],
        temperature: 0.5,
        max_tokens: 10,
        model: model
      }
    });

    return !isUnexpected(response);
  } catch (error) {
    console.error("Error al verificar disponibilidad del servicio:", error);
    return false;
  }
}
