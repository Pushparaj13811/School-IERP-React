import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import { AdminDashboardData } from '../../services/api';
import Button from '../../components/ui/Button';

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dashboardService.getAdminDashboard();
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
  
  const navigateToAnnouncementPage = () => {
    navigate('/announcements');
  };
  
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
          <p>No admin dashboard data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {/* User welcome section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <span className="font-normal">Welcome, Admin</span>
        </h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Total Students"
          value={dashboardData.totalStudents || 0}
          icon="bi-mortarboard"
          color="bg-[#5096FF]"
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Total Teachers"
          value={dashboardData.totalTeachers || 0}
          icon="bi-person-badge"
          color="bg-[#AA9839]"
          onClick={() => navigate('/teachers')}
        />
        <StatCard
          title="Total Classes"
          value={dashboardData.totalClasses || 0}
          icon="bi-building"
          color="bg-[#62C25E]"
          onClick={() => navigate('/classes')}
        />
        <StatCard
          title="Total Subjects"
          value={dashboardData.totalSubjects || 0}
          icon="bi-book"
          color="bg-[#5E479B]"
          onClick={() => navigate('/subjects')}
        />
      </div>

      {/* System summary and announcements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-6">
        {/* System summary */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-7">
          <h3 className="mb-4 text-xl font-bold">System Summary</h3>
          <hr className="mb-4" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-lg font-medium text-gray-700">Students</h4>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{dashboardData.totalStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active:</span>
                  <span className="font-medium">{dashboardData.activeStudents}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-lg font-medium text-gray-700">Teachers</h4>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{dashboardData.totalTeachers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active:</span>
                  <span className="font-medium">{dashboardData.activeTeachers}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-lg font-medium text-gray-700">Classes</h4>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{dashboardData.totalClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sections:</span>
                  <span className="font-medium">{dashboardData.totalSections}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 text-lg font-medium text-gray-700">Users</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-10 h-10 mr-4 bg-[#5096FF] rounded-full flex items-center justify-center text-white">
                  <i className="bi bi-mortarboard text-xl"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Students</div>
                  <div className="text-xl font-semibold">{dashboardData.usersByRole?.STUDENT || 0}</div>
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-10 h-10 mr-4 bg-[#AA9839] rounded-full flex items-center justify-center text-white">
                  <i className="bi bi-person-badge text-xl"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Teachers</div>
                  <div className="text-xl font-semibold">{dashboardData.usersByRole?.TEACHER || 0}</div>
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-10 h-10 mr-4 bg-[#62C25E] rounded-full flex items-center justify-center text-white">
                  <i className="bi bi-person text-xl"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Parents</div>
                  <div className="text-xl font-semibold">{dashboardData.usersByRole?.PARENT || 0}</div>
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-10 h-10 mr-4 bg-[#5E479B] rounded-full flex items-center justify-center text-white">
                  <i className="bi bi-shield text-xl"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Admins</div>
                  <div className="text-xl font-semibold">{dashboardData.usersByRole?.ADMIN || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <Button
              variant='primary'
              onClick={() => navigate('/users')}
            >
              Manage Users
            </Button>
          </div>
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
                <Button
                  variant='primary'
                  onClick={navigateToAnnouncementPage}
                >
                  Manage Announcements
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No announcements available.
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Recent Activities */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-7">
          <h3 className="mb-4 text-xl font-bold">Recent Activities</h3>
          <hr className="mb-4" />

          {dashboardData.recentActivities?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                    <i className={`bi ${
                      activity.type === 'USER_CREATED' ? 'bi-person-plus' :
                      activity.type === 'ANNOUNCEMENT' ? 'bi-megaphone' :
                      activity.type === 'CLASS_CREATED' ? 'bi-building' :
                      'bi-activity'
                    }`}></i>
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">{dashboardService.formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
              <div className="p-4 text-center text-gray-500">
              No recent activities to display.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-lg shadow-sm md:col-span-5">
          <h3 className="mb-4 text-xl font-bold">Quick Actions</h3>
          <hr className="mb-4" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button
              variant='outline'
              onClick={() => navigate('/students/add-students')}
            >
              <i className="bi bi-person-plus text-2xl text-blue-600 px-2"></i>
              <span className="mt-2 text-sm font-medium text-gray-700">Add Student</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => navigate('/teachers/add-teacher')}
            >
              <i className="bi bi-person-badge text-2xl text-amber-600 px-2"></i>
              <span className="mt-2 text-sm font-medium text-gray-700">Add Teacher</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => navigate('/classes/add-class')}
            >
              <i className="bi bi-building-add text-2xl text-green-600 px-2"></i>
              <span className="mt-2 text-sm font-medium text-gray-700">Add Class</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => navigate('/announcements/create-announcement')}
            >
              <i className="bi bi-megaphone text-2xl text-purple-600 px-2"></i>
                <span className="mt-2 text-sm font-medium text-gray-700">New Announcement</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 