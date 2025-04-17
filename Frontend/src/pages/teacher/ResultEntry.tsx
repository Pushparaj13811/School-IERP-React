import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { FaSave, FaLock, FaUnlock } from 'react-icons/fa';
import { academicAPI, resultAPI, userAPI } from '../../services/api';
import { Class, Section, Subject, Student as StudentType, Teacher } from '../../types/api';

interface Student {
    id: number;
    rollNo: string;
    name: string;
    theoryMarks: number;
    practicalMarks: number;
    isEditable: boolean;
}

// Define interface for teacher subject wrapper
interface TeacherSubjectWrapper {
    subject?: Subject;
    class?: Class;
    section?: Section;
    id?: number;
    name?: string;
    code?: string;
    [key: string]: unknown;
}

// Define interface for result data
interface ResultData {
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

const ResultEntry: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear().toString());
    const [term, setTerm] = useState<string>("First");
    const [fullMarks, setFullMarks] = useState<number>(100);
    const [passMarks, setPassMarks] = useState<number>(40);
    
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedSection, setSelectedSection] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [teacherData, setTeacherData] = useState<Teacher | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch teacher profile data once on component mount
    useEffect(() => {
        const fetchTeacherProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log("Fetching teacher profile...");
                
                const response = await userAPI.getProfile();
                console.log("Full profile response:", response);
                
                // Log the exact structure to find where teacher data is
                const responseData = response.data;
                console.log("Response data structure:", JSON.stringify(responseData, null, 2));
                
                if (responseData?.status === 'success') {
                    // Type assertion to access the nested structure safely
                    const userData = responseData.data as { user?: { teacher?: Teacher } };
                    
                    if (userData?.user?.teacher) {
                        console.log("Teacher data found:", userData.user.teacher);
                        setTeacherData(userData.user.teacher);
                    } else {
                        console.error("Teacher data not found in response");
                        console.log("Looking for teacher data in:", responseData.data);
                        
                        // Fallback: fetch classes directly from API if we can't get teacher data
                        try {
                            const classesResponse = await academicAPI.getClasses();
                            if (classesResponse.data?.status === 'success') {
                                setClasses(classesResponse.data.data.classes);
                                console.log("Loaded all classes as fallback");
                            }
                        } catch (error) {
                            console.error("Failed to load classes:", error);
                        }
                        
                        setError("Could not find teacher data. Showing all classes instead.");
                    }
                } else {
                    console.error("API response was not successful");
                    setError("Failed to load teacher profile. Please try again.");
                }
            } catch (error) {
                console.error('Error fetching teacher profile:', error);
                setError("Error loading teacher profile. Please refresh the page.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeacherProfile();
    }, []);

    // Fetch teacher's assigned classes based on teacher data
    useEffect(() => {
        if (!teacherData) return;
        
        try {
            console.log("Processing teacher classes from:", teacherData);
            
            // Check for classes array and its structure
            if (!teacherData.classes || !Array.isArray(teacherData.classes)) {
                console.error("No classes array found in teacher data");
                setError("No classes assigned to this teacher");
                return;
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
                setClasses(teacherClasses);
            } else {
                console.error("No valid classes found in teacher data");
                setError("No classes assigned to this teacher");
            }
        } catch (error) {
            console.error('Error processing teacher classes:', error);
            setError("Error processing assigned classes");
        }
    }, [teacherData]);

    // Fetch sections when a class is selected
    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedClass) return;
            
            try {
                setIsLoading(true);
                setError(null);
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
                        setSections(filteredSections);
                        return;
                    }
                }
                
                // Fallback: fetch all sections for the class
                console.log("No matching sections found in teacher data, fetching from API");
                const response = await academicAPI.getSections(selectedClass);
                console.log("Sections API response:", response.data);
                
                if (response.data?.status === 'success') {
                    setSections(response.data.data.sections);
                } else {
                    console.error("Failed to load sections from API");
                    setError("No sections available for this class");
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
                setError("Error loading sections");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSections();
    }, [selectedClass, teacherData]);

    // Fetch subjects for the selected class
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedClass) return;
            
            try {
                setIsLoading(true);
                setError(null);
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
                    setError("No subjects available for this class");
                    return;
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
                            setSubjects(assignedSubjects);
                            return;
                        }
                    }
                }
                
                // Fallback: if we couldn't filter by teacher's subjects, show all subjects for the class
                setSubjects(classSubjects);
                console.log("Showing all class subjects as fallback");
                
            } catch (error) {
                console.error('Error fetching subjects:', error);
                setError("Error loading subjects");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedClass, teacherData]);

    // Function to fetch students for the selected class and section
    const fetchStudents = async () => {
        if (!selectedClass || !selectedSection) return;
        
        try {
            setIsLoading(true);
            setError(null);
            console.log(`Fetching students for class ${selectedClass}, section ${selectedSection}`);
            
            // Ensure we're fetching students from the specific class and section
            const response = await userAPI.getStudents({
                classId: selectedClass,
                sectionId: selectedSection
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
                
                setStudents(fetchedStudents);
                
                // Only try to fetch existing results if a subject is selected
                if (selectedSubject) {
                    // Try to fetch existing results if any
                    try {
                        console.log(`Checking for existing results for subject ${selectedSubject}, year ${academicYear}, term ${term}`);
                        const existingResults = await resultAPI.getResults({
                            subjectId: selectedSubject,
                            academicYear,
                            term
                        });
                        
                        console.log("Existing results response:", existingResults.data);
                        
                        if (existingResults.data?.status === 'success' && 
                            existingResults.data.data.results && 
                            Array.isArray(existingResults.data.data.results) &&
                            existingResults.data.data.results.length > 0) {
                            
                            // Map existing results to students
                            const updatedStudents = processExistingResults(fetchedStudents, existingResults.data.data.results);
                            
                            setStudents(updatedStudents);
                            console.log("Updated students with existing results:", updatedStudents);
                        }
                    } catch (error) {
                        console.error('Error fetching existing results:', error);
                        // Don't set error state here, as we still want to show students
                    }
                }
            } else {
                console.error("Failed to load students or empty response");
                setError("No students found in this class and section");
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setError("Error loading students");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch students when class and section are selected
    useEffect(() => {
        if (!selectedClass || !selectedSection) {
            // Clear students list if either class or section is deselected
            setStudents([]);
            return;
        }
        
        fetchStudents();
    }, [selectedClass, selectedSection, selectedSubject, academicYear, term]);

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const classId = parseInt(e.target.value);
        setSelectedClass(classId);
        setSelectedSection(null);
        setSelectedSubject(null);
        setStudents([]);
        setError(null);
    };

    const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sectionId = parseInt(e.target.value);
        setSelectedSection(sectionId);
        setSelectedSubject(null);
        setStudents([]);
        setError(null);
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subjectId = parseInt(e.target.value);
        setSelectedSubject(subjectId);
        
        // Refetch students to get updated results for this subject
        if (selectedClass && selectedSection) {
            fetchStudents();
        }
    };

    const handleMarkChange = (studentId: number, field: 'theoryMarks' | 'practicalMarks', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setStudents(students.map(student => {
            if (student.id === studentId) {
                return {
                    ...student,
                    [field]: numValue,
                };
            }
            return student;
        }));
    };

    const handleSave = async () => {
        if (!selectedClass || !selectedSection || !selectedSubject) {
            console.error('Please select class, section, and subject');
            setError("Please select class, section, and subject");
            return;
        }

        setIsSaving(true);
        setSaveStatus(null);
        setError(null);

        try {
            // Create result data for each student
            const results = students.map(student => ({
                studentId: student.id,
                subjectId: selectedSubject as number,
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

            const saveResponses = await Promise.all(savePromises);
            console.log("Save responses:", saveResponses);
            
            // Mark as locked after successful save
            setStudents(students.map(student => ({ ...student, isEditable: false })));
            
            setSaveStatus('success');
            console.log('Results saved successfully');
        } catch (error) {
            console.error('Error saving results:', error);
            setSaveStatus('error');
            setError("Failed to save results. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const processExistingResults = (fetchedStudents: Student[], results: unknown[]) => {
        return fetchedStudents.map(student => {
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

    if (isLoading && !teacherData) {
        return <div className="flex justify-center items-center h-64">Loading teacher data...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Result Entry</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Class
                    </label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={selectedClass || ''}
                        onChange={handleClassChange}
                        disabled={isLoading || classes.length === 0}
                    >
                        <option value="">Select a class</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                    {classes.length === 0 && !isLoading && (
                        <p className="mt-1 text-sm text-red-500">No classes assigned to you</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Section
                    </label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={selectedSection || ''}
                        onChange={handleSectionChange}
                        disabled={!selectedClass || isLoading || sections.length === 0}
                    >
                        <option value="">Select a section</option>
                        {sections.map(section => (
                            <option key={section.id} value={section.id}>
                                {section.name}
                            </option>
                        ))}
                    </select>
                    {selectedClass && sections.length === 0 && !isLoading && (
                        <p className="mt-1 text-sm text-red-500">No sections available for this class</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Subject
                    </label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={selectedSubject || ''}
                        onChange={handleSubjectChange}
                        disabled={!selectedClass || !selectedSection || isLoading || subjects.length === 0}
                    >
                        <option value="">Select a subject</option>
                        {subjects.map(subject => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                    </select>
                    {selectedClass && selectedSection && subjects.length === 0 && !isLoading && (
                        <p className="mt-1 text-sm text-red-500">No subjects assigned to you for this class</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year
                    </label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                    >
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Term
                    </label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    >
                        <option value="First">First Term</option>
                        <option value="Second">Second Term</option>
                        <option value="Final">Final Term</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Marks
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={fullMarks}
                            onChange={(e) => setFullMarks(Number(e.target.value))}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pass Marks
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={passMarks}
                            onChange={(e) => setPassMarks(Number(e.target.value))}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
            </div>

            {isLoading && selectedSubject ? (
                <div className="flex justify-center items-center h-64">Loading students...</div>
            ) : students.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Roll No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Theory Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Practical Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.rollNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            min="0"
                                            max={fullMarks}
                                            value={student.theoryMarks}
                                            onChange={(e) => handleMarkChange(student.id, 'theoryMarks', e.target.value)}
                                            disabled={!student.isEditable}
                                            className={`w-20 p-1 border rounded ${!student.isEditable ? 'bg-gray-100' : ''
                                                }`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            min="0"
                                            max={fullMarks}
                                            value={student.practicalMarks}
                                            onChange={(e) => handleMarkChange(student.id, 'practicalMarks', e.target.value)}
                                            disabled={!student.isEditable}
                                            className={`w-20 p-1 border rounded ${!student.isEditable ? 'bg-gray-100' : ''
                                                }`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {student.isEditable ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                                <FaUnlock /> Editable
                                            </span>
                                        ) : (
                                            <span className="text-red-600 flex items-center gap-1">
                                                <FaLock /> Locked
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : selectedSubject && !isLoading ? (
                <div className="text-center p-8 text-gray-500">
                    No students found in this class and section. Please check your selection.
                </div>
            ) : null}
            
            {students.length > 0 && (
                <div className="mt-6 flex justify-end">
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving || !students.some(s => s.isEditable)}
                        className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${isSaving || !students.some(s => s.isEditable)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90'
                            }`}
                    >
                        <FaSave />
                        {isSaving ? 'Saving...' : 'Save Results'}
                    </Button>
                </div>
            )}

            {saveStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                    Results saved successfully!
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                    Error saving results. Please try again.
                </div>
            )}
        </div>
    );
};

export default ResultEntry; 