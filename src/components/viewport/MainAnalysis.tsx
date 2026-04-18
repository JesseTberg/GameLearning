import React from 'react';
import { motion } from 'motion/react';
import { Languages } from 'lucide-react';
import { TokenDisplay } from './TokenDisplay';
import { cn } from '../../lib/utils';

interface MainAnalysisProps {
  currentAnalysis: any;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onWordClick: (word: any) => void;
}

export const MainAnalysis: React.FC<MainAnalysisProps> = ({ 
  currentAnalysis, 
  onWordClick 
}) => {
  const [showLocalTranslation, setShowLocalTranslation] = React.useState(false);

  if (!currentAnalysis) {
    return (
      <div className="h-48 border border-dashed border-border rounded-xl flex items-center justify-center text-text-dim/40 italic font-mono uppercase tracking-[0.3em]">
        Waiting for Capture
      </div>
    );
  }

  return (
    <div className="bg-panel rounded-xl p-8 border border-border shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Languages size={100} className="text-blue-500" />
      </div>

      <header className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <h3 className="text-[0.65rem] font-bold text-text-dim uppercase tracking-widest leading-none">Capture Analysis</h3>
          <Languages size={14} className="text-blue-500" />
        </div>
        
        <button 
          onClick={() => setShowLocalTranslation(!showLocalTranslation)}
          className={cn(
            "text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded transition-colors flex items-center gap-2 border border-blue-500/20",
            showLocalTranslation ? "bg-blue-600 text-white" : "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
          )}
        >
          {showLocalTranslation ? "Hide Translation" : "Show Translation"}
        </button>
      </header>

      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Word Breakdown</p>
          <TokenDisplay 
            tokens={currentAnalysis.words || []} 
            grammarMatches={currentAnalysis.grammarMatches || []} 
            onWordClick={onWordClick}
          />
        </div>

        <div className="pt-6 border-t border-border/30 space-y-3">
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Full Transcript</p>
          <div className="text-xl font-bold text-white leading-relaxed tracking-tight bg-white/5 p-4 rounded-lg border border-white/5">
            {currentAnalysis.extractedText}
          </div>
        </div>
        
        {showLocalTranslation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-text-main/80 bg-bg/50 p-4 rounded-lg border border-border/50"
          >
            <p className="text-[10px] text-text-dim uppercase tracking-widest mb-2 font-bold">Full Translation</p>
            <p className="italic leading-relaxed font-medium">"{currentAnalysis.translation}"</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
