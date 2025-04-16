import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/config.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/holidays', holidayRoutes);
app.use('/api/v1/achievements', achievementRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
