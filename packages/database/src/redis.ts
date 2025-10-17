import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redisClient =
  globalForRedis.redis ??
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redisClient;

// Helper functions for idempotency
export async function getIdempotencyKey(key: string): Promise<any | null> {
  try {
    const cached = await redisClient.get(`idempotency:${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Redis getIdempotencyKey failed:', error);
    return null;
  }
}

export async function setIdempotencyKey(
  key: string,
  response: any,
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    await redisClient.setex(
      `idempotency:${key}`,
      ttlSeconds,
      JSON.stringify(response)
    );
  } catch (error) {
    console.warn('Redis setIdempotencyKey failed:', error);
  }
}

export async function deleteIdempotencyKey(key: string): Promise<void> {
  try {
    await redisClient.del(`idempotency:${key}`);
  } catch (error) {
    console.warn('Redis deleteIdempotencyKey failed:', error);
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.warn('Redis connection check failed:', error);
    return false;
  }
}

export default redisClient;