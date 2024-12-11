import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import youtubeRouter from './api/youtube/analytics';
import { youtubeConfig } from './config/youtube.config';
import config from './config/api.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env and .env.local
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

// Log environment variables for debugging
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  YOUTUBE_CONFIG: {
    clientId: !!youtubeConfig.clientId,
    clientSecret: !!youtubeConfig.clientSecret,
    redirectUri: youtubeConfig.redirectUri
  }
});

const app = express();
const port = process.env.PORT || 5174; // Using same port as Vite for development

// Global error handlers
process.on('unhandledRejection', (reason: any, promise) => {
  console.error('=== UNHANDLED REJECTION DETAILS ===');
  console.error('Reason:', JSON.stringify(reason, null, 2));
  console.error('Stack:', reason?.stack);
  if (reason?.config) {
    console.error('Request Config:', {
      url: reason.config.url,
      method: reason.config.method,
      headers: reason.config.headers
    });
  }
  if (reason?.response) {
    console.error('Response:', {
      status: reason.response.status,
      data: reason.response.data,
      headers: reason.response.headers
    });
  }
  console.error('Promise:', promise);
  console.error('================================');
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

// Middleware
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Mount routers
app.use('/api/youtube', youtubeRouter);

// Error handling middleware (should be after all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    response: err.response?.data
  });
  
  // Handle different types of errors
  if (err.name === 'QuotaExceededError') {
    return res.status(429).json({
      error: 'YouTube API quota exceeded',
      details: err.message
    });
  }

  if (err.response?.status === 401 || err.message?.includes('token expired')) {
    return res.status(401).json({
      error: 'Authentication failed',
      details: 'Please reconnect your YouTube account'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});
