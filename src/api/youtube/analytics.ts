import express from 'express';
import { Router } from 'express';
import config from '../../config/api.config';
import { validateOrigin } from '../../utils/api.utils';
import { YouTubeAnalyticsService } from '../../lib/services/YouTubeAnalyticsService';

const router = Router();

// Helper to wrap async route handlers with detailed error logging
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => 
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      console.log('\n=== YOUTUBE ROUTER REQUEST ===');
      console.log('Path:', req.path);
      console.log('Method:', req.method);
      console.log('Headers:', req.headers);
      console.log('Query:', req.query);
      console.log('Body:', req.body);
      console.log('============================\n');

      await fn(req, res, next);
    } catch (error: any) {
      console.error('\n=== YOUTUBE ROUTER ERROR ===');
      console.error('Original error:', error);
      console.error('Stack:', error?.stack);
      console.error('Error properties:', Object.keys(error));
      
      // Log all error properties
      if (error && typeof error === 'object') {
        for (const key of Object.keys(error)) {
          try {
            console.error(`${key}:`, error[key]);
          } catch (e) {
            console.error(`Could not stringify ${key}`);
          }
        }
      }
      
      // Log request details
      console.error('Request details:', {
        path: req.path,
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body
      });
      console.error('============================\n');
      
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

// Handle preflight requests
router.options('/analytics', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Main analytics endpoint
router.get('/analytics', asyncHandler(async (req, res) => {
  console.log('\n=== YouTube Analytics Request ===');
  
  // Check authorization header
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ 
      error: {
        message: 'No authorization token provided',
        status: 401
      }
    });
  }

  // Extract and validate access token
  const accessToken = authorization.replace(/^Bearer\s+/i, '');
  if (!accessToken) {
    return res.status(401).json({ 
      error: {
        message: 'Invalid authorization format',
        status: 401
      }
    });
  }

  try {
    const analyticsService = new YouTubeAnalyticsService(accessToken);
    const data = await analyticsService.getChannelAnalytics();
    
    // Send properly formatted JSON response
    res.json({
      totalViews: data.overview.totalViews,
      subscribers: data.overview.subscribers,
      totalVideos: data.overview.totalVideos,
      watchTime: data.recentPerformance?.watchTime?.[0] || '0',
      engagementRate: data.overview.engagementRate
    });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    throw new Error(error.message || 'Failed to fetch YouTube analytics');
  }
}));

export default router;
