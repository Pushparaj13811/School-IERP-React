import express from 'express';
import timetableController from '../controller/timetableController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, schemas, sanitize, validateId } from '../middlewares/validateRequest.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitize);

// Protect all routes after this middleware
router.use(protect);

// Time slots
router.get('/timeslots', timetableController.getAllTimeSlots);
router.post('/timeslots', restrictTo('ADMIN'), validate(schemas.createTimeSlot), timetableController.createTimeSlot);
router.delete('/timeslots/:id', restrictTo('ADMIN'), validateId, timetableController.deleteTimeSlot);

// Timetable routes
router.post('/', restrictTo('ADMIN'), validate(schemas.createTimetable), timetableController.createTimetable);
router.get('/id/:id', validateId, timetableController.getTimetableById);
router.get('/query', timetableController.getTimetable);

// Student timetable
router.get('/student', restrictTo('STUDENT', 'ADMIN', 'PARENT'), timetableController.getStudentTimetable);
router.get('/student/:studentId', restrictTo('ADMIN', 'TEACHER'), timetableController.getStudentTimetable);

// Teacher timetable
router.get('/teacher', restrictTo('TEACHER', 'ADMIN'), timetableController.getTeacherTimetable);
router.get('/teacher/:teacherId', restrictTo('ADMIN'), timetableController.getTeacherTimetable);

// Period management
router.post('/period', restrictTo('ADMIN'), validate(schemas.addPeriod), timetableController.addPeriod);
router.delete('/period/:id', restrictTo('ADMIN'), validateId, timetableController.deletePeriod);

export default router; 