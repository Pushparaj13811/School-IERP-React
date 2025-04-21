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

        // Use service method for business logic
        const results = await attendanceService.markDailyAttendance(
            req.user.teacher.id,
            classId,
            sectionId,
            date,
            attendanceData
        );

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
        await attendanceService.updateDailyAttendanceSummary(classId, sectionId, date);
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

// Export all controllers
export default {
    markDailyAttendance,
    getDailyAttendance,
    getMonthlyAttendance,
    getAttendanceStats
}; 