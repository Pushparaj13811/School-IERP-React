import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import { TeacherDashboardData } from '../../services/api';
import { formatTime } from '../../utils/timeUtils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
  return (
    <div 
      className="overflow-hidden rounded-md shadow-sm cursor-pointer" 
      onClick={onClick}
    >
      <div className={`flex items-center justify-between p-4 ${color}`}>
        <div className="flex-1">
          <div className="text-xs text-white">{title}</div>
          <div className="text-3xl font-bold text-white">{value}</div>
        </div>
        <div className="text-4xl text-white">
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

interface TeacherDetailProps {
  label: string;
  value: string;
}

const TeacherDetail: React.FC<TeacherDetailProps> = ({ label, value }) => {
  return (
    <div className="flex py-2 border-b border-gray-200">
      <div className="w-1/3 text-gray-600">{label}</div>
      <div className="w-2/3 text-gray-800">{value}</div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dashboardService.getTeacherDashboard();
        setDashboardData(result.data);
        setError(result.error);
        setIsLoading(result.isLoading);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const navigateToProfileSection = () => {
    navigate('/profile');
  };
  
  const navigateToAnnouncementPage = () => {
    navigate('/announcements');
  };
  
  const generateTeacherDetails = () => {
    if (!dashboardData?.teacher) return [];
    
    const teacher = dashboardData.teacher;
    const details = [
      { label: 'Employee ID', value: teacher.id || 'N/A' },
      { label: 'Name', value: teacher.name || 'N/A' },
      { label: 'Designation', value: teacher.designation?.name || 'N/A' },
      { label: 'Email', value: teacher.email || 'N/A' },
      { label: 'Phone', value: teacher.phone || 'N/A' }
    ];
    
    return details;
  };
  
  const teacherDetails = generateTeacherDetails();
  
  if (isLoading) {
  return (
      <div className="flex justify-center items-center h-64 bg-[#EEF5FF] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-[#EEF5FF]">
        <div className="p-6 bg-red-100 rounded-lg text-red-800">
          <h3 className="text-xl font-semibold mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
            </div>
          </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4 bg-[#EEF5FF]">
        <div className="p-6 bg-yellow-100 rounded-lg text-yellow-800">
          <h3 className="text-xl font-semibold mb-2">No Dashboard Data</h3>
          <p>No teacher dashboard data available.</p>
        </div>
            </div>
    );
  }

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {/* User welcome section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {dashboardData.teacher?.name || 'Teacher'} <span className="font-normal">Welcome</span>
        </h2>
            </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Total Classes"
          value={dashboardData.totalClasses || 0}
          icon="bi-mortarboard"
          color="bg-[#AA9839]"
          onClick={() => navigate('/classes')}
        />
        <StatCard
          title="Total Students"
          value={dashboardData.totalStudents || 0}
          icon="bi-people"
          color="bg-[#62C25E]"
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Pending Attendances"
          value={dashboardData.pendingAttendances || 0}
          icon="bi-check-circle"
          color="bg-[#5096FF]"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Leave Requests"
          value={dashboardData.pendingLeaveRequests || 0}
          icon="bi-envelope"
          color="bg-[#5E479B]"
          onClick={() => navigate('/leave')}
        />
        </div>

      {/* Teacher details and today's timetable */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-6">
        {/* Teacher details */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-5">
          <h3 className="mb-4 text-xl font-bold">My Details</h3>
          <hr className="mb-4" />

          <div className="flex mb-6">
            <div className="mr-6">
              <div className="overflow-hidden border-4 border-blue-100 rounded-full cursor-pointer w-36 h-36" onClick={navigateToProfileSection}>
                <img
                  src={dashboardData.teacher.profilePicture || "https://via.placeholder.com/150?text=Teacher"}
                  alt="Profile"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Profile image failed to load');
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Teacher";
                  }}
                />
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                <button 
                  className="bg-[#292648] text-white px-4 py-2 rounded text-sm"
                  onClick={navigateToProfileSection}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="flex-1">
              {teacherDetails.map((detail, index) => (
                <TeacherDetail key={index} label={detail.label} value={String(detail.value)} />
              ))}
            </div>
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-7">
          <h3 className="mb-4 text-xl font-bold">Today's Timetable</h3>
          <hr className="mb-4" />

          {dashboardData.todayTimetable?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.todayTimetable.map((period) => (
                    <tr key={period.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatTime(period.timeSlot.startTime)} - {formatTime(period.timeSlot.endTime)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {period.subject.name} ({period.subject.code})
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {period.class.name} {period.section.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No classes scheduled for today.
            </div>
          )}
        </div>
      </div>

      {/* Classes & Subjects and Announcements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Classes & Subjects */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-7">
          <h3 className="mb-4 text-xl font-bold">My Classes & Subjects</h3>
          <hr className="mb-4" />

          {dashboardData.assignedClasses?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.assignedClasses.map((assignment) => (
                    <tr key={`${assignment.class.id}-${assignment.section.id}-${assignment.subject.id}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignment.class.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {assignment.section.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {assignment.subject.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {assignment.studentsCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <button 
                  className="bg-[#292648] text-white px-4 py-2 rounded text-sm"
                  onClick={() => navigate('/assignments')}
                >
                  View All Assignments
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No classes or subjects assigned.
          </div>
          )}
                  </div>

        {/* Announcements */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-5">
          <h3 className="mb-4 text-xl font-bold">Announcements</h3>
          <hr className="mb-4" />

          {dashboardData.recentAnnouncements?.length > 0 ? (
            <div className="space-y-6">
              {dashboardData.recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="mb-4">
                  <div className="text-xs text-gray-500">{dashboardService.formatDate(announcement.date)}</div>
                  <div className="flex items-center mt-1">
                    <span className="font-semibold text-gray-700">📢 {announcement.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{announcement.content}</p>
                  <hr className="mt-4" />
                </div>
              ))}
              <div className="text-right">
                <button 
                  className="bg-[#292648] text-white px-4 py-2 rounded text-sm"
                  onClick={navigateToAnnouncementPage}
                >
                  View All Announcements
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No announcements available.
          </div>
          )}
        </div>
          </div>

      {/* Pending Leave Applications */}
      {dashboardData.pendingLeaveRequests > 0 && dashboardData.pendingLeaveApplications?.length > 0 && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="mb-4 text-xl font-bold">Pending Leave Applications</h3>
          <hr className="mb-4" />

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Period</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.pendingLeaveApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.student.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {dashboardService.formatStudentDisplayName(application.student)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {dashboardService.formatDate(application.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {dashboardService.formatDate(application.startDate)} - {dashboardService.formatDate(application.endDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {application.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <button 
                        className="mr-2 bg-green-500 text-white px-3 py-1 rounded text-xs"
                        onClick={() => navigate(`/leave/${application.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <button 
                className="bg-[#292648] text-white px-4 py-2 rounded text-sm"
                onClick={() => navigate('/leave')}
              >
                View All Leave Applications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 