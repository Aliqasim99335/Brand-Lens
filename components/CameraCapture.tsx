
import React, { useRef, useEffect, useState } from 'react';

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

  useEffect(() => {
    async function setupCamera() {
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
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have given permission in your browser settings.");
      }
    }
    setupCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Maintain aspect ratio
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
          <div className="p-8 text-center text-white">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-medium mb-4">{error}</p>
            <button onClick={onClose} className="px-6 py-2 bg-white text-black rounded-full font-bold">Close</button>
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
            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-around bg-gradient-to-t from-black/60 to-transparent">
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="Cancel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <button 
                onClick={handleCapture}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 group"
                title="Capture Photo"
              >
                <div className="w-full h-full bg-white rounded-full group-active:scale-90 transition-transform"></div>
              </button>

              <div className="w-12"></div> {/* Layout spacer */}
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {!error && (
        <p className="text-white/60 mt-6 text-sm font-medium tracking-wide uppercase">
          Center the garment for identification
        </p>
      )}
    </div>
  );
};

export default CameraCapture;
