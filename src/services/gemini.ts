import { GoogleGenAI, Type } from "@google/genai";
import { GrammarPoint } from "../types";

let aiClient: any = null;

function getAiClient() {
  if (typeof window === 'undefined') return null;

  const localKey = localStorage.getItem('GEMINI_API_KEY');
  
  if (!localKey || localKey === 'undefined' || localKey === 'MY_GEMINI_API_KEY') {
    throw new Error('API Key is missing. Please set your own Gemini API Key in the Settings menu (sidebar bottom).');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: localKey });
  }
  return aiClient;
}

export async function parseGrammarFromPdf(pdfBase64: string): Promise<GrammarPoint[]> {
  const ai = getAiClient();
  if (!ai) throw new Error("Client initialization failed");
  
  const prompt = `
    Analyze this document and extract key grammar points for someone learning the language.
    For each grammar point, provide:
    - name: A concise name for the rule (e.g., "Te-form")
    - description: A simple explanation that a non-tech savvy person would understand.
    - pattern: A code-like pattern hint (e.g. "verb[te]") or a simple example.

    Respond with ONLY a JSON array of these objects.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            pattern: { type: Type.STRING },
          },
          required: ["name", "description"]
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || '[]');
  return parsed.map((p: any) => ({
    ...p,
    id: Math.random().toString(36).substr(2, 9),
    pattern: p.pattern || ''
  }));
}

export async function analyzeGameRegion(base64Image: string, grammarPoints: GrammarPoint[]) {
  const ai = getAiClient();
  if (!ai) throw new Error("Client initialization failed");
  const grammarContext = grammarPoints.map(p => `- ${p.name}: ${p.description} (Pattern: ${p.pattern})`).join('\n');
  
  const prompt = `
    Analyze this game screen selection for language learning.
    
    1. EXTRACT TEXT: Perform OCR on the image. Extract every word accurately.
    2. TRANSLATE: Provide a natural translation of the full text.
    3. TOKENS: Break down the extracted text into individual words or small meaningful segments. For each segment, provide:
       - word: the original text
       - reading: the reading (like Furigana/Pinyin) if applicable
       - translation: a single-word translation
       - isFunctional: boolean, true if this is a particle, marker, or functional word (like 'no', 'wa', 'ga', 'the', 'of', etc.)
    4. GRAMMAR AUDIT: Check if any of these specific grammar points appear in the text:
    ${grammarContext}
    
    5. FLASHCARDS SUGGESTIONS: Identify 2-3 high-value vocabulary words.

    Format the response as JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedText: { type: Type.STRING },
          translation: { type: Type.STRING },
          words: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                reading: { type: Type.STRING },
                translation: { type: Type.STRING },
                isFunctional: { type: Type.BOOLEAN },
              },
            },
          },
          grammarMatches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pointName: { type: Type.STRING },
                matchedText: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
            },
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                reading: { type: Type.STRING },
                translation: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function performLensAnalysis(base64Image: string) {
  const ai = getAiClient();
  if (!ai) throw new Error("Client initialization failed");
  
  const prompt = `
    Perform a "Google Lens" style analysis on this image.
    1. Detect all text blocks.
    2. For each block, provide:
       - originalText: The text extracted from the block.
       - translatedText: A natural translation of that text.
       - boundingBox: [ymin, xmin, ymax, xmax] coordinates in normalized 0-1000 scale.
    
    Ensure the bounding boxes accurately enclose the text.
    Respond with ONLY a JSON object containing a "blocks" array.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalText: { type: Type.STRING },
                translatedText: { type: Type.STRING },
                boundingBox: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  minItems: 4,
                  maxItems: 4,
                },
              },
              required: ["originalText", "translatedText", "boundingBox"]
            },
          },
        },
      },
    },
  });

  return JSON.parse(response.text || '{"blocks": []}');
}

export async function analyzeText(text: string, grammarPoints: GrammarPoint[]) {
  const ai = getAiClient();
  if (!ai) throw new Error("Client initialization failed");
  const grammarContext = grammarPoints.map(p => `- ${p.name}: ${p.description} (Pattern: ${p.pattern})`).join('\n');
  
  const prompt = `
    Analyze this text for language learning.
    
    1. TRANSLATE: Provide a natural translation of the full text.
    2. TOKENS: Break down the text into individual words or small meaningful segments. For each segment, provide:
       - word: the original text
       - reading: the reading (like Furigana/Pinyin) if applicable
       - translation: a single-word translation
       - isFunctional: boolean, true if this is a particle, marker, or functional word (like 'no', 'wa', 'ga', 'the', 'of', etc.)
    3. GRAMMAR AUDIT: Check if any of these specific grammar points appear in the text:
    ${grammarContext}

    Format the response as JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt + "\n\nTEXT TO ANALYZE: " + text }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING },
          words: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                reading: { type: Type.STRING },
                translation: { type: Type.STRING },
                isFunctional: { type: Type.BOOLEAN },
              },
            },
          },
          grammarMatches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pointName: { type: Type.STRING },
                matchedText: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    extractedText: text
  };
}
