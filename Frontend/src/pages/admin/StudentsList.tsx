import React, { useState, useEffect } from 'react';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Student } from '../../types/api';
import Button from '../../components/ui/Button';

const StudentsList: React.FC = () => {
    const navigate = useNavigate();
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [actionType, setActionType] = useState<'activate' | 'deactivate'>('deactivate');
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

    const handleEditClick = (student: Student) => {
        // Navigate to add student form with student data
        navigate('add-students', { 
            state: { 
                editMode: true,
                studentData: student 
            } 
        });
    };

    const handleToggleActiveClick = (student: Student) => {
        const newAction = student.isActive ? 'deactivate' : 'activate';
        setActionType(newAction);
        setSelectedStudent(student);
        setActionModalOpen(true);
    };

    const handleActionConfirm = async () => {
        if (!selectedStudent) return;
        
        try {
            // Toggle active status based on current status
            const isActive = actionType === 'activate';
            const response = await userAPI.toggleStudentActiveStatus(selectedStudent.id, isActive);
            
            if (response.data?.status === 'success') {
                toast.success(`${selectedStudent.name} has been ${isActive ? 'activated' : 'deactivated'} successfully`);
                
                // Update the student in the list with the new active status
                setStudents(students.map(student => 
                    student.id === selectedStudent.id 
                        ? { ...student, isActive: isActive } 
                        : student
                ));
            } else {
                toast.error(response.data?.message || `Failed to ${actionType} student. Please try again.`);
            }
        } catch (error) {
            console.error(`Error ${actionType}ing student:`, error);
            toast.error(`Failed to ${actionType} student. Please try again.`);
        } finally {
            setActionModalOpen(false);
            setSelectedStudent(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading students...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">All Students</h1>
                <Button 
                    variant="primary"
                    onClick={handleAddStudent}
                >   
                    Add Student
                </Button>
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
                                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
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
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {student.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                                            <Button 
                                                variant="outline"   
                                                onClick={() => handleEditClick(student)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button 
                                                variant={student.isActive ? "danger" : "primary"}
                                                onClick={() => handleToggleActiveClick(student)}
                                            >
                                                {student.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationModal
                isOpen={actionModalOpen}
                onClose={() => setActionModalOpen(false)}
                onConfirm={handleActionConfirm}
                title={actionType === 'activate' ? "Activate Student" : "Deactivate Student"}
                message={`Are you sure you want to ${actionType} ${selectedStudent?.name}? ${
                    actionType === 'deactivate' 
                        ? "They will no longer be able to log in or access any features."
                        : "This will restore their access to the system."
                }`}
                confirmLabel={actionType === 'activate' ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default StudentsList; 