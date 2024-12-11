import config from '../config/api.config';

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options = {
    attempts: config.youtubeApiConfig.retryAttempts,
    delay: config.youtubeApiConfig.retryDelay,
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // If it's a quota exceeded error, don't retry
      if (error.code === 403 && error.message.includes('quotaExceeded')) {
        throw new QuotaExceededError('YouTube API quota exceeded');
      }

      // If it's the last attempt, throw the error
      if (attempt === options.attempts) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, options.delay * attempt));
    }
  }

  throw lastError!;
}

export function validateOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return config.allowedOrigins.includes(origin);
}
