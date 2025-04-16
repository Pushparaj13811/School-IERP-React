import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Student } from '../../types/api';

const StudentsList: React.FC = () => {
    const navigate = useNavigate();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getStudents();
            
            if (response.data?.status === 'success' && Array.isArray(response.data?.data?.students)) {
                setStudents(response.data.data.students);
            } else {
                toast.error('Failed to load students data');
                setStudents([]);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students. Please try again.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (studentId: number) => {
        navigate(`/student-profile/${studentId}`);
    };

    const handleAddStudent = () => {
        navigate('add-students');
    };

    const handleEditClick = (e: React.MouseEvent, student: Student) => {
        e.stopPropagation();
        // Navigate to add student form with student data
        navigate('add-students', { 
            state: { 
                editMode: true,
                studentData: student 
            } 
        });
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

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading students...</div>;
    }

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

            {students.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">No students found. Add your first student to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-indigo-900 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Class</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Section</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Roll No.</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Gender</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
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
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.class?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.section?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.rollNo}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.gender}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.email}</td>
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
            )}

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