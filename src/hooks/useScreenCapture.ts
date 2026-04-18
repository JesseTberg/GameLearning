import { useState, useRef, useCallback } from 'react';

export function useScreenCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCapture = useCallback(async () => {
    setCaptureError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCapturing(true);

      stream.getVideoTracks()[0].onended = () => {
        setIsCapturing(false);
        streamRef.current = null;
      };
    } catch (err: any) {
      console.error("Error starting screen capture:", err);
      if (err.name === 'NotAllowedError') {
        setCaptureError("Browser blocked capture. Try opening the app in a new tab for full permissions.");
      } else {
        setCaptureError("Capture failed. Ensure your browser supports Screen Capture API.");
      }
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  return {
    isCapturing,
    captureError,
    startCapture,
    stopCapture,
    videoRef,
    streamRef,
    setCaptureError
  };
}
