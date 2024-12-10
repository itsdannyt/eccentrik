import { z } from 'zod';

export const youtubeChannelSchema = z.string().refine((url) => {
  const pattern = /^https?:\/\/(www\.)?youtube\.com\/(channel\/UC[\w-]{22}|c\/[\w-]+|@[\w-]+)$/;
  return pattern.test(url);
}, "Please enter a valid YouTube channel URL");

export function extractChannelId(url: string): string | null {
  const match = url.match(/youtube\.com\/(channel\/UC[\w-]{22}|c\/[\w-]+|@[\w-]+)/);
  return match ? match[1] : null;
}

export function getChannelCreateUrl(): string {
  return 'https://www.youtube.com/create_channel';
}