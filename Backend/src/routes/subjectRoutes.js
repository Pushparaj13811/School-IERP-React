import express from 'express';
import {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    getSubjectsByClassId,
    assignSubjectToClasses
} from '../controller/subjectController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Subject routes
router
    .route('/')
    .post(restrictTo('ADMIN'), createSubject)
    .get(getAllSubjects);

router
    .route('/:id')
    .get(getSubjectById)
    .patch(restrictTo('ADMIN'), updateSubject)
    .delete(restrictTo('ADMIN'), deleteSubject);

// Get subjects by class
router.get('/class/:classId', getSubjectsByClassId);

// Assign subject to classes
router.post('/:subjectId/assign-classes', restrictTo('ADMIN'), assignSubjectToClasses);

export default router; 