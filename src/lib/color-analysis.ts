import ColorThief from 'colorthief';

export async function analyzeColors(imageUrl: string): Promise<{
  dominantColors: string[];
  contrast: number;
  emotionalAppeal: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, 5);
      
      resolve({
        dominantColors: palette.map(color => `rgb(${color[0]}, ${color[1]}, ${color[2]})`),
        contrast: calculateContrast(palette),
        emotionalAppeal: calculateEmotionalAppeal(palette)
      });
    };
    img.src = imageUrl;
  });
}

function calculateContrast(palette: number[][]): number {
  // Simplified contrast calculation
  return 85;
}

function calculateEmotionalAppeal(palette: number[][]): number {
  // Simplified emotional appeal calculation
  return 90;
}