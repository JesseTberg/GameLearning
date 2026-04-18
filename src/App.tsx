import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { NavSidebar } from './components/NavSidebar';
import { ReaderViewport } from './components/viewport/ReaderViewport';
import { GrammarView } from './components/grammar/GrammarView';
import { FlashcardsView } from './components/flashcards/FlashcardsView';
import { HistoryView } from './components/history/HistoryView';
import { GrammarPoint, Flashcard, CapturedText, Deck } from './types';
import { Panel } from './components/ui/Panel';

const DEFAULT_GRAMMAR_POINTS: GrammarPoint[] = [
  { id: '1', name: 'て-form', description: 'Used for connecting sentences, requests, and ongoing actions.', pattern: 'verb[te]' },
  { id: '2', name: 'Passive Voice (れる/られる)', description: 'Expresses that an action is being done to the subject.', pattern: 'verb[reru]' }
];

import { cn } from './lib/utils';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useScreenCapture } from './hooks/useScreenCapture';

const DEFAULT_DECKS: Deck[] = [
  { id: 'default', name: 'General', color: '#3b82f6', createdAt: Date.now() }
];

export default function App() {
  const [grammarPoints, setGrammarPoints] = useState<GrammarPoint[]>(DEFAULT_GRAMMAR_POINTS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>(DEFAULT_DECKS);
  const [capturedTexts, setCapturedTexts] = useState<CapturedText[]>([]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Prep Area state lifted for access from History
  const [prepCard, setPrepCard] = useState<Partial<Flashcard>>({
    front: '',
    reading: '',
    back: '',
    context: ''
  });

  const onTransferToPrep = (word: any, context?: string) => {
    setPrepCard({
      front: word.word || '',
      reading: word.reading || '',
      back: word.translation || '',
      context: context || ''
    });
  };

  // Capture state moved here for persistence
  const capture = useScreenCapture();

  // Check for API key
  const hasKey = typeof window !== 'undefined' && (!!localStorage.getItem('GEMINI_API_KEY') || !!process.env.GEMINI_API_KEY);

  return (
    <div className="flex min-h-screen bg-bg text-text-main selection:bg-blue-600/40 selection:text-white font-sans">
      <NavSidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className={cn("flex-1 transition-all duration-300", isCollapsed ? "ml-20" : "ml-80")}>
        {/* Global Toolbar */}
        <Panel variant="header">
          <div className="text-[10px] font-mono text-text-dim flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className={cn("w-1 h-1 rounded-full animate-pulse", capture.isCapturing ? "bg-green-500" : (hasKey ? "bg-blue-500" : "bg-red-500"))} />
              STATUS: {capture.isCapturing ? "STREAM ACTIVE" : (hasKey ? "READY" : "API KEY MISSING")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 bg-border rounded-full overflow-hidden">
              <div className={cn("h-full transition-all duration-500", capture.isCapturing ? "bg-green-600 w-full" : (hasKey ? "bg-blue-600 w-full" : "bg-red-900 w-1/4"))} />
            </div>
            <span className="text-[10px] font-mono text-text-dim uppercase tracking-tighter">
              {capture.isCapturing ? "Streaming" : (hasKey ? "Synced" : "Offline")}
            </span>
          </div>
        </Panel>

        <div className="p-8 max-w-[1800px] mx-auto">
          <Routes>
            <Route path="/" element={
              <ReaderViewport 
                grammarPoints={grammarPoints}
                setFlashcards={setFlashcards}
                setCapturedTexts={setCapturedTexts}
                showTranslation={showTranslation}
                onToggleTranslation={() => setShowTranslation(!showTranslation)}
                capture={capture}
                prepCard={prepCard}
                setPrepCard={setPrepCard}
                decks={decks}
              />
            } />
            
            <Route path="/grammar" element={
              <GrammarView 
                grammarPoints={grammarPoints} 
                setGrammarPoints={setGrammarPoints} 
              />
            } />
            
            <Route path="/flashcards" element={
              <FlashcardsView 
                flashcards={flashcards} 
                setFlashcards={setFlashcards} 
                decks={decks}
                setDecks={setDecks}
              />
            } />
            
            <Route path="/history" element={
              <HistoryView 
                capturedTexts={capturedTexts} 
                onTransferToPrep={onTransferToPrep}
                prepCard={prepCard}
                setPrepCard={setPrepCard}
                setFlashcards={setFlashcards}
                decks={decks}
              />
            } />
          </Routes>
        </div>
      </main>

      <ApiKeyModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
