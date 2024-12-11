interface Environment {
  apiUrl: string;
  allowedOrigins: string[];
  youtubeApiConfig: {
    quotaLimit: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

const development: Environment = {
  apiUrl: 'http://localhost:3000',
  allowedOrigins: ['http://localhost:5174', 'http://127.0.0.1:5174'],
  youtubeApiConfig: {
    quotaLimit: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
};

const production: Environment = {
  apiUrl: process.env.API_URL || 'https://api.yourdomain.com',
  allowedOrigins: [
    process.env.FRONTEND_URL || 'https://yourdomain.com',
    process.env.ALTERNATIVE_URL || 'https://www.yourdomain.com',
  ].filter(Boolean),
  youtubeApiConfig: {
    quotaLimit: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
};

const config: Environment = 
  process.env.NODE_ENV === 'production' ? production : development;

export default config;
