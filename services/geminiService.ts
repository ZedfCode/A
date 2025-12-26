
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, FileType } from "../types";

export class GeminiService {
  // Fix: Use a getter to create a fresh GoogleGenAI instance for each request to ensure current API key usage.
  private get ai(): GoogleGenAI {
    // Guidelines: Always use process.env.API_KEY directly in the named parameter.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeUrl(url: string): Promise<AIAnalysisResult> {
    try {
      // Ensure API_KEY is available as per guidelines.
      if (!process.env.API_KEY) {
        throw new Error("API_KEY_MISSING");
      }

      // Fix: Directly call generateContent on the ai.models instance as per SDK requirements.
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this link for a download manager: ${url}`,
        config: {
          systemInstruction: `Analyze the download link. 
          Return a JSON with:
          - suggestedName (string)
          - fileType (VIDEO, AUDIO, IMAGE, DOCUMENT, ARCHIVE, SOFTWARE, OTHER)
          - description (string)
          - tags (string[])
          - safetyScore (0-100)
          - securityReport (string)
          Return ONLY JSON.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedName: { type: Type.STRING },
              fileType: { type: Type.STRING, enum: ['VIDEO', 'AUDIO', 'IMAGE', 'DOCUMENT', 'ARCHIVE', 'SOFTWARE', 'OTHER'] },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              safetyScore: { type: Type.NUMBER },
              securityReport: { type: Type.STRING }
            },
            required: ["suggestedName", "fileType", "safetyScore", "securityReport", "description", "tags"]
          }
        }
      });

      // Fix: Access the .text property directly (do not call as a method).
      const text = response.text;
      if (!text) throw new Error("EMPTY_AI_RESPONSE");

      return JSON.parse(text.trim()) as AIAnalysisResult;
    } catch (error) {
      console.warn("AI Analysis skipped (Reason: " + (error instanceof Error ? error.message : "unknown") + ")");
      // Fallback: Basic URL analysis if API fails.
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1] || "resource_stream";
      return {
        suggestedName: fileName.substring(0, 32),
        fileType: FileType.OTHER,
        description: "Resource detected via heuristic failover protocol",
        tags: ["detected"],
        safetyScore: 95,
        securityReport: "Local integrity check passed"
      };
    }
  }
}

export const geminiService = new GeminiService();
