import axios from 'axios';
import { ImageAnalysis } from './types';

const VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

export class VisionClient {
  private static instance: VisionClient;

  private constructor() {}

  public static getInstance(): VisionClient {
    if (!VisionClient.instance) {
      VisionClient.instance = new VisionClient();
    }
    return VisionClient.instance;
  }

  async analyzeThumbnail(imageUrl: string): Promise<ImageAnalysis> {
    if (!VISION_API_KEY) {
      throw new Error('Google Vision API key is not configured');
    }

    try {
      const response = await axios.post(VISION_API_URL, {
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: 'TEXT_DETECTION' },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'OBJECT_LOCALIZATION' },
            { type: 'FACE_DETECTION' }
          ]
        }]
      });

      if (!response.data?.responses?.[0]) {
        throw new Error('Invalid response from Vision API');
      }

      const result = response.data.responses[0];
      
      return {
        textDetection: {
          hasText: Boolean(result.textAnnotations?.length),
          detectedText: result.textAnnotations?.[0]?.description || '',
          textBlocks: result.textAnnotations?.length || 0
        },
        colorAnalysis: {
          dominantColors: this.extractDominantColors(result.imagePropertiesAnnotation),
          colorfulness: this.calculateColorfulness(result.imagePropertiesAnnotation),
          contrast: this.calculateContrast(result.imagePropertiesAnnotation)
        },
        composition: {
          hasFaces: Boolean(result.faceAnnotations?.length),
          faceCount: result.faceAnnotations?.length || 0,
          objects: this.extractObjects(result.localizedObjectAnnotations),
          isCluttered: this.calculateClutter(result.localizedObjectAnnotations)
        }
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Vision API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  private extractDominantColors(imageProperties: any): Array<{ rgb: string; score: number }> {
    if (!imageProperties?.dominantColors?.colors) {
      return [];
    }

    return imageProperties.dominantColors.colors
      .slice(0, 5)
      .map((color: any) => ({
        rgb: `rgb(${Math.round(color.color.red)}, ${Math.round(color.color.green)}, ${Math.round(color.color.blue)})`,
        score: color.score
      }));
  }

  private calculateColorfulness(imageProperties: any): number {
    if (!imageProperties?.dominantColors?.colors) {
      return 0;
    }

    const colors = imageProperties.dominantColors.colors;
    let totalVariance = 0;

    for (let i = 0; i < colors.length - 1; i++) {
      const color1 = colors[i].color;
      const color2 = colors[i + 1].color;
      
      const variance = Math.sqrt(
        Math.pow(color1.red - color2.red, 2) +
        Math.pow(color1.green - color2.green, 2) +
        Math.pow(color1.blue - color2.blue, 2)
      );
      
      totalVariance += variance * colors[i].score;
    }

    return Math.min(totalVariance * 100, 100);
  }

  private calculateContrast(imageProperties: any): number {
    if (!imageProperties?.dominantColors?.colors) {
      return 0;
    }

    const colors = imageProperties.dominantColors.colors;
    if (colors.length < 2) return 0;

    // Calculate relative luminance for the two most dominant colors
    const color1 = colors[0].color;
    const color2 = colors[1].color;

    const luminance1 = this.calculateRelativeLuminance(color1);
    const luminance2 = this.calculateRelativeLuminance(color2);

    // Calculate contrast ratio
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    const contrast = (lighter + 0.05) / (darker + 0.05);

    // Convert to a 0-100 scale
    return Math.min(((contrast - 1) / 20) * 100, 100);
  }

  private calculateRelativeLuminance(color: any): number {
    const r = color.red / 255;
    const g = color.green / 255;
    const b = color.blue / 255;

    const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private extractObjects(localizedObjectAnnotations: any[]): string[] {
    if (!Array.isArray(localizedObjectAnnotations)) {
      return [];
    }

    return localizedObjectAnnotations
      .map(obj => obj.name)
      .filter((name, index, self) => self.indexOf(name) === index);
  }

  private calculateClutter(localizedObjectAnnotations: any[]): boolean {
    if (!Array.isArray(localizedObjectAnnotations)) {
      return false;
    }

    // Consider it cluttered if there are more than 5 distinct objects
    const distinctObjects = new Set(localizedObjectAnnotations.map(obj => obj.name));
    return distinctObjects.size > 5;
  }
}