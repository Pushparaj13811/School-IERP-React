import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { FaSave, FaLock, FaUnlock } from 'react-icons/fa';

interface Student {
    id: number;
    rollNo: string;
    name: string;
    theoryMarks: number;
    practicalMarks: number;
    isEditable: boolean;
}

interface Subject {
    id: number;
    name: string;
}

// Dummy data - replace with API calls
const dummyClasses = [
    { id: 1, name: 'Class 9' },
    { id: 2, name: 'Class 10' },
    { id: 3, name: 'Class 11' },
    { id: 4, name: 'Class 12' },
];

const dummySubjects: Record<number, Subject[]> = {
    1: [
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Science' },
    ],
    2: [
        { id: 4, name: 'Mathematics' },
        { id: 5, name: 'Science' },
        { id: 6, name: 'English' },
    ],
    3: [
        { id: 7, name: 'Physics' },
        { id: 8, name: 'Chemistry' },
        { id: 9, name: 'Mathematics' },
    ],
    4: [
        { id: 10, name: 'Physics' },
        { id: 11, name: 'Chemistry' },
        { id: 12, name: 'Mathematics' },
    ],
};

const ResultEntry: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

    // Dummy students data - replace with API call
    const dummyStudents: Student[] = [
        { id: 1, rollNo: '001', name: 'John Doe', theoryMarks: 0, practicalMarks: 0, isEditable: true },
        { id: 2, rollNo: '002', name: 'Jane Smith', theoryMarks: 0, practicalMarks: 0, isEditable: true },
        { id: 3, rollNo: '003', name: 'Bob Johnson', theoryMarks: 0, practicalMarks: 0, isEditable: true },
        { id: 4, rollNo: '004', name: 'Alice Brown', theoryMarks: 0, practicalMarks: 0, isEditable: true },
    ];

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const classId = parseInt(e.target.value);
        setSelectedClass(classId);
        setSelectedSubject(null);
        setStudents([]);
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subjectId = parseInt(e.target.value);
        setSelectedSubject(subjectId);
        // In a real app, fetch students with their marks from API
        setStudents(dummyStudents);
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
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveStatus('success');
            // In a real app, update isEditable to false after successful save
            setStudents(students.map(student => ({ ...student, isEditable: false })));
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Result Entry</h1>

            <div className="mb-6 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Class
                    </label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={selectedClass || ''}
                        onChange={handleClassChange}
                    >
                        <option value="">Select a class</option>
                        {dummyClasses.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Subject
                    </label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={selectedSubject || ''}
                        onChange={handleSubjectChange}
                        disabled={!selectedClass}
                    >
                        <option value="">Select a subject</option>
                        {selectedClass &&
                            dummySubjects[selectedClass as keyof typeof dummySubjects].map(subject => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            {students.length > 0 && (
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
                                            max="100"
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
                                            max="100"
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
            )}
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