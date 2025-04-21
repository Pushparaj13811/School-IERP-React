import { ApiError } from '../utils/apiError.js';
import { prisma } from '../databases/prismaClient.js';

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
                throw new ApiError(400, 'Attendance already marked for today');
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
            const numMonth = parseInt(month, 10);
            const numYear = parseInt(year, 10);
            
            if (isNaN(numMonth) || isNaN(numYear) || numMonth < 1 || numMonth > 12) {
                throw new ApiError(400, 'Invalid month or year parameter');
            }
            
            // Create date for the first day of the month
            const startDate = new Date(numYear, numMonth - 1, 1);
            
            // Get student ID if it wasn't provided but we have a user
            const whereCondition = {};
            
            if (studentId) {
                whereCondition.studentId = parseInt(studentId, 10);
            }
            
            // Add month and year to the query
            whereCondition.month = startDate;
            whereCondition.year = numYear;
            
            // Find the attendance record
            const attendance = await prisma.monthlyAttendance.findFirst({
                where: whereCondition
            });
            
            // If no record found but we have the student ID, return a default structure
            if (!attendance && studentId) {
                return {
                    studentId: parseInt(studentId, 10),
                    month: startDate,
                    year: numYear,
                    presentCount: 0,
                    absentCount: 0,
                    percentage: 0,
                    classId: null,
                    sectionId: null
                };
            }
            
            return attendance;
        } catch (error) {
            throw error;
        }
    }

    async getClassAttendance(userId, userRole, classId, sectionId, date) {
        try {
            console.log(`Getting class attendance for userId: ${userId}, userRole: ${userRole}, classId: ${classId}, sectionId: ${sectionId}, date: ${date}`);
            
            // Validate inputs
            if (!classId || !sectionId || !date) {
                throw new ApiError(400, 'Class ID, Section ID and date are required');
            }
            
            // Convert string IDs to integers for database queries
            const classIdInt = parseInt(classId);
            const sectionIdInt = parseInt(sectionId);
            
            // Create date object for the target date
            const targetDate = new Date(date);
            if (isNaN(targetDate.getTime())) {
                throw new ApiError(400, 'Invalid date format');
            }
            
            // Set time to 00:00:00 for the start of the day
            targetDate.setHours(0, 0, 0, 0);
            
            // Check authorization based on user role
            if (userRole === 'TEACHER') {
                // Check if teacher is assigned to this class/section
                const isClassTeacher = await prisma.classTeacherAssignment.findFirst({
                    where: {
                        teacherId: parseInt(userId),
                        classId: classIdInt,
                        sectionId: sectionIdInt
                    }
                });
                
                const isSubjectTeacher = await prisma.teacherSubjectAssignment.findFirst({
                    where: {
                        teacherId: parseInt(userId),
                        classId: classIdInt,
                        sectionId: sectionIdInt
                    }
                });
                
                if (!isClassTeacher && !isSubjectTeacher) {
                    console.log(`Teacher ${userId} is not authorized to view attendance for class ${classId}, section ${sectionId}`);
                    throw new ApiError(403, 'You are not authorized to view attendance for this class/section');
                }
                console.log('Teacher is authorized to view class attendance');
            }
            else if (userRole !== 'ADMIN') {
                console.log(`User ${userId} with role ${userRole} tried to access class attendance without proper authorization`);
                throw new ApiError(403, 'You are not authorized to view class attendance');
            }
            
            // Get all students in the class
            const students = await prisma.student.findMany({
                where: {
                    classId: classIdInt,
                    sectionId: sectionIdInt,
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    rollNumber: true
                },
                orderBy: {
                    rollNumber: 'asc'
                }
            });
            
            // Get attendance records for all students in the class on the specified date
            const attendanceRecords = await prisma.dailyAttendance.findMany({
                where: {
                    student: {
                        classId: classIdInt,
                        sectionId: sectionIdInt
                    },
                    date: targetDate
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            rollNumber: true
                        }
                    },
                    markedBy: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
            
            // Get class and section details
            const classDetails = await prisma.class.findUnique({
                where: { id: classIdInt },
                select: { name: true }
            });
            
            const sectionDetails = await prisma.section.findUnique({
                where: { id: sectionIdInt },
                select: { name: true }
            });
            
            // Get teacher assignments for this class/section
            const classTeachers = await prisma.classTeacherAssignment.findMany({
                where: {
                    classId: classIdInt,
                    sectionId: sectionIdInt
                },
                include: {
                    teacher: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
            
            // Create a map of student IDs to attendance records
            const attendanceMap = new Map();
            attendanceRecords.forEach(record => {
                attendanceMap.set(record.studentId, record);
            });
            
            // Generate list with attendance status for all students
            const studentsWithAttendance = students.map(student => {
                const attendanceRecord = attendanceMap.get(student.id);
                return {
                    student: student,
                    attendance: attendanceRecord ? {
                        id: attendanceRecord.id,
                        status: attendanceRecord.status,
                        remarks: attendanceRecord.remarks,
                        markedBy: attendanceRecord.markedBy,
                        createdAt: attendanceRecord.createdAt
                    } : null
                };
            });
            
            // Calculate attendance summary
            const totalStudents = students.length;
            const presentCount = attendanceRecords.filter(record => record.status === 'PRESENT').length;
            const absentCount = attendanceRecords.filter(record => record.status === 'ABSENT').length;
            const lateCount = attendanceRecords.filter(record => record.status === 'LATE').length;
            const excusedCount = attendanceRecords.filter(record => record.status === 'EXCUSED').length;
            const unmarkedCount = totalStudents - (presentCount + absentCount + lateCount + excusedCount);
            
            return {
                class: classDetails,
                section: sectionDetails,
                date: targetDate,
                classTeachers: classTeachers.map(ct => ({
                    id: ct.teacherId,
                    name: `${ct.teacher.firstName} ${ct.teacher.lastName}`
                })),
                students: studentsWithAttendance,
                summary: {
                    totalStudents,
                    present: presentCount,
                    absent: absentCount,
                    late: lateCount,
                    excused: excusedCount,
                    unmarked: unmarkedCount,
                    attendance_percentage: totalStudents > 0 ? 
                        (presentCount / totalStudents * 100).toFixed(2) : 0
                }
            };
        } catch (error) {
            console.error(`Error in getClassAttendance: ${error.message}`);
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
    
    // New methods for daily attendance
    
    // Check if a teacher is authorized to access/mark attendance for a class/section
    async checkTeacherClassAuthorization(teacherId, classId, sectionId, requireClassTeacher = false) {
        try {
            console.log(`Checking authorization for teacher ${teacherId}, class ${classId}, section ${sectionId}`);
            
            // First check if the teacher is a class teacher for this class/section
            const isClassTeacher = await prisma.classTeacherAssignment.findFirst({
                where: {
                    teacherId: parseInt(teacherId),
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId)
                }
            });
            
            console.log(`Class teacher check result:`, isClassTeacher);
            
            // If class teacher role is required, and teacher is not a class teacher, return false
            if (requireClassTeacher && !isClassTeacher) {
                console.log('Class teacher role required but not found');
                return false;
            }
            
            // If teacher is a class teacher, they're authorized
            if (isClassTeacher) {
                console.log('Teacher is class teacher, authorization granted');
                return true;
            }
            
            // If not a class teacher, check if they teach any subjects in this class/section
            const teachesClass = await prisma.teacherClass.findFirst({
                where: {
                    teacherId: parseInt(teacherId),
                    classId: parseInt(classId)
                }
            });
            
            console.log(`Teaches class check result:`, teachesClass);
            
            const teachesSection = await prisma.teacherSection.findFirst({
                where: {
                    teacherId: parseInt(teacherId),
                    sectionId: parseInt(sectionId)
                }
            });
            
            console.log(`Teaches section check result:`, teachesSection);
            
            // Teacher must teach both in the class and section to be authorized
            const hasAccess = !!(teachesClass && teachesSection);
            console.log(`Final authorization result: ${hasAccess}`);
            return hasAccess;
        } catch (error) {
            console.error(`Authorization check error:`, error);
            throw error;
        }
    }
    
    // Mark daily attendance for a class/section
    async markDailyAttendance(teacherId, classId, sectionId, date, attendanceData, remarks) {
        try {
            console.log(`Marking attendance for teacherId: ${teacherId}, classId: ${classId}, sectionId: ${sectionId}`);
            console.log('Date received:', date, 'Type:', typeof date);
            
            // Format the date properly
            let attendanceDate;
            if (typeof date === 'string') {
                attendanceDate = new Date(date);
            } else if (date instanceof Date) {
                attendanceDate = new Date(date); // Create a new instance to avoid reference issues
            } else {
                console.error('Invalid date format in markDailyAttendance:', date);
                // Default to today's date if invalid
                attendanceDate = new Date();
            }
            
            if (isNaN(attendanceDate.getTime())) {
                console.error('Invalid date value in markDailyAttendance:', date);
                throw new ApiError(400, 'Invalid date format provided');
            }
            
            // Set to midnight for consistent date handling
            const normalizedDate = new Date(attendanceDate.setHours(0, 0, 0, 0));
            console.log('Using normalized date:', normalizedDate);
            
            // Check if the date is a Saturday (day 6)
            if (normalizedDate.getDay() === 6) {
                console.log('Attendance marking attempted on Saturday:', normalizedDate);
                throw new ApiError(400, 'Attendance cannot be marked on Saturdays');
            }
            
            // Check if the teacher is authorized to mark attendance for this class/section
            try {
                // First check if the teacher is a class teacher for this class/section
                const isClassTeacher = await prisma.classTeacherAssignment.findFirst({
                    where: {
                        teacherId: parseInt(teacherId),
                        classId: parseInt(classId),
                        sectionId: parseInt(sectionId)
                    }
                });
                
                console.log(`Class teacher check for ${teacherId}, class ${classId}, section ${sectionId}: `, isClassTeacher);
                
                if (!isClassTeacher) {
                    console.log(`Teacher ${teacherId} is not a class teacher for class ${classId}, section ${sectionId}`);
                    throw new ApiError(403, 'Only class teachers can mark attendance');
                }
                console.log('Teacher is a class teacher, authorization granted for marking attendance');
            } catch (authError) {
                console.error('Authorization check error:', authError);
                throw authError;
            }
            
            // Verify all necessary data is present
            if (!teacherId || !classId || !sectionId || !date || !attendanceData || !Array.isArray(attendanceData)) {
                throw new ApiError(400, 'Missing required fields');
            }
            
            // Get students for this class/section
            const students = await prisma.student.findMany({
                where: {
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId),
                },
                select: {
                    id: true
                }
            });
            
            const studentIds = students.map(student => student.id);
            
            // Validate attendance data
            attendanceData.forEach(record => {
                if (!record.studentId || !record.status) {
                    throw new ApiError(400, 'Each attendance record must have studentId and status');
                }
                
                if (!studentIds.includes(record.studentId)) {
                    throw new ApiError(400, `Student with ID ${record.studentId} is not in this class/section`);
                }
                
                if (!['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED'].includes(record.status)) {
                    throw new ApiError(400, `Invalid status: ${record.status}`);
                }
            });
            
            // Delete existing attendance records for this date
            await prisma.dailyAttendance.deleteMany({
                where: {
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId),
                    date: {
                        gte: new Date(normalizedDate.getTime()),
                        lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000), // Add 24 hours
                    }
                }
            });
            
            // Create new attendance records
            const createAttendance = attendanceData.map(record => {
                return prisma.dailyAttendance.create({
                    data: {
                        date: normalizedDate, // Use the normalized date
                        status: record.status,
                        remarks: record.remarks || remarks || null,
                        student: {
                            connect: { id: record.studentId }
                        },
                        class: {
                            connect: { id: parseInt(classId) }
                        },
                        section: {
                            connect: { id: parseInt(sectionId) }
                        },
                        markedBy: {
                            connect: { id: parseInt(teacherId) }
                        }
                    }
                });
            });
            
            await prisma.$transaction(createAttendance);
            
            return { message: 'Attendance marked successfully' };
        } catch (error) {
            console.error(`Error in markDailyAttendance: ${error.message}`);
            throw error;
        }
    }
    
    // Get daily attendance for a class/section
    async getDailyAttendance(userId, userRole, teacherId, studentId, parentId, classId, sectionId, date) {
        try {
            console.log(`Getting daily attendance for user role: ${userRole}, classId: ${classId}, sectionId: ${sectionId}`);
            
            // Format the date
            const attendanceDate = new Date(date);
            
            // Check authorization based on user role
            if (userRole === 'TEACHER' && teacherId) {
                try {
                    // First check if the teacher is a class teacher for this class/section
                    const isClassTeacher = await prisma.classTeacherAssignment.findFirst({
                        where: {
                            teacherId: parseInt(teacherId),
                            classId: parseInt(classId),
                            sectionId: parseInt(sectionId)
                        }
                    });
                    
                    console.log(`Class teacher check for ${teacherId}, class ${classId}, section ${sectionId}: `, isClassTeacher);
                    
                    if (isClassTeacher) {
                        console.log('Teacher is a class teacher, authorization granted');
                        // Teacher is a class teacher, allow access
                    } else {
                        // If not a class teacher, check if they teach any subjects in this class/section
                        const teachesClass = await prisma.teacherClass.findFirst({
                            where: {
                                teacherId: parseInt(teacherId),
                                classId: parseInt(classId)
                            }
                        });
                        
                        const teachesSection = await prisma.teacherSection.findFirst({
                            where: {
                                teacherId: parseInt(teacherId),
                                sectionId: parseInt(sectionId)
                            }
                        });
                        
                        console.log(`Teacher ${teacherId} teaches class ${classId}: `, !!teachesClass);
                        console.log(`Teacher ${teacherId} teaches section ${sectionId}: `, !!teachesSection);
                        
                        if (!teachesClass || !teachesSection) {
                            console.log(`Teacher ${teacherId} is not authorized for class ${classId}, section ${sectionId}`);
                            throw new ApiError(403, 'You are not authorized to view attendance for this class/section');
                        }
                        console.log('Teacher teaches both class and section, authorization granted');
                    }
                } catch (authError) {
                    console.error('Authorization check error:', authError);
                    throw authError;
                }
            } else if (userRole === 'STUDENT' && studentId) {
                // Students can only view their own class/section attendance
                const student = await prisma.student.findUnique({
                    where: { id: parseInt(studentId) }
                });
                
                if (!student || student.classId !== parseInt(classId) || student.sectionId !== parseInt(sectionId)) {
                    throw new ApiError(403, 'You can only view attendance for your own class/section');
                }
            } else if (userRole === 'PARENT' && parentId) {
                // Parents can only view their children's attendance
                const hasChildInClass = await prisma.student.findFirst({
                    where: {
                        parentId: parseInt(parentId),
                        classId: parseInt(classId),
                        sectionId: parseInt(sectionId),
                    }
                });
                
                if (!hasChildInClass) {
                    throw new ApiError(403, 'You can only view attendance for your children');
                }
            } else if (userRole !== 'ADMIN') {
                // If not an admin and no specific role matched
                console.log(`User with role ${userRole} attempted to access attendance without proper credentials`);
                throw new ApiError(403, 'You do not have permission to access this resource');
            }
            // Admin can view all attendance
            
            console.log(`Authorization passed for ${userRole}, proceeding to get attendance data`);
            
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
            
            return {
                date: attendanceDate,
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                attendance: completeAttendance
            };
        } catch (error) {
            console.error(`Error in getDailyAttendance: ${error.message}`);
            throw error;
        }
    }
    
    // Update monthly attendance summary based on daily attendance
    async updateDailyAttendanceSummary(classId, sectionId, date) {
        try {
            console.log('updateDailyAttendanceSummary called with:', {
                classId,
                sectionId,
                date,
                dateType: typeof date,
                isDateObject: date instanceof Date
            });
            
            // Ensure date is a proper Date object
            let attendanceDate;
            if (typeof date === 'string') {
                attendanceDate = new Date(date);
            } else if (date instanceof Date) {
                attendanceDate = date;
            } else {
                console.error('Invalid date format in updateDailyAttendanceSummary:', date);
                // Default to today's date if invalid
                attendanceDate = new Date();
            }
            
            if (isNaN(attendanceDate.getTime())) {
                console.error('Invalid date value in updateDailyAttendanceSummary:', date);
                attendanceDate = new Date(); // Default to today if invalid
            }
            
            console.log('Using date:', attendanceDate);
            
            const month = attendanceDate.getMonth();
            const year = attendanceDate.getFullYear();
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            
            console.log('Month calculations:', {
                month,
                year,
                monthStart,
                monthEnd
            });
            
            // Ensure classId and sectionId are integers
            const classIdInt = parseInt(classId);
            const sectionIdInt = parseInt(sectionId);
            
            // Get all students in this class/section
            const students = await prisma.student.findMany({
                where: {
                    classId: classIdInt,
                    sectionId: sectionIdInt
                }
            });
            
            console.log(`Found ${students.length} students in class ${classIdInt}, section ${sectionIdInt}`);
            
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
                
                console.log(`Found ${dailyRecords.length} attendance records for student ${student.id} in month ${month + 1}/${year}`);
                
                // Calculate attendance counts
                const presentCount = dailyRecords.filter(record => 
                    record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'HALF_DAY').length;
                const absentCount = dailyRecords.filter(record => 
                    record.status === 'ABSENT' || record.status === 'EXCUSED').length;
                const totalDays = presentCount + absentCount;
                const percentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;
                
                console.log('Attendance counts:', {
                    studentId: student.id,
                    presentCount,
                    absentCount,
                    totalDays,
                    percentage
                });
                
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
                        classId: classIdInt,
                        sectionId: sectionIdInt,
                        month: monthStart,
                        year,
                        presentCount,
                        absentCount,
                        percentage
                    }
                });
                
                console.log(`Updated monthly attendance for student ${student.id}`);
            }
        } catch (error) {
            console.error('Error in updateDailyAttendanceSummary:', error);
            throw error;
        }
    }
    
    // Get attendance statistics for a class/section
    async getAttendanceStats(userId, userRole, teacherId, classId, sectionId, month, year) {
        try {
            // Parse month and year or use current if not provided
            const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
            const targetYear = year ? parseInt(year) : new Date().getFullYear();
            
            // Create date objects for the requested month
            const monthStart = new Date(targetYear, targetMonth, 1);
            const monthEnd = new Date(targetYear, targetMonth + 1, 0);
            
            // Check authorization if user is a teacher
            if (userRole === 'TEACHER' && teacherId) {
                const isAuthorized = await this.checkTeacherClassAuthorization(teacherId, classId, sectionId, false);
                
                if (!isAuthorized) {
                    throw new ApiError(403, 'You are not authorized to view attendance stats for this class/section');
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
            const workingDays = await this.getWorkingDaysInMonth(targetMonth, targetYear);
            
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
            
            return {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId),
                month: targetMonth + 1,
                year: targetYear,
                workingDays,
                totalStudents: students.length,
                averageAttendance: parseFloat(averagePercentage.toFixed(2)),
                dailyStats
            };
        } catch (error) {
            throw error;
        }
    }
    
    // Helper function to get working days in a month (excluding holidays and weekends)
    async getWorkingDaysInMonth(month, year) {
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
    }

    // Get attendance for a specific student
    async getStudentAttendance(userId, userRole, studentId, month, year) {
        try {
            console.log(`Getting student attendance for userId: ${userId}, userRole: ${userRole}, studentId: ${studentId}`);
            
            // Allow for unspecified month/year (will return current month/year)
            const currentDate = new Date();
            const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // JS months are 0-based
            const targetYear = year ? parseInt(year) : currentDate.getFullYear();
            
            // Get the start and end date of the month
            const startDate = new Date(targetYear, targetMonth, 1);
            const endDate = new Date(targetYear, targetMonth + 1, 0);
            
            // Check authorization based on user role
            if (userRole === 'STUDENT') {
                // Students can only view their own attendance
                if (parseInt(userId) !== parseInt(studentId)) {
                    console.log(`Student ${userId} tried to access attendance for student ${studentId}`);
                    throw new ApiError(403, 'You can only view your own attendance');
                }
                console.log('Student is authorized to view their own attendance');
            } 
            else if (userRole === 'PARENT') {
                // Parents can only view their children's attendance
                const isChild = await prisma.student.findFirst({
                    where: {
                        id: parseInt(studentId),
                        parentId: parseInt(userId)
                    }
                });
                
                if (!isChild) {
                    console.log(`Parent ${userId} tried to access attendance for non-child student ${studentId}`);
                    throw new ApiError(403, 'You can only view your children\'s attendance');
                }
                console.log('Parent is authorized to view their child\'s attendance');
            }
            else if (userRole === 'TEACHER') {
                // Get student's class and section
                const student = await prisma.student.findUnique({
                    where: {
                        id: parseInt(studentId)
                    },
                    select: {
                        classId: true,
                        sectionId: true
                    }
                });
                
                if (!student) {
                    throw new ApiError(404, 'Student not found');
                }
                
                // Check if teacher is class teacher or subject teacher for this class/section
                const isClassTeacher = await prisma.classTeacherAssignment.findFirst({
                    where: {
                        teacherId: parseInt(userId),
                        classId: student.classId,
                        sectionId: student.sectionId
                    }
                });
                
                const isSubjectTeacher = await prisma.teacherSubjectAssignment.findFirst({
                    where: {
                        teacherId: parseInt(userId),
                        classId: student.classId,
                        sectionId: student.sectionId
                    }
                });
                
                if (!isClassTeacher && !isSubjectTeacher) {
                    console.log(`Teacher ${userId} is not authorized to view attendance for student ${studentId} in class ${student.classId}, section ${student.sectionId}`);
                    throw new ApiError(403, 'You are not authorized to view attendance for this student');
                }
                console.log('Teacher is authorized to view the student\'s attendance');
            }
            else if (userRole !== 'ADMIN') {
                console.log(`User ${userId} with role ${userRole} tried to access student attendance without proper authorization`);
                throw new ApiError(403, 'You are not authorized to view attendance');
            }
            
            // Fetch attendance records for the student
            const attendanceRecords = await prisma.dailyAttendance.findMany({
                where: {
                    studentId: parseInt(studentId),
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: {
                    date: 'asc'
                },
                include: {
                    markedBy: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
            
            // Get total number of school days in the month
            const totalSchoolDays = await this.getSchoolDaysInMonth(targetMonth + 1, targetYear);
            
            // Calculate attendance summary
            const presentCount = attendanceRecords.filter(record => record.status === 'PRESENT').length;
            const absentCount = attendanceRecords.filter(record => record.status === 'ABSENT').length;
            const lateCount = attendanceRecords.filter(record => record.status === 'LATE').length;
            const excusedCount = attendanceRecords.filter(record => record.status === 'EXCUSED').length;
            
            return {
                student: {
                    id: parseInt(studentId)
                },
                month: targetMonth + 1,
                year: targetYear,
                totalSchoolDays,
                attendanceRecords,
                summary: {
                    present: presentCount,
                    absent: absentCount,
                    late: lateCount,
                    excused: excusedCount,
                    attendance_percentage: totalSchoolDays > 0 ? 
                        (presentCount / totalSchoolDays * 100).toFixed(2) : 0
                }
            };
        } catch (error) {
            console.error(`Error in getStudentAttendance: ${error.message}`);
            throw error;
        }
    }
} 