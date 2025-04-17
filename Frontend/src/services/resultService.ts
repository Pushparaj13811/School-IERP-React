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
    isAbsent?: boolean;
    isLocked?: boolean;
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
        subjectId: number | null,
        academicYear: string,
        term: string
    ): Promise<Student[]> {
        if (!subjectId || students.length === 0) return students;
        
        try {
            console.log(`Checking for existing results for subject ${subjectId}, year ${academicYear}, term ${term}`);
            
            // Create an array to hold updated students
            const updatedStudents: Student[] = [...students];
            
            // Fetch results for each student individually to ensure we get the correct lock status
            for (let i = 0; i < students.length; i++) {
                const student = students[i];
                try {
                    const existingResult = await resultAPI.getResults({
                        studentId: student.id,
                        subjectId,
                        academicYear,
                        term
                    });
                    
                    console.log(`API response for student ${student.id}:`, JSON.stringify(existingResult.data));
                    
                    if (existingResult.data?.status === 'success' && 
                        existingResult.data.data.results && 
                        Array.isArray(existingResult.data.data.results) &&
                        existingResult.data.data.results.length > 0) {
                        
                        // Get the first result (should only be one for this combination)
                        const result = existingResult.data.data.results[0] as unknown as ResultData;
                        
                        // Check if the result is locked - explicitly handle the value
                        let isLocked = true; // Default to locked for safety
                        if (result.isLocked === false) {
                            isLocked = false;
                        }
                        
                        console.log(`Student ${student.id} result has isLocked=${isLocked}, raw value:`, 
                            typeof result.isLocked, result.isLocked);
                        
                        // Update the student with the result data
                        updatedStudents[i] = {
                            ...student,
                            theoryMarks: typeof result.theoryMarks === 'number' ? result.theoryMarks : 0,
                            practicalMarks: typeof result.practicalMarks === 'number' ? result.practicalMarks : 0,
                            isEditable: !isLocked, // Set editable based on lock status
                            isLocked: isLocked // Store lock status
                        };
                        
                        console.log(`Updated student ${student.id}:`, updatedStudents[i]);
                    } else {
                        console.log(`No results found for student ${student.id}`);
                    }
                } catch (error) {
                    console.error(`Error fetching results for student ${student.id}:`, error);
                }
            }
            
            return updatedStudents;
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
            const results = students.map(student => {
                // Calculate total marks (theory + practical)
                const totalMarks = student.theoryMarks + student.practicalMarks;
                
                return {
                    studentId: student.id,
                    subjectId,
                    academicYear,
                    term,
                    fullMarks,
                    passMarks,
                    theoryMarks: student.theoryMarks,
                    practicalMarks: student.practicalMarks,
                    totalMarks,
                    isAbsent: false
                };
            });

            console.log("Saving results:", results);
            
            // Save each result - use POST request directly with manually constructed parameters
            const savePromises = results.map(result => 
                resultAPI.createResult(result)
            );

            const responses = await Promise.all(savePromises.map(promise => 
                promise.catch(error => {
                    console.error('Error in individual result save:', error.response?.data || error.message);
                    return { error };
                })
            ));

            // Check if all saves were successful
            const allSuccessful = responses.every(res => !res.error);
            
            if (allSuccessful) {
                console.log('All results saved successfully');
                return true;
            } else {
                console.log('Some results failed to save');
                return false;
            }
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