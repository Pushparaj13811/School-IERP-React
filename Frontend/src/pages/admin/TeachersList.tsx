import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Teacher } from '../../types/api';

const TeachersList: React.FC = () => {
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getTeachers();
      
      if (response.data?.status === 'success' && Array.isArray(response.data?.data?.teachers)) {
        setTeachers(response.data.data.teachers);
      } else {
        toast.error('Failed to load teachers data');
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers. Please try again.');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (teacherId: number) => {
    navigate(`/teacher-profile/${teacherId}`);
  };

  const handleAddTeacher = () => {
    navigate('add-teacher');
  };

  const handleEditClick = (e: React.MouseEvent, teacher: Teacher) => {
    e.stopPropagation();
    // Navigate to add teacher form with teacher data
    navigate('add-teacher', { 
      state: { 
        editMode: true,
        teacherData: teacher 
      } 
    });
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading teachers...</div>;
  }

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

      {teachers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No teachers found. Add your first teacher to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-indigo-900 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Gender</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Designation</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Contact No.</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Subjects</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Classes</th>
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
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.designation?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.contactNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {teacher.subjects?.map(s => s.name).join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {teacher.classes?.map(c => c.class.name).join(', ') || '-'}
                  </td>
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
      )}

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