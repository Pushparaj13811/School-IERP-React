import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../databases/prismaClient.js';
import { config } from '../config/config.js';
import { AppError } from '../middlewares/errorHandler.js';
import { emailService } from './emailService.js';
import {
    validateEmail,
    validatePassword,
    validateRole,
    validateAddress,
    validateStudentData,
    validateTeacherData,
    validateAdminData,
    validateParentData
} from '../utils/validators.js';

export class AuthService {
    signToken(id) {
        return jwt.sign({ id }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        });
    }

    async register(userData) {
        const { email, password, role, ...profileData } = userData;

        // Validate basic fields
        validateEmail(email);
        validatePassword(password);
        validateRole(role);
        validateAddress(profileData);

        // Validate role-specific data
        switch (role) {
            case 'STUDENT':
                validateStudentData(profileData);
                break;
            case 'TEACHER':
                validateTeacherData(profileData);
                break;
            case 'ADMIN':
                validateAdminData(profileData);
                break;
            case 'PARENT':
                validateParentData(profileData);
                break;
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new AppError(400, 'Email already in use');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

        // Create address record with default values for optional fields
        const address = await prisma.address.create({
            data: {
                addressLine1: profileData.addressLine1,
                addressLine2: profileData.addressLine2 || '',
                street: profileData.street || '',
                city: profileData.city,
                ward: profileData.ward,
                municipality: profileData.municipality,
                district: profileData.district,
                province: profileData.province,
                country: profileData.country || 'Nepal',
                postalCode: profileData.postalCode || '',
                isPermanent: profileData.isPermanent || false
            }
        });

        // Create user with role-specific profile
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                ...(role === 'STUDENT' && {
                    student: {
                        create: {
                            name: profileData.name,
                            nameAsPerBirth: profileData.nameAsPerBirth,
                            gender: profileData.gender.toUpperCase(),
                            email: email,
                            contactNo: profileData.contactNo,
                            emergencyContact: profileData.emergencyContact,
                            dateOfBirth: new Date(profileData.dateOfBirth),
                            dobNo: profileData.dobNo,
                            bloodGroup: profileData.bloodGroup,
                            nationality: profileData.nationality,
                            religion: profileData.religion,
                            rollNo: profileData.rollNo,
                            fatherName: profileData.fatherName,
                            motherName: profileData.motherName,
                            classId: parseInt(profileData.classId),
                            sectionId: parseInt(profileData.sectionId),
                            parentId: parseInt(profileData.parentId),
                            addressId: address.id
                        }
                    }
                }),
                ...(role === 'TEACHER' && {
                    teacher: {
                        create: {
                            name: profileData.name,
                            gender: profileData.gender,
                            contactNo: profileData.contactNo,
                            emergencyContact: profileData.emergencyContact,
                            dateOfBirth: new Date(profileData.dateOfBirth),
                            joinDate: new Date(profileData.joinDate),
                            bio: profileData.bio,
                            designationId: parseInt(profileData.designationId),
                            addressId: address.id
                        }
                    }
                }),
                ...(role === 'ADMIN' && {
                    admin: {
                        create: {
                            fullName: profileData.fullName,
                            phone: profileData.phone,
                            dateOfBirth: new Date(profileData.dateOfBirth),
                            emergencyContact: profileData.emergencyContact,
                            joinDate: new Date(profileData.joinDate),
                            bio: profileData.bio,
                            addressId: address.id
                        }
                    }
                }),
                ...(role === 'PARENT' && {
                    parent: {
                        create: {
                            name: profileData.name,
                            gender: profileData.gender.toUpperCase(),
                            email: email,
                            contactNo: profileData.contactNo,
                            addressId: address.id
                        }
                    }
                })
            },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        // Send welcome email
        try {
            await emailService.sendWelcomeEmail(user);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            // Continue with registration even if email fails
        }

        return user;
    }

    async login(email, password) {
        // Validate input
        validateEmail(email);
        validatePassword(password);

        // Check if user exists && password is correct
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                student: {
                    include: {
                        class: true,
                        section: true,
                        parent: true,
                        address: true,
                        profilePicture: true
                    }
                },
                teacher: {
                    include: {
                        designation: true,
                        address: true,
                        profilePicture: true,
                        subjects: {
                            include: {
                                subject: true
                            }
                        },
                        classes: {
                            include: {
                                class: true
                            }
                        }
                    }
                },
                admin: {
                    include: {
                        address: true,
                        profilePicture: true
                    }
                },
                parent: {
                    include: {
                        children: {
                            include: {
                                class: true,
                                section: true
                            }
                        },
                        address: true,
                        profilePicture: true
                    }
                }
            }
        });

        if (!user) {
            console.log(`Login attempt failed: No user found with email ${email}`);
            throw new AppError(401, 'Incorrect email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Login attempt failed: Invalid password for user ${email}`);
            throw new AppError(401, 'Incorrect email or password');
        }

        console.log(`Login successful for user ${email}`);
        return user;
    }

    async forgotPassword(email) {
        // Validate email
        validateEmail(email);

        // Get user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        if (!user) {
            throw new AppError(404, 'There is no user with this email address');
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

        return resetToken;
    }

    async resetPassword(token, newPassword) {
        // Validate password
        validatePassword(newPassword);

        if (!token) {
            throw new AppError(400, 'Please provide a valid reset token');
        }

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
            throw new AppError(400, 'Token is invalid or has expired');
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });

        return user;
    }
}

export const authService = new AuthService(); 