import { dashboardAPI } from './api';
import { toast } from 'react-toastify';
import { 
  StudentDashboardData, 
  TeacherDashboardData, 
  AdminDashboardData, 
  ParentDashboardData 
} from './api';

// Generic dashboard state with loading and error states
interface DashboardState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

// Default/initial states
const initialStudentDashboardState: DashboardState<StudentDashboardData> = {
  isLoading: true,
  error: null,
  data: null
};

const initialTeacherDashboardState: DashboardState<TeacherDashboardData> = {
  isLoading: true,
  error: null,
  data: null
};

const initialParentDashboardState: DashboardState<ParentDashboardData> = {
  isLoading: true,
  error: null,
  data: null
};

const initialAdminDashboardState: DashboardState<AdminDashboardData> = {
  isLoading: true,
  error: null,
  data: null
};

class DashboardService {
  // Get student dashboard data
  async getStudentDashboard(): Promise<DashboardState<StudentDashboardData>> {
    try {
      const dashboardState: DashboardState<StudentDashboardData> = {...initialStudentDashboardState};
      
      const response = await dashboardAPI.getStudentDashboard();
      
      if (response.data?.status === 'success' && response.data?.data) {
        dashboardState.data = response.data.data;
      } else {
        dashboardState.error = 'No data returned from dashboard API';
      }
      
      dashboardState.isLoading = false;
      return dashboardState;
    } catch (error) {
      console.error('Error in student dashboard service:', error);
      toast.error('Failed to load student dashboard data');
      
      return {
        ...initialStudentDashboardState,
        isLoading: false,
        error: 'Failed to load dashboard data'
      };
    }
  }

  // Get teacher dashboard data
  async getTeacherDashboard(): Promise<DashboardState<TeacherDashboardData>> {
    try {
      const dashboardState: DashboardState<TeacherDashboardData> = {...initialTeacherDashboardState};
      
      const response = await dashboardAPI.getTeacherDashboard();
      
      if (response.data?.status === 'success' && response.data?.data) {
        dashboardState.data = response.data.data;
      } else {
        dashboardState.error = 'No data returned from dashboard API';
      }
      
      dashboardState.isLoading = false;
      return dashboardState;
    } catch (error) {
      console.error('Error in teacher dashboard service:', error);
      toast.error('Failed to load teacher dashboard data');
      
      return {
        ...initialTeacherDashboardState,
        isLoading: false,
        error: 'Failed to load dashboard data'
      };
    }
  }

  // Get parent dashboard data
  async getParentDashboard(): Promise<DashboardState<ParentDashboardData>> {
    try {
      const dashboardState: DashboardState<ParentDashboardData> = {...initialParentDashboardState};
      
      const response = await dashboardAPI.getParentDashboard();
      
      if (response.data?.status === 'success' && response.data?.data) {
        dashboardState.data = response.data.data;
      } else {
        dashboardState.error = 'No data returned from dashboard API';
      }
      
      dashboardState.isLoading = false;
      return dashboardState;
    } catch (error) {
      console.error('Error in parent dashboard service:', error);
      toast.error('Failed to load parent dashboard data');
      
      return {
        ...initialParentDashboardState,
        isLoading: false,
        error: 'Failed to load dashboard data'
      };
    }
  }

  // Get admin dashboard data
  async getAdminDashboard(): Promise<DashboardState<AdminDashboardData>> {
    try {
      const dashboardState: DashboardState<AdminDashboardData> = {...initialAdminDashboardState};
      
      const response = await dashboardAPI.getAdminDashboard();
      
      if (response.data?.status === 'success' && response.data?.data) {
        dashboardState.data = response.data.data;
      } else {
        dashboardState.error = 'No data returned from dashboard API';
      }
      
      dashboardState.isLoading = false;
      return dashboardState;
    } catch (error) {
      console.error('Error in admin dashboard service:', error);
      toast.error('Failed to load admin dashboard data');
      
      return {
        ...initialAdminDashboardState,
        isLoading: false,
        error: 'Failed to load dashboard data'
      };
    }
  }
  
  // Format a student's name and class for display
  formatStudentDisplayName(student: {
    name?: string;
    class?: { name: string } | string;
    section?: { name: string } | string;
  } | null): string {
    if (!student) return 'Student';
    
    let displayName = student.name || 'Student';
    if (student.class) {
      displayName += ` (${typeof student.class === 'string' ? student.class : student.class.name}`;
      if (student.section) {
        displayName += ` ${typeof student.section === 'string' ? student.section : student.section.name}`;
      }
      displayName += ')';
    }
    
    return displayName;
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
    } catch {
      return dateString;
    }
  }

  // Format time (e.g., "08:30" to "8:30 AM")
  formatTime(timeString?: string): string {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return timeString;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService; 