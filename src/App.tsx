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
import { API_KEY_CHANGE_EVENT, hasApiKey } from './lib/encryption';
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
  const [hasKey, setHasKey] = useState(hasApiKey());
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');

  // Set global variables for the service to pick up
  React.useEffect(() => {
    (window as any)._AI_MODEL = selectedModel;
    (window as any)._AI_PROVIDER = 'gemini';
  }, [selectedModel]);

  // Listen for key changes without reload
  React.useEffect(() => {
    const handleKeyChange = () => setHasKey(hasApiKey());
    window.addEventListener(API_KEY_CHANGE_EVENT, handleKeyChange);
    return () => window.removeEventListener(API_KEY_CHANGE_EVENT, handleKeyChange);
  }, []);

  const getQuotaInfo = () => {
    if (selectedModel.includes('pro')) return "PRO QUOTA: ~2 RPM (FREE)";
    return "FLASH QUOTA: ~15 RPM (FREE)";
  };

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
          <div className="text-[10px] font-mono text-text-dim flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full", 
                hasKey ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-red-500 animate-pulse"
              )} />
              <div className="flex flex-col">
                <span className="flex items-center gap-2">
                  AI STATUS: <span className={hasKey ? "text-blue-400" : "text-red-400"}>{hasKey ? "ACTIVE" : "OFFLINE"}</span>
                </span>
                {hasKey && <span className="text-[8px] text-blue-500/60 uppercase">{getQuotaInfo()}</span>}
              </div>
            </div>

            <div className="h-3 w-[1px] bg-white/10" />

            {/* Model Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-white/30 uppercase font-bold">Active Engine</span>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[9px] text-blue-300 outline-none hover:bg-white/10 transition-colors cursor-pointer"
              >
                <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Strong)</option>
                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Lite)</option>
              </select>
            </div>

            <div className="h-3 w-[1px] bg-white/10" />

            <span className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full", 
                capture.isCapturing ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-500"
              )} />
              CAPTURE: <span className={capture.isCapturing ? "text-green-400" : "text-gray-500"}>{capture.isCapturing ? "LIVE" : "IDLE"}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-40 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className={cn(
                "h-full transition-all duration-700", 
                capture.isCapturing ? "bg-green-600 w-full" : (hasKey ? "bg-blue-600/50 w-1/2" : "bg-red-900/40 w-1/5")
              )} />
            </div>
            <span className="text-[9px] font-mono text-text-dim uppercase tracking-widest opacity-50">
              {capture.isCapturing ? "Synchronizing" : (hasKey ? "System Secure" : "Key Required")}
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
