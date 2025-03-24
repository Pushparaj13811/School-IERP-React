import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StudentsList: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data - in a real application, this would come from an API
  const students = [
    {
      id: 1,
      name: 'Ruchi Pathak',
      gender: 'Female',
      parentsName: 'Kiran Pathak',
      class: '7',
      section: 'A',
      address: 'Thasang-3, Lete, Nepal',
      contactNo: '97747367940'
    },
    // Add more mock data as needed
  ];

  const handleRowClick = (studentId: number) => {
    navigate(`/student-profile/${studentId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Students</h1>
        <button className="bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800">
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">S. Id</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Gender</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Parents Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Class</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Section</th>
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
                <td className="px-6 py-4 text-sm text-gray-900">{student.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{student.parentsName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{student.address}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{student.contactNo}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                    <button className="text-green-600 hover:text-green-800">
                      <FaEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsList; 