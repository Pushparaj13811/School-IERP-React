import React, { useEffect, useState } from 'react';
import { FaUserGraduate, FaCalendarCheck, FaPhoneAlt, FaBookOpen, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { dashboardAPI, ParentDashboardData } from '../../services/api';
import { toast } from 'react-toastify';
import Spinner from '../../components/ui/Spinner';

interface ChildData {
  student: {
    id: number;
    name: string;
    rollNo: string;
    class: string;
    section: string;
    profilePicture: string | null;
  };
  attendancePercentage: number;
  recentResults: Array<{
    subject: string;
    marks: number;
    totalMarks: number;
    grade: string;
    date: string;
  }>;
  leaveApplications: Array<{
    id: number;
    leaveType: string;
    fromDate: string;
    toDate: string;
    status: string;
    reason: string;
  }>;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface Holiday {
  id: number;
  title: string;
  type: string;
  date: string;
  description: string;
}

const ParentDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getParentDashboard();
        setDashboardData(response.data.data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNavigation = (path: string) => navigate(path);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { children, recentAnnouncements, upcomingHolidays } = dashboardData;

  return (
    <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      {/* Children Cards */}
      <div className="space-y-6">
        {children.map((childData: ChildData, index: number) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              {childData.student.profilePicture ? (
                <img 
                  src={childData.student.profilePicture} 
                  alt={childData.student.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {childData.student.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold">{childData.student.name}</h2>
                <p className="text-sm text-gray-500">
                  Class {childData.student.class} - {childData.student.section} • Roll No: {childData.student.rollNo}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-lg cursor-pointer bg-blue-50" onClick={() => handleNavigation('/attendance')}>
                <div className="flex items-center">
                  <FaUserGraduate className="text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Attendance</p>
                    <p className="font-semibold">{childData.attendancePercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg cursor-pointer bg-green-50" onClick={() => handleNavigation('/result')}>
                <div className="flex items-center">
                  <FaBookOpen className="text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Results</p>
                    <p className="font-semibold">{childData.recentResults.length} subjects</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg cursor-pointer bg-yellow-50" onClick={() => handleNavigation('/leaves')}>
                <div className="flex items-center">
                  <FaFileAlt className="text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Leave Applications</p>
                    <p className="font-semibold">{childData.leaveApplications.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg cursor-pointer bg-purple-50" onClick={() => handleNavigation('/contact_us')}>
                <div className="flex items-center">
                  <FaPhoneAlt className="text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Contact School</p>
                    <p className="font-semibold">Support</p>
                  </div>
                </div>
              </div>
            </div>
            
            {childData.recentResults.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Recent Results</h3>
                <div className="space-y-2">
                  {childData.recentResults.slice(0, 3).map((result, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{result.subject}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {result.marks}/{result.totalMarks}
                        </p>
                        <p className="text-xs text-gray-500">Grade: {result.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Side Content */}
      <div className="space-y-6">
        {/* Announcements */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Announcements</h2>
          <div className="space-y-4 cursor-pointer" onClick={() => handleNavigation('/announcements')}>
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((announcement: Announcement) => (
                <div key={announcement.id} className="flex flex-col p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center mr-4">
                    <FaCalendarCheck className="text-xl text-indigo-600" />
                    <h3 className="m-2 ml-2 font-medium">{announcement.title}</h3>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">{announcement.content}</p>
                    <p className="mt-3 text-sm text-gray-500">
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No recent announcements</p>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Upcoming Holidays</h2>
          <div className="space-y-4">
            {upcomingHolidays.length > 0 ? (
              upcomingHolidays.map((holiday: Holiday) => (
                <div key={holiday.id} className="flex flex-col p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center mr-4">
                    <FaCalendarCheck className="text-xl text-green-600" />
                    <h3 className="m-2 ml-2 font-medium">{holiday.title}</h3>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">{holiday.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-500">{new Date(holiday.date).toLocaleDateString()}</p>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {holiday.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No upcoming holidays</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
