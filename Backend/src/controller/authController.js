import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../databases/prismaClient.js';
import { config } from '../config/config.js';
import { AppError } from '../middlewares/errorHandler.js';
import { emailService } from '../services/emailService.js';

const signToken = (id) => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    // Remove password from output
    user.password = undefined;

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict'
    });

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};

export const register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return next(new AppError(400, 'Email already in use'));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });

        // Send welcome email
        await emailService.sendWelcomeEmail(user);

        createSendToken(user, 201, res);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return next(new AppError(400, 'Please provide email and password'));
        }

        // Check if user exists && password is correct
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError(401, 'Incorrect email or password'));
        }

        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Get user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return next(new AppError(404, 'There is no user with this email address'));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Save reset token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken,
                passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            }
        });

        // Send reset email
        await emailService.sendPasswordResetEmail(user, resetToken);

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return next(new AppError(400, 'Token is invalid or has expired'));
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });

        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}; 