import { z } from 'zod';

const VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

export interface ImageAnalysis {
  score: number;
  textReadability: number;
  clutterScore: number;
  detectedObjects: string[];
}

const imageAnalysisSchema = z.object({
  score: z.number(),
  textReadability: z.number(),
  clutterScore: z.number(),
  detectedObjects: z.array(z.string())
});

export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'TEXT_DETECTION' },
              { type: 'OBJECT_LOCALIZATION' },
              { type: 'IMAGE_PROPERTIES' }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process the response and calculate scores
    const analysis = {
      score: calculateOverallScore(data),
      textReadability: calculateTextReadability(data),
      clutterScore: calculateClutterScore(data),
      detectedObjects: extractDetectedObjects(data)
    };

    return imageAnalysisSchema.parse(analysis);
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}

function calculateOverallScore(data: any): number {
  // Implement scoring logic based on Vision API response
  return 90;
}

function calculateTextReadability(data: any): number {
  // Implement text readability calculation
  return 85;
}

function calculateClutterScore(data: any): number {
  // Implement clutter score calculation
  return 75;
}

function extractDetectedObjects(data: any): string[] {
  // Extract detected objects from Vision API response
  return ['person', 'laptop', 'phone'];
}