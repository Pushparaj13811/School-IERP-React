import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler.js';

const prisma = new PrismaClient();

export class ResultService {
    async addSubjectResult(data) {
        try {
            const { studentId, subjectId, academicYear, term, fullMarks, passMarks, theoryMarks, practicalMarks, isAbsent } = data;

            // Check if result already exists
            const existingResult = await prisma.subjectResult.findFirst({
                where: {
                    studentId,
                    subjectId,
                    academicYear,
                    term
                }
            });

            if (existingResult) {
                throw new AppError(400, 'Result already exists for this subject, term, and academic year');
            }

            // Calculate total marks
            const totalMarks = isAbsent ? 0 : (theoryMarks || 0) + (practicalMarks || 0);

            // Get grade based on total marks
            const grade = await this.calculateGrade(totalMarks, fullMarks);

            // Create subject result
            const result = await prisma.subjectResult.create({
                data: {
                    studentId,
                    subjectId,
                    academicYear,
                    term,
                    fullMarks,
                    passMarks,
                    theoryMarks,
                    practicalMarks,
                    totalMarks,
                    gradeId: grade.id,
                    isAbsent
                }
            });

            // Update overall result
            await this.calculateOverallResult(studentId, academicYear, term);

            return result;
        } catch (error) {
            throw error;
        }
    }

    async getSubjectResults(studentId, academicYear, term) {
        try {
            const results = await prisma.subjectResult.findMany({
                where: {
                    studentId,
                    academicYear,
                    term
                },
                include: {
                    subject: true,
                    grade: true
                }
            });

            return results;
        } catch (error) {
            throw error;
        }
    }

    async getOverallResult(studentId, academicYear, term) {
        try {
            const result = await prisma.overallResult.findFirst({
                where: {
                    studentId,
                    academicYear,
                    term
                },
                include: {
                    subjectResults: {
                        include: {
                            subject: true,
                            grade: true
                        }
                    }
                }
            });

            return result;
        } catch (error) {
            throw error;
        }
    }

    async calculateOverallResult(studentId, academicYear, term) {
        try {
            // Get all subject results
            const subjectResults = await prisma.subjectResult.findMany({
                where: {
                    studentId,
                    academicYear,
                    term
                },
                include: {
                    grade: true
                }
            });

            if (subjectResults.length === 0) {
                throw new AppError(400, 'No subject results found for calculation');
            }

            // Calculate total percentage
            const totalMarks = subjectResults.reduce((sum, result) => sum + result.totalMarks, 0);
            const totalFullMarks = subjectResults.reduce((sum, result) => sum + result.fullMarks, 0);
            const totalPercentage = (totalMarks / totalFullMarks) * 100;

            // Determine result status
            const status = this.determineResultStatus(subjectResults, totalPercentage);

            // Get class teacher
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    class: {
                        include: {
                            teacherClasses: {
                                where: { isClassTeacher: true },
                                include: { teacher: true }
                            }
                        }
                    }
                }
            });

            const classTeacher = student.class.teacherClasses[0]?.teacher;

            if (!classTeacher) {
                throw new AppError(400, 'Class teacher not found');
            }

            // Create or update overall result
            const overallResult = await prisma.overallResult.upsert({
                where: {
                    studentId_academicYear_term: {
                        studentId,
                        academicYear,
                        term
                    }
                },
                update: {
                    totalPercentage,
                    status,
                    classTeacherId: classTeacher.id
                },
                create: {
                    studentId,
                    academicYear,
                    term,
                    totalPercentage,
                    status,
                    classTeacherId: classTeacher.id
                }
            });

            return overallResult;
        } catch (error) {
            throw error;
        }
    }

    async calculateGrade(totalMarks, fullMarks) {
        const percentage = (totalMarks / fullMarks) * 100;

        const grade = await prisma.gradeDefinition.findFirst({
            where: {
                minScore: {
                    lte: percentage
                },
                maxScore: {
                    gte: percentage
                }
            }
        });

        if (!grade) {
            throw new AppError(400, 'Grade not found for the given marks');
        }

        return grade;
    }

    determineResultStatus(subjectResults, totalPercentage) {
        // Check if any subject is failed
        const hasFailed = subjectResults.some(result => {
            if (result.isAbsent) return true;
            return result.totalMarks < result.passMarks;
        });

        if (hasFailed) {
            return 'FAILED';
        }

        // Check if total percentage meets passing criteria
        if (totalPercentage >= 40) {
            return 'PASSED';
        }

        return 'FAILED';
    }
} 