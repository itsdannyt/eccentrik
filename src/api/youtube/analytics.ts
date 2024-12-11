import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import config from '../../config/api.config';
import { validateOrigin } from '../../utils/api.utils';
import { YouTubeAnalyticsService } from '../../lib/services/YouTubeAnalyticsService';

const router = Router();

// Enable CORS with specific options
router.use(cors({
  origin: (origin, callback) => {
    if (!origin || validateOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

router.get('/analytics', async (req, res) => {
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

    try {
      const analytics = await analyticsService.getChannelAnalytics();
      res.json(analytics);
    } catch (error: any) {
      if (error.code === 401) {
        return res.status(401).json({ 
          error: 'Authentication failed. Please reconnect your YouTube account.' 
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Analytics error:', error);
    
    if (error.name === 'QuotaExceededError') {
      return res.status(429).json({ 
        error: 'YouTube API quota exceeded. Please try again later.' 
      });
    }

    res.status(500).json({ 
      error: 'An error occurred while fetching analytics data.' 
    });
  }
});

export default router;
