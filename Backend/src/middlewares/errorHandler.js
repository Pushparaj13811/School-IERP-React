import { config } from '../config/config.js';
import { Prisma } from '@prisma/client';

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                // Unique constraint violation
                const field = err.meta?.target?.[0] || 'field';
                return {
                    statusCode: 409,
                    message: `A record with this ${field} already exists`
                };
            case 'P2025':
                // Record not found
                return {
                    statusCode: 404,
                    message: 'Record not found'
                };
            case 'P2003':
                // Foreign key constraint violation
                return {
                    statusCode: 400,
                    message: 'Invalid reference: related record does not exist'
                };
            case 'P2014':
                // Required relation violation
                return {
                    statusCode: 400,
                    message: 'Required relation is missing'
                };
            default:
                return {
                    statusCode: 400,
                    message: 'Database operation failed'
                };
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return {
            statusCode: 400,
            message: 'Invalid data provided'
        };
    }

    return null;
};

/**
 * Handle JWT errors
 */
const handleJWTError = (err) => {
    if (err.name === 'JsonWebTokenError') {
        return {
            statusCode: 401,
            message: 'Invalid token. Please log in again.'
        };
    }

    if (err.name === 'TokenExpiredError') {
        return {
            statusCode: 401,
            message: 'Your token has expired. Please log in again.'
        };
    }

    return null;
};

/**
 * Handle Multer errors
 */
const handleMulterError = (err) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return {
            statusCode: 400,
            message: 'File too large. Please upload a smaller file.'
        };
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return {
            statusCode: 400,
            message: 'Too many files. Please upload fewer files.'
        };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return {
            statusCode: 400,
            message: 'Unexpected file field.'
        };
    }

    return null;
};

/**
 * Main error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || err.statuscode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];

    // Handle specific error types
    const prismaError = handlePrismaError(err);
    if (prismaError) {
        statusCode = prismaError.statusCode;
        message = prismaError.message;
    }

    const jwtError = handleJWTError(err);
    if (jwtError) {
        statusCode = jwtError.statusCode;
        message = jwtError.message;
    }

    const multerError = handleMulterError(err);
    if (multerError) {
        statusCode = multerError.statusCode;
        message = multerError.message;
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    }

    // Handle syntax errors in JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON in request body';
    }

    // Build response
    const response = {
        success: false,
        statusCode,
        message
    };

    // Add errors array if present
    if (errors.length > 0) {
        response.errors = errors;
    }

    // Development mode: include additional debug info
    if (config.env === 'development') {
        response.error = {
            name: err.name,
            message: err.message
        };
        response.stack = err.stack;
    } else {
        // Production mode: log the error but don't expose details
        if (statusCode === 500) {
            // Log server errors for monitoring
            console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`, {
                message: err.message,
                stack: err.stack,
                userId: req.user?.id
            });
            // Don't expose internal error details
            response.message = 'An unexpected error occurred. Please try again later.';
        }
    }

    res.status(statusCode).json(response);
}; 