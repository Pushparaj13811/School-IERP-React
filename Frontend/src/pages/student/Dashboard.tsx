import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import { StudentDashboardData } from '../../services/api';
import { formatTime } from '../../utils/timeUtils';

// Import shared components and utilities - eliminates duplicate getGreeting and formatDate
import { PageLoadingState, PageErrorState } from '../../components/common';
import { getTimeBasedGreeting, formatDashboardDate } from '../../utils/dateUtils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dashboardService.getStudentDashboard();
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
        title="No Data Available"
        message="Dashboard data is currently unavailable."
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
              {getTimeBasedGreeting()}, {dashboardData.student?.name || 'Student'}
            </h1>
            <p className="mt-1 text-gray-600">{formatDashboardDate(new Date())}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
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

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Attendance Card */}
        <div
          onClick={() => navigate('/attendance')}
          className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{Math.round(dashboardData.attendancePercentage)}%</p>
            <p className="text-gray-500 mt-1">Attendance Rate</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(dashboardData.attendancePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Exam Results Card */}
        <div
          onClick={() => navigate('/result')}
          className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{dashboardData.examResults?.length || 0}</p>
            <p className="text-gray-500 mt-1">Exam Results</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              View all results
            </span>
          </div>
        </div>

        {/* Holidays Card */}
        <div
          onClick={() => navigate('/holiday')}
          className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{dashboardData.upcomingHolidays?.length || 0}</p>
            <p className="text-gray-500 mt-1">Upcoming Holidays</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              View calendar
            </span>
          </div>
        </div>

        {/* Achievements Card */}
        <div
          onClick={() => navigate('/achievement')}
          className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{dashboardData.achievements || 0}</p>
            <p className="text-gray-500 mt-1">Achievements</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              View badges
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">My Details</h3>
            <p className="text-sm text-gray-500 mt-1">Your student information</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 mb-4">
                <img
                  src={dashboardData.student.profilePicture || "https://via.placeholder.com/150?text=Student"}
                  alt={`${dashboardData.student.name || 'Student'}'s profile`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Student";
                  }}
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">{dashboardData.student?.name || 'N/A'}</h4>
              <p className="text-sm text-gray-500">Roll No: {dashboardData.student?.rollNo || 'N/A'}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Class</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.student?.class?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Section</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.student?.section?.name || 'N/A'}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all"
            >
              View Full Profile
            </button>
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
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
                        <td className="px-4 py-4 text-sm text-gray-700">{period.teacher.name}</td>
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
                <p className="text-gray-500 font-medium">No classes today</p>
                <p className="text-sm text-gray-400 mt-1">Enjoy your free day!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Exam Results */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Exam Results</h3>
                <p className="text-sm text-gray-500 mt-1">Your latest performance</p>
              </div>
              <button
                onClick={() => navigate('/results')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.examResults?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.examResults.slice(0, 4).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        result.grade === 'A' || result.grade === 'A+' ? 'bg-emerald-100' :
                        result.grade === 'B' || result.grade === 'B+' ? 'bg-blue-100' :
                        result.grade === 'C' || result.grade === 'C+' ? 'bg-amber-100' :
                        'bg-red-100'
                      }`}>
                        <span className={`text-lg font-bold ${
                          result.grade === 'A' || result.grade === 'A+' ? 'text-emerald-600' :
                          result.grade === 'B' || result.grade === 'B+' ? 'text-blue-600' :
                          result.grade === 'C' || result.grade === 'C+' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>{result.grade}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{result.subject.name}</p>
                        <p className="text-sm text-gray-500">{dashboardService.formatDate(result.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{result.marksObtained}/{result.totalMarks}</p>
                      <p className="text-xs text-gray-500">marks</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No exam results yet</p>
                <p className="text-sm text-gray-400 mt-1">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
                <p className="text-sm text-gray-500 mt-1">Latest updates and notices</p>
              </div>
              <button
                onClick={() => navigate('/announcements')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recentAnnouncements?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentAnnouncements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="group p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
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

      {/* Upcoming Holidays */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Upcoming Holidays</h3>
              <p className="text-sm text-gray-500 mt-1">Mark your calendar</p>
            </div>
            <button
              onClick={() => navigate('/holiday')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View Calendar
            </button>
          </div>
        </div>
        <div className="p-6">
          {dashboardData.upcomingHolidays?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900">{holiday.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{holiday.holidayType.name}</p>
                  <p className="text-sm font-medium text-amber-700 mt-2">
                    {dashboardService.formatDate(holiday.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No upcoming holidays</p>
              <p className="text-sm text-gray-400 mt-1">Keep working hard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
