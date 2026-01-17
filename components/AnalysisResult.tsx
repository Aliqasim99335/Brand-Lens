
import React from 'react';
import { BrandAnalysis } from '../types';

interface AnalysisResultProps {
  result: BrandAnalysis;
  imageUrl: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, imageUrl }) => {
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img 
            src={imageUrl} 
            alt="Analyzed garment" 
            className="w-full h-full object-cover max-h-[400px] md:max-h-full"
          />
        </div>
        <div className="md:w-1/2 p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              {result.clothingType}
            </span>
            <div className="flex items-center text-sm font-medium text-gray-500">
              <span className="mr-2">Confidence:</span>
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${confidencePercent}%` }}
                ></div>
              </div>
              <span className="text-indigo-600">{confidencePercent}%</span>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-2">{result.brandName}</h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {result.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Color</span>
              <span className="text-gray-900 font-medium capitalize">{result.color}</span>
            </div>
            {result.estimatedPriceRange && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Price Range</span>
                <span className="text-gray-900 font-medium">{result.estimatedPriceRange}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Style Tags</h3>
            <div className="flex flex-wrap gap-2">
              {result.styleKeywords.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
          </div>

          {result.historicalFact && (
            <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
              <h4 className="text-sm font-bold text-indigo-900 mb-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Did you know?
              </h4>
              <p className="text-sm text-indigo-800 italic">
                {result.historicalFact}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
