import { userAPI, resultAPI } from './api';
import { Student as StudentType } from '../types/api';

// Define interface for student results
export interface Student {
    id: number;
    rollNo: string;
    name: string;
    theoryMarks: number;
    practicalMarks: number;
    isEditable: boolean;
    isLocked?: boolean;
}

// Define interface for result data
export interface ResultData {
    id?: number;
    studentId: number;
    subjectId?: number;
    academicYear?: string;
    term?: string;
    theoryMarks?: number;
    practicalMarks?: number;
    totalMarks?: number;
    isAbsent?: boolean;
    isLocked?: boolean;
    grade?: string;
    student?: {
        id: number;
        name: string;
        rollNo?: string;
    };
    subject?: {
        id: number;
        name: string;
    };
    [key: string]: unknown;
}

class ResultService {
    async getStudentsForClassAndSection(
        classId: number | null,
        sectionId: number | null
    ): Promise<Student[]> {
        if (!classId || !sectionId) return [];

        try {
            // Ensure we're fetching students from the specific class and section
            const response = await userAPI.getStudents({
                classId,
                sectionId
            });

            if (response.data?.status === 'success' && Array.isArray(response.data.data.students)) {
                const fetchedStudents = response.data.data.students.map((student: StudentType) => ({
                    id: student.id,
                    rollNo: student.rollNo || '',
                    name: student.name,
                    theoryMarks: 0,
                    practicalMarks: 0,
                    isEditable: true,
                    isLocked: false  // Initialize with unlocked status
                }));

                // Sort students by roll number
                fetchedStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

                return fetchedStudents;
            }

            return [];
        } catch (error) {
            throw error;
        }
    }

    async getExistingResults(
        students: Student[],
        classId: number,
        sectionId: number,
        termId: number,
        academicYearId: number,
        subjectId: number
    ): Promise<Student[]> {
        // If no subject is selected or no students, return as is
        if (!subjectId || students.length === 0) {
            return students;
        }

        try {
            // Fetch results with all specific parameters
            const response = await resultAPI.getResults({
                subjectId,
                classId,
                sectionId,
                academicYear: academicYearId.toString(),
                term: termId.toString()
            });

            // Create a deep copy of students to avoid direct mutation
            const updatedStudents = [...students];

            // Check if we have results
            if (response.data?.status === 'success' && Array.isArray(response.data.data?.results)) {
                const results = response.data.data.results as unknown as ResultData[];

                // Process each student
                for (let i = 0; i < updatedStudents.length; i++) {
                    const student = updatedStudents[i];

                    // Find this student's result in the response
                    const studentResult = results.find(result =>
                        result.studentId === student.id ||
                        (result.student && result.student.id === student.id)
                    );

                    if (studentResult) {
                        // Use the lock status directly from the backend
                        const backendLockStatus = studentResult.isLocked === true;

                        // Set the student's grades and lock status directly from backend
                        student.theoryMarks = typeof studentResult.theoryMarks === 'number' ? studentResult.theoryMarks : 0;
                        student.practicalMarks = typeof studentResult.practicalMarks === 'number' ? studentResult.practicalMarks : 0;
                        student.isLocked = backendLockStatus;
                        student.isEditable = !backendLockStatus;
                    } else {
                        // If no result found for this student and subject, use backend default (unlocked)
                        student.theoryMarks = 0;
                        student.practicalMarks = 0;
                        student.isLocked = false;
                        student.isEditable = true;
                    }
                }
            } else {
                // Reset all students to unlocked if no results found (backend default)
                updatedStudents.forEach(student => {
                    student.theoryMarks = 0;
                    student.practicalMarks = 0;
                    student.isLocked = false;
                    student.isEditable = true;
                });
            }

            return updatedStudents;
        } catch (error) {
            return students; // Return the original students array in case of error
        }
    }

    async saveResults(
        students: Student[],
        subjectId: number,
        academicYear: string,
        term: string,
        fullMarks: number,
        passMarks: number
    ): Promise<boolean> {
        try {
            // Filter for students that are editable (not locked by backend)
            const editableStudents = students.filter(student => student.isEditable);

            if (editableStudents.length === 0) {
                return true; // No updates needed
            }

            // First check current lock status from backend to avoid errors
            try {
                const currentResponse = await resultAPI.getResults({
                    subjectId,
                    academicYear,
                    term
                });

                if (currentResponse.data?.status === 'success' &&
                    Array.isArray(currentResponse.data.data?.results)) {

                    const currentResults = currentResponse.data.data.results as unknown as ResultData[];

                    // Check each student we're about to update
                    for (const student of editableStudents) {
                        const existingResult = currentResults.find(
                            (r) => r.studentId === student.id
                        );

                        if (existingResult) {
                            const backendLocked = existingResult.isLocked === true;
                            if (backendLocked) {
                                // Don't attempt to save this student
                                student.isEditable = false;
                                student.isLocked = true;
                            }
                        }
                    }
                }
            } catch {
                // Continue with save attempt anyway
            }

            // Get the final list of editable students after verification
            const verifiedEditableStudents = editableStudents.filter(s => s.isEditable);

            if (verifiedEditableStudents.length === 0) {
                return false;
            }

            let successCount = 0;
            let failureCount = 0;

            // Process each student
            for (const student of verifiedEditableStudents) {
                try {
                    const result = await resultAPI.createResult({
                        studentId: student.id,
                        subjectId,
                        academicYear,
                        term,
                        fullMarks,
                        passMarks,
                        theoryMarks: student.theoryMarks,
                        practicalMarks: student.practicalMarks,
                    });

                    if (result.data?.status === 'success') {
                        successCount++;
                    } else {
                        failureCount++;
                    }
                } catch {
                    failureCount++;
                }
            }

            return failureCount === 0 && successCount > 0;
        } catch {
            return false;
        }
    }

    processExistingResults(students: Student[], results: unknown[]): Student[] {
        return students.map(student => {
            // Type assert the result to our ResultData interface
            const existingResult = results.find(r => {
                const result = r as ResultData;
                return result.studentId === student.id;
            });

            if (existingResult) {
                const result = existingResult as ResultData;

                // Check if result is locked (from backend)
                const isLocked = result.isLocked !== undefined ? result.isLocked : true;

                return {
                    ...student,
                    theoryMarks: typeof result.theoryMarks === 'number' ? result.theoryMarks : 0,
                    practicalMarks: typeof result.practicalMarks === 'number' ? result.practicalMarks : 0,
                    isEditable: !isLocked, // Set editable based on lock status
                    isLocked: isLocked // Store lock status
                };
            }
            return student;
        });
    }

    async recalculateResults(
        classId: number | null,
        sectionId: number | null,
        academicYear: string,
        term: string
    ): Promise<boolean> {
        if (!classId) return false;

        try {
            const payload = {
                classId,
                ...(sectionId && { sectionId }),
                academicYear,
                term
            };

            const response = await resultAPI.recalculateResults(payload);

            if (response.data?.status === 'success' || response.data?.status === 'partial_success') {
                return true;
            }

            return false;
        } catch (error) {
            throw error;
        }
    }
}

export const resultService = new ResultService();
export default resultService; 