import React from 'react';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';

interface TokenTooltipProps {
  token: { 
    word: string; 
    reading?: string; 
    translation: string; 
    partOfSpeech?: string; 
  };
  grammarMatch?: { pointName: string; explanation: string; };
}

export const TokenTooltip: React.FC<TokenTooltipProps> = ({ token, grammarMatch }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[100] min-w-[120px] bg-sidebar border border-accent/40 shadow-2xl rounded-lg p-3 pointer-events-none"
    >
      {token.reading && (
        <div className="text-[10px] font-bold text-accent-light uppercase mb-0.5 tracking-tighter">
          {token.reading}
        </div>
      )}
      <div className="text-sm font-bold text-white mb-1 decoration-accent-light underline underline-offset-2">{token.word}</div>
      <div className="text-[11px] text-text-dim italic leading-tight mb-1">
        {token.translation}
      </div>
      {token.partOfSpeech && (
        <div className="text-[8px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-1 rounded inline-block">
          {token.partOfSpeech}
        </div>
      )}
      {grammarMatch && (
        <div className="mt-2 pt-2 border-t border-border flex items-start gap-2">
          <Brain size={10} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[9px] text-amber-500 leading-tight">
            Matched: <span className="font-bold">{grammarMatch.pointName}</span>
          </div>
        </div>
      )}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-sidebar border-b border-r border-accent/40 rotate-45" />
    </motion.div>
  );
};
