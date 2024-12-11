import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import config from '../../config/api.config';
import { validateOrigin } from '../../utils/api.utils';
import { YouTubeAnalyticsService } from '../../lib/services/YouTubeAnalyticsService';

const router = Router();

// Helper to wrap async route handlers with detailed error logging
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => 
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      console.error('=== YOUTUBE ROUTER ERROR ===');
      console.error('Error:', error);
      console.error('Stack:', error?.stack);
      console.error('Request:', {
        path: req.path,
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body
      });
      console.error('==========================');
      next(error);
    }
  };

// Error handling middleware
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('YouTube Analytics Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Enable CORS with specific options
router.use(cors({
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Main analytics endpoint
router.get('/analytics', asyncHandler(async (req, res, next) => {
  try {
    const origin = req.get('origin');
    if (!validateOrigin(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const accessToken = authorization.replace(/^Bearer\s+/i, '');
    
    const analyticsService = new YouTubeAnalyticsService(accessToken);
    const analytics = await analyticsService.getChannelAnalytics();
    
    // Validate response structure
    if (!analytics?.overview) {
      throw new Error('Invalid analytics data structure');
    }
    
    // Set proper content type
    res.setHeader('Content-Type', 'application/json');
    
    // Send response with fallback values
    res.json({
      overview: {
        totalViews: analytics.overview.totalViews || '0',
        subscribers: analytics.overview.subscribers || '0',
        totalVideos: analytics.overview.totalVideos || '0',
        watchTime: analytics.overview.watchTime || '0',
        engagementRate: analytics.overview.engagementRate || '0'
      },
      recentVideos: (analytics.topVideos || []).map(video => ({
        id: video?.id || '',
        title: video?.title || '',
        thumbnail: video?.thumbnail || '',
        publishedAt: video?.publishedAt || new Date().toISOString(),
        stats: {
          views: video?.stats?.views || '0',
          likes: video?.stats?.likes || '0',
          comments: video?.stats?.comments || '0'
        },
        analytics: {
          watchTime: video?.analytics?.watchTime || '0',
          avgViewDuration: video?.analytics?.avgViewDuration || '0:00',
          engagementRate: video?.analytics?.engagementRate || '0'
        },
        insights: video?.insights || []
      }))
    });
  } catch (error: any) {
    console.error('YouTube Analytics Error:', {
      error,
      stack: error?.stack,
      response: error?.response?.data
    });
    
    if (error?.response?.status === 401 || error?.code === 401) {
      return res.status(401).json({
        error: 'YouTube authentication failed',
        message: 'Please reconnect your YouTube account',
        details: error.message
      });
    }
    
    // Generic error response
    res.status(500).json({
      error: 'Failed to fetch YouTube data',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}));

export default router;
