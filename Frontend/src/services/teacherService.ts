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
            const response = await userAPI.getProfile();
            const responseData = response.data;

            if (responseData?.status === 'success') {
                // Type assertion to access the nested structure safely
                const userData = responseData.data as { user?: { teacher?: Teacher } };

                if (userData?.user?.teacher) {
                    return userData.user.teacher;
                } else {
                    return null;
                }
            }

            return null;
        } catch (error) {
            throw error;
        }
    }

    async getAssignedClasses(teacherData: Teacher | null): Promise<Class[]> {
        if (!teacherData) {
            // Fallback: fetch all classes if teacher data is not available
            try {
                const classesResponse = await academicAPI.getClasses();
                if (classesResponse.data?.status === 'success') {
                    return classesResponse.data.data.classes;
                }
            } catch {
                // Failed to load classes
            }
            return [];
        }

        try {
            // Check for classes array and its structure
            if (!teacherData.classes || !Array.isArray(teacherData.classes)) {
                return [];
            }

            // Extract classes assigned to the teacher
            const teacherClasses = teacherData.classes
                .map(c => {
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

            if (teacherClasses.length > 0) {
                return teacherClasses;
            }

            return [];
        } catch (error) {
            throw error;
        }
    }

    async getSectionsForClass(selectedClass: number | null, teacherData: Teacher | null): Promise<Section[]> {
        if (!selectedClass) return [];

        try {
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

                if (filteredSections.length > 0) {
                    return filteredSections;
                }
            }

            // Fallback: fetch all sections for the class
            const response = await academicAPI.getSections(selectedClass);

            if (response.data?.status === 'success') {
                return response.data.data.sections;
            }

            return [];
        } catch (error) {
            throw error;
        }
    }

    async getSubjectsForClass(selectedClass: number | null, teacherData: Teacher | null): Promise<Subject[]> {
        if (!selectedClass) return [];

        try {
            // Get subjects for this specific class from API
            const classSubjectsResponse = await academicAPI.getSubjectsByClass(selectedClass);

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

            if (classSubjects.length === 0) {
                return [];
            }

            // If we have teacher data with subjects, filter by teacher's assigned subjects
            if (teacherData?.subjects && Array.isArray(teacherData.subjects)) {
                const teacherSubjects: Subject[] = [];

                // Process teacherData.subjects based on its structure
                teacherData.subjects.forEach((s: unknown) => {
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

                if (teacherSubjects.length > 0) {
                    // Find subjects that are both assigned to the teacher AND for this class
                    const teacherSubjectIds = new Set(teacherSubjects.map(s => s.id));
                    const assignedSubjects = classSubjects.filter(s => teacherSubjectIds.has(s.id));

                    if (assignedSubjects.length > 0) {
                        return assignedSubjects;
                    }
                }
            }

            // Fallback: if we couldn't filter by teacher's subjects, show all subjects for the class
            return classSubjects;

        } catch (error) {
            throw error;
        }
    }
}

export const teacherService = new TeacherService();
export default teacherService; 