import { ApiError } from '../utils/apiError.js';

export const notFoundHandler = (req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
}; 