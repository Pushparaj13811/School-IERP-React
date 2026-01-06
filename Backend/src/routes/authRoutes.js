import express from 'express';
import { register, login, forgotPassword, resetPassword, logout, refreshToken } from '../controller/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.js';
import { validate, schemas, sanitize } from '../middlewares/validateRequest.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitize);

// Public routes with stricter rate limiting and validation
router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/forgot-password', passwordResetLimiter, validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, validate(schemas.resetPassword), resetPassword);

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

export default router; 