import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { ApiError } from '../utils/apiError.js';
import { prisma } from '../databases/prismaClient.js';

export const protect = async (req, res, next) => {
    try {
        // 1) Get token from header or cookie
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new ApiError(401, 'You are not logged in! Please log in to get access.'));
        }

        // 2) Verify token
        const decoded = jwt.verify(token, config.jwtSecret);

        // 3) Check if user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                student: {
                    select: {
                        id: true,
                        name: true,
                        classId: true,
                        sectionId: true
                    }
                },
                teacher: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                admin: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!user) {
            return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
        }

        // 4) Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        next(new ApiError(401, 'Invalid token or authorization error.'));
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'You do not have permission to perform this action'));
        }
        next();
    };
}; 