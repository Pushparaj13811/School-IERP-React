import { config } from '../config/config.js';

/**
 * Production-Ready Rate Limiter
 *
 * Features:
 * - Sliding window algorithm (prevents burst attacks at window boundaries)
 * - Redis support for distributed systems (with graceful fallback to in-memory)
 * - Tiered rate limiting (different limits per user type)
 * - Fail-open strategy (doesn't block requests if Redis is unavailable)
 * - Proper HTTP headers (X-RateLimit-*, Retry-After)
 * - Whitelist/Blacklist support
 * - Development mode bypass
 *
 * Based on best practices from:
 * - https://zuplo.com/learning-center/10-best-practices-for-api-rate-limiting-in-2025
 * - https://dev.to/crit3cal/building-production-ready-api-rate-limiting-with-express-redis-and-middleware-gdi
 */

// Redis client (will be set if Redis is available)
let redisClient = null;
let redisAvailable = false;

// In-memory fallback store using sliding window
const memoryStore = new Map();

// Whitelist and blacklist (can be configured via environment)
const whitelist = new Set(
    (process.env.RATE_LIMIT_WHITELIST || '').split(',').filter(Boolean)
);
const blacklist = new Set(
    (process.env.RATE_LIMIT_BLACKLIST || '').split(',').filter(Boolean)
);

/**
 * Initialize Redis connection for distributed rate limiting
 * Call this function during app startup if you want Redis support
 */
export const initializeRedis = async (client) => {
    try {
        redisClient = client;
        await redisClient.ping();
        redisAvailable = true;
        console.log('Rate limiter: Redis connection established');
    } catch (error) {
        console.warn('Rate limiter: Redis unavailable, falling back to in-memory store');
        redisAvailable = false;
    }
};

/**
 * Clean up expired entries from in-memory store
 * Runs every minute to prevent memory leaks
 */
const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of memoryStore.entries()) {
        // Remove entries older than 1 hour (max window we support)
        if (now - data.windowStart > 60 * 60 * 1000) {
            memoryStore.delete(key);
        }
    }
}, 60 * 1000);

// Prevent cleanup interval from keeping process alive
if (cleanupInterval.unref) {
    cleanupInterval.unref();
}

/**
 * Sliding Window Rate Limiter using Redis Sorted Sets
 * More accurate than fixed window - prevents burst attacks at boundaries
 */
const checkRateLimitRedis = async (key, windowMs, maxRequests) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `ratelimit:${key}`;

    try {
        // Use Redis transaction for atomicity
        const multi = redisClient.multi();

        // Remove expired entries (outside current window)
        multi.zRemRangeByScore(redisKey, 0, windowStart);

        // Count requests in current window
        multi.zCard(redisKey);

        // Add current request with timestamp as score
        multi.zAdd(redisKey, { score: now, value: `${now}-${Math.random()}` });

        // Set TTL to auto-cleanup (window + buffer)
        multi.expire(redisKey, Math.ceil(windowMs / 1000) + 60);

        const results = await multi.exec();
        const requestCount = results[1]; // zCard result

        return {
            allowed: requestCount < maxRequests,
            current: requestCount + 1,
            remaining: Math.max(0, maxRequests - requestCount - 1),
            resetTime: new Date(now + windowMs).toISOString(),
            retryAfter: Math.ceil(windowMs / 1000)
        };
    } catch (error) {
        console.error('Rate limiter Redis error:', error.message);
        // Fail open - allow request if Redis fails
        return { allowed: true, current: 0, remaining: maxRequests, resetTime: null, retryAfter: 0 };
    }
};

/**
 * Sliding Window Rate Limiter using In-Memory Store
 * Fallback when Redis is unavailable
 */
const checkRateLimitMemory = (key, windowMs, maxRequests) => {
    const now = Date.now();
    const windowStart = now - windowMs;

    let data = memoryStore.get(key);

    if (!data) {
        data = { requests: [], windowStart: now };
    }

    // Filter out expired requests (sliding window)
    data.requests = data.requests.filter(timestamp => timestamp > windowStart);

    const requestCount = data.requests.length;
    const allowed = requestCount < maxRequests;

    if (allowed) {
        data.requests.push(now);
    }

    data.windowStart = now;
    memoryStore.set(key, data);

    return {
        allowed,
        current: requestCount + (allowed ? 1 : 0),
        remaining: Math.max(0, maxRequests - requestCount - (allowed ? 1 : 0)),
        resetTime: new Date(now + windowMs).toISOString(),
        retryAfter: Math.ceil(windowMs / 1000)
    };
};

/**
 * Get rate limit key based on request
 * Supports IP-based, user-based, and API key-based limiting
 */
const getDefaultKey = (req, prefix = '') => {
    // Prefer user ID if authenticated
    if (req.user?.id) {
        return `${prefix}user:${req.user.id}`;
    }

    // Fall back to IP address
    const ip = req.ip ||
               req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.connection?.remoteAddress ||
               'unknown';

    return `${prefix}ip:${ip}`;
};

/**
 * Get tier-based rate limits
 * Different limits for different user types
 */
const getTierLimits = (req, baseMaxRequests) => {
    if (!req.user) return baseMaxRequests;

    // Define tier multipliers
    const tierMultipliers = {
        'ADMIN': 5,      // Admins get 5x the limit
        'TEACHER': 2,    // Teachers get 2x the limit
        'PARENT': 1.5,   // Parents get 1.5x the limit
        'STUDENT': 1     // Students get base limit
    };

    const multiplier = tierMultipliers[req.user.role] || 1;
    return Math.floor(baseMaxRequests * multiplier);
};

/**
 * Creates a production-ready rate limiter middleware
 *
 * @param {Object} options - Rate limiter configuration
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message when rate limited
 * @param {Function} options.keyGenerator - Custom function to generate rate limit key
 * @param {Function} options.skip - Function to skip rate limiting for certain requests
 * @param {boolean} options.enableTieredLimits - Enable different limits per user role
 * @param {string} options.keyPrefix - Prefix for rate limit keys (useful for different endpoints)
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (options = {}) => {
    const {
        windowMs = config.rateLimit.windowMs,
        maxRequests = config.rateLimit.maxRequests,
        message = 'Too many requests, please try again later.',
        keyGenerator = null,
        skip = () => false,
        enableTieredLimits = false,
        keyPrefix = ''
    } = options;

    return async (req, res, next) => {
        try {
            // Skip rate limiting in development mode
            if (config.env === 'development') {
                return next();
            }

            // Check if request should be skipped
            if (skip(req)) {
                return next();
            }

            // Generate rate limit key
            const key = keyGenerator
                ? keyGenerator(req)
                : getDefaultKey(req, keyPrefix);

            // Check whitelist
            if (whitelist.has(key) || whitelist.has(req.ip)) {
                return next();
            }

            // Check blacklist - always block
            if (blacklist.has(key) || blacklist.has(req.ip)) {
                return res.status(403).json({
                    success: false,
                    statusCode: 403,
                    message: 'Access denied'
                });
            }

            // Calculate effective max requests (with tier support)
            const effectiveMaxRequests = enableTieredLimits
                ? getTierLimits(req, maxRequests)
                : maxRequests;

            // Check rate limit (Redis or in-memory)
            const result = redisAvailable
                ? await checkRateLimitRedis(key, windowMs, effectiveMaxRequests)
                : checkRateLimitMemory(key, windowMs, effectiveMaxRequests);

            // Set standard rate limit headers
            res.setHeader('X-RateLimit-Limit', effectiveMaxRequests);
            res.setHeader('X-RateLimit-Remaining', result.remaining);
            if (result.resetTime) {
                res.setHeader('X-RateLimit-Reset', result.resetTime);
            }

            // Check if request is allowed
            if (!result.allowed) {
                res.setHeader('Retry-After', result.retryAfter);

                // Log rate limit violation for security monitoring
                console.warn(`Rate limit exceeded: ${key} - ${req.method} ${req.path}`);

                return res.status(429).json({
                    success: false,
                    statusCode: 429,
                    message,
                    retryAfter: result.retryAfter
                });
            }

            next();
        } catch (error) {
            // Fail open - don't block requests due to rate limiter errors
            console.error('Rate limiter error:', error.message);
            next();
        }
    };
};

/**
 * Preset Rate Limiters for common use cases
 */

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    keyPrefix: 'api:',
    enableTieredLimits: true
});

// Authentication rate limiter - 5 attempts per 15 minutes (strict)
export const authLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.authMaxRequests,
    message: 'Too many authentication attempts, please try again later.',
    keyPrefix: 'auth:',
    enableTieredLimits: false // Same limit for everyone
});

// Password reset rate limiter - 3 attempts per hour
export const passwordResetLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again after an hour.',
    keyPrefix: 'pwreset:',
    enableTieredLimits: false
});

// File upload rate limiter - 10 uploads per 15 minutes
export const uploadLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    maxRequests: 10,
    message: 'Too many file uploads, please try again later.',
    keyPrefix: 'upload:',
    enableTieredLimits: true
});

// User creation rate limiter - 20 per 15 minutes
export const userCreationLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    maxRequests: 20,
    message: 'Too many user creation requests, please try again later.',
    keyPrefix: 'usercreate:',
    enableTieredLimits: false
});

// Report generation rate limiter - 10 per 15 minutes (expensive operations)
export const reportLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    maxRequests: 10,
    message: 'Too many report generation requests, please try again later.',
    keyPrefix: 'report:',
    enableTieredLimits: true
});

// Strict limiter for sensitive operations - 5 per 15 minutes
export const strictLimiter = createRateLimiter({
    windowMs: config.rateLimit.windowMs,
    maxRequests: 5,
    message: 'Too many requests for this operation, please try again later.',
    keyPrefix: 'strict:',
    enableTieredLimits: false
});

/**
 * Dynamic rate limiter factory
 * Creates a rate limiter based on endpoint-specific configuration
 */
export const createEndpointLimiter = (endpoint, customOptions = {}) => {
    const defaultConfigs = {
        'login': { maxRequests: 5, windowMs: 15 * 60 * 1000 },
        'register': { maxRequests: 3, windowMs: 60 * 60 * 1000 },
        'password-reset': { maxRequests: 3, windowMs: 60 * 60 * 1000 },
        'email-verification': { maxRequests: 5, windowMs: 60 * 60 * 1000 },
        'file-upload': { maxRequests: 10, windowMs: 15 * 60 * 1000 },
        'report-generation': { maxRequests: 10, windowMs: 15 * 60 * 1000 },
        'bulk-operation': { maxRequests: 5, windowMs: 15 * 60 * 1000 },
        'data-export': { maxRequests: 5, windowMs: 60 * 60 * 1000 }
    };

    const baseConfig = defaultConfigs[endpoint] || { maxRequests: 100, windowMs: 15 * 60 * 1000 };

    return createRateLimiter({
        ...baseConfig,
        ...customOptions,
        keyPrefix: `${endpoint}:`,
        message: customOptions.message || `Too many ${endpoint} requests, please try again later.`
    });
};

export default {
    createRateLimiter,
    initializeRedis,
    apiLimiter,
    authLimiter,
    passwordResetLimiter,
    uploadLimiter,
    userCreationLimiter,
    reportLimiter,
    strictLimiter,
    createEndpointLimiter
};
