import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TeachersList: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - in a real application, this would come from an API
  const teachers = [
    {
      id: 1,
      name: 'Ruchi Pathak',
      gender: 'Female',
      subject: 'Science',
      email: 'ruchi124@gmail.com',
      address: 'Thasang-3, Lete, Nepal',
      contactNo: '97747367940'
    },
    // Add more mock data as needed
  ];

  const handleRowClick = (teacherId: number) => {
    navigate(`/teacher-profile/${teacherId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Teachers</h1>
        <button className="bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800">
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
              <th className="px-6 py-3 text-left text-sm font-medium">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Address</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Contact No.</th>
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
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.subject}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.address}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.contactNo}</td>
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

export default TeachersList; 