export interface TitleAnalysis {
  score: number;
  explanation: string;
  suggestions: string[];
}

export interface ThumbnailAnalysis {
  score: number;
  explanation: string;
  suggestions: string[];
}

export interface AnalysisResult {
  title: TitleAnalysis | null;
  thumbnail: ThumbnailAnalysis | null;
}