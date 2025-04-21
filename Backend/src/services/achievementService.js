import { prisma } from '../databases/prismaClient.js';
import { ApiError } from '../utils/apiError.js';

export class AchievementService {
    async addAchievement(data) {
        try {
            const { activityType, title, organization, numberOfDays, fromDate, toDate, description, testimonial, achievementTypeId, certificateUrl, studentId, teacherId } = data;

            // Validate date range
            const from = new Date(fromDate);
            const to = new Date(toDate);

            if (from > to) {
                throw new ApiError(400, 'From date cannot be after to date');
            }

            // Validate achievement type
            const achievementType = await prisma.achievementType.findUnique({
                where: { id: achievementTypeId }
            });

            if (!achievementType) {
                throw new ApiError(400, 'Invalid achievement type');
            }

            // Validate student or teacher exists
            if (studentId) {
                const student = await prisma.student.findUnique({
                    where: { id: studentId }
                });

                if (!student) {
                    throw new ApiError(400, 'Student not found');
                }
            }

            if (teacherId) {
                const teacher = await prisma.teacher.findUnique({
                    where: { id: teacherId }
                });

                if (!teacher) {
                    throw new ApiError(400, 'Teacher not found');
                }
            }

            // Create achievement
            const achievement = await prisma.achievement.create({
                data: {
                    activityType,
                    title,
                    organization,
                    numberOfDays,
                    fromDate: from,
                    toDate: to,
                    description,
                    testimonial,
                    achievementTypeId,
                    certificateUrl,
                    studentId,
                    teacherId
                },
                include: {
                    achievementType: true,
                    student: true,
                    teacher: true
                }
            });

            return achievement;
        } catch (error) {
            throw error;
        }
    }

    async getAchievements(filters) {
        try {
            const { studentId, teacherId, achievementTypeId, startDate, endDate } = filters;

            const where = {};

            if (studentId) {
                where.studentId = parseInt(studentId);
            }

            if (teacherId) {
                where.teacherId = parseInt(teacherId);
            }

            if (achievementTypeId) {
                where.achievementTypeId = parseInt(achievementTypeId);
            }

            if (startDate && endDate) {
                where.OR = [
                    {
                        fromDate: {
                            lte: new Date(endDate)
                        },
                        toDate: {
                            gte: new Date(startDate)
                        }
                    }
                ];
            }

            const achievements = await prisma.achievement.findMany({
                where,
                include: {
                    achievementType: true,
                    student: true,
                    teacher: true
                },
                orderBy: {
                    fromDate: 'desc'
                }
            });

            return achievements;
        } catch (error) {
            throw error;
        }
    }

    async updateAchievement(id, updateData) {
        try {
            // Check if achievement exists
            const existingAchievement = await prisma.achievement.findUnique({
                where: { id: parseInt(id) }
            });

            if (!existingAchievement) {
                throw new ApiError(404, 'Achievement not found');
            }

            // Validate date range if dates are being updated
            if (updateData.fromDate || updateData.toDate) {
                const from = new Date(updateData.fromDate || existingAchievement.fromDate);
                const to = new Date(updateData.toDate || existingAchievement.toDate);

                if (from > to) {
                    throw new ApiError(400, 'From date cannot be after to date');
                }
            }

            // Update achievement
            const achievement = await prisma.achievement.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    achievementType: true,
                    student: true,
                    teacher: true
                }
            });

            return achievement;
        } catch (error) {
            throw error;
        }
    }

    async deleteAchievement(id) {
        try {
            // Check if achievement exists
            const existingAchievement = await prisma.achievement.findUnique({
                where: { id: parseInt(id) }
            });

            if (!existingAchievement) {
                throw new ApiError(404, 'Achievement not found');
            }

            // Delete achievement
            await prisma.achievement.delete({
                where: { id: parseInt(id) }
            });
        } catch (error) {
            throw error;
        }
    }
} 