
import { GoogleGenAI, Type } from "@google/genai";
import { BrandAnalysis } from "../types";

const MODEL_NAME = "gemini-3-pro-preview";

export async function analyzeClothingImage(base64Image: string): Promise<BrandAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Identify the clothing brand, category, and style details from this image. If the brand logo is visible, use it for identification. If no logo is present, provide the most likely brand based on design language or state 'Unbranded/Generic'. Provide a detailed description, style keywords, and a fun historical fact about the brand if identified.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          brandName: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          clothingType: { type: Type.STRING },
          color: { type: Type.STRING },
          description: { type: Type.STRING },
          styleKeywords: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          detectableLogos: { type: Type.BOOLEAN },
          estimatedPriceRange: { type: Type.STRING },
          historicalFact: { type: Type.STRING }
        },
        required: ["brandName", "confidence", "clothingType", "description", "styleKeywords"],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("No response from AI");
  }

  return JSON.parse(resultText) as BrandAnalysis;
}
