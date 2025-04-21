import { Router } from 'express';
import {
    generateAttendanceReport,
    generatePerformanceReport,
    generateFinancialReport,
    generateExamReport,
    getRecentReports,
    downloadReport,
    getAttendanceReportDataController,
    getPerformanceReportDataController
} from '../controller/reportController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes are protected and require authentication
router.use(protect);

// Generate attendance report - accessible by admins and teachers
router.post(
    '/attendance',
    restrictTo('ADMIN', 'TEACHER'),
    generateAttendanceReport
);

// Generate performance report - accessible by admins only
router.post(
    '/performance',
    restrictTo('ADMIN'),
    generatePerformanceReport
);

// Generate financial report - accessible by admins only
router.post(
    '/financial',
    restrictTo('ADMIN'),
    generateFinancialReport
);

// Generate exam report - accessible by admins and teachers
router.post(
    '/exam',
    restrictTo('ADMIN', 'TEACHER'),
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

// --- NEW Data Fetching Routes ---
router.get('/data/attendance', restrictTo('ADMIN', 'TEACHER'), getAttendanceReportDataController);
router.get('/data/performance', restrictTo('ADMIN'), getPerformanceReportDataController);
// Add routes for financial and exam data later if needed

export default router; 