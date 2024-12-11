import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import youtubeRouter from './api/youtube/analytics';
import youtubeAuthRouter from './api/youtube/auth';
import { youtubeConfig } from './config/youtube.config';
import config from './config/api.config';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env and .env.local
dotenv.config({ path: resolve(__dirname, '../.env') });
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Log environment variables for debugging
console.log('\n=== Server Environment ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API_URL:', process.env.API_URL);
console.log('========================\n');

async function startServer() {
  try {
    const app = express();
    const port = process.env.PORT || 5174;

    // Enable detailed error handling in development
    if (process.env.NODE_ENV !== 'production') {
      app.set('json spaces', 2);
      app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        console.log('Headers:', req.headers);
        next();
      });
    }

    // Configure CORS with specific options
    app.use(cors({
      origin: [
        'http://localhost:5174',
        'http://localhost:3000',
        'https://eccentrik.co'
      ],
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
      optionsSuccessStatus: 200
    }));

    // Parse JSON bodies
    app.use(express.json());

    // Set security headers
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      next();
    });

    // API routes - make sure they're handled first
    app.use('/api/youtube', (req, res, next) => {
      res.type('application/json');
      next();
    }, youtubeRouter);
    
    app.use('/auth/youtube', (req, res, next) => {
      res.type('application/json');
      next();
    }, youtubeAuthRouter);

    // Serve static files from the dist directory
    const distPath = resolve(__dirname, '../dist');
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        if (path.endsWith('.ts')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      }
    }));

    // SPA fallback - must come after API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
      } else {
        res.sendFile(resolve(distPath, 'index.html'));
      }
    });

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server Error:', {
        message: err.message,
        stack: err.stack,
        status: err.status || 500
      });
      
      // Make sure we're sending JSON
      res.setHeader('Content-Type', 'application/json');
      res.status(err.status || 500).json({
        error: {
          message: err.message || 'Internal Server Error',
          status: err.status || 500,
          ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        }
      });
    });

    await new Promise<void>((resolve) => {
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        resolve();
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

startServer().catch(error => {
  console.error('Unhandled server error:', error);
  process.exit(1);
});
