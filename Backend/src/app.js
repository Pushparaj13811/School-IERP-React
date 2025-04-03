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

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
    origin: config.clientUrl,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
