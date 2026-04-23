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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!tokens || tokens.length === 0) return null;

  return (
    <div className="text-3xl font-bold text-white leading-relaxed flex flex-wrap items-baseline gap-y-2">
      {tokens.map((token: any, i: number) => {
        // Handle explicit newlines from AI
        if (token.word.includes('\n')) {
          return (
            <React.Fragment key={i}>
              <div className="basis-full h-0" />
              {token.word.includes('\n\n') && <div className="basis-full h-4" />}
            </React.Fragment>
          );
        }

        const isWhitespace = /^\s+$/.test(token.word);
        const isPunctuation = /^[.,!?:; "'「」？！…\(\)（）]+$/.test(token.word);
        
        if (isWhitespace) {
          return <span key={i} className="whitespace-pre">{token.word}</span>;
        }

        const grammarMatch = grammarMatches?.find((m: any) => m.matchedText.includes(token.word));
        
        return (
          <div 
            key={i} 
            className="relative group/token h-fit mx-[1px]"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onWordClick(token)}
          >
            <span className={cn(
              "cursor-pointer transition-all decoration-2 underline-offset-8 px-0.5 rounded hover:bg-white/5",
              grammarMatch 
                ? "text-token-grammar underline decoration-token-grammar/50" 
                : token.isFunctional || isPunctuation
                  ? "text-token-functional/80 font-medium hover:text-white" 
                  : "text-token-standard hover:text-token-hover"
            )}>
              {token.word}
            </span>
            
            <AnimatePresence>
              {hoveredIndex === i && (
                <TokenTooltip token={token} grammarMatch={grammarMatch} />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
