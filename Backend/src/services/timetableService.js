import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError.js';

const prisma = new PrismaClient();

class TimetableService {
    /**
     * Create a new timetable for a class and section
     */
    async createTimetable(timetableData) {
        try {
            const { classId, sectionId, academicYear, term } = timetableData;

            // Check if class exists
            const classExists = await prisma.class.findUnique({
                where: { id: classId }
            });

            if (!classExists) {
                throw new ApiError('Class not found', 404);
            }

            // Check if section exists
            const sectionExists = await prisma.section.findUnique({
                where: { id: sectionId }
            });

            if (!sectionExists) {
                throw new ApiError('Section not found', 404);
            }

            // Check if timetable already exists
            const existingTimetable = await prisma.timetable.findFirst({
                where: {
                    classId,
                    sectionId,
                    academicYear,
                    term
                }
            });

            if (existingTimetable) {
                throw new ApiError('Timetable already exists for this class, section, academic year and term', 400);
            }

            // Create new timetable
            const timetable = await prisma.timetable.create({
                data: {
                    classId,
                    sectionId,
                    academicYear,
                    term
                }
            });

            return timetable;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error creating timetable', 500);
        }
    }

    /**
     * Get timetable by ID
     */
    async getTimetableById(timetableId) {
        try {
            const timetable = await prisma.timetable.findUnique({
                where: { id: parseInt(timetableId) },
                include: {
                    class: true,
                    section: true,
                    periods: {
                        include: {
                            timeSlot: true,
                            subject: true,
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                            profilePicture: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!timetable) {
                throw new ApiError('Timetable not found', 404);
            }

            return timetable;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error retrieving timetable', 500);
        }
    }

    /**
     * Get timetable by class, section, academic year and term
     */
    async getTimetable(classId, sectionId, academicYear, term) {
        try {
            const timetable = await prisma.timetable.findFirst({
                where: {
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId),
                    academicYear,
                    term
                },
                include: {
                    class: true,
                    section: true,
                    periods: {
                        include: {
                            timeSlot: true,
                            subject: true,
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                            profilePicture: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!timetable) {
                throw new ApiError('Timetable not found', 404);
            }

            return timetable;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error retrieving timetable', 500);
        }
    }

    /**
     * Get student's timetable
     */
    async getStudentTimetable(studentId) {
        try {
            // Get student with class and section
            const student = await prisma.student.findUnique({
                where: { id: parseInt(studentId) },
                include: {
                    class: true,
                    section: true
                }
            });

            if (!student) {
                throw new ApiError('Student not found', 404);
            }

            // Get current academic year and term (this would be based on your system's logic)
            // For now, we'll assume there's a current active academic year and term
            const currentAcademicYear = "2023-2024"; // This should be retrieved from your system
            const currentTerm = "First Term"; // This should be retrieved from your system

            // Get timetable
            const timetable = await prisma.timetable.findFirst({
                where: {
                    classId: student.classId,
                    sectionId: student.sectionId,
                    academicYear: currentAcademicYear,
                    term: currentTerm
                },
                include: {
                    periods: {
                        include: {
                            timeSlot: true,
                            subject: true,
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                            profilePicture: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!timetable) {
                throw new ApiError('Timetable not found for this student', 404);
            }

            return timetable;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error retrieving student timetable', 500);
        }
    }

    /**
     * Create or update a period in the timetable
     */
    async addPeriod(periodData) {
        try {
            const {
                timetableId,
                dayOfWeek,
                timeSlotId,
                subjectId,
                teacherId,
                classId,
                sectionId
            } = periodData;

            // Check if timetable exists
            const timetable = await prisma.timetable.findUnique({
                where: { id: parseInt(timetableId) }
            });

            if (!timetable) {
                throw new ApiError('Timetable not found', 404);
            }

            // Check if period already exists for this day and time slot for this class and section
            const existingPeriod = await prisma.period.findFirst({
                where: {
                    dayOfWeek: parseInt(dayOfWeek),
                    timeSlotId: parseInt(timeSlotId),
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId)
                }
            });

            if (existingPeriod) {
                // Update existing period
                return await prisma.period.update({
                    where: { id: existingPeriod.id },
                    data: {
                        subjectId: parseInt(subjectId),
                        teacherId: parseInt(teacherId)
                    },
                    include: {
                        timeSlot: true,
                        subject: true,
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                // Create new period
                return await prisma.period.create({
                    data: {
                        dayOfWeek: parseInt(dayOfWeek),
                        timeSlotId: parseInt(timeSlotId),
                        subjectId: parseInt(subjectId),
                        teacherId: parseInt(teacherId),
                        classId: parseInt(classId),
                        sectionId: parseInt(sectionId),
                        timetableId: parseInt(timetableId)
                    },
                    include: {
                        timeSlot: true,
                        subject: true,
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error adding period to timetable', 500);
        }
    }

    /**
     * Delete a period from the timetable
     */
    async deletePeriod(periodId) {
        try {
            const period = await prisma.period.findUnique({
                where: { id: parseInt(periodId) }
            });

            if (!period) {
                throw new ApiError('Period not found', 404);
            }

            await prisma.period.delete({
                where: { id: parseInt(periodId) }
            });

            return { message: 'Period deleted successfully' };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error deleting period', 500);
        }
    }

    /**
     * Create a new time slot
     */
    async createTimeSlot(timeSlotData) {
        try {
            const { startTime, endTime, isBreak, breakType } = timeSlotData;

            // Validate time format (HH:mm)
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                throw new ApiError('Invalid time format. Use HH:mm format', 400);
            }

            // Check if start time is before end time
            if (startTime >= endTime) {
                throw new ApiError('Start time must be before end time', 400);
            }

            // Create time slot
            const timeSlot = await prisma.timeSlot.create({
                data: {
                    startTime,
                    endTime,
                    isBreak: isBreak || false,
                    breakType: isBreak ? breakType : null
                }
            });

            return timeSlot;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error creating time slot', 500);
        }
    }

    /**
     * Get all time slots
     */
    async getAllTimeSlots() {
        try {
            const timeSlots = await prisma.timeSlot.findMany({
                orderBy: { startTime: 'asc' }
            });

            return timeSlots;
        } catch (error) {
            throw new ApiError(error.message || 'Error retrieving time slots', 500);
        }
    }

    /**
     * Get teacher's timetable
     */
    async getTeacherTimetable(teacherId) {
        try {
            const teacher = await prisma.teacher.findUnique({
                where: { id: parseInt(teacherId) },
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            if (!teacher) {
                throw new ApiError('Teacher not found', 404);
            }

            // Get all periods assigned to this teacher
            const periods = await prisma.period.findMany({
                where: {
                    teacherId: parseInt(teacherId)
                },
                include: {
                    timeSlot: true,
                    subject: true,
                    class: true,
                    section: true,
                    timetable: true
                },
                orderBy: [
                    { dayOfWeek: 'asc' },
                    { timeSlot: { startTime: 'asc' } }
                ]
            });

            // Organize by day of week
            const timetable = {
                teacher: {
                    id: teacher.id,
                    name: teacher.user.name
                },
                schedule: {}
            };

            // Initialize days of week
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            daysOfWeek.forEach(day => {
                timetable.schedule[day] = [];
            });

            // Populate schedule
            periods.forEach(period => {
                const day = daysOfWeek[period.dayOfWeek];
                timetable.schedule[day].push({
                    periodId: period.id,
                    timeSlot: {
                        id: period.timeSlot.id,
                        startTime: period.timeSlot.startTime,
                        endTime: period.timeSlot.endTime,
                        isBreak: period.timeSlot.isBreak,
                        breakType: period.timeSlot.breakType
                    },
                    subject: {
                        id: period.subject.id,
                        name: period.subject.name,
                        code: period.subject.code
                    },
                    class: {
                        id: period.class.id,
                        name: period.class.name
                    },
                    section: {
                        id: period.section.id,
                        name: period.section.name
                    },
                    academicYear: period.timetable.academicYear,
                    term: period.timetable.term
                });
            });

            return timetable;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error retrieving teacher timetable', 500);
        }
    }
}

export default new TimetableService(); 