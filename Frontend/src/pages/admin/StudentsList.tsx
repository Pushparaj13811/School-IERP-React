import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';

interface Student {
    id: number;
    name: string;
    grade: string;
    rollNo: string;
    gender: string;
    email: string;
    address: string;
    contactNo: string;
}

const StudentsList: React.FC = () => {
    const navigate = useNavigate();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Mock data - in a real application, this would come from an API
    const students = [
        {
            id: 1,
            name: 'Rohan Sharma',
            grade: 'Grade 10',
            rollNo: '2023001',
            gender: 'Male',
            email: 'rohan.s@gmail.com',
            address: 'Thasang-3, Lete, Nepal',
            contactNo: '9774736794'
        },
        // Add more mock data as needed
    ];

    const handleRowClick = (studentId: number) => {
        navigate(`/student-profile/${studentId}`);
    };

    const handleAddStudent = () => {
        navigate('add-students');
    };

    const handleEditClick = (e: React.MouseEvent, student: Student) => {
        e.stopPropagation();
        // Navigate to add student form with student data
        navigate('add-students', { state: { editData: student } });
    };

    const handleDeleteClick = (e: React.MouseEvent, student: Student) => {
        e.stopPropagation();
        setSelectedStudent(student);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        // Implement delete logic here
        console.log('Deleting student:', selectedStudent?.id);
        setDeleteModalOpen(false);
        setSelectedStudent(null);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">All Students</h1>
                <button 
                    className="bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800"
                    onClick={handleAddStudent}
                >
                    Add Student
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-indigo-900 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium">S. Id</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Grade</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Roll No.</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Gender</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Address</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Contact No.</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.map((student, index) => (
                            <tr 
                                key={student.id} 
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} cursor-pointer hover:bg-gray-100`}
                                onClick={() => handleRowClick(student.id)}
                            >
                                <td className="px-6 py-4 text-sm text-gray-900">{student.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{student.grade}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{student.gender}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{student.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{student.address}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{student.contactNo}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            className="text-green-600 hover:text-green-800"
                                            onClick={(e) => handleEditClick(e, student)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className="text-red-600 hover:text-red-800"
                                            onClick={(e) => handleDeleteClick(e, student)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Student"
                message={`Are you sure you want to delete ${selectedStudent?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default StudentsList; 