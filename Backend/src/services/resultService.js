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

            // If result exists, update it instead of creating a new one
            if (existingResult) {
                // Calculate total marks
                const totalMarks = isAbsent ? 0 : (theoryMarks || 0) + (practicalMarks || 0);

                // Get grade based on total marks
                const grade = await this.calculateGrade(totalMarks, fullMarks);

                // Update existing result
                const updatedResult = await prisma.subjectResult.update({
                    where: {
                        id: existingResult.id
                    },
                    data: {
                        theoryMarks,
                        practicalMarks,
                        totalMarks,
                        gradeId: grade.id,
                        isAbsent,
                        updatedAt: new Date()
                    }
                });

                // Recalculate overall result
                await this.calculateOverallResult(studentId, academicYear, term);

                return updatedResult;
            }

            // Calculate total marks for new result
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
            // Get all subject results for this student, term and academic year
            const subjectResults = await prisma.subjectResult.findMany({
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

            if (subjectResults.length === 0) {
                throw new AppError(400, 'No subject results found for calculation');
            }

            // Get all subjects assigned to the student's class
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                include: {
                    class: {
                        include: {
                            subjects: {
                                include: {
                                    subject: true
                                }
                            },
                            teacherClasses: {
                                include: { teacher: true }
                            }
                        }
                    },
                    section: true
                }
            });

            if (!student) {
                throw new AppError(404, 'Student not found');
            }

            // Get expected subjects for this class
            const expectedSubjectIds = student.class.subjects.map(s => s.subjectId);
            
            // Calculate how many subjects have marks entered vs total expected
            const subjectsWithMarks = new Set(subjectResults.map(r => r.subjectId));
            const completedSubjectsCount = subjectsWithMarks.size;
            const totalExpectedSubjects = expectedSubjectIds.length;

            // Determine if all subjects have results
            const isComplete = completedSubjectsCount >= totalExpectedSubjects;
            
            // Calculate result metrics based on entered subjects
            const totalMarks = subjectResults.reduce((sum, result) => sum + result.totalMarks, 0);
            const totalFullMarks = subjectResults.reduce((sum, result) => sum + result.fullMarks, 0);
            const totalPercentage = totalFullMarks > 0 ? (totalMarks / totalFullMarks) * 100 : 0;

            // Determine result status (pass/fail)
            const resultStatus = this.determineResultStatus(subjectResults, totalPercentage);
            
            // Calculate strongest and weakest subjects
            let strongestSubject = null;
            let weakestSubject = null;
            let subjectsToImprove = [];

            if (subjectResults.length > 0) {
                // Find strongest subject (highest percentage)
                const subjectPercentages = subjectResults.map(result => ({
                    subjectId: result.subjectId,
                    subjectName: result.subject.name,
                    percentage: (result.totalMarks / result.fullMarks) * 100
                }));

                subjectPercentages.sort((a, b) => b.percentage - a.percentage);
                strongestSubject = subjectPercentages[0]?.subjectName || null;
                
                // Find subjects that need improvement (below 50%)
                subjectsToImprove = subjectPercentages
                    .filter(s => s.percentage < 50)
                    .map(s => s.subjectName);
                    
                // Find weakest subject
                weakestSubject = subjectPercentages[subjectPercentages.length - 1]?.subjectName || null;
            }

            // Get class teacher
            const classTeacher = student.class.teacherClasses[0]?.teacher;
            let classTeacherId = 1; // Default value
            
            if (classTeacher && classTeacher.id) {
                classTeacherId = classTeacher.id;
            } else {
                console.warn('No teacher found for class. Using default teacher ID.');
            }

            // Prepare overall result data
            const resultData = {
                studentId,
                academicYear,
                term,
                totalPercentage,
                status: resultStatus,
                strongestSubject,
                subjectsToImprove,
                rank: null, // Will be calculated separately in a batch process
                classTeacherId // Use the variable we defined above
            };

            // Create or update overall result
            const overallResult = await prisma.overallResult.upsert({
                where: {
                    studentId_academicYear_term: {
                        studentId,
                        academicYear,
                        term
                    }
                },
                update: resultData,
                create: resultData
            });

            // Add processing status to return value but not to database
            return {
                ...overallResult,
                completedSubjects: completedSubjectsCount,
                totalSubjects: totalExpectedSubjects,
                processingStatus: isComplete ? 'COMPLETE' : 'IN_PROGRESS'
            };
        } catch (error) {
            console.error('Error calculating overall result:', error);
            throw error;
        }
    }

    async calculateGrade(totalMarks, fullMarks) {
        const percentage = (totalMarks / fullMarks) * 100;

        try {
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
                // Return a default class ID 1 if no grade definition is found
                // This will later be replaced with the student's class ID in the controller
                return { id: 1, grade: this.getGradeLetterFromPercentage(percentage) };
            }

            return grade;
        } catch (error) {
            console.error('Error finding grade definition:', error);
            // Return a default grade object
            return { id: 1, grade: this.getGradeLetterFromPercentage(percentage) };
        }
    }

    // Helper method to get grade letter from percentage
    getGradeLetterFromPercentage(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        return 'F';
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

    /**
     * Batch process to update all results for a given class, section, academic year and term
     * @param {number} classId - Class ID
     * @param {number} sectionId - Section ID
     * @param {string} academicYear - Academic year (e.g. "2023-2024")
     * @param {string} term - Term (e.g. "First Term")
     * @returns {Promise<{updated: number, failed: number}>} - Number of updated and failed records
     */
    async recalculateClassResults(classId, sectionId, academicYear, term) {
        try {
            // Get all students in this class and section
            const students = await prisma.student.findMany({
                where: {
                    classId,
                    sectionId
                }
            });

            let updated = 0;
            let failed = 0;

            // Process each student
            for (const student of students) {
                try {
                    await this.calculateOverallResult(student.id, academicYear, term);
                    updated++;
                } catch (error) {
                    console.error(`Failed to update result for student ${student.id}:`, error);
                    failed++;
                }
            }

            return { updated, failed };
        } catch (error) {
            console.error('Error in batch recalculation:', error);
            throw error;
        }
    }
} 