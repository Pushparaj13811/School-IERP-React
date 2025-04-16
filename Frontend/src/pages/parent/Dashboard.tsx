import React from 'react';
import { FaUserGraduate, FaCalendarCheck, FaPhoneAlt, FaTrophy } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const ParentDashboard: React.FC = () => {
  const children = [
    {
      id: 1,
      name: 'Rohan Sharma',
      grade: '10th',
      attendance: '85%',
      lastResultPercentage: '88%',
      totalAchievementCount: 5,
      totalContact: 10,
    },
    {
      id: 2,
      name: 'Priya Sharma',
      grade: '8th',
      attendance: '92%',
      lastResultPercentage: '94%',
      totalAchievementCount: 2,
      totalContact: 11,
    },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Meeting', date: 'Feb 20, 2024', time: '10:00 AM', event_description: "An interactive session where parents and teachers discuss students’ progress, achievements, and areas for improvement." },
    { id: 2, title: 'Annual Sports Day', date: 'Feb 25, 2024', time: '9:00 AM', event_description:"A fun-filled event featuring various sports competitions, promoting teamwork, fitness, and school spirit." },
    { id: 3, title: 'Science Exhibition', date: 'Mar 5, 2024', time: '11:00 AM', event_description:"A platform for students to showcase innovative science projects, experiments, and creative problem-solving skills." },
  ];

  const navigate = useNavigate();
  const handleNavigation = (path: string) => navigate(path);
  const navigateToAnnoucementPage = () =>{
    navigate('/announcements')
  }; 
  return (
    <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      {/* Stacked Child Cards */}
      <div className="space-y-6">
        {children.map((child) => (
          <div key={child.id} className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold">{child.name}</h2>
            <p className="text-sm text-gray-500">Grade {child.grade}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-lg cursor-pointer bg-blue-50" onClick={() => handleNavigation('/attendance')}>
                <div className="flex items-center">
                  <FaUserGraduate className="text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Attendance</p>
                    <p className="font-semibold">{child.attendance}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg cursor-pointer bg-green-50" onClick={() => handleNavigation('/result')}>
                <div className="flex items-center">
                  <FaCalendarCheck className="text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Result</p>
                    <p className="font-semibold">{child.lastResultPercentage}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg cursor-pointer bg-yellow-50" onClick={() => handleNavigation('/achievement')}>
                <div className="flex items-center">
                  <FaTrophy className="text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Achievements</p>
                    <p className="font-semibold">{child.totalAchievementCount}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg cursor-pointer bg-purple-50" onClick={() => handleNavigation('/contact_us')}>
                <div className="flex items-center">
                  <FaPhoneAlt className="text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Contact Details</p>
                    <p className="font-semibold">{child.totalContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events - Stacked Vertically */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Announcements</h2>
        <div className="space-y-4 cursor-pointer" onClick={navigateToAnnoucementPage} >
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex flex-col items-start p-3 rounded-lg md:flex-col md:items-start bg-gray-50 ">
            {/* Ensuring icon and title are in a row */}
            <div className="flex items-center mr-4">
              <FaCalendarCheck className="text-xl text-indigo-600" />
              <h3 className="m-2 ml-2 font-medium">{event.title}</h3>
            </div>
          
            <div>
              <p className='font-semibold text-gray-500'>{event.event_description}</p>
              <p className="mt-3 text-sm text-gray-500">{event.date} • {event.time}</p>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
