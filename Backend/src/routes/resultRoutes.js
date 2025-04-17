import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { addSubjectResult, getSubjectResults, getOverallResult, calculateOverallResult, recalculateResults, toggleSubjectResultLock } from '../controller/resultController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Add subject result (teachers only)
router.post('/subject', restrictTo('TEACHER'), addSubjectResult);

// Get subject results
router.get('/subject', getSubjectResults);

// Get overall result
router.get('/overall', getOverallResult);

// Calculate overall result (teachers only)
router.post('/overall/calculate', restrictTo('TEACHER'), calculateOverallResult);

// Recalculate results for a student or class (teachers and admins only)
router.post('/recalculate', restrictTo('TEACHER', 'ADMIN'), recalculateResults);

// Toggle lock status for a subject result (admin only)
router.patch('/subject/:id/lock', restrictTo('ADMIN'), toggleSubjectResultLock);

export default router; 