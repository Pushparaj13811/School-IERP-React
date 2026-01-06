import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    createFeedback,
    getAllFeedback,
    getUserFeedback,
    getFeedbackTypes,
    deleteFeedback
} from '../controller/feedbackController.js';
import { sanitize, validate, schemas, validateId } from '../middlewares/validateRequest.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for feedback submission
const feedbackLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many feedback submissions, please try again later.'
});

// Apply sanitization to all routes
router.use(sanitize);

// Protect all routes
router.use(protect);

// Get feedback types
router.get('/types', getFeedbackTypes);

// Get user's own feedback
router.get('/', getUserFeedback);

// Get all feedback (admin only)
router.get('/all', restrictTo('ADMIN'), getAllFeedback);

// Create feedback
router.post('/', feedbackLimiter, validate(schemas.createFeedback), createFeedback);

// Delete feedback
router.delete('/:id', validateId, deleteFeedback);

export default router;
