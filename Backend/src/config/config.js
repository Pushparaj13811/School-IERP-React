import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables in production
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('CLIENT_URL', 'EMAIL_USER', 'EMAIL_PASS');
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
    // Ensure JWT_SECRET is not the default value in production
    if (process.env.JWT_SECRET === 'your-secret-key') {
        throw new Error('JWT_SECRET must be set to a secure value in production');
    }
}

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,

    // Client URL for CORS - MUST be set in production
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

    // Allowed origins for CORS (comma-separated in env)
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:5173', 'http://localhost:3000'],

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5'), // Stricter for auth
    },

    // Redis Configuration (for distributed rate limiting, sessions, caching)
    redis: {
        enabled: process.env.REDIS_ENABLED === 'true',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        // Connection pool settings
        maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
        retryDelayMs: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
    },

    // Request body size limits
    bodyLimit: process.env.BODY_LIMIT || '10kb',
    uploadLimit: process.env.UPLOAD_LIMIT || '5mb',

    // Email configuration
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        from: process.env.EMAIL_FROM || 'noreply@school.com'
    },

    // Academic settings
    academic: {
        currentYear: process.env.CURRENT_ACADEMIC_YEAR || '2024-2025',
        currentTerm: process.env.CURRENT_TERM || 'First Term'
    }
}; 