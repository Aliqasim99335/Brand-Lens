
import React from 'react';
import { AnalysisHistoryItem } from '../types';

interface HistoryListProps {
  items: AnalysisHistoryItem[];
  onSelectItem: (item: AnalysisHistoryItem) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ items, onSelectItem }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Recent Scans
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:ring-2 hover:ring-indigo-500 transition-all text-left"
          >
            <img 
              src={item.imageUrl} 
              alt={item.result.brandName} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 p-3">
                <p className="text-white text-xs font-bold truncate w-full">
                  {item.result.brandName}
                </p>
                <p className="text-gray-300 text-[10px] truncate">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
