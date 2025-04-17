import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    assignClassTeacher,
    getAllClassTeacherAssignments,
    removeClassTeacherAssignment
} from '../controller/teacherController.js';

const router = express.Router();

// Class teacher assignment routes
router.post('/class-teacher', protect, restrictTo('ADMIN'), assignClassTeacher);
router.get('/class-teacher/assignments', protect, getAllClassTeacherAssignments);
router.delete('/class-teacher/assignments/:id', protect, restrictTo('ADMIN'), removeClassTeacherAssignment);

export default router; 