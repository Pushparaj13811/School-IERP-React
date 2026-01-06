import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    markSubjectAttendance,
    getSubjectAttendance,
    getMonthlyAttendance,
    getClassAttendance,
    markDailyAttendance,
    getDailyAttendance,
    getAttendanceStats,
    getPendingAttendanceDays
} from '../controller/attendanceController.js';
import { validate, schemas, sanitize } from '../middlewares/validateRequest.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for attendance marking
const attendanceLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
    message: 'Too many attendance requests, please try again later.'
});

// Apply sanitization to all routes
router.use(sanitize);

// Protect all routes
router.use(protect);

// Mark subject attendance (teachers only)
router.post('/subject', restrictTo('TEACHER'), attendanceLimiter, markSubjectAttendance);

// Get subject attendance
router.get('/subject', getSubjectAttendance);

// Daily attendance routes - TEACHER or ADMIN only
router.post('/daily', restrictTo('TEACHER', 'ADMIN', 'STUDENT'), attendanceLimiter, validate(schemas.markDailyAttendance), markDailyAttendance);
router.get('/daily', getDailyAttendance);

// Monthly attendance routes - with query validation
router.get('/monthly', validate(schemas.monthlyAttendanceQuery, 'query'), getMonthlyAttendance);

// Get class attendance (teachers only)
router.get('/class', restrictTo('TEACHER'), getClassAttendance);

// Statistics
router.get('/stats', getAttendanceStats);

// Pending attendance days route (teacher only)
router.get('/pending', restrictTo('TEACHER'), getPendingAttendanceDays);

export default router; 