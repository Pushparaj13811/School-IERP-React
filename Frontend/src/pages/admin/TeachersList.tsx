import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';

interface Teacher {
  id: number;
  name: string;
  gender: string;
  designation: string;
  email: string;
  address: string;
  contactNo: string;
  subjectAssigned: string;
  gradeAssigned: string;
}

const TeachersList: React.FC = () => {
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Mock data - in a real application, this would come from an API
  const teachers = [
    {
      id: 1,
      name: 'Priya Verma',
      gender: 'Female',
      designation: 'Senior Teacher',
      email: 'priya.v@gmail.com',
      address: 'Thasang-3, Lete, Nepal',
      contactNo: '9774736794',
      subjectAssigned: 'Mathematics',
      gradeAssigned: 'Grade 10'
    },
    // Add more mock data as needed
  ];

  const handleRowClick = (teacherId: number) => {
    navigate(`/teacher-profile/${teacherId}`);
  };

  const handleAddTeacher = () => {
    navigate('add-teacher');
  };

  const handleEditClick = (e: React.MouseEvent, teacher: Teacher) => {
    e.stopPropagation();
    // Navigate to add teacher form with teacher data
    navigate('add-teacher', { state: { editData: teacher } });
  };

  const handleDeleteClick = (e: React.MouseEvent, teacher: Teacher) => {
    e.stopPropagation();
    setSelectedTeacher(teacher);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Implement delete logic here
    console.log('Deleting teacher:', selectedTeacher?.id);
    setDeleteModalOpen(false);
    setSelectedTeacher(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Teachers</h1>
        <button 
          className="bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800"
          onClick={handleAddTeacher}
        >
          Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">T. Id</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Gender</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Designation</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Address</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Contact No.</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Grade</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher, index) => (
              <tr 
                key={teacher.id} 
                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} cursor-pointer hover:bg-gray-100`}
                onClick={() => handleRowClick(teacher.id)}
              >
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.designation}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.address}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.contactNo}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.subjectAssigned}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.gradeAssigned}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="text-green-600 hover:text-green-800"
                      onClick={(e) => handleEditClick(e, teacher)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={(e) => handleDeleteClick(e, teacher)}
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
        title="Delete Teacher"
        message={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default TeachersList; 