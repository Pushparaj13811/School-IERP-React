import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { FaSave, FaLock, FaUnlock, FaSync } from 'react-icons/fa';
import { academicAPI } from '../../services/api';
import { Class, Section, Subject, Teacher } from '../../types/api';
import teacherService from '../../services/teacherService';
import resultService, { Student } from '../../services/resultService';

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
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const [recalculateStatus, setRecalculateStatus] = useState<'success' | 'error' | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [teacherData, setTeacherData] = useState<Teacher | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch teacher profile data once on component mount
    useEffect(() => {
        const fetchTeacherProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const teacher = await teacherService.getTeacherProfile();
                
                if (teacher) {
                    setTeacherData(teacher);
                } else {
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
        const fetchTeacherClasses = async () => {
            try {
                const teacherClasses = await teacherService.getAssignedClasses(teacherData);
                if (teacherClasses.length > 0) {
                    setClasses(teacherClasses);
                } else {
                    setError("No classes assigned to this teacher");
                }
            } catch (error) {
                console.error('Error processing teacher classes:', error);
                setError("Error processing assigned classes");
            }
        };
        
        if (teacherData) {
            fetchTeacherClasses();
        }
    }, [teacherData]);

    // Fetch sections when a class is selected
    useEffect(() => {
        const fetchSections = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const sectionsList = await teacherService.getSectionsForClass(selectedClass, teacherData);
                
                if (sectionsList.length > 0) {
                    setSections(sectionsList);
                } else {
                    setError("No sections available for this class");
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
                setError("Error loading sections");
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedClass) {
            fetchSections();
        } else {
            setSections([]);
        }
    }, [selectedClass, teacherData]);

    // Fetch subjects for the selected class
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const subjectsList = await teacherService.getSubjectsForClass(selectedClass, teacherData);
                
                if (subjectsList.length > 0) {
                    setSubjects(subjectsList);
                } else {
                    setError("No subjects available for this class");
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
                setError("Error loading subjects");
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedClass) {
            fetchSubjects();
        } else {
            setSubjects([]);
        }
    }, [selectedClass, teacherData]);

    // Function to fetch students and existing results
    const fetchStudentsAndResults = async () => {
        if (!selectedClass || !selectedSection) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            // First fetch students for the selected class and section
            const fetchedStudents = await resultService.getStudentsForClassAndSection(
                selectedClass, 
                selectedSection
            );
            
            if (fetchedStudents.length === 0) {
                setError("No students found in this class and section");
                setStudents([]);
                return;
            }
            
            // Set initial student list
            setStudents(fetchedStudents);
            
            // If a subject is selected, check for existing results
            if (selectedSubject) {
                const updatedStudents = await resultService.getExistingResults(
                    fetchedStudents,
                    selectedSubject,
                    academicYear,
                    term
                );
                
                setStudents(updatedStudents);
            }
        } catch (error) {
            console.error('Error fetching students and results:', error);
            setError("Error loading students");
            setStudents([]);
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
        
        fetchStudentsAndResults();
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
            fetchStudentsAndResults();
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
            const success = await resultService.saveResults(
                students,
                selectedSubject,
                academicYear,
                term,
                fullMarks,
                passMarks
            );
            
            if (success) {
                // Mark as locked after successful save
                setStudents(students.map(student => ({ ...student, isEditable: false })));
                setSaveStatus('success');
            } else {
                setSaveStatus('error');
                setError("Failed to save all results. Please try again.");
            }
        } catch (error) {
            console.error('Error saving results:', error);
            setSaveStatus('error');
            setError("Failed to save results. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRecalculate = async () => {
        if (!selectedClass) {
            setError("Please select at least a class to recalculate results");
            return;
        }

        setIsRecalculating(true);
        setRecalculateStatus(null);
        setError(null);

        try {
            const success = await resultService.recalculateResults(
                selectedClass,
                selectedSection,
                academicYear,
                term
            );
            
            if (success) {
                setRecalculateStatus('success');
                // Refresh student data if a subject is selected
                if (selectedClass && selectedSection && selectedSubject) {
                    await fetchStudentsAndResults();
                }
            } else {
                setRecalculateStatus('error');
                setError("Failed to recalculate results. Please try again.");
            }
        } catch (error) {
            console.error('Error recalculating results:', error);
            setRecalculateStatus('error');
            setError("Failed to recalculate results. Please try again.");
        } finally {
            setIsRecalculating(false);
        }
    };

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

            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div className="max-w-2xl">
                        <h3 className="text-md font-medium text-gray-700 mb-1">Results Recalculation</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Click the button to recalculate overall results for students based on their subject marks. 
                            This will update total marks, percentage, and grades in the database.
                            {selectedClass 
                                ? selectedSection 
                                    ? ` Recalculation will run for all students in class ${classes.find(c => c.id === selectedClass)?.name || ''} section ${sections.find(s => s.id === selectedSection)?.name || ''}.`
                                    : ` Recalculation will run for all students in class ${classes.find(c => c.id === selectedClass)?.name || ''}.`
                                : ' Recalculation will run for all students in the system.'}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleRecalculate}
                        disabled={isRecalculating}
                        className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${isRecalculating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        <FaSync className={isRecalculating ? 'animate-spin' : ''} />
                        {isRecalculating ? 'Processing...' : selectedClass 
                            ? `Recalculate ${selectedSection ? 'Section' : 'Class'} Results` 
                            : 'Recalculate All Results'}
                    </Button>
                </div>
                {recalculateStatus === 'success' && (
                    <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md">
                        Results recalculated successfully!
                    </div>
                )}
                {recalculateStatus === 'error' && (
                    <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
                        Error recalculating results. Please try again.
                    </div>
                )}
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
                <div className="mt-6 flex justify-end gap-4">
                    <div className="flex-1 self-center">
                        <p className="text-sm text-gray-600 italic">
                            Note: After saving marks, grades and overall results will be automatically calculated by the system.
                        </p>
                    </div>
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