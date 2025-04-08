import express from 'express';
import { register, login, forgotPassword, resetPassword, logout } from '../controller/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below
router.post('/logout', logout);

export default router; 