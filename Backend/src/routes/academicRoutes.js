import express from 'express';
import {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
    getClasses,
    getSubjects,
    getDesignations
} from '../controller/classController.js';
import { getSectionsByClass } from '../controller/sectionController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Class Routes
router
    .route('/classes')
    .post(restrictTo('ADMIN'), createClass)
    .get(getAllClasses);

router
    .route('/classes/:id')
    .get(getClassById)
    .patch(restrictTo('ADMIN'), updateClass)
    .delete(restrictTo('ADMIN'), deleteClass);

// Legacy routes for backward compatibility
router.get('/classes/:classId/sections', getSectionsByClass);

// Additional routes
router.get('/subjects', getSubjects);
router.get('/designations', getDesignations);

export default router; 