
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setupCamera = useCallback(async () => {
    setError(null);
    setIsReady(false);
    
    if (!window.isSecureContext) {
      setError("Camera access requires a secure connection (HTTPS). Please ensure your connection is secure.");
      return;
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      });
      
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission dismissed')) {
        setError("Camera permission was denied or dismissed. Please click 'Try Again' and allow access when the browser prompts you.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found on this device.");
      } else {
        setError(`Could not access camera: ${err.message || 'Unknown error'}. Please check your browser settings.`);
      }
    }
  }, []);

  useEffect(() => {
    setupCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && isReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-full h-full max-w-2xl md:h-[80vh] bg-gray-900 md:rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        {error ? (
          <div className="p-8 text-center text-white max-w-sm">
            <div className="w-16 h-16 bg-red-100/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2 text-white">Camera Access Error</p>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">{error}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={setupCamera} 
                className="w-full px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={onClose} 
                className="w-full px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              onLoadedMetadata={() => setIsReady(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* Loading Spinner for Camera Initializing */}
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[80%] aspect-square border-2 border-white/30 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-around bg-gradient-to-t from-black/80 to-transparent">
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                title="Cancel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <button 
                onClick={handleCapture}
                disabled={!isReady}
                className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 group transition-all ${!isReady ? 'opacity-50' : 'opacity-100'}`}
                title="Capture Photo"
              >
                <div className="w-full h-full bg-white rounded-full group-active:scale-90 transition-transform shadow-lg"></div>
              </button>

              <div className="w-12"></div>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {!error && (
        <p className="text-white/60 mt-6 text-sm font-medium tracking-wide uppercase flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          Align garment within the frame
        </p>
      )}
    </div>
  );
};

export default CameraCapture;
