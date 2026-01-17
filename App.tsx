
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, BrandAnalysis, AnalysisHistoryItem } from './types';
import { analyzeClothingImage } from './services/geminiService';
import AnalysisResult from './components/AnalysisResult';
import HistoryList from './components/HistoryList';
import CameraCapture from './components/CameraCapture';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState<BrandAnalysis | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('brandlens_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = useCallback((imageUrl: string, result: BrandAnalysis) => {
    const newItem: AnalysisHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      imageUrl,
      result
    };
    
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 10);
      localStorage.setItem('brandlens_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const processImage = async (input: File | string) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    setCurrentResult(null);
    setIsCameraOpen(false);

    const performAnalysis = async (dataUrl: string) => {
      setCurrentImageUrl(dataUrl);
      try {
        // Extract base64 content
        const base64 = dataUrl.split(',')[1];
        const result = await analyzeClothingImage(base64);
        
        setCurrentResult(result);
        setAppState(AppState.SUCCESS);
        saveToHistory(dataUrl, result);
      } catch (error: any) {
        console.error("Analysis failed:", error);
        setErrorMessage(error.message || "Failed to analyze the image. Please try again.");
        setAppState(AppState.ERROR);
      }
    };

    if (typeof input === 'string') {
      // Direct data URL from camera
      await performAnalysis(input);
    } else {
      // File from upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        await performAnalysis(imageUrl);
      };
      reader.readAsDataURL(input);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processImage(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processImage(file);
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setCurrentResult(null);
    setCurrentImageUrl(null);
    setErrorMessage(null);
  };

  const selectHistoryItem = (item: AnalysisHistoryItem) => {
    setCurrentImageUrl(item.imageUrl);
    setCurrentResult(item.result);
    setAppState(AppState.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Camera Modal */}
      {isCameraOpen && (
        <CameraCapture 
          onCapture={(base64) => processImage(base64)} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={reset}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                BrandLens AI
              </span>
            </div>
            <div className="hidden sm:flex space-x-8">
              <button onClick={() => setIsCameraOpen(true)} className="text-gray-500 hover:text-indigo-600 transition-colors font-medium">Take Photo</button>
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-indigo-600 transition-colors font-medium">Upload</button>
            </div>
            <button 
              onClick={() => setIsCameraOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Quick Scan
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Landing State */}
        {appState === AppState.IDLE && (
          <div className="text-center py-16 animate-in fade-in zoom-in-95 duration-700">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
              Identify any brand <br /> 
              <span className="text-indigo-600">with a single snap.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
              Instant brand recognition for shirts, shoes, and accessories using advanced AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button 
                onClick={() => setIsCameraOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center shadow-xl shadow-indigo-200"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Take Photo
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl font-bold text-lg hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Image
              </button>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="hidden md:block max-w-xl mx-auto p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 hover:border-indigo-400 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-sm text-gray-400">Or drag and drop an image file here</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-6 h-6 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Identifying Garment...</h3>
              <p className="text-gray-500">Checking design patterns and logos</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto text-center py-20 bg-red-50 rounded-3xl p-8 border border-red-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h3>
            <p className="text-red-700 mb-8">{errorMessage}</p>
            <button onClick={reset} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
              Try Another Image
            </button>
          </div>
        )}

        {/* Success State */}
        {appState === AppState.SUCCESS && currentResult && currentImageUrl && (
          <div>
            <div className="mb-6">
              <button onClick={reset} className="flex items-center text-gray-500 hover:text-indigo-600 font-medium">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                New Scan
              </button>
            </div>
            <AnalysisResult result={currentResult} imageUrl={currentImageUrl} />
          </div>
        )}

        <HistoryList items={history} onSelectItem={selectHistoryItem} />
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-8 right-8 sm:hidden">
        <button 
          onClick={() => setIsCameraOpen(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all scale-100 active:scale-90"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
