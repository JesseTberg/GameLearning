export interface WordAnalysis {
  word: string;
  reading?: string | null; // Furigana/Pinyin
  translation: string;
}

export interface GrammarPoint {
  id: string;
  name: string;
  description: string;
  pattern: string;
}

export interface CapturedText {
  id: string;
  raw: string;
  timestamp: number;
  translation: string;
  words: WordAnalysis[]; // Granular word data
  grammarMatches: {
    pointId: string;
    text: string;
    explanation: string;
  }[];
  suggestedGrammar?: {
    name: string;
    description: string;
    pattern: string;
    matchedText: string;
  }[];
}

export interface Deck {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  reading?: string;
  back: string;
  context?: string;
  createdAt: number;
}

export interface LensBlock {
  originalText: string;
  translatedText: string;
  boundingBox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
}

export interface LensResult {
  screenshot: string; // base64
  blocks: LensBlock[];
}
