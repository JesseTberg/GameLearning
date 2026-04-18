import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Layers, Play, Shuffle, X, ChevronLeft, ChevronRight, FolderPlus, ArrowLeft, MoreVertical, Trash2, Edit3, Move, Plus } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Grid } from '../ui/Grid';
import { FlashcardItem } from './FlashcardItem';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { QuickActions } from '../viewport/QuickActions';
import { Flashcard, Deck } from '../../types';
import { cn } from '../../lib/utils';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ 
  flashcards, 
  setFlashcards,
  decks,
  setDecks
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studySession, setStudySession] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showReadingOnFront, setShowReadingOnFront] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingDeckName, setEditingDeckName] = useState('');
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [movingToDeckId, setMovingToDeckId] = useState<string | null>(null);
  
  const [prepCard, setPrepCard] = useState<Partial<Flashcard>>({
    front: '',
    reading: '',
    back: '',
    context: ''
  });

  const onUpdate = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  
  const onMoveSelected = (targetDeckId: string) => {
    if (selectedIds.length === 0) return;
    setFlashcards(prev => prev.map(c => 
      selectedIds.includes(c.id) ? { ...c, deckId: targetDeckId } : c
    ));
    setSelectedIds([]);
    setMovingToDeckId(null);
  };

  const onDelete = (id: string) => {
    setFlashcards(prev => prev.filter(c => c.id !== id));
    setSelectedIds(selectedIds.filter(sid => sid !== id));
  };

  const onCreateDeck = () => {
    if (!newDeckName.trim()) return;
    const newDeck: Deck = {
      id: Math.random().toString(36).substring(2, 9),
      name: newDeckName,
      color: `hwb(${Math.floor(Math.random() * 360)} 20% 20%)`,
      createdAt: Date.now()
    };
    setDecks(prev => [...prev, newDeck]);
    setNewDeckName('');
    setIsCreatingDeck(false);
  };

  const onRenameDeck = () => {
    if (!editingDeckId || !editingDeckName.trim()) return;
    setDecks(prev => prev.map(d => d.id === editingDeckId ? { ...d, name: editingDeckName } : d));
    setEditingDeckId(null);
    setEditingDeckName('');
  };

  const onDeleteDeck = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === 'default') {
      alert("Standard collection cannot be deleted.");
      return;
    }
    if (confirm('Are you absolutely sure? This will permanently delete this deck and ALL flashcards inside it.')) {
      setDecks(prev => prev.filter(d => d.id !== id));
      setFlashcards(prev => prev.filter(c => c.deckId !== id));
      if (activeDeckId === id) setActiveDeckId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const startStudy = (shuffle = false) => {
    const deckCards = activeDeckId 
      ? flashcards.filter(f => f.deckId === activeDeckId)
      : flashcards;

    const pool = selectedIds.length > 0 
      ? deckCards.filter(f => selectedIds.includes(f.id))
      : deckCards;
    
    if (pool.length === 0) return;

    let session = [...pool];
    if (shuffle) {
      session = session.sort(() => Math.random() - 0.5);
    }
    
    setStudySession(session);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsStudyMode(true);
  };

  const headerRight = (
    <div className="flex items-center gap-3">
      {!activeDeckId && !isStudyMode && (
        <Button size="sm" onClick={() => setIsCreatingDeck(true)} className="gap-2">
          <FolderPlus size={14} /> New Deck
        </Button>
      )}
      {activeDeckId && !isStudyMode && (
        <>
          <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest mr-2">
            {selectedIds.length > 0 ? `${selectedIds.length} Selected` : `${flashcards.filter(f => f.deckId === activeDeckId).length} Total`}
          </span>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center mr-2 border-r border-border/50 pr-4">
               <select 
                 className="bg-panel border border-border/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500 mr-2"
                 onChange={(e) => onMoveSelected(e.target.value)}
                 value=""
               >
                 <option value="" disabled>Move Selected to...</option>
                 {decks.filter(d => d.id !== activeDeckId).map(deck => (
                   <option key={deck.id} value={deck.id}>{deck.name}</option>
                 ))}
               </select>
            </div>
          )}

          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setIsCreatingCard(true)}
            className="gap-2"
          >
            <Plus size={14} /> New Card
          </Button>

          <Button 
            size="sm" 
            variant="accent-ghost" 
            onClick={() => startStudy(true)}
            className="gap-2"
          >
            <Shuffle size={14} /> Shuffle
          </Button>
          <Button 
            size="sm" 
            onClick={() => startStudy(false)}
            className="gap-2"
          >
            <Play size={14} /> Study
          </Button>
        </>
      )}
      {isStudyMode && (
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => setIsStudyMode(false)}
          className="gap-2"
        >
          <X size={14} /> Exit
        </Button>
      )}
    </div>
  );

  if (isStudyMode) {
    const current = studySession[currentIndex];
    
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <SectionHeader 
          title="Study Session" 
          subtitle={`${currentIndex + 1} of ${studySession.length}`} 
          rightAction={headerRight}
        />

        <div className="perspective-1000">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            className="relative h-80 cursor-pointer"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <Card className={cn(
              "w-full h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-500 bg-panel border-2",
              showAnswer ? "border-blue-500/50" : "border-accent/20"
            )}>
              <div className="absolute top-4 left-4 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                {showAnswer ? "Definition" : "Word"}
              </div>

              {!showAnswer ? (
                <div className="space-y-4">
                  {current.reading && (
                    <div 
                      className={cn(
                        "text-sm font-bold transition-all p-1 px-3 rounded-full cursor-pointer",
                        showReadingOnFront ? "bg-accent/10 text-accent-light" : "bg-white/5 text-transparent hover:bg-white/10"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReadingOnFront(!showReadingOnFront);
                      }}
                    >
                      {current.reading}
                    </div>
                  )}
                  <div className="text-5xl font-bold text-white uppercase tracking-tight">{current.front}</div>
                  {!showReadingOnFront && current.reading && (
                    <div className="text-[9px] text-text-dim/40 uppercase font-bold tracking-[0.2em] mt-2">
                       (Reading hidden)
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {current.reading && (
                    <div className="text-lg text-accent-light font-bold">
                      {current.reading}
                    </div>
                  )}
                  <div className="text-3xl font-medium italic text-white">"{current.back}"</div>
                  {current.context && (
                    <div className="text-xs text-text-dim bg-black/20 p-4 rounded border border-white/5 opacity-80 max-w-md">
                      {current.context}
                    </div>
                  )}
                </div>
              )}

              <div className="absolute bottom-6 text-[9px] text-text-dim/40 uppercase font-bold tracking-widest">
                Click to Flip
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="flex justify-between items-center bg-panel/50 p-4 rounded-xl border border-border/50">
          <Button 
            variant="secondary" 
            disabled={currentIndex === 0}
            onClick={() => { setCurrentIndex(i => i - 1); setShowAnswer(false); }}
            className="gap-2"
          >
            <ChevronLeft size={16} /> Prev
          </Button>
          
          <div className="flex gap-2">
            {[...Array(Math.min(studySession.length, 5))].map((_, i) => (
               <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === currentIndex ? "bg-blue-500" : "bg-border")} />
            ))}
          </div>

          <Button 
            variant="primary" 
            disabled={currentIndex === studySession.length - 1}
            onClick={() => { setCurrentIndex(i => i + 1); setShowAnswer(false); }}
            className="gap-2"
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  // Deck List View
  if (!activeDeckId) {
    return (
      <div className="space-y-8">
        <SectionHeader title="Your Decks" rightAction={headerRight} />

        <AnimatePresence>
          {(isCreatingDeck || editingDeckId) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Panel variant="glass" className="p-6 flex items-center gap-4">
                <input 
                  autoFocus
                  value={isCreatingDeck ? newDeckName : editingDeckName}
                  onChange={e => isCreatingDeck ? setNewDeckName(e.target.value) : setEditingDeckName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (isCreatingDeck ? onCreateDeck() : onRenameDeck())}
                  placeholder={isCreatingDeck ? "Enter deck name..." : "Rename deck..."}
                  className="flex-1 bg-bg/50 border border-border/50 rounded p-3 text-white outline-none focus:border-blue-500"
                />
                <Button onClick={isCreatingDeck ? onCreateDeck : onRenameDeck}>
                  {isCreatingDeck ? 'Create' : 'Save'}
                </Button>
                <Button variant="secondary" onClick={() => { setIsCreatingDeck(false); setEditingDeckId(null); }}>Cancel</Button>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>

        <Grid cols={3}>
          {decks.map(deck => {
            const count = flashcards.filter(f => f.deckId === deck.id).length;
            return (
              <motion.div 
                key={deck.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveDeckId(deck.id)}
                className="cursor-pointer group relative"
              >
                <Card className="p-8 h-48 flex flex-col justify-between border-2 border-transparent hover:border-blue-500/30 transition-all bg-panel/40">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 shadow-lg shadow-blue-500/20">
                      <Layers size={20} className="text-white" />
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDeckId(deck.id);
                          setEditingDeckName(deck.name);
                        }}
                        className="p-2 opacity-0 group-hover:opacity-100 text-text-dim hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      {deck.id !== 'default' && (
                        <button 
                          onClick={(e) => onDeleteDeck(e, deck.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{deck.name}</h3>
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{count} {count === 1 ? 'Card' : 'Cards'}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </Grid>

        {decks.length === 0 && (
          <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-4 text-text-dim">
            <Layers size={48} className="opacity-20" />
            <p className="font-bold uppercase tracking-widest">No decks found</p>
          </div>
        )}
      </div>
    );
  }

  // Cards in Deck View
  const currentDeck = decks.find(d => d.id === activeDeckId);
  const deckCards = flashcards.filter(f => f.deckId === activeDeckId);

  return (
    <div className="space-y-6 relative">
      <SectionHeader 
        title={currentDeck?.name || 'Deck'} 
        subtitle={`${deckCards.length} Cards`}
        leftAction={(
          <Button variant="ghost" size="sm" onClick={() => setActiveDeckId(null)} className="mr-2 -ml-2 text-text-dim hover:text-white">
            <ArrowLeft size={16} /> Decks
          </Button>
        )}
        rightAction={headerRight} 
      />

      <AnimatePresence>
        {isCreatingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatingCard(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md"
            >
              <QuickActions 
                prepCard={prepCard}
                setPrepCard={setPrepCard}
                decks={decks}
                defaultDeckId={activeDeckId || undefined}
                onAddFlashcard={(card) => {
                  setFlashcards(prev => [card, ...prev]);
                  setPrepCard({ front: '', reading: '', back: '', context: '' });
                  setIsCreatingCard(false);
                }}
              />
              <button 
                onClick={() => setIsCreatingCard(false)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {deckCards.length === 0 ? (
        <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-4 text-text-dim">
          <Layers size={48} className="opacity-20" />
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest">Deck Empty</p>
            <p className="text-xs opacity-50">Words saved from scans will appear here.</p>
          </div>
        </div>
      ) : (
        <Grid cols={3}>
          <AnimatePresence mode="popLayout">
            {deckCards.map(card => (
              <div 
                key={card.id} 
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  toggleSelect(card.id);
                }}
                className={cn(
                  "relative transition-all duration-300",
                  selectedIds.includes(card.id) ? "scale-[1.02] ring-2 ring-blue-500/50 rounded-xl" : "hover:scale-[1.01]"
                )}
              >
                <div className={cn(
                  "absolute -top-2 -right-2 w-5 h-5 rounded-full z-10 flex items-center justify-center text-[10px] font-bold transition-all",
                  selectedIds.includes(card.id) ? "bg-blue-500 text-white" : "bg-border text-transparent"
                )}>
                  ✓
                </div>
                <FlashcardItem 
                  card={card} 
                  onUpdate={onUpdate} 
                  onDelete={onDelete} 
                />
              </div>
            ))}
          </AnimatePresence>
        </Grid>
      )}
    </div>
  );
};
