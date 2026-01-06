import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { addSubjectResult, getSubjectResults, getOverallResult, calculateOverallResult, recalculateResults, toggleSubjectResultLock, bulkToggleResultLock } from '../controller/resultController.js';
import { validate, schemas, sanitize, validateId } from '../middlewares/validateRequest.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for result modifications
const resultLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
    message: 'Too many result modification requests, please try again later.'
});

// Apply sanitization to all routes
router.use(sanitize);

// Protect all routes
router.use(protect);

// Add subject result (teachers only) - with validation and rate limiting
router.post('/subject', restrictTo('TEACHER', 'ADMIN'), resultLimiter, validate(schemas.result), addSubjectResult);

// Get subject results - restricted to users who can view them
router.get('/subject', restrictTo('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'), getSubjectResults);

// Get overall result
router.get('/overall', restrictTo('TEACHER', 'ADMIN', 'STUDENT', 'PARENT'), getOverallResult);

// Calculate overall result (teachers and admins only)
router.post('/overall/calculate', restrictTo('TEACHER', 'ADMIN'), resultLimiter, calculateOverallResult);

// Recalculate results for a student or class (teachers and admins only)
router.post('/recalculate', restrictTo('TEACHER', 'ADMIN'), resultLimiter, recalculateResults);

// Toggle lock status for a subject result (admin only)
router.patch('/subject/:id/lock', restrictTo('ADMIN'), validateId, toggleSubjectResultLock);

// Bulk toggle lock status for multiple results (admin only)
router.post('/bulk-lock', restrictTo('ADMIN'), bulkToggleResultLock);

export default router; 