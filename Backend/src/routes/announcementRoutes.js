import express from 'express';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controller/announcementController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { createUploader } from '../middlewares/multerMiddleware.js';

const router = express.Router();

// Create a specific uploader for announcement attachments
const announcementUploader = createUploader('announcements');

// Protect all routes
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Routes accessible only to teachers and admins
router.post('/', restrictTo('TEACHER', 'ADMIN'), announcementUploader.array('attachments', 5), createAnnouncement);
router.put('/:id', restrictTo('TEACHER', 'ADMIN'), announcementUploader.array('attachments', 5), updateAnnouncement);
router.delete('/:id', restrictTo('TEACHER', 'ADMIN'), deleteAnnouncement);

export default router; 