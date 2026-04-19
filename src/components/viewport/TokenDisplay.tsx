import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { TokenTooltip } from './TokenTooltip';
import { cn } from '../../lib/utils';

interface TokenDisplayProps {
  tokens: any[];
  grammarMatches: any[];
  onWordClick: (word: any) => void;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ tokens, grammarMatches, onWordClick }) => {
  const [hoveredWord, setHoveredWord] = useState<any>(null);

  if (!tokens || tokens.length === 0) return null;

  return (
    <div className="text-3xl font-bold text-white leading-relaxed flex flex-wrap gap-x-3 gap-y-2">
      {tokens.map((token: any, i: number) => {
        const grammarMatch = grammarMatches?.find((m: any) => m.matchedText.includes(token.word));
        return (
          <div 
            key={i} 
            className="relative group/token h-fit"
            onMouseEnter={() => setHoveredWord(token)}
            onMouseLeave={() => setHoveredWord(null)}
            onClick={() => onWordClick(token)}
          >
            <span className={cn(
              "cursor-pointer transition-all decoration-2 underline-offset-8",
              grammarMatch 
                ? "text-token-grammar underline decoration-token-grammar/50" 
                : token.isFunctional 
                  ? "text-token-functional/80 font-medium hover:text-white" 
                  : "text-token-standard hover:text-token-hover"
            )}>
              {token.word}
            </span>
            
            <AnimatePresence>
              {hoveredWord === token && (
                <TokenTooltip token={token} grammarMatch={grammarMatch} />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
