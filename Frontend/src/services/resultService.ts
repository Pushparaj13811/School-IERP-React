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
    isAbsent?: boolean;
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
                    isEditable: true
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
        subjectId: number | null,
        academicYear: string,
        term: string
    ): Promise<Student[]> {
        if (!subjectId || students.length === 0) return students;
        
        try {
            console.log(`Checking for existing results for subject ${subjectId}, year ${academicYear}, term ${term}`);
            const existingResults = await resultAPI.getResults({
                subjectId,
                academicYear,
                term
            });
            
            console.log("Existing results response:", existingResults.data);
            
            if (existingResults.data?.status === 'success' && 
                existingResults.data.data.results && 
                Array.isArray(existingResults.data.data.results) &&
                existingResults.data.data.results.length > 0) {
                
                // Map existing results to students
                const updatedStudents = this.processExistingResults(students, existingResults.data.data.results);
                
                console.log("Updated students with existing results:", updatedStudents);
                return updatedStudents;
            }
            
            return students;
        } catch (error) {
            console.error('Error fetching existing results:', error);
            // Return original students array if there was an error
            return students;
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
            // Create result data for each student
            const results = students.map(student => ({
                studentId: student.id,
                subjectId,
                academicYear,
                term,
                fullMarks,
                passMarks,
                theoryMarks: student.theoryMarks,
                practicalMarks: student.practicalMarks,
                isAbsent: false // Add UI for marking absent if needed
            }));

            console.log("Saving results:", results);
            
            // Save each result
            const savePromises = results.map(result => 
                resultAPI.createResult(result)
            );

            await Promise.all(savePromises);
            console.log('Results saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving results:', error);
            throw error;
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
                return {
                    ...student,
                    theoryMarks: typeof result.theoryMarks === 'number' ? result.theoryMarks : 0,
                    practicalMarks: typeof result.practicalMarks === 'number' ? result.practicalMarks : 0,
                    isEditable: false // Lock edited marks
                };
            }
            return student;
        });
    }
}

export const resultService = new ResultService();
export default resultService; 