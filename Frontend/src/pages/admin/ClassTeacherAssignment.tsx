import React, { useEffect, useState } from 'react';
import { teacherAPI, academicAPI, userAPI } from '../../services/api';
import { Teacher, Class as ClassType, Section } from '../../types/api';

interface Assignment {
  id: number;
  teacher: {
    id: number;
    name: string;
    email: string;
    designation?: {
      name: string;
    };
  };
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
}

const ClassTeacherAssignment: React.FC = () => {
  // State hooks
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, assignmentId: 0 });
  const [filter, setFilter] = useState({ searchTerm: '', classId: '', sectionId: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    teacherId: '',
    classId: '',
    sectionId: ''
  });
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all required data
        const [teachersRes, classesRes, assignmentsRes] = await Promise.all([
          userAPI.getTeachers(),
          academicAPI.getClasses(),
          teacherAPI.getClassTeacherAssignments()
        ]);
        
        setTeachers(teachersRes.data.data.teachers);
        setClasses(classesRes.data.data.classes);
        setAssignments(assignmentsRes.data.data.assignments);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle class selection - fetch sections for the selected class
  useEffect(() => {
    if (formData.classId) {
      const fetchSections = async () => {
        try {
          const classId = parseInt(formData.classId);
          const res = await academicAPI.getSections(classId);
          setSections(res.data.data.sections);
        } catch (err) {
          console.error('Error fetching sections:', err);
          setError('Failed to load sections');
        }
      };
      
      fetchSections();
    } else {
      setSections([]);
      setFormData(prev => ({ ...prev, sectionId: '' }));
    }
  }, [formData.classId]);
  
  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Filter handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit handler for assigning a class teacher
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacherId || !formData.classId || !formData.sectionId) {
      setError('Please select a teacher, class, and section');
      return;
    }
    
    // Check if there's an existing assignment
    const existingAssignment = assignments.find(
      a => a.class.id === parseInt(formData.classId) && a.section.id === parseInt(formData.sectionId)
    );
    
    if (existingAssignment && existingAssignment.teacher.id === parseInt(formData.teacherId)) {
      setError('This teacher is already assigned to this class and section');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await teacherAPI.assignClassTeacher({
        teacherId: parseInt(formData.teacherId),
        classId: parseInt(formData.classId),
        sectionId: parseInt(formData.sectionId)
      });
      
      // Update assignments list
      if (existingAssignment) {
        // Replace the existing assignment
        setAssignments(prev => 
          prev.map(a => a.id === existingAssignment.id ? res.data.data.assignment : a)
        );
      } else {
        // Add the new assignment
        setAssignments(prev => [...prev, res.data.data.assignment]);
      }
      
      setSuccess('Class teacher assigned successfully');
      
      // Reset form after successful submission
      setFormData({
        teacherId: '',
        classId: '',
        sectionId: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error assigning class teacher:', err);
      setError('Failed to assign class teacher');
    } finally {
      setSaving(false);
    }
  };
  
  // Delete assignment handler
  const handleDeleteConfirm = async () => {
    if (!confirmDialog.assignmentId) return;
    
    try {
      await teacherAPI.removeClassTeacherAssignment(confirmDialog.assignmentId);
      
      // Remove the assignment from the list
      setAssignments(prev => 
        prev.filter(a => a.id !== confirmDialog.assignmentId)
      );
      
      setSuccess('Class teacher assignment removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error removing class teacher assignment:', err);
      setError('Failed to remove class teacher assignment');
    } finally {
      setConfirmDialog({ open: false, assignmentId: 0 });
    }
  };
  
  // Filter assignments based on search term and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearchTerm = 
      filter.searchTerm === '' || 
      assignment.teacher.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      assignment.class.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      assignment.section.name.toLowerCase().includes(filter.searchTerm.toLowerCase());
    
    const matchesClassFilter = filter.classId === '' || assignment.class.id === parseInt(filter.classId);
    const matchesSectionFilter = filter.sectionId === '' || assignment.section.id === parseInt(filter.sectionId);
    
    return matchesSearchTerm && matchesClassFilter && matchesSectionFilter;
  });
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Class Teacher Assignment</h1>
      
      {/* Assignment Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Assign Class Teacher</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher
              </label>
              <select
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={saving}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.designation?.name || 'Teacher'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={saving}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                id="sectionId"
                name="sectionId"
                value={formData.sectionId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                disabled={saving || !formData.classId || sections.length === 0}
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
              {formData.classId && sections.length === 0 && (
                <p className="text-sm text-red-500 mt-1">No sections available for this class</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={saving || !formData.teacherId || !formData.classId || !formData.sectionId}
            >
              {saving ? 'Assigning...' : 'Assign Class Teacher'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Assignments List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Current Class Teacher Assignments</h2>
          
          {/* Filters */}
          <div className="flex space-x-2">
            <input
              type="text"
              name="searchTerm"
              placeholder="Search..."
              value={filter.searchTerm}
              onChange={handleFilterChange}
              className="p-2 border rounded-md"
            />
            
            <select
              name="classId"
              value={filter.classId}
              onChange={handleFilterChange}
              className="p-2 border rounded-md"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.class.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.section.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.teacher.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.teacher.designation?.name || 'Teacher'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setConfirmDialog({ open: true, assignmentId: assignment.id })}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No class teacher assignments found.
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
            <p className="mb-6">Are you sure you want to remove this class teacher assignment?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmDialog({ open: false, assignmentId: 0 })}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTeacherAssignment;