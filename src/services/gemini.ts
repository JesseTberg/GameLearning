import { Type } from "@google/genai";
import { GrammarPoint } from "../types";
import { getStoredApiKey } from "../lib/encryption";

/**
 * Enhanced secure caller that decrypts the user's key at the last possible moment
 * and routes through the local proxy to satisfy the strict CSP connect-src 'self' rule.
 */
async function callGeminiThroughProxy(params: {
  prompt: string;
  model?: string;
  mimeType?: string;
  base64Data?: string;
  config?: any;
}) {
  const provider = (window as any)._AI_PROVIDER || 'gemini';
  const decryptedKey = await getStoredApiKey(provider);

  if (!decryptedKey) {
    throw new Error(`${provider.toUpperCase()} API Key is missing. Check your Settings.`);
  }

  const response = await fetch("/api/ai-proxy", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-api-key": decryptedKey 
    },
    body: JSON.stringify({
      ...params,
      provider,
      model: params.model || (window as any)._AI_MODEL || "gemini-3-flash-preview"
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

export async function parseGrammarFromPdf(pdfBase64: string): Promise<GrammarPoint[]> {
  const prompt = `
    Analyze this document and extract key grammar points for someone learning the language.
    For each grammar point, provide:
    - name: A concise name for the rule (e.g., "Te-form")
    - description: A simple explanation that a non-tech savvy person would understand.
    - pattern: A code-like pattern hint (e.g. "verb[te]") or a simple example.

    Respond with ONLY a JSON array of these objects.
  `;

  const text = await callGeminiThroughProxy({
    prompt,
    mimeType: "application/pdf",
    base64Data: pdfBase64,
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

  const parsed = JSON.parse(text || '[]');
  return parsed.map((p: any) => ({
    ...p,
    id: Math.random().toString(36).substr(2, 9),
    pattern: p.pattern || ''
  }));
}

export async function analyzeGameRegion(base64Image: string, grammarPoints: GrammarPoint[]) {
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

  const text = await callGeminiThroughProxy({
    prompt,
    mimeType: "image/png",
    base64Data: base64Image,
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

  return JSON.parse(text || '{}');
}

export async function performLensAnalysis(base64Image: string) {
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

  const text = await callGeminiThroughProxy({
    prompt,
    mimeType: "image/png",
    base64Data: base64Image,
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

  return JSON.parse(text || '{"blocks": []}');
}

export async function analyzeText(textToAnalyze: string, grammarPoints: GrammarPoint[]) {
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

  const responseText = await callGeminiThroughProxy({
    prompt: prompt + "\n\nTEXT TO ANALYZE: " + textToAnalyze,
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

  const parsed = JSON.parse(responseText || '{}');
  return {
    ...parsed,
    extractedText: textToAnalyze
  };
}
