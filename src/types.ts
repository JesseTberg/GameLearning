export interface WordAnalysis {
  word: string;
  reading?: string; // Furigana/Pinyin
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
