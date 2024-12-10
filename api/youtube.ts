import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://youtube.googleapis.com/youtube/v3';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const { endpoint, ...params } = request.query;

    if (!endpoint || typeof endpoint !== 'string') {
      return response.status(400).json({ error: 'Endpoint is required' });
    }

    const youtubeResponse = await axios.get(`${BASE_URL}/${endpoint}`, {
      params: {
        ...params,
        key: YOUTUBE_API_KEY
      }
    });

    return response.status(200).json(youtubeResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return response.status(error.response?.status || 500).json(error.response?.data || { error: 'YouTube API error' });
    }
    return response.status(500).json({ error: 'Internal server error' });
  }
}
