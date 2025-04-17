import { ResultService } from '../services/resultService.js';
import { AppError } from '../middlewares/errorHandler.js';
import { PrismaClient } from '@prisma/client';

const resultService = new ResultService();
const prisma = new PrismaClient();

export const addSubjectResult = async (req, res, next) => {
    try {
        const { 
            studentId, 
            subjectId, 
            academicYear, 
            term, 
            fullMarks, 
            passMarks, 
            theoryMarks, 
            practicalMarks,
            totalMarks,
            totalPercentage,
            grade, 
            isAbsent 
        } = req.body;
        
        if (!studentId || !subjectId || !academicYear || !term || !fullMarks || !passMarks) {
            return next(new AppError(400, 'Please provide all required fields'));
        }

        // Calculate total marks if not provided
        const calculatedTotalMarks = totalMarks || (isAbsent ? 0 : (theoryMarks || 0) + (practicalMarks || 0));

        try {
            // If we need to find or create a new grade definition
            let gradeId;
            
            try {
                // Try to find an existing gradeDefinition for this grade
                const gradeDefinition = await prisma.gradeDefinition.findFirst({
                    where: { grade: grade || 'F' }
                });
                
                if (gradeDefinition) {
                    gradeId = gradeDefinition.id;
                } else {
                    // Use class ID as fallback for gradeId
                    const student = await prisma.student.findUnique({
                        where: { id: Number(studentId) },
                        select: { classId: true }
                    });
                    
                    if (student) {
                        gradeId = student.classId;
                    } else {
                        // Default to subjectId if everything else fails
                        gradeId = Number(subjectId);
                    }
                }
            } catch (gradeError) {
                console.error('Error finding grade definition:', gradeError);
                // Default to subjectId if everything else fails
                gradeId = Number(subjectId);
            }

            const result = await resultService.addSubjectResult({
                studentId: Number(studentId),
                subjectId: Number(subjectId),
                academicYear,
                term,
                fullMarks: Number(fullMarks),
                passMarks: Number(passMarks),
                theoryMarks: Number(theoryMarks || 0),
                practicalMarks: Number(practicalMarks || 0),
                totalMarks: calculatedTotalMarks,
                gradeId,
                isAbsent: Boolean(isAbsent)
            });
            
            res.status(201).json({
                status: 'success',
                data: { result }
            });
        } catch (error) {
            console.error('Error processing result:', error);
            next(new AppError(500, 'Error processing result: ' + error.message));
        }
    } catch (error) {
        console.error('Error in addSubjectResult:', error);
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