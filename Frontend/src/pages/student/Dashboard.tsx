import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, StudentDashboardState } from '../../services/dashboardService';

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
  const [dashboardState, setDashboardState] = useState<StudentDashboardState>({
    isLoading: true,
    error: null,
    data: {
      student: null,
      attendancePercentage: 0,
      examResults: 0,
      holidaysCount: 0,
      achievementsCount: 0,
      recentAnnouncements: []
    }
  });
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getStudentDashboard();
        setDashboardState(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load dashboard data'
        }));
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
  
  const { isLoading, error, data } = dashboardState;
  const { student, attendancePercentage, examResults, holidaysCount, achievementsCount, recentAnnouncements } = data;
  
  // Generate student details from the student object
  const generateStudentDetails = () => {
    if (!student) return [];
    
    const details = [
      { label: 'Student No.', value: student.rollNo || 'N/A' },
      { label: 'Name', value: student.name || 'N/A' },
      { label: 'Gender', value: student.gender || 'N/A' },
      { label: "Father's Name", value: student.fatherName || 'N/A' },
      { label: "Mother's Name", value: student.motherName || 'N/A' },
      { label: 'Date of Birth', value: dashboardService.formatDate(student.dateOfBirth) },
      { label: 'DOB No.', value: student.dobNo || 'N/A' },
      { label: 'Class', value: student.class?.name || 'N/A' },
      { label: 'Section', value: student.section?.name || 'N/A' },
      { label: 'Roll No.', value: student.rollNo || 'N/A' }
    ];
    
    // Add address if available
    if (student.address) {
      let addressValue = '';
      if (student.address.addressLine1) addressValue += student.address.addressLine1 + ', ';
      if (student.address.city) addressValue += student.address.city + ', ';
      if (student.address.district) addressValue += student.address.district;
      details.push({ label: 'Address', value: addressValue || 'N/A' });
      details.push({ label: 'Contact No.', value: student.contactNo || 'N/A' });
    }
    
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

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {/* User welcome section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {student?.name || 'Student'} <span className="font-normal">Welcome</span>
        </h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Exam Result"
          value={examResults}
          icon="bi-clipboard-data"
          color="bg-[#62C25E]"
          onClick={() => navigate('/result')}
        />
        <StatCard
          title="Monthwise Attendence"
          value={`${attendancePercentage}%`}
          icon="bi-calendar-check"
          color="bg-[#AA9839]"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Holidays"
          value={holidaysCount}
          icon="bi-calendar-event"
          color="bg-[#5096FF]"
          onClick={() => navigate('/holiday')}
        />
        <StatCard
          title="Achievements"
          value={achievementsCount}
          icon="bi-trophy"
          color="bg-[#5E479B]"
          onClick={() => navigate('/achievement')}
        />
      </div>

      {/* Student details and announcements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Student details */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-7">
          <h3 className="mb-4 text-xl font-bold">My Details</h3>
          <hr className="mb-4" />

          <div className="flex mb-6">
            <div className="mr-6">
              <div className="overflow-hidden border-4 border-blue-100 rounded-full cursor-pointer w-36 h-36" onClick={navigateProfileSection}>
                <img
                  src={dashboardService.getProfileImageUrl(student)}
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
                  Edit
                </button>
                <button className="bg-[#292648] text-white px-4 py-2 rounded text-sm">Download</button>
              </div>
            </div>

            <div className="flex-1">
              {studentDetails.slice(0, Math.ceil(studentDetails.length / 2)).map((detail, index) => (
                <StudentDetail key={index} label={detail.label} value={detail.value} />
              ))}
            </div>

            <div className="flex-1">
              {studentDetails.slice(Math.ceil(studentDetails.length / 2)).map((detail, index) => (
                <StudentDetail key={index} label={detail.label} value={detail.value} />
              ))}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-5">
          <h3 className="mb-4 text-xl font-bold">Announcements</h3>
          <hr className="mb-4" />

          {recentAnnouncements.length > 0 ? (
            <div className="space-y-6">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="mb-4">
                  <div className="text-xs text-gray-500">{announcement.date}</div>
                  <div className="flex items-center mt-1">
                    <span className="font-semibold text-gray-700">📢 {announcement.title}</span>
                    <span className="ml-2 text-xs text-blue-500">📄</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{announcement.content}</p>
                  <div className="mt-2 text-right">
                    <button 
                      className="text-sm px-4 py-1 text-white bg-[#292648] rounded" 
                      onClick={navigateToAnnoucementPage}
                    >
                      View More
                    </button>
                  </div>
                  <hr className="mt-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              <p>No announcements available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 