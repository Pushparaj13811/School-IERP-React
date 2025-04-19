import express from 'express';
import timetableController from '../controller/timetableController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Time slots
router.get('/timeslots', timetableController.getAllTimeSlots);
router.post('/timeslots', restrictTo('ADMIN'), timetableController.createTimeSlot);
router.delete('/timeslots/:id', restrictTo('ADMIN'), timetableController.deleteTimeSlot);

// Timetable routes
router.post('/', restrictTo('ADMIN'), timetableController.createTimetable);
router.get('/id/:id', timetableController.getTimetableById);
router.get('/query', timetableController.getTimetable);

// Student timetable
router.get('/student', restrictTo('STUDENT', 'ADMIN'), timetableController.getStudentTimetable);
router.get('/student/:studentId', restrictTo('ADMIN', 'TEACHER'), timetableController.getStudentTimetable);

// Teacher timetable
router.get('/teacher', restrictTo('TEACHER', 'ADMIN'), timetableController.getTeacherTimetable);
router.get('/teacher/:teacherId', restrictTo('ADMIN'), timetableController.getTeacherTimetable);

// Period management
router.post('/period', restrictTo('ADMIN'), timetableController.addPeriod);
router.delete('/period/:id', restrictTo('ADMIN'), timetableController.deletePeriod);

export default router; 