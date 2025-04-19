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
            // Validate and parse input parameters
            if (!classId || !sectionId || !academicYear || !term) {
                console.log('Missing required parameters');
                return null;
            }

            // Safely parse integers with fallback
            let parsedClassId, parsedSectionId;

            try {
                parsedClassId = parseInt(classId);
                parsedSectionId = parseInt(sectionId);

                if (isNaN(parsedClassId) || isNaN(parsedSectionId)) {
                    console.log('Invalid class or section ID format');
                    return null;
                }
            } catch (parseError) {
                console.error('Error parsing IDs:', parseError);
                return null;
            }

            console.log(`Searching for timetable with classId=${parsedClassId}, sectionId=${parsedSectionId}, academicYear=${academicYear}, term=${term}`);

            const timetable = await prisma.timetable.findFirst({
                where: {
                    classId: parsedClassId,
                    sectionId: parsedSectionId,
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
                            }
                        }
                    }
                }
            });

            // Return null instead of throwing an error if timetable not found
            if (!timetable) {
                console.log(`Timetable not found for classId=${parsedClassId}, sectionId=${parsedSectionId}`);
                return null;
            }

            return timetable;
        } catch (error) {
            console.error('Error in getTimetable:', error);
            // Don't throw an API error here, instead return null
            return null;
        }
    }

    /**
     * Get student's timetable
     */
    async getStudentTimetable(studentId) {
        try {
            // Safely parse studentId
            let parsedStudentId;
            try {
                parsedStudentId = parseInt(studentId);
                if (isNaN(parsedStudentId)) {
                    console.error('Invalid student ID format:', studentId);
                    return null;
                }
            } catch (parseError) {
                console.error('Error parsing student ID:', parseError);
                return null;
            }

            // Get student with class and section
            const student = await prisma.student.findUnique({
                where: { id: parsedStudentId },
                include: {
                    class: true,
                    section: true
                }
            });

            if (!student) {
                console.log(`Student with ID ${parsedStudentId} not found`);
                return null;
            }

            console.log(`Found student in class ${student.class?.name || 'Unknown'}, section ${student.section?.name || 'Unknown'}`);

            if (!student.classId || !student.sectionId) {
                console.log(`Student with ID ${parsedStudentId} doesn't have a class or section assigned`);
                return null;
            }

            // Get current academic year and term
            const currentAcademicYear = "2023-2024"; // This should be retrieved from your system
            const currentTerm = "First Term"; // This should be retrieved from your system

            console.log(`Looking up timetable for classId=${student.classId}, sectionId=${student.sectionId}, year=${currentAcademicYear}, term=${currentTerm}`);

            // Get timetable
            const timetable = await prisma.timetable.findFirst({
                where: {
                    classId: student.classId,
                    sectionId: student.sectionId,
                    academicYear: currentAcademicYear,
                    term: currentTerm
                },
                include: {
                    class: true,
                    section: true,
                    periods: {
                        include: {
                            timeSlot: true,
                            subject: true,
                            teacher: {
                            }
                        }
                    }
                }
            });

            if (!timetable) {
                return null;
            }
            return timetable;
        } catch (error) {
            return null;
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

            // Parse all numeric inputs
            const parsedDayOfWeek = parseInt(dayOfWeek);
            const parsedTimeSlotId = parseInt(timeSlotId);
            const parsedSubjectId = parseInt(subjectId);
            const parsedTeacherId = parseInt(teacherId);
            const parsedClassId = parseInt(classId);
            const parsedSectionId = parseInt(sectionId);
            const parsedTimetableId = parseInt(timetableId);

            // Check if timetable exists
            const timetable = await prisma.timetable.findUnique({
                where: { id: parsedTimetableId }
            });

            if (!timetable) {
                throw new ApiError('Timetable not found', 404);
            }

            // Check if time slot exists
            const timeSlot = await prisma.timeSlot.findUnique({
                where: { id: parsedTimeSlotId }
            });

            if (!timeSlot) {
                throw new ApiError('Time slot not found', 404);
            }

            // Check if teacher exists
            const teacher = await prisma.teacher.findUnique({
                where: { id: parsedTeacherId }
            });

            if (!teacher) {
                throw new ApiError('Teacher not found', 404);
            }

            // Check if subject exists
            const subject = await prisma.subject.findUnique({
                where: { id: parsedSubjectId }
            });

            if (!subject) {
                throw new ApiError('Subject not found', 404);
            }

            // Check if teacher is already assigned to another class during the same time slot on the same day
            const teacherConflict = await prisma.period.findFirst({
                where: {
                    dayOfWeek: parsedDayOfWeek,
                    timeSlotId: parsedTimeSlotId,
                    teacherId: parsedTeacherId,
                    NOT: {
                        AND: [
                            { classId: parsedClassId },
                            { sectionId: parsedSectionId }
                        ]
                    }
                },
                include: {
                    class: true,
                    section: true
                }
            });

            if (teacherConflict) {
                throw new ApiError(`Teacher is already assigned to ${teacherConflict.class.name} - ${teacherConflict.section.name} during this time slot on this day`, 400);
            }

            // Check if period already exists for this day and time slot for this class and section
            const existingPeriod = await prisma.period.findFirst({
                where: {
                    dayOfWeek: parsedDayOfWeek,
                    timeSlotId: parsedTimeSlotId,
                    classId: parsedClassId,
                    sectionId: parsedSectionId
                }
            });

            let result;
            if (existingPeriod) {
                // Update existing period
                console.log(`Updating existing period ID ${existingPeriod.id}`);
                result = await prisma.period.update({
                    where: { id: existingPeriod.id },
                    data: {
                        subjectId: parsedSubjectId,
                        teacherId: parsedTeacherId
                    },
                    include: {
                        timeSlot: true,
                        subject: true,
                        teacher: {
                        }
                    }
                });
            } else {
                // Create new period
                console.log('Creating new period');
                result = await prisma.period.create({
                    data: {
                        dayOfWeek: parsedDayOfWeek,
                        timeSlotId: parsedTimeSlotId,
                        subjectId: parsedSubjectId,
                        teacherId: parsedTeacherId,
                        classId: parsedClassId,
                        sectionId: parsedSectionId,
                        timetableId: parsedTimetableId
                    },
                    include: {
                        timeSlot: true,
                        subject: true,
                        teacher: {  
                        }
                    }
                });
            }

            console.log(`Period ${existingPeriod ? 'updated' : 'created'} successfully:`, JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error in addPeriod:', error);
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
            console.log('Creating time slot with data:', JSON.stringify(timeSlotData, null, 2));

            const { startTime, endTime, isBreak, breakType } = timeSlotData;

            console.log(`Parsed values: startTime=${startTime}, endTime=${endTime}, isBreak=${isBreak}, breakType=${breakType}`);

            // Validate time format (HH:mm)
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                console.error('Invalid time format:', { startTime, endTime });
                throw new ApiError('Invalid time format. Use HH:mm format', 400);
            }

            // Check if start time is before end time
            if (startTime >= endTime) {
                console.error('Start time is not before end time:', { startTime, endTime });
                throw new ApiError('Start time must be before end time', 400);
            }

            // Format data for database
            const timeSlotToCreate = {
                startTime,
                endTime,
                isBreak: isBreak === true || isBreak === 'true',
                breakType: isBreak === true || isBreak === 'true' ? breakType : null
            };

            console.log('Creating time slot in database with:', JSON.stringify(timeSlotToCreate, null, 2));

            // Create time slot
            const timeSlot = await prisma.timeSlot.create({
                data: timeSlotToCreate
            });

            console.log('Time slot created successfully:', JSON.stringify(timeSlot, null, 2));
            return timeSlot;
        } catch (error) {
            console.error('Error in createTimeSlot:', error);
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
     * Delete a time slot
     */
    async deleteTimeSlot(timeSlotId) {
        try {
            console.log(`Attempting to delete time slot with id: ${timeSlotId}`);

            // Check if the time slot exists
            const timeSlot = await prisma.timeSlot.findUnique({
                where: { id: parseInt(timeSlotId) },
                include: { periods: true }
            });

            if (!timeSlot) {
                throw new ApiError('Time slot not found', 404);
            }

            // Check if the time slot is being used in any periods
            if (timeSlot.periods && timeSlot.periods.length > 0) {
                throw new ApiError('Cannot delete time slot as it is being used in timetable periods', 400);
            }

            // Delete the time slot
            await prisma.timeSlot.delete({
                where: { id: parseInt(timeSlotId) }
            });

            console.log(`Time slot with id ${timeSlotId} deleted successfully`);
            return { message: 'Time slot deleted successfully' };
        } catch (error) {
            console.error('Error in deleteTimeSlot:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.message || 'Error deleting time slot', 500);
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
                            firstName: true,
                            lastName: true,
                            profilePicture: true
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
                    name: teacher.user.firstName + ' ' + teacher.user.lastName
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