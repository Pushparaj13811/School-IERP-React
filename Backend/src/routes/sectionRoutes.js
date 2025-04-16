import express from 'express';
import {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    deleteSection,
    getSectionsByClass
} from '../controller/sectionController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Section Routes
router
    .route('/')
    .post(restrictTo('ADMIN'), createSection)
    .get(getAllSections);

router
    .route('/:id')
    .get(getSectionById)
    .patch(restrictTo('ADMIN'), updateSection)
    .delete(restrictTo('ADMIN'), deleteSection);

// Get sections by class ID
router.get('/class/:classId', getSectionsByClass);

export default router; 