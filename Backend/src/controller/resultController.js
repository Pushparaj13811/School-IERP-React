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
            isAbsent 
        } = req.body;
        
        if (!studentId || !subjectId || !academicYear || !term) {
            return next(new AppError(400, 'Missing required fields: studentId, subjectId, academicYear, and term are mandatory'));
        }

        if (fullMarks === undefined || passMarks === undefined) {
            return next(new AppError(400, 'fullMarks and passMarks are required'));
        }

        if (!isAbsent && (theoryMarks === undefined && practicalMarks === undefined)) {
            return next(new AppError(400, 'Either theoryMarks or practicalMarks must be provided when student is not absent'));
        }

        // Calculate total marks if not provided
        const calculatedTotalMarks = totalMarks || (isAbsent ? 0 : (theoryMarks || 0) + (practicalMarks || 0));
        const calculatedPercentage = (calculatedTotalMarks / fullMarks) * 100;

        try {
            // Find student's class for grade calculation
            const student = await prisma.student.findUnique({
                where: { id: Number(studentId) },
                select: { 
                    classId: true,
                    name: true 
                }
            });
            
            if (!student) {
                return next(new AppError(404, 'Student not found'));
            }

            // Calculate grade based on percentage
            const percentage = calculatedPercentage;
            const gradeValue = resultService.getGradeLetterFromPercentage(percentage);
            
            // Find the corresponding grade definition
            const gradeDefinition = await prisma.gradeDefinition.findFirst({
                where: { grade: gradeValue }
            });
            
            if (!gradeDefinition) {
                return next(new AppError(404, `Grade definition not found for grade: ${gradeValue}. Please create grade definitions first.`));
            }
            
            const gradeId = gradeDefinition.id;
            console.log(`Using grade definition: ${gradeDefinition.grade} (ID: ${gradeId}) for percentage: ${percentage}`);

            // Create or update subject result
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
            
            // Calculate overall result immediately after saving subject result
            try {
                const overallResult = await resultService.calculateOverallResult(Number(studentId), academicYear, term);
                
                // Return both the subject result and the updated overall result
                res.status(201).json({
                    status: 'success',
                    data: { 
                        subjectResult: result,
                        overallResult: {
                            totalMarks: overallResult.totalMarks,
                            totalFullMarks: overallResult.totalFullMarks,
                            totalPercentage: overallResult.totalPercentage,
                            status: overallResult.status,
                            processingStatus: overallResult.processingStatus,
                            completedSubjects: overallResult.completedSubjects,
                            totalSubjects: overallResult.totalSubjects
                        }
                    },
                    message: `Result saved for ${student.name} and overall result updated`
                });
            } catch (overallError) {
                console.error('Error calculating overall result:', overallError);
                
                // Still return success for the subject result, but with a warning
                res.status(201).json({
                    status: 'partial_success',
                    data: { result },
                    message: 'Subject result saved successfully, but failed to update overall result'
                });
            }
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

export const recalculateResults = async (req, res, next) => {
    try {
        const { studentId, classId, sectionId, academicYear, term } = req.body;
        
        if (!academicYear || !term) {
            return next(new AppError(400, 'Academic year and term are required'));
        }
        
        // Check if we're calculating for a specific student or for a class/section
        if (studentId) {
            // Recalculate for a single student
            const student = await prisma.student.findUnique({
                where: { id: Number(studentId) },
                select: { name: true }
            });
            
            if (!student) {
                return next(new AppError(404, 'Student not found'));
            }
            
            const result = await resultService.calculateOverallResult(Number(studentId), academicYear, term);
            
            return res.status(200).json({
                status: 'success',
                data: { result },
                message: `Results recalculated for student ${student.name}`
            });
        } else if (classId) {
            // Recalculate for an entire class or section
            const where = { 
                classId: Number(classId),
                ...(sectionId && { sectionId: Number(sectionId) })
            };
            
            const students = await prisma.student.findMany({
                where,
                select: { id: true }
            });
            
            if (students.length === 0) {
                return next(new AppError(404, 'No students found in the specified class/section'));
            }
            
            const results = [];
            const errors = [];
            
            // Process all students in parallel
            await Promise.all(students.map(async (student) => {
                try {
                    const result = await resultService.calculateOverallResult(student.id, academicYear, term);
                    results.push({
                        studentId: student.id,
                        result
                    });
                } catch (error) {
                    errors.push({
                        studentId: student.id,
                        error: error.message
                    });
                }
            }));
            
            return res.status(200).json({
                status: errors.length > 0 ? 'partial_success' : 'success',
                data: {
                    processedCount: results.length,
                    errorCount: errors.length,
                    results,
                    errors: errors.length > 0 ? errors : undefined
                },
                message: `Recalculated results for ${results.length} students with ${errors.length} errors`
            });
        } else {
            return next(new AppError(400, 'Either studentId or classId must be provided'));
        }
    } catch (error) {
        console.error('Error in recalculateResults:', error);
        next(error);
    }
}; 