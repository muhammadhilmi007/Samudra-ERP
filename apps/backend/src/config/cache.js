/**
 * Cache Configuration
 * Handles Redis connection setup and cache management
 */

const Redis = require('ioredis');
const { logger } = require('../api/middleware/gateway/logger');

/**
 * Configure Redis connection
 * @param {Object} app - Express application instance
 * @returns {Promise<Redis|null>} Redis client instance or null if connection fails
 */
const configureRedis = async (app) => {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      logger.warn('REDIS_URL environment variable is not defined. Caching will be disabled.');
      return null;
    }
    
    // Create Redis client
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
    });
    
    // Store redis connection in app locals for health checks
    app.locals.redis = redis;
    
    // Handle connection events
    redis.on('connect', () => {
      logger.info('Redis connected');
    });
    
    redis.on('ready', () => {
      logger.info('Redis ready');
    });
    
    redis.on('error', (err) => {
      logger.error(`Redis error: ${err.message}`);
    });
    
    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });
    
    redis.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      if (redis) {
        await redis.quit();
        logger.info('Redis connection closed due to app termination');
      }
    });
    
    return redis;
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
    return null;
  }
};

/**
 * Cache middleware factory
 * @param {Redis} redis - Redis client instance
 * @param {number} expiry - Cache expiry time in seconds (default: 1 hour)
 * @returns {Function} Express middleware function
 */
const cacheMiddleware = (redis, expiry = 3600) => {
  return async (req, res, next) => {
    if (!redis) {
      return next();
    }
    
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const cacheKey = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        const data = JSON.parse(cachedData);
        return res.status(200).json(data);
      }
      
      // Store the original send function
      const originalSend = res.send;
      
      // Override the send function
      res.send = function (body) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          try {
            redis.setex(cacheKey, expiry, body);
          } catch (err) {
            logger.error(`Redis cache set error: ${err.message}`);
          }
        }
        
        // Call the original send function
        originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`);
      next();
    }
  };
};

/**
 * Clear cache for a specific key pattern
 * @param {Redis} redis - Redis client instance
 * @param {string} pattern - Key pattern to clear
 * @returns {Promise<number>} Number of keys cleared
 */
const clearCache = async (redis, pattern) => {
  if (!redis) {
    return 0;
  }
  
  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
      return keys.length;
    }
    
    return 0;
  } catch (error) {
    logger.error(`Clear cache error: ${error.message}`);
    return 0;
  }
};

module.exports = {
  configureRedis,
  cacheMiddleware,
  clearCache,
};
