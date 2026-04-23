import React, { useState, useCallback } from 'react';
import { analyzeGameRegion, performLensAnalysis, analyzeText, transcribeImage } from '../services/gemini';
import { GrammarPoint, CapturedText, LensResult } from '../types';

export function useOCR(grammarPoints: GrammarPoint[], setCapturedTexts: React.Dispatch<React.SetStateAction<CapturedText[]>>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [lensResult, setLensResult] = useState<LensResult | null>(null);

  const performOCR = useCallback(async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Transcription (OCR + Words)
      const transcript = await transcribeImage(base64Image);
      setCurrentAnalysis(transcript);
      
      // Step 2: Auto-trigger Deep Analysis
      setIsAnalyzing(true);
      const deepResult = await analyzeText(transcript.extractedText, grammarPoints);
      
      const fullResult = {
        ...transcript,
        ...deepResult
      };
      
      setCurrentAnalysis(fullResult);
      
      const newCapture: CapturedText = {
        id: Math.random().toString(36).substr(2, 9),
        raw: fullResult.extractedText,
        timestamp: Date.now(),
        translation: fullResult.translation,
        words: fullResult.words || [],
        grammarMatches: fullResult.grammarMatches?.map((m: any) => ({
          pointId: grammarPoints.find(p => p.name === m.pointName)?.id || 'unknown',
          text: m.matchedText,
          explanation: m.explanation
        })) || []
      };
      
      setCapturedTexts(prev => [newCapture, ...prev]);
      return fullResult;
    } catch (err: any) {
      const msg = err.message || "Analysis failed";
      console.error("Analysis failed:", msg);
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
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
    isAnalyzing,
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
