import { AttendanceService } from '../services/attendanceService.js';
import { AppError } from '../middlewares/errorHandler.js';
import { PrismaClient } from '@prisma/client';

const attendanceService = new AttendanceService();
const prisma = new PrismaClient();

export const markSubjectAttendance = async (req, res, next) => {
    try {
        const { studentId, subjectId, isPresent } = req.body;
        
        if (!studentId || !subjectId || typeof isPresent !== 'boolean') {
            return next(new AppError(400, 'Please provide all required fields'));
        }

        const attendance = await attendanceService.markSubjectAttendance(studentId, subjectId, isPresent);
        
        res.status(201).json({
            status: 'success',
            data: { attendance }
        });
    } catch (error) {
        next(error);
    }
};

export const getSubjectAttendance = async (req, res, next) => {
    try {
        const { studentId, subjectId, startDate, endDate } = req.query;
        
        if (!studentId || !subjectId) {
            return next(new AppError(400, 'Please provide studentId and subjectId'));
        }

        const attendance = await attendanceService.getSubjectAttendance(studentId, subjectId, startDate, endDate);
        
        res.status(200).json({
            status: 'success',
            data: { attendance }
        });
    } catch (error) {
        next(error);
    }
};

export const getMonthlyAttendance = async (req, res, next) => {
    try {
        const { studentId, month, year } = req.query;
        
        // Validate required parameters
        if (!month || !year) {
            return next(new AppError(400, 'Please provide month and year'));
        }

        // If studentId is not provided but user is a student, use their ID
        let targetStudentId = studentId;
        if (!targetStudentId && req.user?.role === 'STUDENT') {
            targetStudentId = req.user.student.id;
        }
        
        // If we still don't have a studentId, that's an error
        if (!targetStudentId) {
            return next(new AppError(400, 'Student ID is required'));
        }

        // Get the attendance data from service
        const attendance = await attendanceService.getMonthlyAttendance(
            targetStudentId, 
            month,
            year
        );
        
        res.status(200).json({
            status: 'success',
            data: { attendance }
        });
    } catch (error) {
        next(error);
    }
};

export const getClassAttendance = async (req, res, next) => {
    try {
        const { classId, sectionId, date } = req.query;
        
        if (!classId || !sectionId || !date) {
            return next(new AppError(400, 'Please provide classId, sectionId, and date'));
        }

        const attendance = await attendanceService.getClassAttendance(classId, sectionId, date);
        
        res.status(200).json({
            status: 'success',
            data: { attendance }
        });
    } catch (error) {
        next(error);
    }
};

// Mark attendance for a class/section on a specific date
export const markDailyAttendance = async (req, res, next) => {
    try {
        const { classId, sectionId, date, attendanceData } = req.body;
        
        if (!classId || !sectionId || !date || !attendanceData || !Array.isArray(attendanceData)) {
            return next(new AppError(400, 'Missing required fields'));
        }
        
        // Validate that user is a teacher
        if (req.user.role !== 'TEACHER') {
            return next(new AppError(403, 'Only teachers can mark attendance'));
        }
        
        const teacherId = req.user.teacher.id;
        
        // Verify teacher is assigned to this class and section
        const isClassTeacher = await prisma.teacherClass.findFirst({
            where: {
                teacherId,
                classId: parseInt(classId),
            }
        });
        
        const isSectionTeacher = await prisma.teacherSection.findFirst({
            where: {
                teacherId,
                sectionId: parseInt(sectionId),
            }
        });
        
        if (!isClassTeacher || !isSectionTeacher) {
            return next(new AppError(403, 'You are not authorized to mark attendance for this class/section'));
        }
        
        // Format the date to ensure it's treated as a date object
        const attendanceDate = new Date(date);
        
        // Check if attendance for this date already exists
        const existingAttendance = await prisma.dailyAttendance.findMany({
            where: {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                date: {
                    gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
                    lt: new Date(new Date(attendanceDate).setHours(23, 59, 59, 999)),
                }
            }
        });
        
        // Process each student's attendance
        const results = [];
        
        for (const record of attendanceData) {
            const { studentId, status, remarks } = record;
            
            if (!studentId || !status) {
                continue; // Skip invalid records
            }
            
            // Check if the student belongs to this class and section
            const student = await prisma.student.findFirst({
                where: {
                    id: parseInt(studentId),
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId),
                }
            });
            
            if (!student) {
                continue; // Skip students not in this class/section
            }
            
            // Find existing attendance record for this student on this date
            const existingRecord = existingAttendance.find(record => record.studentId === parseInt(studentId));
            
            // Create or update attendance record
            let attendanceRecord;
            
            if (existingRecord) {
                // Update existing record
                attendanceRecord = await prisma.dailyAttendance.update({
                    where: {
                        id: existingRecord.id
                    },
                    data: {
                        status,
                        remarks,
                        markedById: teacherId
                    }
                });
            } else {
                // Create new record
                attendanceRecord = await prisma.dailyAttendance.create({
                    data: {
                        studentId: parseInt(studentId),
                        classId: parseInt(classId),
                        sectionId: parseInt(sectionId),
                        date: attendanceDate,
                        status,
                        remarks,
                        markedById: teacherId
                    }
                });
            }
            
            results.push(attendanceRecord);
        }
        
        // After marking daily attendance, update monthly attendance
        await updateMonthlyAttendance(parseInt(classId), parseInt(sectionId), attendanceDate);
        
        res.status(200).json({
            status: 'success',
            results: results.length,
            data: {
                attendance: results
            }
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        next(error);
    }
};

// Get attendance for a class/section on a specific date
export const getDailyAttendance = async (req, res, next) => {
    try {
        const { classId, sectionId, date } = req.query;
        
        if (!classId || !sectionId || !date) {
            return next(new AppError(400, 'Missing required fields'));
        }
        
        // Format the date to ensure it's treated as a date object
        const attendanceDate = new Date(date);
        
        // If user is a teacher, verify they're assigned to this class/section
        if (req.user.role === 'TEACHER') {
            const teacherId = req.user.teacher.id;
            
            const isClassTeacher = await prisma.teacherClass.findFirst({
                where: {
                    teacherId,
                    classId: parseInt(classId),
                }
            });
            
            const isSectionTeacher = await prisma.teacherSection.findFirst({
                where: {
                    teacherId,
                    sectionId: parseInt(sectionId),
                }
            });
            
            if (!isClassTeacher || !isSectionTeacher) {
                return next(new AppError(403, 'You are not authorized to view attendance for this class/section'));
            }
        } else if (req.user.role === 'STUDENT') {
            // Students can only view their own attendance
            const student = req.user.student;
            
            if (student.classId !== parseInt(classId) || student.sectionId !== parseInt(sectionId)) {
                return next(new AppError(403, 'You can only view attendance for your own class/section'));
            }
        } else if (req.user.role === 'PARENT') {
            // Parents can only view their children's attendance
            const parent = req.user.parent;
            
            const hasChildInClass = await prisma.student.findFirst({
                where: {
                    parentId: parent.id,
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId),
                }
            });
            
            if (!hasChildInClass) {
                return next(new AppError(403, 'You can only view attendance for your children'));
            }
        }
        // Admin can view all attendance
        
        // Get students for this class/section
        const students = await prisma.student.findMany({
            where: {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
            },
            orderBy: {
                rollNo: 'asc'
            }
        });
        
        // Get attendance records for this date
        const attendanceRecords = await prisma.dailyAttendance.findMany({
            where: {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                date: {
                    gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
                    lt: new Date(new Date(attendanceDate).setHours(23, 59, 59, 999)),
                }
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        rollNo: true
                    }
                },
                markedBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        
        // Create a complete attendance list (including students without records)
        const completeAttendance = students.map(student => {
            const record = attendanceRecords.find(record => record.studentId === student.id);
            
            return record || {
                studentId: student.id,
                student: {
                    id: student.id,
                    name: student.name,
                    rollNo: student.rollNo
                },
                status: 'ABSENT', // Default status
                date: attendanceDate,
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                markedBy: null,
                remarks: null
            };
        });
        
        res.status(200).json({
            status: 'success',
            results: completeAttendance.length,
            data: {
                date: attendanceDate,
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                attendance: completeAttendance
            }
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        next(error);
    }
};

// Helper function to update monthly attendance summary
const updateMonthlyAttendance = async (classId, sectionId, date) => {
    try {
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        
        // Get all students in this class/section
        const students = await prisma.student.findMany({
            where: {
                classId,
                sectionId
            }
        });
        
        for (const student of students) {
            // Get daily attendance records for this student in the month
            const dailyRecords = await prisma.dailyAttendance.findMany({
                where: {
                    studentId: student.id,
                    date: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            });
            
            // Calculate attendance counts
            const presentCount = dailyRecords.filter(record => 
                record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'HALF_DAY').length;
            const absentCount = dailyRecords.filter(record => 
                record.status === 'ABSENT' || record.status === 'EXCUSED').length;
            const totalDays = presentCount + absentCount;
            const percentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;
            
            // Update or create monthly attendance record
            await prisma.monthlyAttendance.upsert({
                where: {
                    studentId_month_year: {
                        studentId: student.id,
                        month: monthStart,
                        year
                    }
                },
                update: {
                    presentCount,
                    absentCount,
                    percentage
                },
                create: {
                    studentId: student.id,
                    classId,
                    sectionId,
                    month: monthStart,
                    year,
                    presentCount,
                    absentCount,
                    percentage
                }
            });
        }
    } catch (error) {
        console.error('Error updating monthly attendance:', error);
        throw error;
    }
};

// Get attendance statistics for a class/section
export const getAttendanceStats = async (req, res, next) => {
    try {
        const { classId, sectionId, month, year } = req.query;
        
        if (!classId || !sectionId) {
            return next(new AppError(400, 'Class ID and Section ID are required'));
        }
        
        // Parse month and year or use current if not provided
        const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        
        // Create date objects for the requested month
        const monthStart = new Date(targetYear, targetMonth, 1);
        const monthEnd = new Date(targetYear, targetMonth + 1, 0);
        
        // If user is a teacher, verify they're assigned to this class/section
        if (req.user.role === 'TEACHER') {
            const teacherId = req.user.teacher.id;
            
            const isClassTeacher = await prisma.teacherClass.findFirst({
                where: {
                    teacherId,
                    classId: parseInt(classId),
                }
            });
            
            const isSectionTeacher = await prisma.teacherSection.findFirst({
                where: {
                    teacherId,
                    sectionId: parseInt(sectionId),
                }
            });
            
            if (!isClassTeacher || !isSectionTeacher) {
                return next(new AppError(403, 'You are not authorized to view attendance for this class/section'));
            }
        }
        
        // Get all students in this class/section
        const students = await prisma.student.findMany({
            where: {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
            }
        });
        
        // Get working days count (excluding holidays and weekends)
        const workingDays = await getWorkingDaysInMonth(targetMonth, targetYear);
        
        // Fetch monthly attendance for all students
        const monthlyAttendance = await prisma.monthlyAttendance.findMany({
            where: {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                month: monthStart,
                year: targetYear
            }
        });
        
        // Calculate average attendance percentage
        let totalPercentage = 0;
        let totalStudents = 0;
        
        for (const attendance of monthlyAttendance) {
            totalPercentage += attendance.percentage;
            totalStudents++;
        }
        
        const averagePercentage = totalStudents > 0 ? totalPercentage / totalStudents : 0;
        
        // Get daily attendance counts for each day in the month
        const dailyStats = [];
        for (let day = 1; day <= monthEnd.getDate(); day++) {
            const date = new Date(targetYear, targetMonth, day);
            
            // Skip weekends (Saturday and Sunday)
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue;
            }
            
            // Check if this is a holiday
            const isHoliday = await prisma.holiday.findFirst({
                where: {
                    fromDate: {
                        lte: date
                    },
                    toDate: {
                        gte: date
                    }
                }
            });
            
            if (isHoliday) {
                continue;
            }
            
            // Get attendance for this day
            const dailyAttendance = await prisma.dailyAttendance.findMany({
                where: {
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId),
                    date: {
                        gte: new Date(date.setHours(0, 0, 0, 0)),
                        lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
                    }
                }
            });
            
            const presentCount = dailyAttendance.filter(record => 
                record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'HALF_DAY').length;
            const absentCount = dailyAttendance.filter(record => 
                record.status === 'ABSENT' || record.status === 'EXCUSED').length;
            const totalStudentsCount = students.length;
            const attendancePercentage = totalStudentsCount > 0 ? (presentCount / totalStudentsCount) * 100 : 0;
            
            dailyStats.push({
                date: new Date(targetYear, targetMonth, day),
                presentCount,
                absentCount,
                totalStudents: totalStudentsCount,
                percentage: parseFloat(attendancePercentage.toFixed(2))
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                month: targetMonth + 1,
                year: targetYear,
                workingDays,
                totalStudents: students.length,
                averageAttendance: parseFloat(averagePercentage.toFixed(2)),
                dailyStats
            }
        });
    } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        next(error);
    }
};

// Helper function to get working days in a month (excluding holidays and weekends)
const getWorkingDaysInMonth = async (month, year) => {
    try {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        let workingDays = 0;
        
        // Get holidays for this month
        const holidays = await prisma.holiday.findMany({
            where: {
                OR: [
                    {
                        fromDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    {
                        toDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                ]
            }
        });
        
        // Create an array of holiday dates
        const holidayDates = [];
        for (const holiday of holidays) {
            let currentDate = new Date(holiday.fromDate);
            const endHoliday = new Date(holiday.toDate);
            
            while (currentDate <= endHoliday) {
                holidayDates.push(new Date(currentDate).toDateString());
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        // Count working days
        for (let day = 1; day <= endDate.getDate(); day++) {
            const currentDate = new Date(year, month, day);
            
            // Skip weekends (Saturday and Sunday)
            if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                continue;
            }
            
            // Skip holidays
            if (holidayDates.includes(currentDate.toDateString())) {
                continue;
            }
            
            workingDays++;
        }
        
        return workingDays;
    } catch (error) {
        console.error('Error calculating working days:', error);
        return 0;
    }
};

// Export all controllers
export default {
    markDailyAttendance,
    getDailyAttendance,
    getMonthlyAttendance,
    getAttendanceStats
}; 