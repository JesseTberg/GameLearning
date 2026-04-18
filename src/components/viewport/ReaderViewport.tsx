import React, { useRef, useEffect } from 'react';
import { ViewportHeader } from './ViewportHeader';
import { CaptureCanvas } from './CaptureCanvas';
import { MainAnalysis } from './MainAnalysis';
import { QuickActions } from './QuickActions';
import { SectionHeader } from '../ui/SectionHeader';
import { useScreenCapture } from '../../hooks/useScreenCapture';
import { useSelectionBox } from '../../hooks/useSelectionBox';
import { useOCR } from '../../hooks/useOCR';
import { Flashcard, GrammarPoint, CapturedText, Deck } from '../../types';

interface ReaderViewportProps {
  grammarPoints: GrammarPoint[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  setCapturedTexts: React.Dispatch<React.SetStateAction<CapturedText[]>>;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  capture: ReturnType<typeof useScreenCapture>;
  prepCard: Partial<Flashcard>;
  setPrepCard: React.Dispatch<React.SetStateAction<Partial<Flashcard>>>;
  decks: Deck[];
}

export const ReaderViewport: React.FC<ReaderViewportProps> = ({
  grammarPoints,
  setFlashcards,
  setCapturedTexts,
  showTranslation,
  onToggleTranslation,
  capture,
  prepCard,
  setPrepCard,
  decks
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [lastMousePos, setLastMousePos] = React.useState({ x: 0, y: 0 });
  
  const {
    isCapturing,
    captureError,
    startCapture,
    stopCapture,
    videoRef,
    streamRef
  } = capture;

  const {
    selectionRect,
    isSelecting,
    handleMouseDown: originalMouseDown,
    handleMouseMove: originalMouseMove,
    handleMouseUp: originalMouseUp,
    resetSelection
  } = useSelectionBox(containerRef, isCapturing);

  const {
    isLoading,
    currentAnalysis,
    performOCR
  } = useOCR(grammarPoints, setCapturedTexts);

  // Persistence effect
  useEffect(() => {
    if (isCapturing && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isCapturing, streamRef, videoRef]);

  // Handle Right Click Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    originalMouseDown(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    originalMouseMove(e);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    originalMouseUp(() => onAnalyze());
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isCapturing || !containerRef.current) return;
    
    // Zoom in/out factor
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = Math.min(Math.max(zoom * zoomFactor, 1), 5);
    
    if (nextZoom === zoom) return;

    // Calculate mouse position relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Adjust pan to zoom towards mouse position
    // Formula: newPan = mousePos - (mousePos - oldPan) * (newZoom / oldZoom)
    const nextPan = {
      x: mouseX - (mouseX - pan.x) * (nextZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (nextZoom / zoom)
    };

    setZoom(nextZoom);
    setPan(nextPan);
  };

  const onAnalyze = async () => {
    if (!selectionRect || !videoRef.current || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Robust mapping using boundingClientRects
    // This correctly handles any CSS transforms (scale, translate) applied to the video element
    const vidRect = video.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Selection coordinates in screen space
    const selScreenLeft = containerRect.left + selectionRect.left;
    const selScreenTop = containerRect.top + selectionRect.top;
    
    // Coordinates relative to the video content's visual top-left
    const relX = selScreenLeft - vidRect.left;
    const relY = selScreenTop - vidRect.top;
    
    // Proportional scaling to map visual pixels to video source pixels
    const scaleX = video.videoWidth / vidRect.width;
    const scaleY = video.videoHeight / vidRect.height;

    canvas.width = selectionRect.width * scaleX;
    canvas.height = selectionRect.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      video,
      relX * scaleX,
      relY * scaleY,
      selectionRect.width * scaleX,
      selectionRect.height * scaleY,
      0, 0, canvas.width, canvas.height
    );

    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    try {
      await performOCR(base64Image);
      resetSelection();
    } catch (err) {
      // Error handled in hook
    }
  };

  const onTransferWord = (word: any) => {
    setPrepCard({
      front: word.word || '',
      reading: word.reading || '',
      back: word.translation || '',
      context: currentAnalysis?.extractedText || ''
    });
  };

  return (
    <div className="space-y-6" onContextMenu={(e) => e.preventDefault()}>
      <SectionHeader title="Reader View" subtitle="Capture and translate text from any window" />

      <ViewportHeader 
        isCapturing={isCapturing} 
        startCapture={startCapture} 
        stopCapture={stopCapture} 
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {captureError && (
        <div className="bg-red-900/20 border border-red-900/40 text-red-400 p-4 rounded-lg text-sm mb-6 flex items-start gap-4">
          <div className="mt-1">⚠️</div>
          <div>
            <p className="font-bold uppercase tracking-widest text-[10px] mb-1 text-red-300">Connection Error</p>
            {captureError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <CaptureCanvas 
            isCapturing={isCapturing}
            videoRef={videoRef}
            containerRef={containerRef}
            isSelecting={isSelecting}
            isLoading={isLoading}
            selectionRect={selectionRect}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onStartCapture={startCapture}
            zoom={zoom}
            pan={pan}
          />
          
          <MainAnalysis 
            currentAnalysis={currentAnalysis} 
            showTranslation={showTranslation} 
            onToggleTranslation={onToggleTranslation}
            onWordClick={onTransferWord}
          />
        </div>

        <QuickActions 
          prepCard={prepCard}
          setPrepCard={setPrepCard}
          onAddFlashcard={(card) => {
            setFlashcards(prev => [card, ...prev]);
            setPrepCard({ front: '', reading: '', back: '', context: '' });
          }}
          decks={decks}
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
