import React from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaUserFriends, FaBullhorn } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  // Mock data - in a real application, this would come from API
  const statistics = {
    studentCount: 843,
    teacherCount: 42,
    parentCount: 752,
    announcementCount: 18
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Students Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Total Students</p>
            <p className="text-3xl font-bold mt-1">{statistics.studentCount}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
          <span className="text-2xl"><FaUserGraduate /></span>
          </div>
        </div>
        
        {/* Teachers Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Total Teachers</p>
            <p className="text-3xl font-bold mt-1">{statistics.teacherCount}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
          <span className="text-2xl"><FaChalkboardTeacher /></span>
          </div>
        </div>
        
        {/* Parents Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Total Parents</p>
            <p className="text-3xl font-bold mt-1">{statistics.parentCount}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
          <span className="text-2xl"><FaUserFriends /></span>
          </div>
        </div>
        
        {/* Announcements Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Announcements</p>
            <p className="text-3xl font-bold mt-1">{statistics.announcementCount}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
          <span className="text-2xl"><FaBullhorn /></span>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex items-start p-3 bg-white rounded shadow-sm">
              <div className="bg-blue-100 text-blue-500 p-2 rounded mr-3">
                <FaUserGraduate />
              </div>
              <div>
                <p className="font-medium">New student registered</p>
                <p className="text-sm text-gray-500">Rohan Sharma - Grade 9</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-white rounded shadow-sm">
              <div className="bg-green-100 text-green-500 p-2 rounded mr-3">
                <FaBullhorn />
              </div>
              <div>
                <p className="font-medium">New announcement published</p>
                <p className="text-sm text-gray-500">Annual Day Celebration</p>
                <p className="text-xs text-gray-400 mt-1">Yesterday</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-white rounded shadow-sm">
              <div className="bg-yellow-100 text-yellow-500 p-2 rounded mr-3">
                <FaChalkboardTeacher />
              </div>
              <div>
                <p className="font-medium">New teacher added</p>
                <p className="text-sm text-gray-500">Ms. Priya Patel - Science</p>
                <p className="text-xs text-gray-400 mt-1">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 