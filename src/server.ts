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

    // Configure CORS
    app.use(cors({
      origin: [
        'http://localhost:5174',
        'http://localhost:3000',
        'https://eccentrik.co'
      ],
      credentials: true
    }));

    // Parse JSON bodies
    app.use(express.json());

    // Configure API routes
    app.use('/api/youtube', youtubeRouter);
    app.use('/auth/youtube', youtubeAuthRouter);

    // Serve static files from the dist directory
    const distPath = resolve(__dirname, '../dist');
    app.use(express.static(distPath));

    // Handle SPA routing - must be after API routes
    app.get('*', (req, res) => {
      // Only handle HTML requests, let the static middleware handle other files
      if (req.headers.accept?.includes('text/html')) {
        res.sendFile(resolve(distPath, 'index.html'));
      } else {
        res.status(404).send('Not found');
      }
    });

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server Error:', err);
      
      // Send a properly formatted JSON response
      res.status(err.status || 500).json({
        error: {
          message: err.message || 'Internal Server Error',
          status: err.status || 500
        }
      });
    });

    // Handle 404 errors
    app.use((req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: {
          message: 'Not Found',
          status: 404
        }
      });
    });

    // Global error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Global error handler:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API URL: ${process.env.API_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('Unhandled server error:', error);
  process.exit(1);
});
