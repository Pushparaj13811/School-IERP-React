import express from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import {
    assignClassTeacher,
    getAllClassTeacherAssignments,
    removeClassTeacherAssignment
} from '../controller/teacherController.js';

const router = express.Router();

// Class teacher assignment routes
router.post('/class-teacher', authenticate, authorize(['ADMIN']), assignClassTeacher);
router.get('/class-teacher/assignments', authenticate, getAllClassTeacherAssignments);
router.delete('/class-teacher/assignments/:id', authenticate, authorize(['ADMIN']), removeClassTeacherAssignment);

export default router; 