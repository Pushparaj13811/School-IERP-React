import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { addAchievement, getAchievements, updateAchievement, deleteAchievement } from '../controller/achievementController.js';
import { validate, schemas, sanitize, validateId } from '../middlewares/validateRequest.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for achievement creation
const achievementLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    message: 'Too many achievement requests, please try again later.'
});

// Apply sanitization to all routes
router.use(sanitize);

// Protect all routes
router.use(protect);

// Add achievement (teachers, students, and admins)
router.post('/', restrictTo('TEACHER', 'STUDENT', 'ADMIN'), achievementLimiter, validate(schemas.createAchievement), addAchievement);

// Get achievements (any authenticated user)
router.get('/', getAchievements);

// Update achievement (teachers, students, and admins - ownership checked in controller)
router.patch('/:id', restrictTo('TEACHER', 'STUDENT', 'ADMIN'), validateId, updateAchievement);

// Delete achievement (teachers, students, and admins - ownership checked in controller)
router.delete('/:id', restrictTo('TEACHER', 'STUDENT', 'ADMIN'), validateId, deleteAchievement);

export default router; 