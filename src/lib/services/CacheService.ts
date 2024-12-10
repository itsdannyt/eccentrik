interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class CacheService {
  private static instance: CacheService | null = null;
  private cache: Map<string, CacheItem<any>>;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}