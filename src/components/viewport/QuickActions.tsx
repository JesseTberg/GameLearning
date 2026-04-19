import React from 'react';
import { Plus, Brain, Save, Trash2, Edit3, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { cn } from '../../lib/utils';
import { Flashcard, Deck } from '../../types';

interface FlashcardPrepProps {
  prepCard: Partial<Flashcard>;
  setPrepCard: React.Dispatch<React.SetStateAction<Partial<Flashcard>>>;
  onAddFlashcard: (card: Flashcard) => void;
  decks: Deck[];
  defaultDeckId?: string;
}

export const QuickActions: React.FC<FlashcardPrepProps> = ({
  prepCard,
  setPrepCard,
  onAddFlashcard,
  decks,
  defaultDeckId
}) => {
  const [selectedDeckId, setSelectedDeckId] = React.useState(defaultDeckId || decks[0]?.id || 'default');
  
  // Update selection if defaultDeckId changes (e.g. switching views)
  React.useEffect(() => {
    if (defaultDeckId) setSelectedDeckId(defaultDeckId);
  }, [defaultDeckId]);

  const hasContent = prepCard.front || prepCard.back;

  const handleSave = () => {
    if (!prepCard.front || !prepCard.back) return;
    
    onAddFlashcard({
      id: Math.random().toString(36).substring(2, 9),
      deckId: selectedDeckId,
      front: prepCard.front,
      reading: prepCard.reading || '',
      back: prepCard.back,
      context: prepCard.context || '',
      createdAt: Date.now()
    });
  };

  const handleClear = () => {
    setPrepCard({ front: '', reading: '', back: '', context: '' });
  };

  return (
    <aside className="space-y-6 sticky top-8">
      <SectionHeader title="Flashcard Prep" />
      
      <Panel variant="glass" className="p-6 border-blue-500/20 bg-blue-600/5">
        <div className="flex items-center justify-between mb-6">
          <label className="text-[0.65rem] font-bold text-text-dim uppercase tracking-widest italic flex items-center gap-2">
            <Edit3 size={12} /> Live Creator
          </label>
          {hasContent && (
            <button onClick={handleClear} className="text-text-dim hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Word / Text</label>
            <input 
              value={prepCard.front || ''}
              onChange={(e) => setPrepCard(p => ({ ...p, front: e.target.value }))}
              placeholder="Captured Word"
              className="w-full bg-bg/50 border border-border/50 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Reading (Optional)</label>
            <input 
              value={prepCard.reading || ''}
              onChange={(e) => setPrepCard(p => ({ ...p, reading: e.target.value }))}
              placeholder="e.g. かんじ"
              className="w-full bg-bg/50 border border-border/50 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Meaning / Definition</label>
            <textarea 
              value={prepCard.back || ''}
              onChange={(e) => setPrepCard(p => ({ ...p, back: e.target.value }))}
              placeholder="Translation results"
              rows={3}
              className="w-full bg-bg/50 border border-border/50 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-all font-medium resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Target Deck</label>
            <select 
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="w-full bg-bg/50 border border-border/50 rounded p-2 text-sm text-white focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
            >
              {decks.map(deck => (
                <option key={deck.id} value={deck.id} className="bg-bg">
                  {deck.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter flex items-center justify-between">
              Context
              {prepCard.context && (
                <button 
                  onClick={() => setPrepCard(p => ({ ...p, context: '' }))}
                  className="text-[8px] text-accent hover:text-white transition-colors"
                >
                  CLEAR
                </button>
              )}
            </label>
            <textarea 
              value={prepCard.context || ''}
              onChange={(e) => setPrepCard(p => ({ ...p, context: e.target.value }))}
              placeholder="Source text context"
              rows={2}
              className="w-full bg-bg/50 border border-border/50 rounded p-2 text-[11px] text-gray-400 italic focus:border-blue-500 outline-none transition-all font-medium resize-none"
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={!prepCard.front || !prepCard.back}
            className="w-full gap-2 shadow-lg shadow-blue-900/20"
          >
            <Plus size={16} /> Save to Collection
          </Button>
        </div>
      </Panel>

      {!hasContent && (
        <div className="p-10 border-2 border-dashed border-border/20 rounded-xl flex flex-col items-center justify-center text-center opacity-30 grayscale pointer-events-none">
          <Brain size={48} className="mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Select a word<br/>to start</p>
        </div>
      )}
    </aside>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 border-l-2 border-blue-500 pl-3">
    <h4 className="text-[0.7rem] font-bold text-white uppercase tracking-widest leading-none">{title}</h4>
  </div>
);
