import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function analyzeTitleWithGPT(title: string): Promise<{
  score: number;
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a YouTube content optimization expert. Analyze the given title and provide a score out of 100 and suggestions for improvement."
        },
        {
          role: "user",
          content: `Analyze this YouTube title: "${title}"`
        }
      ],
      temperature: 0.7,
    });

    const analysis = response.choices[0].message.content;
    // Parse the response to extract score and suggestions
    // This is a simplified example
    return {
      score: 85,
      suggestions: ["Make it more action-oriented", "Add numbers or statistics", "Include emotional triggers"]
    };
  } catch (error) {
    console.error('Error analyzing title:', error);
    throw error;
  }
}