import { prisma } from '../databases/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';
import { generateRandomPassword } from '../utils/passwordGenerator.js';

export class UserService {
    async getUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                student: {
                    include: {
                        class: true,
                        section: true,
                        parent: true,
                        address: true,
                        profilePicture: true,
                        subjectAttendance: true,
                        monthlyAttendance: true,
                        subjectResults: {
                            include: {
                                subject: true
                            }
                        },
                        overallResults: true,
                        leaveApplications: true,
                        achievements: true
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
                        },
                        periods: true,
                        classResults: true,
                        leaveApplications: true,
                        achievements: true,
                        announcements: true
                    }
                },
                admin: {
                    include: {
                        address: true,
                        profilePicture: true,
                        leaveApplications: true,
                        announcements: true
                    }
                },
                parent: {
                    include: {
                        address: true,
                        profilePicture: true,
                        children: {
                            include: {
                                class: true,
                                section: true,
                                subjectResults: true,
                                overallResults: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return user;
    }

    async updateProfile(userId, data) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Update address if provided
        if (data.address) {
            let addressId;
            switch (user.role) {
                case 'STUDENT':
                    addressId = user.student?.addressId;
                    break;
                case 'TEACHER':
                    addressId = user.teacher?.addressId;
                    break;
                case 'ADMIN':
                    addressId = user.admin?.addressId;
                    break;
                case 'PARENT':
                    addressId = user.parent?.addressId;
                    break;
            }

            if (addressId) {
                await prisma.address.update({
                    where: { id: addressId },
                    data: data.address
                });
            }
        }

        // Update role-specific profile
        switch (user.role) {
            case 'STUDENT':
                return await this.updateStudentProfile(user.student.id, data);
            case 'TEACHER':
                return await this.updateTeacherProfile(user.teacher.id, data);
            case 'ADMIN':
                return await this.updateAdminProfile(user.admin.id, data);
            case 'PARENT':
                return await this.updateParentProfile(user.parent.id, data);
            default:
                throw new AppError(400, 'Invalid user role');
        }
    }

    async updatePassword(userId, currentPassword, newPassword) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            throw new AppError(401, 'Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
    }

    async updateProfilePicture(userId, fileUrl) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Create new profile picture
        const profilePicture = await prisma.profilePicture.create({
            data: { url: fileUrl }
        });

        // Update based on role
        switch (user.role) {
            case 'STUDENT':
                return await prisma.student.update({
                    where: { id: user.student.id },
                    data: { profilePictureId: profilePicture.id },
                    include: {
                        profilePicture: true,
                        class: true,
                        section: true,
                        address: true
                    }
                });
            case 'TEACHER':
                return await prisma.teacher.update({
                    where: { id: user.teacher.id },
                    data: { profilePictureId: profilePicture.id },
                    include: {
                        profilePicture: true,
                        designation: true,
                        address: true
                    }
                });
            case 'ADMIN':
                return await prisma.admin.update({
                    where: { id: user.admin.id },
                    data: { profilePictureId: profilePicture.id },
                    include: {
                        profilePicture: true,
                        address: true
                    }
                });
            case 'PARENT':
                return await prisma.parent.update({
                    where: { id: user.parent.id },
                    data: { profilePictureId: profilePicture.id },
                    include: {
                        profilePicture: true,
                        address: true,
                        children: {
                            include: {
                                class: true,
                                section: true
                            }
                        }
                    }
                });
            default:
                throw new AppError(400, 'Invalid user role');
        }
    }

    // Helper method for updating student profile
    async updateStudentProfile(studentId, data) {
        const updateData = {
            name: data.name,
            contactNo: data.contactNo,
            emergencyContact: data.emergencyContact,
            bloodGroup: data.bloodGroup,
            religion: data.religion
        };

        return await prisma.student.update({
            where: { id: studentId },
            data: updateData,
            include: {
                class: true,
                section: true,
                parent: true,
                address: true,
                profilePicture: true
            }
        });
    }

    // Helper method for updating teacher profile
    async updateTeacherProfile(teacherId, data) {
        const updateData = {
            name: data.name,
            contactNo: data.contactNo,
            emergencyContact: data.emergencyContact,
            bio: data.bio
        };

        return await prisma.teacher.update({
            where: { id: teacherId },
            data: updateData,
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
        });
    }

    // Helper method for updating admin profile
    async updateAdminProfile(adminId, data) {
        const updateData = {
            fullName: data.fullName,
            phone: data.phone,
            emergencyContact: data.emergencyContact,
            bio: data.bio
        };

        return await prisma.admin.update({
            where: { id: adminId },
            data: updateData,
            include: {
                address: true,
                profilePicture: true
            }
        });
    }

    // Helper method for updating parent profile
    async updateParentProfile(parentId, data) {
        const updateData = {
            name: data.name,
            contactNo: data.contactNo
        };

        return await prisma.parent.update({
            where: { id: parentId },
            data: updateData,
            include: {
                address: true,
                profilePicture: true,
                children: {
                    include: {
                        class: true,
                        section: true
                    }
                }
            }
        });
    }

    async createUserWithAutoPassword(email, role, userData) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new AppError(400, 'User with this email already exists');
        }

        // Generate random password
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                ...userData
            }
        });

        return { user, password };
    }

    async createStudentWithAutoPassword(email, studentData) {
        const { user, password } = await this.createUserWithAutoPassword(email, 'STUDENT', studentData);
        
        // Create student profile
        await prisma.student.create({
            data: {
                userId: user.id,
                ...studentData
            }
        });

        return { user, password };
    }

    async createParentWithAutoPassword(email, parentData) {
        const { user, password } = await this.createUserWithAutoPassword(email, 'PARENT', parentData);
        
        // Create parent profile
        await prisma.parent.create({
            data: {
                userId: user.id,
                ...parentData
            }
        });

        return { user, password };
    }

    async createTeacherWithAutoPassword(email, teacherData) {
        const { user, password } = await this.createUserWithAutoPassword(email, 'TEACHER', teacherData);
        
        // Create teacher profile
        await prisma.teacher.create({
            data: {
                userId: user.id,
                ...teacherData
            }
        });

        return { user, password };
    }

    async getUserByEmail(email) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        return user;
    }
}