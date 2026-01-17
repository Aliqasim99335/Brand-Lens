
export interface BrandAnalysis {
  brandName: string;
  confidence: number;
  clothingType: string;
  color: string;
  description: string;
  styleKeywords: string[];
  detectableLogos: boolean;
  estimatedPriceRange?: string;
  historicalFact?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: BrandAnalysis;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
