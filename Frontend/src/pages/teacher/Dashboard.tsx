import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import { TeacherDashboardData } from '../../services/api';
import { formatTime } from '../../utils/timeUtils';

// Import shared components and utilities - eliminates duplicate StatCard and loading states
import {
  PageLoadingState,
  PageErrorState,
  StatCard,
  StatusBadge
} from '../../components/common';
import { getTimeBasedGreeting, formatDashboardDate } from '../../utils/dateUtils';

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
      } catch {
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
  
  // Loading state - using shared component
  if (isLoading) {
    return <PageLoadingState message="Loading dashboard..." />;
  }

  // Error state - using shared component
  if (error) {
    return (
      <PageErrorState
        title="Error Loading Dashboard"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!dashboardData) {
    return (
      <PageErrorState
        title="No Dashboard Data"
        message="No teacher dashboard data available."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getTimeBasedGreeting()}, {dashboardData.teacher?.name || 'Teacher'}
            </h1>
            <p className="mt-1 text-gray-600">{formatDashboardDate(new Date())}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Take Attendance
            </button>
            <button
              onClick={navigateToProfileSection}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards - using shared StatCard component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Classes"
          value={dashboardData.totalClasses || 0}
          color="amber"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          onClick={() => navigate('/classes')}
        />
        <StatCard
          title="Total Students"
          value={dashboardData.totalStudents || 0}
          color="green"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Pending Attendances"
          value={dashboardData.pendingAttendances || 0}
          color="blue"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Leave Requests"
          value={dashboardData.pendingLeaveRequests || 0}
          color="purple"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          onClick={() => navigate('/leave')}
        />
      </div>

      {/* Teacher details and today's timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Teacher details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-5">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">My Details</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-indigo-100 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={navigateToProfileSection}
                >
                  <img
                    src={dashboardData.teacher.profilePicture || "https://via.placeholder.com/150?text=Teacher"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Teacher";
                    }}
                  />
                </div>
                <button
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all text-sm"
                  onClick={navigateToProfileSection}
                >
                  Edit Profile
                </button>
              </div>

              <div className="flex-1">
                {teacherDetails.map((detail, index) => (
                  <TeacherDetail key={index} label={detail.label} value={String(detail.value)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-7">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Today's Timetable</h3>
                <p className="text-sm text-gray-500 mt-1">Your class schedule for today</p>
              </div>
              <button
                onClick={() => navigate('/timetable')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View Full
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.todayTimetable?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class/Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dashboardData.todayTimetable.map((period) => (
                      <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {formatTime(period.timeSlot.startTime)} - {formatTime(period.timeSlot.endTime)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{period.subject.name}</div>
                          <div className="text-xs text-gray-500">{period.subject.code}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {period.class.name} {period.section.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No classes scheduled today</p>
                <p className="text-sm text-gray-400 mt-1">Enjoy your free day!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classes & Subjects and Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Classes & Subjects */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-7">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">My Classes & Subjects</h3>
                <p className="text-sm text-gray-500 mt-1">Your assigned teaching responsibilities</p>
              </div>
              <button
                onClick={() => navigate('/assignments')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.assignedClasses?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dashboardData.assignedClasses.map((assignment) => (
                      <tr
                        key={`${assignment.class.id}-${assignment.section.id}-${assignment.subject.id}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {assignment.class.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {assignment.section.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {assignment.subject.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {assignment.studentsCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No classes assigned</p>
                <p className="text-sm text-gray-400 mt-1">Contact admin for class assignments</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-5">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
                <p className="text-sm text-gray-500 mt-1">Latest updates and notices</p>
              </div>
              <button
                onClick={navigateToAnnouncementPage}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recentAnnouncements?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{announcement.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{announcement.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{dashboardService.formatDate(announcement.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No announcements</p>
                <p className="text-sm text-gray-400 mt-1">Stay tuned for updates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Leave Applications */}
      {dashboardData.pendingLeaveRequests > 0 && dashboardData.pendingLeaveApplications?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pending Leave Applications</h3>
                <p className="text-sm text-gray-500 mt-1">Student leave requests awaiting approval</p>
              </div>
              <button
                onClick={() => navigate('/leave')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.pendingLeaveApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {application.student.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {dashboardService.formatStudentDisplayName(application.student)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {dashboardService.formatDate(application.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {dashboardService.formatDate(application.startDate)} - {dashboardService.formatDate(application.endDate)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status="PENDING" size="sm" />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-xs font-medium hover:from-indigo-700 hover:to-blue-700 transition-all"
                          onClick={() => navigate(`/leave/${application.id}`)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 