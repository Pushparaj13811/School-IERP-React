import { AppError } from './errorHandler.js';

export const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
}; 