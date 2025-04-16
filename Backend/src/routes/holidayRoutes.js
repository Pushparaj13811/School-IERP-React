import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { addHoliday, getHolidays, updateHoliday, deleteHoliday } from '../controller/holidayController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Add holiday (admin only)
router.post('/', restrictTo('ADMIN'), addHoliday);

// Get holidays
router.get('/', getHolidays);

// Update holiday (admin only)
router.patch('/:id', restrictTo('ADMIN'), updateHoliday);

// Delete holiday (admin only)
router.delete('/:id', restrictTo('ADMIN'), deleteHoliday);

export default router; 