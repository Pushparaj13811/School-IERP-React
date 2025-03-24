import React from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaCalendarAlt, FaBook } from 'react-icons/fa';

const TeacherDashboard: React.FC = () => {
  // Mock data - in a real application, this would come from an API
  const statistics = {
    totalClasses: 5,
    totalStudents: 175,
    upcomingLessons: 8,
    assignedSubjects: 3
  };

  const recentActivities = [
    { id: 1, type: 'attendance', title: 'Marked attendance for Class 10-A', time: '2 hours ago' },
    { id: 2, type: 'grade', title: 'Updated grades for Mathematics Quiz', time: 'Yesterday' },
    { id: 3, type: 'homework', title: 'Assigned homework to Class 9-B', time: '2 days ago' },
  ];

  const upcomingSchedule = [
    { id: 1, subject: 'Mathematics', class: '10-A', time: '9:00 AM - 10:00 AM' },
    { id: 2, subject: 'Physics', class: '9-B', time: '11:00 AM - 12:00 PM' },
    { id: 3, subject: 'Chemistry', class: '10-B', time: '2:00 PM - 3:00 PM' },
  ];

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Assigned Classes</p>
              <p className="text-3xl font-bold mt-1">{statistics.totalClasses}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <span className="text-2xl"><FaChalkboardTeacher /></span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Total Students</p>
              <p className="text-3xl font-bold mt-1">{statistics.totalStudents}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <span className="text-2xl"><FaUserGraduate /></span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Upcoming Lessons</p>
              <p className="text-3xl font-bold mt-1">{statistics.upcomingLessons}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <span className="text-2xl"><FaCalendarAlt /></span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Assigned Subjects</p>
              <p className="text-3xl font-bold mt-1">{statistics.assignedSubjects}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <span className="text-2xl"><FaBook /></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {upcomingSchedule.map(schedule => (
                <div key={schedule.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
                    <FaBook />
                  </div>
                  <div>
                    <h3 className="font-medium">{schedule.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {schedule.class} • {schedule.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    activity.type === 'attendance' ? 'bg-green-100 text-green-600' :
                    activity.type === 'grade' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <FaChalkboardTeacher />
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 