import { academicAPI, userAPI } from './api';
import { Teacher, Class, Section, Subject } from '../types/api';

export interface TeacherSubjectWrapper {
    subject?: Subject;
    class?: Class;
    section?: Section;
    id?: number;
    name?: string;
    code?: string;
    [key: string]: unknown;
}

class TeacherService {
    async getTeacherProfile(): Promise<Teacher | null> {
        try {
            console.log("Fetching teacher profile...");
            
            const response = await userAPI.getProfile();
            console.log("Full profile response:", response);
            
            const responseData = response.data;
            
            if (responseData?.status === 'success') {
                // Type assertion to access the nested structure safely
                const userData = responseData.data as { user?: { teacher?: Teacher } };
                
                if (userData?.user?.teacher) {
                    console.log("Teacher data found:", userData.user.teacher);
                    return userData.user.teacher;
                } else {
                    console.error("Teacher data not found in response");
                    return null;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching teacher profile:', error);
            throw error;
        }
    }

    async getAssignedClasses(teacherData: Teacher | null): Promise<Class[]> {
        if (!teacherData) {
            // Fallback: fetch all classes if teacher data is not available
            try {
                const classesResponse = await academicAPI.getClasses();
                if (classesResponse.data?.status === 'success') {
                    console.log("Loaded all classes as fallback");
                    return classesResponse.data.data.classes;
                }
            } catch (error) {
                console.error("Failed to load classes:", error);
            }
            return [];
        }

        try {
            console.log("Processing teacher classes from:", teacherData);
            
            // Check for classes array and its structure
            if (!teacherData.classes || !Array.isArray(teacherData.classes)) {
                console.error("No classes array found in teacher data");
                return [];
            }
            
            // Extract classes assigned to the teacher
            const teacherClasses = teacherData.classes
                .map(c => {
                    // Log the class object to debug its structure
                    console.log("Class entry:", c);
                    
                    if (c && typeof c === 'object') {
                        // Check if it has a class property
                        if ('class' in c && c.class) {
                            return c.class;
                        }
                        // Or if it already has the class structure directly
                        else if ('id' in c && 'name' in c) {
                            return c;
                        }
                    }
                    return null;
                })
                .filter((c): c is Class => c !== null);
            
            console.log("Extracted teacher classes:", teacherClasses);
            
            if (teacherClasses.length > 0) {
                return teacherClasses;
            }
            
            console.error("No valid classes found in teacher data");
            return [];
        } catch (error) {
            console.error('Error processing teacher classes:', error);
            throw error;
        }
    }

    async getSectionsForClass(selectedClass: number | null, teacherData: Teacher | null): Promise<Section[]> {
        if (!selectedClass) return [];
        
        try {
            console.log("Fetching sections for class ID:", selectedClass);
            
            // Check for sections array and its structure if teacher data is available
            if (teacherData?.sections && Array.isArray(teacherData.sections)) {
                // Get sections for class that teacher is assigned to
                const filteredSections = teacherData.sections
                    .map(s => {
                        if (s && typeof s === 'object' && 'section' in s && s.section) {
                            return s.section;
                        }
                        return null;
                    })
                    .filter((s): s is Section => s !== null && s.classId === selectedClass);
                
                console.log("Filtered teacher sections:", filteredSections);
                
                if (filteredSections.length > 0) {
                    return filteredSections;
                }
            }
            
            // Fallback: fetch all sections for the class
            console.log("No matching sections found in teacher data, fetching from API");
            const response = await academicAPI.getSections(selectedClass);
            console.log("Sections API response:", response.data);
            
            if (response.data?.status === 'success') {
                return response.data.data.sections;
            }
            
            console.error("Failed to load sections from API");
            return [];
        } catch (error) {
            console.error('Error fetching sections:', error);
            throw error;
        }
    }

    async getSubjectsForClass(selectedClass: number | null, teacherData: Teacher | null): Promise<Subject[]> {
        if (!selectedClass) return [];
        
        try {
            console.log("Fetching subjects for class ID:", selectedClass);
            
            // Check teacher's assigned subjects if teacher data is available
            if (teacherData?.subjects) {
                console.log("Teacher subjects:", teacherData.subjects);
            } else {
                console.log("No subjects found in teacher data");
            }
            
            // Get subjects for this specific class from API
            console.log("Getting class-specific subjects");
            const classSubjectsResponse = await academicAPI.getSubjectsByClass(selectedClass);
            console.log("Class subjects response:", classSubjectsResponse);
            
            // Since we're not sure about the exact shape, let's handle multiple possibilities
            let classSubjects: Subject[] = [];
            
            // Handle the case where the response directly contains data in success/data format
            if (typeof classSubjectsResponse === 'object' && classSubjectsResponse !== null) {
                if ('success' in classSubjectsResponse && 
                    classSubjectsResponse.success && 
                    Array.isArray(classSubjectsResponse.data)) {
                    classSubjects = classSubjectsResponse.data;
                }
                // Handle the case with nested data structure
                else if ('data' in classSubjectsResponse && 
                         typeof classSubjectsResponse.data === 'object' && 
                         classSubjectsResponse.data !== null) {
                    const dataObj = classSubjectsResponse.data;
                    
                    // If data.data is an array, use it directly
                    if ('data' in dataObj && Array.isArray(dataObj.data)) {
                        classSubjects = dataObj.data;
                    }
                    // If data.data.subjects exists and is an array, use that
                    else if ('data' in dataObj && 
                             typeof dataObj.data === 'object' && 
                             dataObj.data !== null &&
                             'subjects' in dataObj.data && 
                             Array.isArray(dataObj.data.subjects)) {
                        classSubjects = dataObj.data.subjects;
                    }
                }
            }
            
            console.log("Processed class subjects:", classSubjects);
            
            if (classSubjects.length === 0) {
                console.error("No subjects found for this class");
                return [];
            }
            
            // If we have teacher data with subjects, filter by teacher's assigned subjects
            if (teacherData?.subjects && Array.isArray(teacherData.subjects)) {
                const teacherSubjects: Subject[] = [];
                
                // Process teacherData.subjects based on its structure
                teacherData.subjects.forEach((s: unknown) => {
                    // Log to inspect the structure
                    console.log("Teacher subject entry:", s);
                    
                    if (typeof s === 'object' && s !== null) {
                        const subjectWrapper = s as TeacherSubjectWrapper;
                        
                        // If it's a direct Subject object
                        if ('id' in subjectWrapper && 'name' in subjectWrapper) {
                            teacherSubjects.push(subjectWrapper as unknown as Subject);
                        }
                        // If it's a wrapper with a subject property
                        else if ('subject' in subjectWrapper && typeof subjectWrapper.subject === 'object' && subjectWrapper.subject !== null) {
                            teacherSubjects.push(subjectWrapper.subject);
                        }
                    }
                });
                
                console.log("Processed teacher subjects:", teacherSubjects);
                
                if (teacherSubjects.length > 0) {
                    // Find subjects that are both assigned to the teacher AND for this class
                    const teacherSubjectIds = new Set(teacherSubjects.map(s => s.id));
                    const assignedSubjects = classSubjects.filter(s => teacherSubjectIds.has(s.id));
                    
                    console.log("Assigned subjects for this class:", assignedSubjects);
                    
                    if (assignedSubjects.length > 0) {
                        return assignedSubjects;
                    }
                }
            }
            
            // Fallback: if we couldn't filter by teacher's subjects, show all subjects for the class
            console.log("Showing all class subjects as fallback");
            return classSubjects;
            
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    }
}

export const teacherService = new TeacherService();
export default teacherService; 