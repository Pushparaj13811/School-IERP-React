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

const router = express.Router();

// Protect all routes
router.use(protect);

// Leave types routes
router.get('/types', getLeaveTypes);
router.post('/types', restrictTo('ADMIN'), createLeaveType);

// Leave applications routes
router.post('/', createLeaveApplication);
router.get('/', getLeaveApplications);
router.get('/:id', getLeaveApplicationById);
router.patch('/:id/status', updateLeaveStatus);

export default router; 