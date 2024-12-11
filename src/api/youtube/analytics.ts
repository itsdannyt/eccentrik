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
  console.log('Headers:', req.headers);
  
  // Check authorization header
  const authorization = req.headers.authorization;
  if (!authorization) {
    console.error('No authorization header provided');
    return res.status(401).json({ 
      error: 'Authentication Error',
      message: 'No authorization token provided' 
    });
  }

  // Extract and validate access token
  const accessToken = authorization.replace(/^Bearer\s+/i, '');
  if (!accessToken) {
    console.error('Invalid authorization format');
    return res.status(401).json({ 
      error: 'Authentication Error',
      message: 'Invalid authorization format' 
    });
  }

  console.log('Access token received:', accessToken.substring(0, 10) + '...');
  
  try {
    console.log('Creating YouTubeAnalyticsService...');
    const analyticsService = new YouTubeAnalyticsService(accessToken);
    
    console.log('Initializing service...');
    await analyticsService.initialize();
    
    console.log('Fetching analytics data...');
    const data = await analyticsService.getChannelAnalytics();
    
    console.log('Analytics data fetched successfully:', {
      hasOverview: !!data.overview,
      hasPerformance: !!data.recentPerformance,
      topVideosCount: data.topVideos?.length,
      hasDemographics: !!data.demographics,
      hasTraffic: !!data.traffic
    });
    
    res.json(data);
  } catch (error: any) {
    console.error('Analytics endpoint error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    // Handle specific error types
    if (error.message.includes('token expired')) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'YouTube token has expired. Please reconnect your account.'
      });
    }
    
    if (error.message.includes('No channel data found')) {
      return res.status(404).json({
        error: 'Channel Error',
        message: 'No YouTube channel found for this account.'
      });
    }
    
    // Generic error response
    res.status(500).json({
      error: 'Analytics Error',
      message: error.message || 'Failed to fetch YouTube analytics'
    });
  }
}));

export default router;
