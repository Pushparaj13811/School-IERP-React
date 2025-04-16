import { ResultService } from '../services/resultService.js';
import { AppError } from '../middlewares/errorHandler.js';

const resultService = new ResultService();

export const addSubjectResult = async (req, res, next) => {
    try {
        const { studentId, subjectId, academicYear, term, fullMarks, passMarks, theoryMarks, practicalMarks, isAbsent } = req.body;
        
        if (!studentId || !subjectId || !academicYear || !term || !fullMarks || !passMarks) {
            return next(new AppError(400, 'Please provide all required fields'));
        }

        const result = await resultService.addSubjectResult({
            studentId,
            subjectId,
            academicYear,
            term,
            fullMarks,
            passMarks,
            theoryMarks,
            practicalMarks,
            isAbsent
        });
        
        res.status(201).json({
            status: 'success',
            data: { result }
        });
    } catch (error) {
        next(error);
    }
};

export const getSubjectResults = async (req, res, next) => {
    try {
        const { studentId, academicYear, term } = req.query;
        
        if (!studentId || !academicYear || !term) {
            return next(new AppError(400, 'Please provide studentId, academicYear, and term'));
        }

        const results = await resultService.getSubjectResults(studentId, academicYear, term);
        
        res.status(200).json({
            status: 'success',
            data: { results }
        });
    } catch (error) {
        next(error);
    }
};

export const getOverallResult = async (req, res, next) => {
    try {
        const { studentId, academicYear, term } = req.query;
        
        if (!studentId || !academicYear || !term) {
            return next(new AppError(400, 'Please provide studentId, academicYear, and term'));
        }

        const result = await resultService.getOverallResult(studentId, academicYear, term);
        
        res.status(200).json({
            status: 'success',
            data: { result }
        });
    } catch (error) {
        next(error);
    }
};

export const calculateOverallResult = async (req, res, next) => {
    try {
        const { studentId, academicYear, term } = req.body;
        
        if (!studentId || !academicYear || !term) {
            return next(new AppError(400, 'Please provide studentId, academicYear, and term'));
        }

        const result = await resultService.calculateOverallResult(studentId, academicYear, term);
        
        res.status(200).json({
            status: 'success',
            data: { result }
        });
    } catch (error) {
        next(error);
    }
}; 