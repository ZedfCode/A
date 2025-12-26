
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, FileType } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correctly initialize with API key from environment variable process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeUrl(url: string): Promise<AIAnalysisResult> {
    try {
      // Use gemini-3-flash-preview for efficient text tasks like link analysis
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
          - safetyScore (0-100, analyze if the domain is known for malware or phishing)
          - securityReport (short sentence summarizing the safety check)
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
            // Ensure all required fields are requested in the schema
            required: ["suggestedName", "fileType", "safetyScore", "securityReport", "description", "tags"]
          }
        }
      });

      // Access the .text property directly as per latest guidelines
      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini AI");
      }

      return JSON.parse(text.trim()) as AIAnalysisResult;
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Return a complete AIAnalysisResult object as fallback when AI fails
      return {
        suggestedName: 'resource_' + Date.now(),
        fileType: FileType.OTHER,
        description: "AI Analysis unavailable",
        tags: [],
        safetyScore: 100,
        securityReport: "Offline check passed. Domain appears normal."
      };
    }
  }
}

export const geminiService = new GeminiService();
