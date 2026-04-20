import React, { useState, useCallback } from 'react';
import { analyzeGameRegion, performLensAnalysis, analyzeText } from '../services/gemini';
import { GrammarPoint, CapturedText, LensResult } from '../types';

export function useOCR(grammarPoints: GrammarPoint[], setCapturedTexts: React.Dispatch<React.SetStateAction<CapturedText[]>>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [lensResult, setLensResult] = useState<LensResult | null>(null);

  const performOCR = useCallback(async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeGameRegion(base64Image, grammarPoints);
      setCurrentAnalysis(result);
      
      const newCapture: CapturedText = {
        id: Math.random().toString(36).substr(2, 9),
        raw: result.extractedText,
        timestamp: Date.now(),
        translation: result.translation,
        words: result.words || [],
        grammarMatches: result.grammarMatches?.map((m: any) => ({
          pointId: grammarPoints.find(p => p.name === m.pointName)?.id || 'unknown',
          text: m.matchedText,
          explanation: m.explanation
        })) || []
      };
      
      setCapturedTexts(prev => [newCapture, ...prev]);
      return result;
    } catch (err: any) {
      const msg = err.message || "Analysis failed";
      console.error("Analysis failed:", msg);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [grammarPoints, setCapturedTexts]);

  const performLens = useCallback(async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await performLensAnalysis(base64Image);
      setLensResult({
        screenshot: base64Image,
        blocks: result.blocks
      });
      return result;
    } catch (err: any) {
      const msg = err.message || "Lens analysis failed";
      console.error("Lens analysis failed:", msg);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performTextAnalysis = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeText(text, grammarPoints);
      setCurrentAnalysis(result);
      return result;
    } catch (err: any) {
      const msg = err.message || "Text analysis failed";
      console.error("Text analysis failed:", msg);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [grammarPoints]);

  return {
    isLoading,
    error,
    setError,
    currentAnalysis,
    lensResult,
    setLensResult,
    performOCR,
    performLens,
    performTextAnalysis,
    setCurrentAnalysis
  };
}
