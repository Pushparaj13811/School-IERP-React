import { Router } from 'express';
import {
    generateAttendanceReport,
    generatePerformanceReport,
    generateFinancialReport,
    generateExamReport,
    getRecentReports,
    downloadReport,
    getAttendanceReportDataController,
    getPerformanceReportDataController,
    getChartData
} from '../controller/reportController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { sanitize, validate, schemas } from '../middlewares/validateRequest.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Rate limiter for report generation (computationally expensive)
const reportGenerationLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many report generation requests, please try again later.'
});

// Rate limiter for report data fetching
const reportDataLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30,
    message: 'Too many report data requests, please try again later.'
});

// Apply sanitization to all routes
router.use(sanitize);

// All routes are protected and require authentication
router.use(protect);

// Generate attendance report - accessible by admins and teachers
router.post(
    '/attendance',
    restrictTo('ADMIN', 'TEACHER'),
    reportGenerationLimiter,
    generateAttendanceReport
);

// Generate performance report - accessible by admins only
router.post(
    '/performance',
    restrictTo('ADMIN'),
    reportGenerationLimiter,
    generatePerformanceReport
);

// Generate financial report - accessible by admins only
router.post(
    '/financial',
    restrictTo('ADMIN'),
    reportGenerationLimiter,
    generateFinancialReport
);

// Generate exam report - accessible by admins and teachers
router.post(
    '/exam',
    restrictTo('ADMIN', 'TEACHER'),
    reportGenerationLimiter,
    generateExamReport
);

// Get user's recent reports
router.get(
    '/recent',
    getRecentReports
);

// Download a report - accessible by the user who generated it (handled in controller)
router.get(
    '/download/:reportId',
    downloadReport
);

// --- Data Fetching Routes with rate limiting ---
router.get('/data/attendance', restrictTo('ADMIN', 'TEACHER'), reportDataLimiter, validate(schemas.reportQuery, 'query'), getAttendanceReportDataController);
router.get('/data/performance', restrictTo('ADMIN'), reportDataLimiter, validate(schemas.reportQuery, 'query'), getPerformanceReportDataController);

// Chart data route for visualizations
router.get('/chart/:type', reportDataLimiter, getChartData);

export default router; 