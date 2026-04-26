import React, { useRef, useEffect } from 'react';
import { ViewportHeader } from './ViewportHeader';
import { CaptureCanvas } from './CaptureCanvas';
import { MainAnalysis } from './MainAnalysis';
import { QuickActions } from './QuickActions';
import { LensOverlay } from './LensOverlay';
import { CapturePreview } from './CapturePreview';
import { SectionHeader } from '../ui/SectionHeader';
import { useScreenCapture } from '../../hooks/useScreenCapture';
import { useSelectionBox } from '../../hooks/useSelectionBox';
import { useOCR } from '../../hooks/useOCR';
import { Flashcard, GrammarPoint, CapturedText, Deck } from '../../types';
import { cn } from '../../lib/utils';

interface ReaderViewportProps {
  grammarPoints: GrammarPoint[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  setCapturedTexts: React.Dispatch<React.SetStateAction<CapturedText[]>>;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onAddGrammar?: (point: { name: string; description: string; pattern: string }) => void;
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
  onAddGrammar,
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
  const [isLensVisible, setIsLensVisible] = React.useState(false);
  const [isPrepVisible, setIsPrepVisible] = React.useState(true);
  const [pendingCapture, setPendingCapture] = React.useState<{ image: string, type: 'ocr' | 'lens' } | null>(null);
  
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
    lensResult,
    setLensResult,
    performOCR,
    performLens,
    performTextAnalysis,
    setCurrentAnalysis,
    loadDemoData,
    error: analysisError,
    setError: setAnalysisError
  } = useOCR(grammarPoints, setCapturedTexts);

  const handleLensBlockClick = (text: string) => {
    performTextAnalysis(text);
  };

  // Persistence effect
  useEffect(() => {
    if (isCapturing && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isCapturing, streamRef, videoRef]);

  const handleTriggerLens = async () => {
    if (!videoRef.current || !canvasRef.current || !containerRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Choose capture area: zoomed viewport OR full video
    let sourceRect;
    const vidRect = video.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const scaleX = video.videoWidth / vidRect.width;
    const scaleY = video.videoHeight / vidRect.height;

    if (zoom > 1.05) {
      // Logic from onAnalyze: map container boundaries to video source
      const relX = containerRect.left - vidRect.left;
      const relY = containerRect.top - vidRect.top;
      
      sourceRect = {
        sx: Math.max(0, relX * scaleX),
        sy: Math.max(0, relY * scaleY),
        sw: Math.min(video.videoWidth, containerRect.width * scaleX),
        sh: Math.min(video.videoHeight, containerRect.height * scaleY)
      };
    } else {
      sourceRect = {
        sx: 0,
        sy: 0,
        sw: video.videoWidth,
        sh: video.videoHeight
      };
    }
    
    if (sourceRect.sw === 0 || sourceRect.sh === 0) return;

    canvas.width = sourceRect.sw;
    canvas.height = sourceRect.sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(
      video, 
      sourceRect.sx, sourceRect.sy, sourceRect.sw, sourceRect.sh,
      0, 0, canvas.width, canvas.height
    );
    // Switched to jpeg at 0.8 quality for Vercel compatibility
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    setPendingCapture({ image: base64Image, type: 'lens' });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle Right Click Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLensVisible) return;
    if (e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    originalMouseDown(e);
  };

  const clampPan = (nextX: number, nextY: number, nextZoom: number) => {
    if (!containerRef.current) return { x: nextX, y: nextY };
    const rect = containerRef.current.getBoundingClientRect();
    
    // Limits: pan cannot go above 0 (top/left) 
    // and cannot go below container - zoomed_size (bottom/right)
    const minX = rect.width * (1 - nextZoom);
    const minY = rect.height * (1 - nextZoom);
    
    return {
      x: Math.min(0, Math.max(nextX, minX)),
      y: Math.min(0, Math.max(nextY, minY))
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      
      setPan(prev => clampPan(prev.x + dx, prev.y + dy, zoom));
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
    if (!isCapturing || !containerRef.current || isLensVisible) return;
    
    // Zoom in/out factor
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = Math.min(Math.max(zoom * zoomFactor, 1), 5);
    
    if (nextZoom === zoom) return;

    // Calculate mouse position relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Adjust pan to zoom towards mouse position
    const rawPanX = mouseX - (mouseX - pan.x) * (nextZoom / zoom);
    const rawPanY = mouseY - (mouseY - pan.y) * (nextZoom / zoom);

    const nextPan = clampPan(rawPanX, rawPanY, nextZoom);

    setZoom(nextZoom);
    setPan(nextPan);
  };

  const onAnalyze = async () => {
    if (!selectionRect || !videoRef.current || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    const vidRect = video.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const selScreenLeft = containerRect.left + selectionRect.left;
    const selScreenTop = containerRect.top + selectionRect.top;
    
    const relX = selScreenLeft - vidRect.left;
    const relY = selScreenTop - vidRect.top;
    
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

    // Ensure minimum dimensions to avoid API errors
    if (canvas.width < 10 || canvas.height < 10) return;

    // Switched to jpeg at 0.8 quality to keep payload small for Vercel (4.5MB limit)
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    setPendingCapture({ image: base64Image, type: 'ocr' });
  };

  const handleConfirmCapture = async () => {
    if (!pendingCapture) return;
    
    const { image, type } = pendingCapture;
    
    try {
      if (type === 'lens') {
        setIsLensVisible(true);
        setPendingCapture(null);
        await performLens(image);
      } else {
        setPendingCapture(null);
        await performOCR(image);
        resetSelection();
      }
    } catch (err) {
      setIsLensVisible(false);
    }
  };

  const onTransferWord = (word: any) => {
    setPrepCard({
      front: word.word || '',
      reading: word.reading || '',
      back: word.translation || '',
      context: word.isLensBlock 
        ? (word.originalWord ? `Source: ${word.originalWord}` : 'Visual Capture')
        : (currentAnalysis?.extractedText || '')
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
        onResetZoom={handleResetZoom}
        onTriggerLens={handleTriggerLens}
        onLoadDemo={loadDemoData}
        isLensLoading={isLensVisible && isLoading}
        isOCRLoading={!isLensVisible && isLoading}
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

      {analysisError && (
        <div className="bg-amber-900/20 border border-amber-900/40 text-amber-400 p-4 rounded-lg text-sm mb-6 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="mt-1">⚠️</div>
            <div>
              <p className="font-bold uppercase tracking-widest text-[10px] mb-1 text-amber-300">Analysis Error</p>
              {analysisError}
            </div>
          </div>
          <button 
            onClick={() => setAnalysisError(null)}
            className="text-amber-400/60 hover:text-amber-400 transition-colors self-start"
          >
            Close
          </button>
        </div>
      )}

      <div className={cn(
        "grid gap-8 transition-all duration-500",
        isPrepVisible ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"
      )}>
        <div className={isPrepVisible ? "lg:col-span-3" : "w-full"}>
          <div className="flex justify-end mb-2">
            <button 
              onClick={() => setIsPrepVisible(!isPrepVisible)}
              className="text-[10px] font-bold text-text-dim hover:text-white uppercase tracking-widest px-3 py-1 bg-white/5 rounded border border-white/5"
            >
              {isPrepVisible ? "Hide Prep Area" : "Show Prep Area"}
            </button>
          </div>

          <CaptureCanvas 
            isCapturing={isCapturing}
            isLensVisible={isLensVisible}
            videoRef={videoRef}
            containerRef={containerRef}
            isSelecting={isSelecting}
            isLoading={isLoading && !isLensVisible}
            selectionRect={selectionRect}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onStartCapture={startCapture}
            zoom={zoom}
            pan={pan}
          >
            {isLensVisible && lensResult && (
              <LensOverlay 
                result={lensResult} 
                onClose={() => setIsLensVisible(false)} 
                isLoading={isLoading}
                onBreakdown={handleLensBlockClick}
                onAddFlashcard={(text, translation) => {
                   setPrepCard({
                     front: text,
                     back: translation,
                     context: 'Lens mode capture'
                   });
                }}
              />
            )}
          </CaptureCanvas>
          
          <MainAnalysis 
            currentAnalysis={currentAnalysis} 
            lensResult={lensResult}
            isLoading={isLoading}
            showTranslation={showTranslation} 
            onToggleTranslation={onToggleTranslation}
            onWordClick={onTransferWord}
            onBlockClick={handleLensBlockClick}
            onAddGrammar={onAddGrammar}
          />
        </div>

        {isPrepVisible && (
          <div className="lg:col-span-1">
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
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <CapturePreview 
        image={pendingCapture?.image || null}
        isLoading={isLoading}
        onConfirm={handleConfirmCapture}
        onCancel={() => setPendingCapture(null)}
      />
    </div>
  );
};
