import React from 'react';
import { Camera, Crosshair, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ViewportHeaderProps {
  isCapturing: boolean;
  startCapture: () => void;
  stopCapture: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ViewportHeader: React.FC<ViewportHeaderProps> = ({ 
  isCapturing, 
  startCapture, 
  stopCapture,
  zoom,
  onZoomChange
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-6">
      <div className="flex flex-wrap items-center gap-6 text-[0.8rem] text-text-dim font-mono">
        <span className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", isCapturing ? "bg-green-500" : "bg-gray-500")} />
          {isCapturing ? "CONNECTED" : "READY"}
        </span>
        <div className="h-4 w-[1px] bg-border hidden sm:block" />
        <span className="flex items-center gap-1 uppercase tracking-tighter">
          <Crosshair size={12} />
          SELECT AREA TO TRANSLATE
        </span>

        {isCapturing && (
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1 rounded-full border border-white/10 ml-0 md:ml-4">
            <Search size={12} className="text-blue-500" />
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.1" 
              value={zoom} 
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[10px] w-10 text-blue-400 font-bold">{(zoom * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
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
