import express from 'express';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controller/announcementController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Routes accessible only to teachers and admins
router.post('/', restrictTo('TEACHER', 'ADMIN'), createAnnouncement);
router.put('/:id', restrictTo('TEACHER', 'ADMIN'), updateAnnouncement);
router.delete('/:id', restrictTo('TEACHER', 'ADMIN'), deleteAnnouncement);

export default router; 