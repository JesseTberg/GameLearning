import React from 'react';
import { AnimatePresence } from 'motion/react';
import { History as HistoryIcon } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Grid } from '../ui/Grid';
import { HistoryItem } from './HistoryItem';
import { QuickActions } from '../viewport/QuickActions';
import { CapturedText, Flashcard, Deck } from '../../types';

interface HistoryViewProps {
  capturedTexts: CapturedText[];
  onTransferToPrep: (word: any, context?: string) => void;
  prepCard: Partial<Flashcard>;
  setPrepCard: React.Dispatch<React.SetStateAction<Partial<Flashcard>>>;
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  decks: Deck[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  capturedTexts, 
  onTransferToPrep,
  prepCard,
  setPrepCard,
  setFlashcards,
  decks
}) => {
  return (
    <div className="space-y-6">
      <SectionHeader title="Past Scans" subtitle="Review your past captures and create flashcards" />

      {capturedTexts.length === 0 ? (
        <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-4 text-text-dim">
          <HistoryIcon size={48} className="opacity-20" />
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest">Archive Empty</p>
            <p className="text-xs opacity-50">Saved scans will appear in this timeline.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Grid cols={2}>
              <AnimatePresence mode="popLayout">
                {capturedTexts.map(capture => (
                  <HistoryItem 
                    key={capture.id} 
                    capture={capture} 
                    onTransferToPrep={onTransferToPrep}
                  />
                ))}
              </AnimatePresence>
            </Grid>
          </div>

          <div className="lg:col-span-1">
            <QuickActions 
              prepCard={prepCard}
              setPrepCard={setPrepCard}
              onAddFlashcard={(card) => {
                setFlashcards(prev => [card, ...prev]);
                setPrepCard({ front: '', reading: '', back: '', context: '' });
              }}
              decks={decks}
            />
          </div>
        </div>
      )}
    </div>
  );
};
