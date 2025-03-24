import React from 'react';
import { FaUserGraduate, FaCalendarCheck, FaChartLine, FaBell } from 'react-icons/fa';

const ParentDashboard: React.FC = () => {
  // Mock data - in a real application, this would come from an API
  const children = [
    {
      id: 1,
      name: 'Rohan Sharma',
      grade: '10th',
      attendance: '95%',
      lastAttended: '2024-02-15',
      upcomingExams: 2,
      pendingFees: 0
    },
    {
      id: 2,
      name: 'Priya Sharma',
      grade: '8th',
      attendance: '92%',
      lastAttended: '2024-02-15',
      upcomingExams: 1,
      pendingFees: 0
    }
  ];

  const recentActivities = [
    { id: 1, type: 'exam', title: 'Mathematics Mid-term Result Published', child: 'Rohan Sharma', time: '2 hours ago' },
    { id: 2, type: 'attendance', title: 'Marked Present', child: 'Priya Sharma', time: 'Today' },
    { id: 3, type: 'homework', title: 'Science Project Due Tomorrow', child: 'Rohan Sharma', time: 'Yesterday' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Meeting', date: 'Feb 20, 2024', time: '10:00 AM' },
    { id: 2, title: 'Annual Sports Day', date: 'Feb 25, 2024', time: '9:00 AM' },
    { id: 3, title: 'Science Exhibition', date: 'Mar 5, 2024', time: '11:00 AM' },
  ];

  return (
    <div className="p-6">
      {/* Children Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {children.map(child => (
          <div key={child.id} className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{child.name}</h2>
              <p className="text-sm text-gray-500">Grade {child.grade}</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FaUserGraduate />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="font-semibold">{child.attendance}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FaCalendarCheck />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Last Attended</p>
                      <p className="font-semibold">{child.lastAttended}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <FaChartLine />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Upcoming Exams</p>
                      <p className="font-semibold">{child.upcomingExams}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaBell />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Pending Fees</p>
                      <p className="font-semibold">{child.pendingFees}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    activity.type === 'exam' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'attendance' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <FaUserGraduate />
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.child}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg mr-4">
                    <FaCalendarCheck />
                  </div>
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {event.date} • {event.time}
                    </p>
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

export default ParentDashboard; 