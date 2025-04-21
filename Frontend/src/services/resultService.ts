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
            console.log(`Fetching students for class ${classId}, section ${sectionId}`);
            
            // Ensure we're fetching students from the specific class and section
            const response = await userAPI.getStudents({
                classId,
                sectionId
            });
            
            console.log("Students API response:", response.data);
            
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
                console.log("Fetched and sorted students:", fetchedStudents);
                
                return fetchedStudents;
            }
            
            console.error("Failed to load students or empty response");
            return [];
        } catch (error) {
            console.error('Error fetching students:', error);
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
            console.log("No subject selected or no students to fetch results for");
            return students;
        }

        try {
            console.log(`Fetching results for class=${classId}, section=${sectionId}, term=${termId}, academicYear=${academicYearId}, subject=${subjectId}`);
            
            // Fetch results with all specific parameters
            const response = await resultAPI.getResults({
                subjectId,
                classId,
                sectionId,
                academicYear: academicYearId.toString(),
                term: termId.toString()
            });
            
            console.log("API response:", response.data);

            // Create a deep copy of students to avoid direct mutation
            const updatedStudents = [...students];

            // Check if we have results
            if (response.data?.status === 'success' && Array.isArray(response.data.data?.results)) {
                const results = response.data.data.results as unknown as ResultData[];
                console.log(`Found ${results.length} results for subject ${subjectId}`);
                
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
                        
                        console.log(
                            `Student ${student.id} (${student.name}) - ` +
                            `Backend lock status: ${backendLockStatus ? 'LOCKED' : 'UNLOCKED'}`
                        );
                        
                        // Set the student's grades and lock status directly from backend
                        student.theoryMarks = typeof studentResult.theoryMarks === 'number' ? studentResult.theoryMarks : 0;
                        student.practicalMarks = typeof studentResult.practicalMarks === 'number' ? studentResult.practicalMarks : 0;
                        student.isLocked = backendLockStatus;
                        student.isEditable = !backendLockStatus;
                    } else {
                        // If no result found for this student and subject, use backend default (unlocked)
                        console.log(`No result found for student ${student.id} in subject ${subjectId}. Using backend default (unlocked).`);
                        student.theoryMarks = 0;
                        student.practicalMarks = 0;
                        student.isLocked = false;
                        student.isEditable = true;
                    }
                }
            } else {
                console.log(`No results found for this combination. Using backend default (unlocked) for all students.`);
                // Reset all students to unlocked if no results found (backend default)
                updatedStudents.forEach(student => {
                    student.theoryMarks = 0;
                    student.practicalMarks = 0;
                    student.isLocked = false;
                    student.isEditable = true;
                });
            }
            
            console.log(`Completed fetching results for subject ${subjectId}. Returning ${updatedStudents.length} students.`);
            return updatedStudents;
        } catch (error) {
            console.error("Error fetching results:", error);
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
            console.log('Saving results for students:', students.length);
            
            // Filter for students that are editable (not locked by backend)
            const editableStudents = students.filter(student => student.isEditable);
            
            if (editableStudents.length === 0) {
                console.log('No editable students to save');
                return true; // No updates needed
            }
            
            console.log(`Saving results for ${editableStudents.length} editable students`);
            
            // First check current lock status from backend to avoid errors
            try {
                console.log(`Verifying lock status before saving results`);
                const currentResponse = await resultAPI.getResults({
                    subjectId,
                    academicYear,
                    term
                });
                
                if (currentResponse.data?.status === 'success' && 
                    Array.isArray(currentResponse.data.data?.results)) {
                    
                    const currentResults = currentResponse.data.data.results as unknown as ResultData[];
                    console.log(`Got ${currentResults.length} current results for verification`);
                    
                    // Check each student we're about to update
                    for (const student of editableStudents) {
                        const existingResult = currentResults.find(
                            (r) => r.studentId === student.id
                        );
                        
                        if (existingResult) {
                            const backendLocked = existingResult.isLocked === true;
                            if (backendLocked) {
                                console.error(
                                    `LOCK STATUS MISMATCH: Student ${student.id} (${student.name}) - ` +
                                    `Frontend shows unlocked but backend reports locked!`
                                );
                                // Don't attempt to save this student
                                student.isEditable = false;
                                student.isLocked = true;
                            } else {
                                console.log(
                                    `Student ${student.id} (${student.name}) - ` +
                                    `Lock status verified as unlocked, proceed with saving`
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error verifying lock status:', error);
                // Continue with save attempt anyway
            }
            
            // Get the final list of editable students after verification
            const verifiedEditableStudents = editableStudents.filter(s => s.isEditable);
            console.log(`After verification, ${verifiedEditableStudents.length} students are editable`);
            
            if (verifiedEditableStudents.length === 0) {
                console.warn('No students are editable after verification!');
                return false;
            }
            
            let successCount = 0;
            let failureCount = 0;
            
            // Process each student
            for (const student of verifiedEditableStudents) {
                try {
                    console.log(`Saving result for student ${student.id} (${student.name})`);
                    
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
                        console.log(`Successfully saved result for student ${student.id}`);
                        successCount++;
                    } else {
                        console.error(`Failed to save result for student ${student.id}:`, result.data?.message);
                        failureCount++;
                    }
                } catch (error) {
                    console.error(`Error saving result for student ${student.id}:`, error);
                    failureCount++;
                }
            }
            
            console.log(`Save results complete: ${successCount} successful, ${failureCount} failed`);
            return failureCount === 0 && successCount > 0;
        } catch (error) {
            console.error('Error saving results:', error);
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
                console.log(`Found existing result for student ${student.id}:`, result);
                
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
            console.log(`Recalculating results for class ${classId}, section ${sectionId || 'all'}, year ${academicYear}, term ${term}`);
            
            const payload = {
                classId,
                ...(sectionId && { sectionId }),
                academicYear,
                term
            };
            
            const response = await resultAPI.recalculateResults(payload);
            
            if (response.data?.status === 'success' || response.data?.status === 'partial_success') {
                console.log("Results recalculation response:", response.data);
                return true;
            }
            
            console.error("Failed to recalculate results");
            return false;
        } catch (error) {
            console.error('Error recalculating results:', error);
            throw error;
        }
    }
}

export const resultService = new ResultService();
export default resultService; 