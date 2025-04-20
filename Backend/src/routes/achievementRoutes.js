import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { addAchievement, getAchievements, updateAchievement, deleteAchievement } from '../controller/achievementController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Add achievement (teachers and students)
router.post('/', restrictTo('TEACHER', 'STUDENT'), addAchievement);

// Get achievements
router.get('/', getAchievements);

// Update achievement (teachers and students)
router.patch('/:id', restrictTo('TEACHER', 'STUDENT'), updateAchievement);

// Delete achievement (teachers and students)
router.delete('/:id', restrictTo('TEACHER', 'STUDENT'), deleteAchievement);

export default router; 