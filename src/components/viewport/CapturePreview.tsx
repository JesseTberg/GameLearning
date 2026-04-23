import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

interface CapturePreviewProps {
  image: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CapturePreview: React.FC<CapturePreviewProps> = ({
  image,
  onConfirm,
  onCancel,
  isLoading
}) => {
  return (
    <AnimatePresence>
      {image && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onCancel}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            <Panel variant="glass" className="overflow-hidden flex flex-col border-white/10">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <RefreshCw size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">Confirm Capture</h3>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">Verify the text is clear before analyzing</p>
                  </div>
                </div>
                <button 
                  onClick={onCancel}
                  className="p-2 text-text-dim hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-black/40 min-h-[300px] flex items-center justify-center p-8">
                <div className="relative group">
                  <img 
                    src={`data:image/jpeg;base64,${image}`} 
                    alt="Capture Preview" 
                    className="max-w-full h-auto rounded shadow-2xl border border-white/10"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded" />
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 max-w-md">
                   <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-2">
                     <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                     Rate Limit Protection
                   </p>
                   <p className="text-[10px] text-amber-200/60 mt-1 uppercase">
                     Analyze only if text is legible. Partial or blurry captures waste tokens.
                   </p>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="secondary" 
                    onClick={onCancel}
                    className="px-8 uppercase text-[11px] font-bold tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="px-8 flex gap-2 items-center uppercase text-[11px] font-bold tracking-widest"
                  >
                    {isLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Analyze
                  </Button>
                </div>
              </div>
            </Panel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
