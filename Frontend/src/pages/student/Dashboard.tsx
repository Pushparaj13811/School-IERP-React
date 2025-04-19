import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import { StudentDashboardData } from '../../services/api';
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

interface StudentDetailProps {
  label: string;
  value: string;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ label, value }) => {
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
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dashboardService.getStudentDashboard();
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
  
  const navigateProfileSection = () => {
    navigate('/profile');
  };
  
  const navigateToAnnoucementPage = () => {
    navigate('/announcements');
  };
  
  // Generate student details from the student object
  const generateStudentDetails = () => {
    if (!dashboardData?.student) return [];
    
    const student = dashboardData.student;
    const details = [
      { label: 'Student No.', value: student.rollNo || 'N/A' },
      { label: 'Name', value: student.name || 'N/A' },
      { label: 'Class', value: student.class?.name || 'N/A' },
      { label: 'Section', value: student.section?.name || 'N/A' },
      { label: 'Roll No.', value: student.rollNo || 'N/A' }
    ];
    
    return details;
  };
  
  const studentDetails = generateStudentDetails();
  
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
          <p>No student dashboard data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {/* User welcome section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {dashboardData.student?.name || 'Student'} <span className="font-normal">Welcome</span>
        </h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Attendance"
          value={`${Math.round(dashboardData.attendancePercentage)}%`}
          icon="bi-calendar-check"
          color="bg-[#AA9839]"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Exam Results"
          value={dashboardData.examResults?.length || 0}
          icon="bi-clipboard-data"
          color="bg-[#62C25E]"
          onClick={() => navigate('/result')}
        />
        <StatCard
          title="Holidays"
          value={dashboardData.upcomingHolidays?.length || 0}
          icon="bi-calendar-event"
          color="bg-[#5096FF]"
          onClick={() => navigate('/holiday')}
        />
        <StatCard
          title="Achievements"
          value={dashboardData.achievements || 0}
          icon="bi-trophy"
          color="bg-[#5E479B]"
          onClick={() => navigate('/achievement')}
        />
      </div>

      {/* Student details and today's timetable */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-6">
        {/* Student details */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-5">
          <h3 className="mb-4 text-xl font-bold">My Details</h3>
          <hr className="mb-4" />

          <div className="flex mb-6">
            <div className="mr-6">
              <div className="overflow-hidden border-4 border-blue-100 rounded-full cursor-pointer w-36 h-36" onClick={navigateProfileSection}>
                <img
                  src={dashboardData.student.profilePicture || "https://via.placeholder.com/150?text=Student"}
                  alt="Profile"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Profile image failed to load');
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Student";
                  }}
                />
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                <button 
                  className="bg-[#292648] text-white px-4 py-2 rounded text-sm"
                  onClick={navigateProfileSection}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="flex-1">
              {studentDetails.map((detail, index) => (
                <StudentDetail key={index} label={detail.label} value={detail.value} />
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
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
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
                        {period.teacher.name}
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

      {/* Recent Exam Results and Announcements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Recent Exam Results */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-7">
          <h3 className="mb-4 text-xl font-bold">Recent Exam Results</h3>
          <hr className="mb-4" />

          {dashboardData.examResults?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.examResults.map((result) => (
                    <tr key={result.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.subject.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {result.marksObtained}/{result.totalMarks}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.grade === 'A' || result.grade === 'A+' ? 'bg-green-100 text-green-800' :
                          result.grade === 'B' || result.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                          result.grade === 'C' || result.grade === 'C+' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {dashboardService.formatDate(result.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <button 
                  className="bg-[#292648] text-white px-4 py-2 rounded text-sm"
                  onClick={() => navigate('/results')}
                >
                  View All Results
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No exam results available.
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
                  onClick={navigateToAnnoucementPage}
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

      {/* Upcoming Holidays */}
      <div className="mt-6 p-6 bg-white rounded-lg shadow-sm">
        <h3 className="mb-4 text-xl font-bold">Upcoming Holidays</h3>
        <hr className="mb-4" />

        {dashboardData.upcomingHolidays?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {dashboardData.upcomingHolidays.map((holiday) => (
              <div key={holiday.id} className="p-4 border rounded-md bg-blue-50">
                <div className="text-lg font-semibold text-blue-800">{holiday.title}</div>
                <div className="text-sm text-gray-600">Type: {holiday.holidayType.name}</div>
                <div className="mt-2 text-sm font-medium text-gray-700">
                  {dashboardService.formatDate(holiday.date)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No upcoming holidays.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 