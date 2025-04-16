import { AttendanceService } from '../services/attendanceService.js';
import { AppError } from '../middlewares/errorHandler.js';

const attendanceService = new AttendanceService();

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
        
        if (!studentId || !month || !year) {
            return next(new AppError(400, 'Please provide studentId, month, and year'));
        }

        const attendance = await attendanceService.getMonthlyAttendance(studentId, month, year);
        
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