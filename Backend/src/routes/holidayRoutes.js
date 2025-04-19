import express from 'express';
import { 
  getAllHolidays, 
  getHolidayById, 
  createHoliday, 
  updateHoliday, 
  deleteHoliday,
  getHolidayTypes,
  createHolidayType,
  getUpcomingHolidays
} from '../controller/holidayController.js';
import { protect,restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes for all authenticated users (admins, teachers, students, parents)
router.get('/', protect, getAllHolidays);
router.get('/upcoming', protect, getUpcomingHolidays);
router.get('/types', protect, getHolidayTypes);
router.get('/:id', protect, getHolidayById);

// Admin-only routes
router.post('/', restrictTo('ADMIN'), createHoliday);
router.put('/:id', restrictTo('ADMIN'), updateHoliday);
router.delete('/:id', restrictTo('ADMIN'), deleteHoliday);
router.post('/types', restrictTo('ADMIN'), createHolidayType);

export default router; 