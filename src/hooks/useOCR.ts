import React, { useState, useCallback } from 'react';
import { analyzeGameRegion } from '../services/gemini';
import { GrammarPoint, CapturedText } from '../types';

export function useOCR(grammarPoints: GrammarPoint[], setCapturedTexts: React.Dispatch<React.SetStateAction<CapturedText[]>>) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);

  const performOCR = useCallback(async (base64Image: string) => {
    setIsLoading(true);
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
      console.error("Analysis failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [grammarPoints, setCapturedTexts]);

  return {
    isLoading,
    currentAnalysis,
    performOCR,
    setCurrentAnalysis
  };
}
