import { ResultService } from '../services/resultService.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { prisma } from '../databases/prismaClient.js';

const resultService = new ResultService();

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
            return next(new ApiError(400, 'Missing required fields: studentId, subjectId, academicYear, and term are mandatory'));
        }

        if (fullMarks === undefined || passMarks === undefined) {
            return next(new ApiError(400, 'fullMarks and passMarks are required'));
        }

        if (!isAbsent && (theoryMarks === undefined && practicalMarks === undefined)) {
            return next(new ApiError(400, 'Either theoryMarks or practicalMarks must be provided when student is not absent'));
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
                return next(new ApiError(404, 'Student not found'));
            }

            // Calculate grade based on percentage
            const percentage = calculatedPercentage;
            const gradeValue = resultService.getGradeLetterFromPercentage(percentage);

            // Find the corresponding grade definition
            const gradeDefinition = await prisma.gradeDefinition.findFirst({
                where: { grade: gradeValue }
            });

            if (!gradeDefinition) {
                return next(new ApiError(404, `Grade definition not found for grade: ${gradeValue}. Please create grade definitions first.`));
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
                isAbsent: Boolean(isAbsent),
                isLocked: true
            });

            console.log('Created/updated result with isLocked:', result.isLocked);

            // Calculate overall result immediately after saving subject result
            try {
                const overallResult = await resultService.calculateOverallResult(Number(studentId), academicYear, term);

                // Return both the subject result and the updated overall result
                return res.status(201).json(
                    new ApiResponse(
                        201,
                        {
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
                        `Result saved for ${student.name} and overall result updated`
                    )
                );
            } catch (overallError) {
                console.error('Error calculating overall result:', overallError);

                // Still return success for the subject result, but with a warning
                return res.status(201).json(
                    new ApiResponse(
                        201,
                        { result },
                        'Subject result saved successfully, but failed to update overall result'
                    )
                );
            }
        } catch (error) {
            console.error('Error processing result:', error);
            next(new ApiError(500, 'Error processing result: ' + error.message));
        }
    } catch (error) {
        console.error('Error in addSubjectResult:', error);
        next(error);
    }
};

export const getSubjectResults = async (req, res, next) => {
    try {
        const { studentId, classId, sectionId, subjectId, academicYear, term } = req.query;

        // If studentId is provided, get results for that specific student
        if (studentId && academicYear && term) {
            const results = await resultService.getSubjectResults(studentId, academicYear, term);

            return res.status(200).json(
                new ApiResponse(
                    200,
                    { results },
                    'Results fetched successfully'
                )
            );
        }

        // If classId, sectionId, and subjectId are provided, get results for all students in the class/section for the subject
        if (classId && sectionId && subjectId && academicYear && term) {
            // Get all students in this class and section
            const students = await prisma.student.findMany({
                where: {
                    classId: Number(classId),
                    sectionId: Number(sectionId)
                },
                select: { id: true }
            });

            if (students.length === 0) {
                return next(new ApiError(404, 'No students found in the specified class/section'));
            }

            // Get all results for the students in the class/section for the specific subject
            const results = await prisma.subjectResult.findMany({
                where: {
                    studentId: { in: students.map(s => s.id) },
                    subjectId: Number(subjectId),
                    academicYear,
                    term
                },
                include: {
                    student: {
                        select: {
                            name: true,
                            rollNo: true
                        }
                    },
                    subject: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    student: {
                        rollNo: 'asc'
                    }
                }
            });

            console.log('Fetched results for class/section with lock status:', results.map(r => ({
                id: r.id,
                studentId: r.studentId,
                isLocked: r.isLocked
            })));

            return res.status(200).json(
                new ApiResponse(
                    200,
                    { results },
                    'Results fetched successfully'
                )
            );
        }

        // If we get here, required parameters are missing
        return next(new ApiError(400, 'Please provide either studentId OR (classId, sectionId, and subjectId) along with academicYear and term'));
    } catch (error) {
        console.error('Error in getSubjectResults:', error);
        next(error);
    }
};

export const getOverallResult = async (req, res, next) => {
    try {
        const { studentId, academicYear, term } = req.query;

        if (!studentId || !academicYear || !term) {
            return next(new ApiError(400, 'Please provide studentId, academicYear, and term'));
        }

        // Convert studentId to a number to fix Prisma type error
        const result = await resultService.getOverallResult(Number(studentId), academicYear, term);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { result },
                    'Overall result calculated successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

export const calculateOverallResult = async (req, res, next) => {
    try {
        const { studentId, academicYear, term } = req.body;

        if (!studentId || !academicYear || !term) {
            return next(new ApiError(400, 'Please provide studentId, academicYear, and term'));
        }

        const result = await resultService.calculateOverallResult(studentId, academicYear, term);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { result },
                    'Overall result calculated successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

export const recalculateResults = async (req, res, next) => {
    try {
        const { studentId, classId, sectionId, academicYear, term } = req.body;

        if (!academicYear || !term) {
            return next(new ApiError(400, 'Academic year and term are required'));
        }

        // Check if we're calculating for a specific student or for a class/section
        if (studentId) {
            // Recalculate for a single student
            const student = await prisma.student.findUnique({
                where: { id: Number(studentId) },
                select: { name: true }
            });

            if (!student) {
                return next(new ApiError(404, 'Student not found'));
            }

            const result = await resultService.calculateOverallResult(Number(studentId), academicYear, term);

            return res.status(200).json(
                new ApiResponse(
                    200,
                    { result },
                    `Results recalculated for student ${student.name}`
                )
            );
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
                return next(new ApiError(404, 'No students found in the specified class/section'));
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

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        processedCount: results.length,
                        errorCount: errors.length,
                        results,
                        errors: errors.length > 0 ? errors : undefined
                    },
                    `Recalculated results for ${results.length} students with ${errors.length} errors`
                )
            );
        } else {
            return next(new ApiError(400, 'Either studentId or classId must be provided'));
        }
    } catch (error) {
        console.error('Error in recalculateResults:', error);
        next(error);
    }
};

export const toggleSubjectResultLock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isLocked } = req.body;

        if (isLocked === undefined) {
            return next(new ApiError(400, 'isLocked status is required'));
        }

        // Check if the result exists
        const result = await prisma.subjectResult.findUnique({
            where: { id: Number(id) },
            include: {
                student: {
                    select: { name: true }
                },
                subject: {
                    select: { name: true }
                }
            }
        });

        if (!result) {
            return next(new ApiError(404, 'Subject result not found'));
        }

        // Update the lock status
        const updatedResult = await prisma.subjectResult.update({
            where: { id: Number(id) },
            data: {
                isLocked: Boolean(isLocked),
                updatedAt: new Date()
            },
            include: {
                student: {
                    select: { name: true }
                },
                subject: {
                    select: { name: true }
                }
            }
        });

        const action = isLocked ? 'locked' : 'unlocked';

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { result: updatedResult },
                    `Result ${action} for ${result.student.name}'s ${result.subject.name} subject`
                )
            );
    } catch (error) {
        console.error('Error toggling subject result lock:', error);
        next(error);
    }
}; 