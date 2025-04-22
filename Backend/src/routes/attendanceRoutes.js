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

const router = express.Router();

// Protect all routes
router.use(protect);

// Mark subject attendance (teachers only)
router.post('/subject', restrictTo('TEACHER'), markSubjectAttendance);

// Get subject attendance
router.get('/subject', getSubjectAttendance);

// Daily attendance routes
router.post('/daily', markDailyAttendance);
router.get('/daily', getDailyAttendance);

// Monthly attendance routes
router.get('/monthly', getMonthlyAttendance);

// Get class attendance (teachers only)
router.get('/class', restrictTo('TEACHER'), getClassAttendance);

// Statistics
router.get('/stats', getAttendanceStats);

// Pending attendance days route (teacher only)
router.get('/pending', restrictTo('TEACHER'), getPendingAttendanceDays);

export default router; 