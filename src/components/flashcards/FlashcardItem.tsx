import React, { useState } from 'react';
import { History, Trash2, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Flashcard } from '../../types';

interface FlashcardItemProps {
  card: Flashcard;
  onUpdate: (id: string, updates: Partial<Flashcard>) => void;
  onDelete: (id: string) => void;
}

export const FlashcardItem: React.FC<FlashcardItemProps> = ({ card, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [reading, setReading] = useState(card.reading || '');
  const [back, setBack] = useState(card.back);
  const [context, setContext] = useState(card.context || '');

  const onSave = () => {
    onUpdate(card.id, { front, reading, back, context });
    setIsEditing(false);
  };

  return (
    <Card className="p-6">
      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-text-dim">Front</label>
            <input 
              value={front} 
              onChange={e => setFront(e.target.value)}
              className="w-full bg-panel border border-border px-2 py-1 rounded text-lg font-bold text-white outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-text-dim">Reading</label>
            <input 
              value={reading} 
              onChange={e => setReading(e.target.value)}
              placeholder="Reading (Furigana/Pinyin)"
              className="w-full bg-panel border border-border px-2 py-1 rounded text-xs text-accent-light outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-text-dim">Back</label>
            <textarea 
              value={back} 
              onChange={e => setBack(e.target.value)}
              rows={2}
              className="w-full bg-panel border border-border px-2 py-1 rounded text-sm text-text-main outline-none"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[9px] uppercase font-bold text-text-dim">Context</label>
              <button 
                onClick={() => setContext('')}
                className="text-[8px] text-red-400 hover:text-white transition-colors"
              >
                REMOVE
              </button>
            </div>
            <textarea 
              value={context} 
              onChange={e => setContext(e.target.value)}
              rows={2}
              className="w-full bg-panel border border-border px-2 py-1 rounded text-[10px] text-text-dim italic outline-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={onSave} className="flex-1">Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <History size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(card.id)} className="hover:text-red-400">
              <Trash2 size={14} />
            </Button>
          </div>

          <div className="text-[10px] font-mono text-text-dim mb-4 flex items-center gap-2 uppercase tracking-tighter">
            <Clock size={10} />
            {new Date(card.createdAt).toLocaleDateString()}
          </div>

          <div className="mb-4">
            {card.reading && <div className="text-[10px] text-accent-light font-bold mb-0.5">{card.reading}</div>}
            <h3 className="text-2xl font-bold text-white uppercase">{card.front}</h3>
          </div>

          <p className="text-accent-light font-medium mb-4 italic text-sm">{card.back}</p>
          
          <div className="p-3 bg-black/30 rounded text-[11px] text-text-dim italic leading-relaxed">
            "{card.context}"
          </div>
        </>
      )}
    </Card>
  );
};
