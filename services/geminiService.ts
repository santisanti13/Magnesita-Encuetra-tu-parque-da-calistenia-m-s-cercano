import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";

export const searchParks = async (
  query: string, 
  userLocation?: { latitude: number; longitude: number }
): Promise<SearchResult> => {
  try {
    let contents = `Encuentra parques de calistenia, barras de dominadas o parques de street workout en: ${query}. 
    Dame una lista detallada con sus nombres y qué tipo de equipamiento tienen si es posible.`;

    const toolConfig: any = {};

    // Integrate user location if available for better precision
    if (userLocation) {
       // If query is vague (e.g. "near me"), rely heavily on latLng
       if (query.toLowerCase().includes("cerca") || query.toLowerCase().includes("near") || query === "Ubicación actual") {
         contents = "Encuentra parques de calistenia y street workout lo más cerca posible de mi ubicación actual.";
       }
       toolConfig.retrievalConfig = {
         latLng: {
           latitude: userLocation.latitude,
           longitude: userLocation.longitude
         }
       };
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: toolConfig,
        systemInstruction: "Eres un experto en calistenia y fitness. Tu objetivo es ayudar a los usuarios a encontrar los mejores lugares para entrenar al aire libre en España. Sé conciso y útil.",
      },
    });

    const text = response.text || "No se encontraron resultados de texto.";
    
    // Extract grounding chunks safely
    const chunks: GroundingChunk[] = 
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Filter only maps chunks
    const mapsChunks = chunks.filter(c => c.maps !== undefined);

    return {
      text,
      locations: mapsChunks
    };

  } catch (error) {
    console.error("Error searching parks:", error);
    throw error;
  }
};

export const generateParkImage = async (parkName: string): Promise<string | null> => {
  try {
    const prompt = `A hyper-realistic, 8k resolution, cinematic wide shot of a calisthenics park named "${parkName}" in a sunny outdoor setting in Spain. 
    Professional photography, golden hour lighting, sharp focus on pull-up bars, parallel bars, and monkey bars. 
    The park has modern street workout equipment. Trees and urban environment in the background. No people, just the empty equipment ready for workout. 
    High quality, photorealistic.`;

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // Nano banana models don't support responseMimeType for images, just extract inlineData
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating park image:", error);
    return null; // Fail gracefully
  }
};