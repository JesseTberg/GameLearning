import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { TokenDisplay } from '../viewport/TokenDisplay';
import { CapturedText } from '../../types';
import { useNavigate } from 'react-router-dom';

interface HistoryItemProps {
  capture: CapturedText;
  onTransferToPrep: (word: any, context?: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ capture, onTransferToPrep }) => {
  const navigate = useNavigate();

  const handleWordClick = (word: any) => {
    onTransferToPrep(word, capture.raw);
    // Removed navigate('/') to stay on history page
  };

  return (
    <Card className="p-6 group relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono text-accent-light uppercase flex items-center gap-2 font-bold tracking-widest">
          <Clock size={12} />
          {new Date(capture.timestamp).toLocaleString()}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-[9px] text-text-dim uppercase tracking-widest font-bold">Word Breakdown</p>
          <TokenDisplay 
            tokens={capture.words} 
            grammarMatches={capture.grammarMatches.map(m => ({ matchedText: m.text })) as any} 
            onWordClick={handleWordClick}
          />
        </div>

        <div className="pt-4 border-t border-border/10 space-y-1">
          <p className="text-[9px] text-text-dim uppercase tracking-widest font-bold">Full Transcript</p>
          <div className="text-lg font-bold text-white leading-snug">
            {capture.raw}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-[9px] text-text-dim uppercase tracking-widest font-bold">Translation</p>
          <div className="text-sm text-text-main italic border-l-2 border-accent/30 pl-3 leading-relaxed">
            {capture.translation}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
          Click word to Study <ExternalLink size={10} />
        </div>
      </div>
    </Card>
  );
};
