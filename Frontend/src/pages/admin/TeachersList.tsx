import React, { useState, useEffect } from 'react';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Teacher } from '../../types/api';
import Button from '../../components/ui/Button';

const TeachersList: React.FC = () => {
  const navigate = useNavigate();
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'deactivate'>('deactivate');
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

  const handleEditClick = (teacher: Teacher) => {
    // Navigate to add teacher form with teacher data
    navigate('add-teacher', { 
      state: { 
        editMode: true,
        teacherData: teacher 
      } 
    });
  };


  const handleToggleActiveClick = (teacher: Teacher) => {
    const newAction = teacher.isActive ? 'deactivate' : 'activate';
    setActionType(newAction);
    setSelectedTeacher(teacher);
    setActionModalOpen(true);
  };


  const handleActionConfirm = async () => {
    if (!selectedTeacher) return;
    
    try {
      // Toggle active status based on current status
      const isActive = actionType === 'activate';
      const response = await userAPI.toggleTeacherActiveStatus(selectedTeacher.id, isActive);
      
      if (response.data?.status === 'success') {
        toast.success(`${selectedTeacher.name} has been ${isActive ? 'activated' : 'deactivated'} successfully`);
        
        // Update the teacher in the list with the new active status
        setTeachers(teachers.map(teacher => 
          teacher.id === selectedTeacher.id 
            ? { ...teacher, isActive: isActive } 
            : teacher
        ));
      } else {
        toast.error(response.data?.message || `Failed to ${actionType} teacher. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing teacher:`, error);
      toast.error(`Failed to ${actionType} teacher. Please try again.`);
    } finally {
      setActionModalOpen(false);
      setSelectedTeacher(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading teachers...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Teachers</h1>
        <Button 
          variant="primary"
          onClick={handleAddTeacher}
        >
          Add Teacher
        </Button>
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
                <th className="px-6 py-3 text-left text-sm font-medium">Sections</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
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
                    {teacher.subjects ? 
                      teacher.subjects.map(s => {
                        if (s && typeof s === 'object' && 'name' in s) {
                          return s.name as string;
                        }
                        return '';
                      }).filter(Boolean).join(', ') 
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {teacher.classes ? 
                      teacher.classes.map(c => {
                        // Handle both potential data structures
                        if (c && typeof c === 'object' && 'class' in c && c.class) {
                          return c.class.name;
                        } else if (c && typeof c === 'object' && 'name' in c) {
                          // If classes is an array of direct class objects
                          return c.name as string;
                        }
                        return '';
                      }).filter(Boolean).join(', ') 
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {teacher.sections ? 
                      teacher.sections.map(s => {
                        if (s && typeof s === 'object' && 'name' in s) {
                          return s.name as string;
                        }
                        return '';
                      }).filter(Boolean).join(', ') 
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {teacher.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline"
                        onClick={() => handleEditClick(teacher)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant={teacher.isActive ? "danger" : "primary"}
                        onClick={() => handleToggleActiveClick(teacher)}
                      >
                        {teacher.isActive ? <FaToggleOff /> : <FaToggleOn />}
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
        title={actionType === 'activate' ? "Activate Teacher" : "Deactivate Teacher"}
        message={`Are you sure you want to ${actionType} ${selectedTeacher?.name}? ${
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

export default TeachersList; 