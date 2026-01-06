/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Internal Server Error",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        // Keep statuscode for backward compatibility
        this.statuscode = statusCode;
        this.errors = errors;
        this.data = null;
        this.message = message;
        this.success = false;
        this.isOperational = true; // Distinguishes operational errors from programming errors

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Create a 400 Bad Request error
     */
    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    /**
     * Create a 401 Unauthorized error
     */
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    /**
     * Create a 403 Forbidden error
     */
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    /**
     * Create a 404 Not Found error
     */
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    /**
     * Create a 409 Conflict error
     */
    static conflict(message) {
        return new ApiError(409, message);
    }

    /**
     * Create a 422 Unprocessable Entity error
     */
    static unprocessable(message, errors = []) {
        return new ApiError(422, message, errors);
    }

    /**
     * Create a 429 Too Many Requests error
     */
    static tooManyRequests(message = 'Too many requests') {
        return new ApiError(429, message);
    }

    /**
     * Create a 500 Internal Server Error
     */
    static internal(message = 'Internal Server Error') {
        return new ApiError(500, message);
    }
}

export { ApiError };