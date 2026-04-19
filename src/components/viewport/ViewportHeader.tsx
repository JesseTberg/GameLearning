import React from 'react';
import { Camera, Crosshair, Search, Zap, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ViewportHeaderProps {
  isCapturing: boolean;
  startCapture: () => void;
  stopCapture: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetZoom: () => void;
  onTriggerLens?: () => void;
  isLensLoading?: boolean;
  isOCRLoading?: boolean;
}

export const ViewportHeader: React.FC<ViewportHeaderProps> = ({ 
  isCapturing, 
  startCapture, 
  stopCapture,
  zoom,
  onZoomChange,
  onResetZoom,
  onTriggerLens,
  isLensLoading,
  isOCRLoading
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-6 bg-panel/20 p-4 rounded-xl border border-white/5">
      <div className="flex flex-wrap items-center gap-6 text-[0.8rem] text-text-dim font-mono">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", isCapturing ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-500")} />
            {isCapturing ? "CONNECTED" : "READY"}
          </span>
          <div className="h-4 w-[1px] bg-border hidden sm:block" />
          
          {isOCRLoading && (
            <span className="flex items-center gap-2 text-blue-400 animate-pulse">
              <RefreshCw size={12} className="animate-spin" />
              ANALYZING SELECTION...
            </span>
          )}
          
          {!isOCRLoading && (
            <span className="flex items-center gap-1 uppercase tracking-tighter opacity-60">
              <Crosshair size={12} />
              SELECT AREA TO TRANSLATE
            </span>
          )}
        </div>

        {isCapturing && (
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 ml-0 md:ml-4 group">
            <Search size={12} className="text-blue-500" />
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="0.1" 
              value={zoom} 
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[10px] w-10 text-blue-400 font-bold">{(zoom * 100).toFixed(0)}%</span>
            <button 
              onClick={onResetZoom}
              className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[8px] font-bold uppercase transition-all opacity-0 group-hover:opacity-100"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isCapturing && (
          <Button 
            variant="accent-ghost" 
            size="sm" 
            onClick={onTriggerLens}
            isLoading={isLensLoading}
            className="gap-2 border-blue-500/30"
          >
            <Zap size={14} className="text-blue-400" />
            Lens Translate
          </Button>
        )}
        {!isCapturing ? (
          <Button onClick={startCapture} className="flex items-center gap-2 whitespace-nowrap">
            <Camera size={16} />
            Start Reader
          </Button>
        ) : (
          <Button onClick={stopCapture} variant="danger" size="sm" className="whitespace-nowrap">
            Stop Capture
          </Button>
        )}
      </div>
    </div>
  );
};
