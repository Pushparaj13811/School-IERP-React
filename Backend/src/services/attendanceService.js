import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler.js';

const prisma = new PrismaClient();

export class AttendanceService {
    async markSubjectAttendance(studentId, subjectId, isPresent) {
        try {
            // Get current date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if attendance already exists for today
            const existingAttendance = await prisma.subjectAttendance.findFirst({
                where: {
                    studentId,
                    subjectId,
                    attendanceDate: today
                }
            });

            if (existingAttendance) {
                throw new AppError(400, 'Attendance already marked for today');
            }

            // Create new attendance record
            const attendance = await prisma.subjectAttendance.create({
                data: {
                    studentId,
                    subjectId,
                    lectureConducted: 1,
                    presentCount: isPresent ? 1 : 0,
                    absentCount: isPresent ? 0 : 1,
                    attendanceDate: today
                }
            });

            // Update monthly attendance
            await this.updateMonthlyAttendance(studentId, today);

            return attendance;
        } catch (error) {
            throw error;
        }
    }

    async getSubjectAttendance(studentId, subjectId, startDate, endDate) {
        try {
            const where = {
                studentId,
                subjectId
            };

            if (startDate && endDate) {
                where.attendanceDate = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }

            const attendance = await prisma.subjectAttendance.findMany({
                where,
                orderBy: {
                    attendanceDate: 'desc'
                }
            });

            return attendance;
        } catch (error) {
            throw error;
        }
    }

    async getMonthlyAttendance(studentId, month, year) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const attendance = await prisma.monthlyAttendance.findFirst({
                where: {
                    studentId,
                    month: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            return attendance;
        } catch (error) {
            throw error;
        }
    }

    async getClassAttendance(classId, sectionId, date) {
        try {
            const attendanceDate = new Date(date);
            attendanceDate.setHours(0, 0, 0, 0);

            const students = await prisma.student.findMany({
                where: {
                    classId,
                    sectionId
                },
                include: {
                    subjectAttendance: {
                        where: {
                            attendanceDate
                        }
                    }
                }
            });

            return students;
        } catch (error) {
            throw error;
        }
    }

    async updateMonthlyAttendance(studentId, date) {
        try {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            // Get all subject attendance for the month
            const subjectAttendance = await prisma.subjectAttendance.findMany({
                where: {
                    studentId,
                    attendanceDate: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            // Calculate totals
            const presentCount = subjectAttendance.reduce((sum, record) => sum + record.presentCount, 0);
            const absentCount = subjectAttendance.reduce((sum, record) => sum + record.absentCount, 0);

            // Update or create monthly attendance
            await prisma.monthlyAttendance.upsert({
                where: {
                    studentId_month: {
                        studentId,
                        month: startOfMonth
                    }
                },
                update: {
                    presentCount,
                    absentCount
                },
                create: {
                    studentId,
                    month: startOfMonth,
                    presentCount,
                    absentCount
                }
            });
        } catch (error) {
            throw error;
        }
    }
} 