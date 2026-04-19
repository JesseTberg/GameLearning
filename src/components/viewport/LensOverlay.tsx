import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, Copy, Plus, Languages, Type, LayoutTemplate, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { LensResult } from '../../types';
import { cn } from '../../lib/utils';

interface LensOverlayProps {
  result: LensResult;
  onClose: () => void;
  onAddFlashcard: (text: string, translation: string) => void;
  onBreakdown?: (text: string) => void;
  isLoading?: boolean;
}

export const LensOverlay: React.FC<LensOverlayProps> = ({ 
  result, 
  onClose, 
  onAddFlashcard,
  onBreakdown,
  isLoading 
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [inlineMode, setInlineMode] = useState(false);

  return (
    <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col overflow-hidden rounded-xl border border-blue-900/40 shadow-2xl">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#121212] z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <Languages size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Lens Intelligence</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <button 
            onClick={() => setInlineMode(!inlineMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
              inlineMode ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 text-text-dim hover:bg-white/5"
            )}
          >
            <LayoutTemplate size={12} />
            {inlineMode ? "Overlay Active" : "Annotated List"}
          </button>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-text-dim hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Interactive Image */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full aspect-video">
            <img 
              src={`data:image/png;base64,${result.screenshot}`} 
              className="w-full h-full object-contain rounded shadow-lg opacity-80"
              alt="Lens Capture"
            />

            {/* Markers / Overlays */}
            {result.blocks.map((block, idx) => {
              const [ymin, xmin, ymax, xmax] = block.boundingBox;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={idx}
                  className="absolute cursor-pointer transition-all z-10"
                  style={{
                    top: `${ymin / 10}%`,
                    left: `${xmin / 10}%`,
                    width: `${(xmax - xmin) / 10}%`,
                    height: `${(ymax - ymin) / 10}%`,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div className={cn(
                    "w-full h-full border-2 transition-all flex items-center justify-center",
                    isHovered 
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                      : "border-blue-500/20 bg-transparent group-hover:border-blue-500/40"
                  )}>
                    {/* Inline Translation Toggle */}
                    {inlineMode && (
                      <div className="text-white font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [font-size:clamp(8px,1.2cqi,14px)] text-center p-1">
                        {block.translatedText}
                      </div>
                    )}
                    
                    {/* Index Badge (Always visible in list mode, or on hover) */}
                    {(!inlineMode || isHovered) && (
                      <div className={cn(
                        "absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg transition-all",
                        isHovered ? "bg-blue-600 text-white scale-110" : "bg-panel text-blue-400 border border-blue-500/30"
                      )}>
                        {idx + 1}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <RefreshCw className="animate-spin text-blue-500" size={48} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-bold text-white uppercase tracking-[0.3em] animate-pulse">Scanning Visual Scene</p>
                  <p className="text-[10px] text-blue-400/60 font-mono italic">Extracting spatial text semantic blocks...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Annotated List */}
        <div className="w-96 border-l border-white/5 bg-[#0e0e0e] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type size={14} className="text-text-dim" />
              <h4 className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">Translations</h4>
            </div>
            <span className="text-[10px] font-mono text-blue-500/60 font-bold">{result.blocks.length} BLOCKS FOUND</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {result.blocks.map((block, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={cn(
                  "p-4 rounded-lg border transition-all relative group/card",
                  hoveredIdx === idx 
                    ? "bg-blue-600/10 border-blue-500/40 shadow-lg translate-x-1" 
                    : "bg-panel/40 border-border/10 hover:border-white/10"
                )}
              >
                {/* Index Indicator */}
                <div className="absolute top-4 left-[-10px] w-5 h-5 bg-[#0e0e0e] border border-border/20 rounded-full flex items-center justify-center text-[10px] font-bold text-text-dim group-hover/card:text-blue-400 group-hover/card:border-blue-500/40">
                  {idx + 1}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-text-dim uppercase tracking-tighter opacity-50">Detected</p>
                    <p className="text-xs font-medium text-white/90 leading-snug">{block.originalText}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-blue-500 uppercase tracking-tighter">Translation</p>
                    <p className="text-sm font-bold text-blue-400 leading-snug italic">"{block.translatedText}"</p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onBreakdown?.(block.originalText)}
                      className={cn(
                        "h-7 px-3 text-[9px] gap-2 rounded transition-all",
                        hoveredIdx === idx ? "bg-amber-600 text-white" : "bg-white/5 text-amber-500/80"
                      )}
                    >
                      <Sparkles size={10} /> Breakdown
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onAddFlashcard(block.originalText, block.translatedText)}
                      className={cn(
                        "h-7 px-3 text-[9px] gap-2 rounded transition-all",
                        hoveredIdx === idx ? "bg-blue-600 text-white" : "bg-white/5"
                      )}
                    >
                      <Plus size={10} /> Flashcard
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {result.blocks.length === 0 && !isLoading && (
              <div className="h-40 flex flex-col items-center justify-center text-text-dim/40 italic text-xs text-center p-8 gap-4">
                <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center opacity-30">
                  <X size={24} />
                </div>
                <p>No text blocks identified in this scene.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="px-6 py-3 border-t border-white/5 bg-[#0e0e0e] text-[9px] font-bold text-text-dim uppercase tracking-[0.2em] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Hover Highlight
          </span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-border" /> Instant Save
          </span>
        </div>
        <p className="font-mono opacity-50 text-[8px]">GEMINI VISION ENGINE LENS v1.0.4</p>
      </footer>
    </div>
  );
};
