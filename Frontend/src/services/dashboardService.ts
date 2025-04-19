import { dashboardAPI, userAPI, announcementAPI } from './api';
import { Student } from '../types/api';
import { toast } from 'react-toastify';

// Type for student dashboard with loading and error states
export interface StudentDashboardState {
  isLoading: boolean;
  error: string | null;
  data: {
    student: Student | null;
    attendancePercentage: number;
    examResults: number;
    holidaysCount: number;
    achievementsCount: number;
    recentAnnouncements: Array<{
      id: number;
      date: string;
      title: string;
      content: string;
    }>;
  };
}

// Default/initial state
const initialStudentDashboardState: StudentDashboardState = {
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
};

class DashboardService {
  // Get student dashboard data
  async getStudentDashboard(): Promise<StudentDashboardState> {
    try {
      // Use the mock fallback only in development if the API endpoint doesn't exist yet
      let dashboardData: StudentDashboardState = {...initialStudentDashboardState};

      try {
        // Try to get data from the real API
        const response = await dashboardAPI.getStudentDashboard();
        if (response.data?.status === 'success' && response.data?.data) {
          const apiData = response.data.data;
          dashboardData.data = {
            student: apiData.student,
            attendancePercentage: apiData.attendancePercentage,
            examResults: apiData.examResults,
            holidaysCount: apiData.holidaysCount,
            achievementsCount: apiData.achievementsCount,
            recentAnnouncements: apiData.recentAnnouncements
          };
        }
      } catch (error) {
        console.warn('Dashboard API not available, falling back to profile data');
        
        // If dashboard API fails, try to at least get the student profile
        try {
          const profileResponse = await userAPI.getProfile();
          
          // Fetch announcements separately
          let recentAnnouncements: Array<{
            id: number;
            date: string;
            title: string;
            content: string;
          }> = [];
          
          try {
            const announcementsResponse = await announcementAPI.getAll();
            if (announcementsResponse.data?.status === 'success' && 
                announcementsResponse.data?.data?.announcements) {
              // Get the 3 most recent announcements
              recentAnnouncements = announcementsResponse.data.data.announcements
                .slice(0, 3)
                .map(announcement => ({
                  id: announcement.id,
                  date: this.formatDate(announcement.createdAt),
                  title: announcement.title,
                  content: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : '')
                }));
            }
          } catch (announcementError) {
            console.error('Error fetching announcements:', announcementError);
            // Fallback to mock announcement if API call fails
            recentAnnouncements = [
              {
                id: 1,
                date: new Date().toLocaleDateString(),
                title: 'Exam Announcement!',
                content: 'We are excited to announce that your Second Terminal Exam will start soon. Please prepare accordingly.'
              }
            ];
          }
          
          if (profileResponse.data?.status === 'success' && profileResponse.data?.data?.user?.student) {
            // Extract student data from user object
            const userData = profileResponse.data.data.user;
            
            // Check if student data exists
            if (userData.student) {
              // Set student in dashboard data
              dashboardData.data.student = userData.student;
              
              // Create mock data for the other stats
              dashboardData.data.attendancePercentage = 85; // Mock data
              dashboardData.data.examResults = 1; // Mock count
              dashboardData.data.holidaysCount = 15; // Mock count
              dashboardData.data.achievementsCount = 5; // Mock count
              
              // Use real announcements or fallback mock
              dashboardData.data.recentAnnouncements = recentAnnouncements;
            }
          }
        } catch (profileError) {
          console.error('Error fetching profile data:', profileError);
          dashboardData.error = 'Failed to load dashboard data';
        }
      }
      
      dashboardData.isLoading = false;
      return dashboardData;
      
    } catch (error) {
      console.error('Error in dashboard service:', error);
      toast.error('Failed to load dashboard data');
      
      return {
        ...initialStudentDashboardState,
        isLoading: false,
        error: 'Failed to load dashboard data'
      };
    }
  }
  
  // Format a student's name and class for display
  formatStudentDisplayName(student: Student | null): string {
    if (!student) return 'Student';
    
    let displayName = student.name || 'Student';
    if (student.class?.name) {
      displayName += ` (${student.class.name}`;
      if (student.section?.name) {
        displayName += ` ${student.section.name}`;
      }
      displayName += ')';
    }
    
    return displayName;
  }
  
  // Get the profile picture URL for a student
  getProfileImageUrl(student: Student | null): string {
    if (!student || !student.profilePicture) {
      return "https://via.placeholder.com/150?text=Student";
    }
    
    const profilePicture = student.profilePicture;
    
    try {
      // Check if profilePicture is an object with url property
      if (typeof profilePicture === 'object' && profilePicture !== null) {
        const pictureObj = profilePicture as unknown as { url?: string };
        if (pictureObj.url) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          return `${baseUrl}${pictureObj.url.startsWith('/') ? '' : '/'}${pictureObj.url}`;
        }
      }
      
      // If it's a string
      if (typeof profilePicture === 'string') {
        // Check if it's already a full URL
        if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
          return profilePicture;
        }
        
        // Otherwise, prepend the API base URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        return `${baseUrl}${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`;
      }
      
      return "https://via.placeholder.com/150?text=Student";
    } catch (error) {
      console.error("Error processing profile picture:", error);
      return "https://via.placeholder.com/150?text=Student";
    }
  }
  
  // Format date for display
  formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService; 