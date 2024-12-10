export interface TextDetection {
  hasText: boolean;
  detectedText: string;
  textBlocks: number;
}

export interface ColorAnalysis {
  dominantColors: Array<{
    rgb: string;
    score: number;
  }>;
  colorfulness: number;
  contrast: number;
}

export interface Composition {
  hasFaces: boolean;
  faceCount: number;
  objects: string[];
  isCluttered: boolean;
}

export interface ImageAnalysis {
  textDetection: TextDetection;
  colorAnalysis: ColorAnalysis;
  composition: Composition;
}