import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { addSubjectResult, getSubjectResults, getOverallResult, calculateOverallResult } from '../controller/resultController.js';

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

export default router; 