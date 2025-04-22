import { AttendanceService } from '../services/attendanceService.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const attendanceService = new AttendanceService();

export const markSubjectAttendance = async (req, res, next) => {
    try {
        const { studentId, subjectId, isPresent } = req.body;

        if (!studentId || !subjectId || typeof isPresent !== 'boolean') {
            return next(new ApiError(400, 'Please provide all required fields'));
        }

        const attendance = await attendanceService.markSubjectAttendance(studentId, subjectId, isPresent);

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    attendance,
                    'Attendance marked successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

export const getSubjectAttendance = async (req, res, next) => {
    try {
        const { studentId, subjectId, startDate, endDate } = req.query;

        if (!studentId || !subjectId) {
            return next(new ApiError(400, 'Please provide studentId and subjectId'));
        }

        const attendance = await attendanceService.getSubjectAttendance(studentId, subjectId, startDate, endDate);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    attendance,
                    'Subject attendance fetched successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

export const getMonthlyAttendance = async (req, res, next) => {
    try {
        const { studentId, month, year } = req.query;

        // Validate required parameters
        if (!month || !year) {
            return next(new ApiError(400, 'Please provide month and year'));
        }

        // If studentId is not provided but user is a student, use their ID
        let targetStudentId = studentId;
        if (!targetStudentId && req.user?.role === 'STUDENT') {
            targetStudentId = req.user.student.id;
        }

        // If we still don't have a studentId, that's an error
        if (!targetStudentId) {
            return next(new ApiError(400, 'Student ID is required'));
        }

        // Get the attendance data from service
        const attendance = await attendanceService.getMonthlyAttendance(
            targetStudentId,
            month,
            year
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    attendance,
                    'Monthly attendance fetched successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

export const getClassAttendance = async (req, res, next) => {
    try {
        const { classId, sectionId, date } = req.query;

        if (!classId || !sectionId || !date) {
            return next(new ApiError(400, 'Please provide classId, sectionId, and date'));
        }

        const attendance = await attendanceService.getClassAttendance(
            req.user.id,
            req.user.role,
            classId,
            sectionId,
            date
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    attendance,
                    'Class attendance fetched successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

// Get attendance for a class/section on a specific date
export const getDailyAttendance = async (req, res, next) => {
    try {
        const { classId, sectionId, date } = req.query;

        if (!classId || !sectionId || !date) {
            return next(new ApiError(400, 'Missing required fields'));
        }

        // Use service method for business logic
        const attendanceData = await attendanceService.getDailyAttendance(
            req.user.id,
            req.user.role,
            req.user.role === 'TEACHER' ? req.user.teacher.id : null,
            req.user.role === 'STUDENT' ? req.user.student.id : null,
            req.user.role === 'PARENT' ? req.user.parent.id : null,
            classId,
            sectionId,
            date
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    attendanceData,
                    'Attendance fetched successfully'
                )
            );
    } catch (error) {
        console.error('Error fetching attendance:', error);
        next(error);
    }
};

// Mark attendance for a class/section on a specific date
export const markDailyAttendance = async (req, res, next) => {
    try {
        const { classId, sectionId, date, attendanceData } = req.body;

        if (!classId || !sectionId || !date || !attendanceData || !Array.isArray(attendanceData)) {
            return next(new ApiError(400, 'Missing required fields'));
        }

        // Validate that user is a teacher
        if (req.user.role !== 'TEACHER') {
            return next(new ApiError(403, 'Only teachers can mark attendance'));
        }

        console.log('Received attendance marking request:', {
            classId,
            sectionId,
            date,
            dateType: typeof date,
            attendanceDataCount: attendanceData.length
        });

        // Parse date if it's a string
        let formattedDate;
        try {
            if (typeof date === 'string') {
                formattedDate = new Date(date);
                if (isNaN(formattedDate.getTime())) {
                    return next(new ApiError(400, 'Invalid date format'));
                }
            } else if (date instanceof Date) {
                formattedDate = date;
            } else {
                return next(new ApiError(400, 'Invalid date type'));
            }
        } catch (error) {
            console.error('Error parsing date:', error);
            return next(new ApiError(400, 'Invalid date format'));
        }

        // Use service method for business logic
        const results = await attendanceService.markDailyAttendance(
            req.user.teacher.id,
            classId,
            sectionId,
            formattedDate,
            attendanceData
        );

        // Use the same formatted date for updating monthly attendance
        updateMonthlyAttendance(classId, sectionId, formattedDate);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    results,
                    'Attendance marked successfully'
                )
            );
    } catch (error) {
        console.error('Error marking attendance:', error);
        next(error);
    }
};

// Helper function to update monthly attendance summary
const updateMonthlyAttendance = async (classId, sectionId, date) => {
    try {
        // Ensure date is a proper Date object
        let dateObj;
        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            console.error('Invalid date format:', date);
            // Default to today's date if invalid
            dateObj = new Date();
        }
        
        if (isNaN(dateObj.getTime())) {
            console.error('Invalid date value:', date);
            dateObj = new Date(); // Default to today if invalid
        }
        
        console.log('Converting date', date, 'to Date object', dateObj);
        await attendanceService.updateDailyAttendanceSummary(classId, sectionId, dateObj);
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
            return next(new ApiError(400, 'Class ID and Section ID are required'));
        }

        // Use service method for business logic
        const statsData = await attendanceService.getAttendanceStats(
            req.user.id,
            req.user.role,
            req.user.role === 'TEACHER' ? req.user.teacher.id : null,
            classId,
            sectionId,
            month,
            year
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    statsData,
                    'Attendance statistics fetched successfully'
                )
            );
    } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        next(error);
    }
};

// Get pending attendance days for a teacher
export const getPendingAttendanceDays = async (req, res, next) => {
    try {
        // Ensure user is a teacher
        if (req.user.role !== 'TEACHER') {
            return next(new ApiError(403, 'Only teachers can access pending attendance information'));
        }

        // Get the teacher's ID
        const teacherId = req.user.teacher.id;

        // Get month and year from query parameters if provided
        const { month, year } = req.query;

        // Use service method to get pending attendance days
        const pendingData = await attendanceService.getPendingAttendanceDays(
            teacherId,
            month ? parseInt(month) : undefined,
            year ? parseInt(year) : undefined
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    pendingData,
                    'Pending attendance days fetched successfully'
                )
            );
    } catch (error) {
        console.error('Error fetching pending attendance days:', error);
        next(error);
    }
};

// Export all controllers
export default {
    markDailyAttendance,
    getDailyAttendance,
    getMonthlyAttendance,
    getAttendanceStats,
    getPendingAttendanceDays
}; 