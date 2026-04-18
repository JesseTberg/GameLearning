import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CaptureCanvasProps {
  isCapturing: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isSelecting: boolean;
  isLoading: boolean;
  selectionRect: { left: number; top: number; width: number; height: number; } | null;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onStartCapture: () => void;
  zoom: number;
  pan: { x: number; y: number };
}

export const CaptureCanvas: React.FC<CaptureCanvasProps> = ({
  isCapturing,
  videoRef,
  containerRef,
  isSelecting,
  isLoading,
  selectionRect,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onStartCapture,
  zoom,
  pan
}) => {
  return (
    <div 
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      className={cn(
        "relative aspect-video bg-black rounded-xl border border-border overflow-hidden shadow-2xl flex items-center justify-center group mb-8",
        isCapturing ? "cursor-crosshair" : "cursor-default"
      )}
    >
      <video 
        ref={videoRef} 
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
        className={cn(
          "absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-75",
          !isCapturing && "hidden"
        )}
        autoPlay 
        muted 
        playsInline 
      />

      {!isCapturing && (
        <div className="text-panel flex flex-col items-center gap-4 opacity-50 text-center px-4">
          <div className="p-8 border-2 border-dashed border-panel rounded-full mb-2">
            <Camera size={64} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white mb-2">[ WAIT FOR CONNECTION ]</p>
            <button 
              onClick={onStartCapture}
              className="text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-4 py-2 rounded uppercase tracking-[0.2em] font-bold transition-all"
            >
              START READER
            </button>
          </div>
        </div>
      )}
      
      {selectionRect && (isSelecting || isLoading) && (
        <div 
          className={cn(
            "absolute border-2 border-accent bg-accent/10 pointer-events-none transition-opacity z-10",
            isLoading ? "opacity-50" : "opacity-100"
          )}
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-white w-5 h-5" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
