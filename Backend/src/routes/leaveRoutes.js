import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    createLeaveApplication,
    getLeaveApplications,
    getLeaveApplicationById,
    updateLeaveStatus,
    getLeaveTypes,
    createLeaveType
} from '../controller/leaveController.js';
import { validate, schemas, sanitize, validateId, validatePagination } from '../middlewares/validateRequest.js';
import { createRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Rate limiter for leave applications
const leaveApplicationLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many leave applications, please try again later.'
});

// Apply sanitization to all routes
router.use(sanitize);

// Protect all routes
router.use(protect);

// Leave types routes
router.get('/types', getLeaveTypes);
router.post('/types', restrictTo('ADMIN'), createLeaveType);

// Leave applications routes
router.post('/', leaveApplicationLimiter, validate(schemas.createLeave), createLeaveApplication);
router.get('/', validatePagination, getLeaveApplications);
router.get('/:id', validateId, getLeaveApplicationById);
// Status updates - ADMIN, TEACHER, or class teacher only (verified in controller)
router.patch('/:id/status', restrictTo('ADMIN', 'TEACHER'), validateId, validate(schemas.updateLeaveStatus), updateLeaveStatus);

export default router; 