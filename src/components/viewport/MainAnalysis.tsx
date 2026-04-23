import React from 'react';
import { motion } from 'motion/react';
import { Languages, Plus, Sparkles, Loader2 } from 'lucide-react';
import { TokenDisplay } from './TokenDisplay';
import { cn } from '../../lib/utils';

interface MainAnalysisProps {
  currentAnalysis: any;
  lensResult?: any;
  isLoading?: boolean;
  isAnalyzing?: boolean;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onWordClick: (word: any) => void;
  onBlockClick?: (text: string) => void;
}

export const MainAnalysis: React.FC<MainAnalysisProps> = ({ 
  currentAnalysis, 
  lensResult,
  isLoading,
  isAnalyzing,
  showTranslation,
  onToggleTranslation,
  onWordClick,
  onBlockClick
}) => {
  if (!currentAnalysis && !lensResult) {
    return (
      <div className="h-48 border border-dashed border-border rounded-xl flex items-center justify-center text-text-dim/40 italic font-mono uppercase tracking-[0.3em]">
        Waiting for Capture
      </div>
    );
  }

  // Synthesis tokens from lens blocks if currentAnalysis is missing but lens is there
  const lensTokens = lensResult?.blocks?.map((b: any) => ({
    word: b.originalText,
    translation: b.translatedText,
    isLensBlock: true
  })) || [];

  return (
    <div className="bg-panel rounded-xl p-8 border border-border shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Languages size={100} className="text-blue-500" />
      </div>

      <header className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <h3 className="text-[0.65rem] font-bold text-text-dim uppercase tracking-widest leading-none">
            {lensResult && !currentAnalysis ? "Lens Batch Analysis" : "Capture Analysis"}
          </h3>
          <Languages size={14} className="text-blue-500" />
        </div>
        
        {(currentAnalysis?.translation || lensResult) && (
          <button 
            onClick={onToggleTranslation}
            className={cn(
              "text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded transition-colors flex items-center gap-2 border border-blue-500/20",
              showTranslation ? "bg-blue-600 text-white" : "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
            )}
          >
            {showTranslation ? "Hide Detailed Info" : "Show Detailed Info"}
          </button>
        )}
      </header>

      <div className="space-y-8">
        {/* If we have standard analysis */}
        {(currentAnalysis || (isLoading && !lensResult)) && (
          <>
            <div className="space-y-4 relative">
              <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Word Breakdown</p>
              
              {isLoading ? (
                <div className="h-24 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 animate-pulse gap-3">
                  <Loader2 className="animate-spin text-blue-500" size={16} />
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Analyzing linguistic structure...</span>
                </div>
              ) : (
                <TokenDisplay 
                  tokens={currentAnalysis.words || []} 
                  grammarMatches={currentAnalysis.grammarMatches || []} 
                  onWordClick={onWordClick}
                />
              )}
            </div>

            {!isLoading && (
              <>
                {isAnalyzing ? (
                  <div className="pt-6 border-t border-border/30 animate-pulse">
                     <div className="flex items-center gap-3 mb-4">
                        <Sparkles size={14} className="text-amber-500 animate-spin" />
                        <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Linguistic Analysis in progress...</p>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-amber-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="pt-6 border-t border-border/30 space-y-3">
                      <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Full Transcript</p>
                      <div className="text-xl font-bold text-white leading-relaxed tracking-tight bg-white/5 p-4 rounded-lg border border-white/5">
                        {currentAnalysis.extractedText}
                      </div>
                    </div>
                    
                    {showTranslation && currentAnalysis.translation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-text-main/80 bg-bg/50 p-4 rounded-lg border border-border/50"
                      >
                        <p className="text-[10px] text-text-dim uppercase tracking-widest mb-2 font-bold">Full Translation</p>
                        <p className="italic leading-relaxed font-medium">"{currentAnalysis.translation}"</p>
                      </motion.div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* If we have lens results and no standard analysis yet or explicitly requested */}
        {lensTokens.length > 0 && (
          <div className={cn("space-y-6", currentAnalysis && "mt-8 pt-8 border-t-2 border-dashed border-border/20")}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Visual Blocks Identified</p>
              <span className="text-[9px] font-mono text-blue-400/50">{lensTokens.length} blocks detected</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lensTokens.map((token: any, i: number) => {
                // If it's a multi-word block with spaces, we can split it for "picking specific words"
                const hasSpaces = token.word.includes(' ');
                const words = hasSpaces ? token.word.split(/\s+/) : [token.word];
                
                return (
                  <div 
                    key={i} 
                    className="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-blue-500/30 transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex flex-wrap gap-2">
                      {words.map((w: string, wi: number) => (
                        <button
                          key={wi}
                          onClick={() => onWordClick({ ...token, word: w, originalWord: token.word })}
                          className="text-lg font-bold text-white hover:text-blue-400 hover:scale-105 transition-all bg-white/5 px-2 py-0.5 rounded"
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <p className="text-xs text-text-dim italic font-medium truncate pr-4">"{token.translation}"</p>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onBlockClick?.(token.word)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-blue-600/10 text-blue-400 rounded text-[9px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all"
                          title="Detailed Word Breakdown"
                        >
                          <Sparkles size={10} /> Breakdown
                        </button>
                        <button 
                          onClick={() => onWordClick(token)}
                          className="p-1.5 bg-blue-600/10 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-all"
                          title="Create Flashcard for Full Block"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
