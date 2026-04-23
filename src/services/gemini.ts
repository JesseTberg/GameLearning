import { GoogleGenAI, Type } from "@google/genai";
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

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (responseText) {
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Not JSON, use the raw response if it's reasonably sized
        if (responseText.length < 500) errorMessage = responseText;
      }
    }
    throw new Error(errorMessage);
  }

  if (responseText.trim().startsWith("<!DOCTYPE html>")) {
    throw new Error("Backend not found or returned an HTML error page. This usually means the API route is missing or misconfigured on your hosting provider.");
  }

  try {
    const data = JSON.parse(responseText);
    return data.text;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON. Raw body:", responseText);
    throw new Error("The AI Assistant returned a malformed response. Please try refreshing and entering your key again.");
  }
}

function sanitizeJson(text: string): string {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    const parts = clean.split("```");
    // Usually it's ```json ... ``` or just ``` ... ```
    // We take the middle part
    clean = parts[1];
    if (clean.startsWith("json")) {
      clean = clean.substring(4);
    }
    clean = clean.split("```")[0].trim();
  }
  return clean;
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

  const parsed = JSON.parse(sanitizeJson(text || '[]'));
  return parsed.map((p: any) => ({
    ...p,
    id: Math.random().toString(36).substr(2, 9),
    pattern: p.pattern || ''
  }));
}

export async function transcribeImage(base64Image: string) {
  const prompt = `
    Analyze this image and extract all text.
    
    1. EXTRACT TEXT: Perform highly accurate OCR.
    2. TOKENS: Break down the text into logical word units.
       CRITICAL SEGMENTATION RULE: Keep conjugated words (verbs, adjectives, etc.) as a single segment. DO NOT split word stems from suffixes.
       CRITICAL RECONSTRUCTION RULE: Every single character, space, and punctuation mark MUST be included. Joining 'word' fields must result in the exact source string.
       
    Provide for each segment:
    - word: the original text segment
    - reading: phonetic reading if applicable
    - translation: simple English meaning
    - partOfSpeech: linguistic role (Noun, Verb, etc.)
    - isFunctional: boolean (particles/markers)
    
    Respond in JSON.
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
          words: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                reading: { type: Type.STRING },
                translation: { type: Type.STRING },
                partOfSpeech: { type: Type.STRING },
                isFunctional: { type: Type.BOOLEAN },
              },
            },
          },
        },
      },
    },
  });

  return JSON.parse(sanitizeJson(text || '{}'));
}

export async function analyzeGameRegion(base64Image: string, grammarPoints: GrammarPoint[]) {
  const grammarContext = grammarPoints.map(p => `- ${p.name}: ${p.description} (Pattern: ${p.pattern})`).join('\n');
  
  const prompt = `
    Analyze this game screen selection for language learning.
    
    1. EXTRACT TEXT: Perform OCR on the image. Extract every word accurately.
    2. TRANSLATE: Provide a natural translation of the full text.
    3. TOKENS: Break down the extracted text into logical word segments. 
       CRITICAL SEGMENTATION RULE: Keep conjugated words (verbs, adjectives, etc.) as a single segment. DO NOT split a word's stem from its conjugation suffix or inflections. Each segment should be a complete word unit or a functional particle.
       CRITICAL RECONSTRUCTION RULE: Every single character, space, and punctuation mark from the original text MUST be included in the tokens list. 
       The list of 'word' fields, when joined, must be IDENTICAL to the source text. 
       For each segment, provide:
       - word: the original text segment (including whitespace/punctuation as their own tokens)
       - reading: the reading (like Furigana/Pinyin) if applicable (leave null for punctuation/whitespace)
       - translation: a single-word or phrase translation (leave null for punctuation/whitespace)
       - partOfSpeech: Identifiy the part of speech (Noun, Verb, Particle, Adjective, Punctuation, etc.)
       - isFunctional: boolean, true for markers, particles, or structural segments. DO NOT mark conjugation suffixes as functional; they must be part of the main word.
    4. GRAMMAR AUDIT: Check if any of these specific grammar points appear in the text:
    ${grammarContext}
    
    CRITICAL GRAMMAR RULE: Only include a match if it is CONTEXTUALLY RELEVANT. For example, if the grammar point is "te-form", do not match words that simply contain "て" (like "手" or "手帳") unless they are actually verbs in the te-form. Each match must be a genuine instance of that specific grammatical rule in this sentence.
    
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
                partOfSpeech: { type: Type.STRING },
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

  return JSON.parse(sanitizeJson(text || '{}'));
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

  return JSON.parse(sanitizeJson(text || '{"blocks": []}'));
}

export async function analyzeText(textToAnalyze: string, grammarPoints: GrammarPoint[]) {
  const grammarContext = grammarPoints.map(p => `- ${p.name}: ${p.description} (Pattern: ${p.pattern})`).join('\n');
  
  const prompt = `
    Analyze this text for language learning.
    
    1. TRANSLATE: Provide a natural translation of the full text.
    2. TOKENS: Break down the text into logical word segments.
       CRITICAL SEGMENTATION RULE: Keep conjugated words (verbs, adjectives, etc.) as a single segment. DO NOT split a word's stem from its conjugation suffix or inflections. Each segment should be a complete word unit or a functional particle.
       CRITICAL RECONSTRUCTION RULE: Every single character, space, and punctuation mark from the original text MUST be included in the tokens list. 
       The list of 'word' fields, when joined, must be IDENTICAL to the source text. 
       Do not skip anything.
       For each segment, provide:
       - word: the original text segment (including whitespace/punctuation as their own tokens)
       - reading: the reading if applicable
       - translation: a single-word or phrase translation
       - partOfSpeech: The linguistic role (Noun, Verb, Particle, etc.)
       - isFunctional: boolean, true for markers, particles, or structural segments. DO NOT mark conjugation suffixes as functional; they must be part of the main word.
    3. GRAMMAR AUDIT: Check if any of these specific grammar points appear in the text:
    ${grammarContext}

    CRITICAL GRAMMAR RULE: Only include a match if it is CONTEXTUALLY RELEVANT and syntactically correct for that rule. Do not match tokens based on substring pattern matching alone. Verify that the word's Part of Speech matches the grammar rule's requirements.

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
                partOfSpeech: { type: Type.STRING },
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

  const parsed = JSON.parse(sanitizeJson(responseText || '{}'));
  return {
    ...parsed,
    extractedText: textToAnalyze
  };
}
