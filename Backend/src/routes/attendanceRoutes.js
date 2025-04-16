import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { markSubjectAttendance, getSubjectAttendance, getMonthlyAttendance, getClassAttendance } from '../controller/attendanceController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Mark subject attendance (teachers only)
router.post('/subject', restrictTo('TEACHER'), markSubjectAttendance);

// Get subject attendance
router.get('/subject', getSubjectAttendance);

// Get monthly attendance
router.get('/monthly', getMonthlyAttendance);

// Get class attendance (teachers only)
router.get('/class', restrictTo('TEACHER'), getClassAttendance);

export default router; 