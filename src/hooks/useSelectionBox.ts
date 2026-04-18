import React, { useState, useCallback, useMemo } from 'react';

export function useSelectionBox(containerRef: React.RefObject<HTMLDivElement | null>, isCapturing: boolean) {
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number, y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isCapturing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
    setIsSelecting(true);
  }, [isCapturing, containerRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelectionEnd({ x, y });
  }, [isSelecting, containerRef]);

  const handleMouseUp = useCallback((onComplete: () => void) => {
    if (isSelecting) {
      setIsSelecting(false);
      onComplete();
    }
  }, [isSelecting]);

  const selectionRect = useMemo(() => {
    if (!selectionStart || !selectionEnd) return null;
    return {
      left: Math.min(selectionStart.x, selectionEnd.x),
      top: Math.min(selectionStart.y, selectionEnd.y),
      width: Math.abs(selectionEnd.x - selectionStart.x),
      height: Math.abs(selectionEnd.y - selectionStart.y)
    };
  }, [selectionStart, selectionEnd]);

  const resetSelection = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  return {
    selectionStart,
    selectionEnd,
    isSelecting,
    selectionRect,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetSelection
  };
}
