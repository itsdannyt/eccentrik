import { CacheService } from './CacheService';

export class RateLimitService {
  private static instance: RateLimitService;
  private cache: CacheService;
  private readonly WINDOW_MS = 100_000; // 100 second window
  private readonly MAX_REQUESTS = 100; // Maximum requests per window
  private readonly BATCH_SIZE = 50; // Maximum videos per batch request

  private constructor() {
    this.cache = CacheService.getInstance();
  }

  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  async acquireToken(userId: string): Promise<boolean> {
    const key = `rate_limit:${userId}`;
    const current = this.cache.get<{ count: number; timestamp: number }>(key);

    if (!current) {
      this.cache.set(key, { count: 1, timestamp: Date.now() });
      return true;
    }

    if (Date.now() - current.timestamp > this.WINDOW_MS) {
      this.cache.set(key, { count: 1, timestamp: Date.now() });
      return true;
    }

    if (current.count >= this.MAX_REQUESTS) {
      return false;
    }

    this.cache.set(key, { count: current.count + 1, timestamp: current.timestamp });
    return true;
  }

  async waitForToken(userId: string): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    while (!(await this.acquireToken(userId))) {
      await delay(1000); // Wait 1 second before retrying
    }
  }

  getBatchSize(): number {
    return this.BATCH_SIZE;
  }

  async executeWithRetry<T>(
    userId: string,
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForToken(userId);
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    throw new Error('Max retries exceeded');
  }
}