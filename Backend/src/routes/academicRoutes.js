import express from 'express';
import {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass
} from '../controller/classController.js';
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

// Class Routes
router
    .route('/classes')
    .post(protect, restrictTo('ADMIN'), createClass)
    .get(protect, getAllClasses);

router
    .route('/classes/:id')
    .get(protect, getClassById)
    .patch(protect, restrictTo('ADMIN'), updateClass)
    .delete(protect, restrictTo('ADMIN'), deleteClass);

// Section Routes
router
    .route('/sections')
    .post(protect, restrictTo('ADMIN'), createSection)
    .get(protect, getAllSections);

router
    .route('/sections/:id')
    .get(protect, getSectionById)
    .patch(protect, restrictTo('ADMIN'), updateSection)
    .delete(protect, restrictTo('ADMIN'), deleteSection);

router
    .route('/classes/:classId/sections')
    .get(protect, getSectionsByClass);

export default router; 