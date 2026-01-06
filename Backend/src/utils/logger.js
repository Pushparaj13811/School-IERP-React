import { config } from '../config/config.js';

/**
 * Simple structured logger utility
 * In production, only errors and warnings are logged
 * In development, all log levels are enabled
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

const currentLogLevel = config.env === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
};

/**
 * Logger object with different log levels
 */
const logger = {
    /**
     * Log error messages - always logged
     */
    error: (message, meta = {}) => {
        if (currentLogLevel >= LOG_LEVELS.ERROR) {
            console.error(formatMessage('ERROR', message, meta));
        }
    },

    /**
     * Log warning messages - logged in development and production
     */
    warn: (message, meta = {}) => {
        if (currentLogLevel >= LOG_LEVELS.WARN) {
            console.warn(formatMessage('WARN', message, meta));
        }
    },

    /**
     * Log info messages - only in development
     */
    info: (message, meta = {}) => {
        if (currentLogLevel >= LOG_LEVELS.INFO) {
            console.info(formatMessage('INFO', message, meta));
        }
    },

    /**
     * Log debug messages - only in development
     */
    debug: (message, meta = {}) => {
        if (currentLogLevel >= LOG_LEVELS.DEBUG) {
            console.debug(formatMessage('DEBUG', message, meta));
        }
    },

    /**
     * Log HTTP requests
     */
    http: (req, res, duration) => {
        if (currentLogLevel >= LOG_LEVELS.INFO) {
            const meta = {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip,
            };
            console.info(formatMessage('HTTP', `${req.method} ${req.originalUrl} ${res.statusCode}`, meta));
        }
    },
};

export default logger;
