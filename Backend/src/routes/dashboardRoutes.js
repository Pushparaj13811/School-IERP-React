import express from 'express';
import { 
    getAdminDashboard, 
    getTeacherDashboard, 
    getStudentDashboard, 
    getParentDashboard 
} from '../controller/dashboardController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/v1/dashboard/admin
 * @desc    Get admin dashboard data
 * @access  Private (Admin only)
 */
router.get('/admin', 
    protect, 
    restrictTo('ADMIN'), 
    getAdminDashboard
);

/**
 * @route   GET /api/v1/dashboard/teacher
 * @desc    Get teacher dashboard data
 * @access  Private (Teacher only)
 */
router.get('/teacher', 
    protect, 
    restrictTo('TEACHER'), 
    getTeacherDashboard
);

/**
 * @route   GET /api/v1/dashboard/student
 * @desc    Get student dashboard data
 * @access  Private (Student only)
 */
router.get('/student', 
    protect, 
    restrictTo('STUDENT'), 
    getStudentDashboard
);

/**
 * @route   GET /api/v1/dashboard/parent
 * @desc    Get parent dashboard data
 * @access  Private (Parent only)
 */
router.get('/parent', 
    protect, 
    restrictTo('PARENT'), 
    getParentDashboard
);

export default router; 