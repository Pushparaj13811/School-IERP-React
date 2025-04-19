import axios from 'axios';
import { 
  ApiResponse, 
  ClassesResponse, 
  SectionsResponse, 
  SubjectsResponse, 
  DesignationsResponse,
  StudentsResponse,
  TeachersResponse,
  ParentsResponse,
  UserResponse,
  Student,
  Teacher,
  Parent,
  StudentFormData,
  ParentFormData,
  Subject
} from '../types/api';

// Define missing interfaces
interface TeacherFormData {
  name: string;
  email: string;
  gender: string;
  contactNo: string;
  designationId?: number;
  subjects?: number[];
  classes?: number[];
  address: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
}

// Interfaces for other API responses
interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

interface Attendance {
  id: number;
  date: string;
  status: string;
  studentId: number;
  student?: Student;
}

interface DailyAttendance {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';
  remarks?: string;
  studentId: number;
  student?: {
    id: number;
    name: string;
    rollNumber?: string;
  };
}

interface MonthlyAttendanceSummary {
  studentId: number;
  studentName: string;
  rollNumber?: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  halfDay: number;
  total: number;
  percentage: number;
}

interface AttendanceStats {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  halfDayCount: number;
  presentPercentage: number;
  dailyTrend?: {
    date: string;
    present: number;
    absent: number;
    percentage: number;
  }[];
  classWiseStats?: {
    className: string;
    present: number;
    absent: number;
    percentage: number;
  }[];
}

interface Result {
  id: number;
  marks: number;
  grade: string;
  studentId: number;
  subjectId: number;
  student?: Student;
  subject?: { name: string };
}

interface OverallResult {
  id: number;
  studentId: number;
  academicYear: string;
  term: string;
  totalPercentage: number;
  status: string; 
  rank?: number | string;
  strongestSubject?: string;
  subjectsToImprove?: string[];
  classTeacherId: number;
}

interface LeaveApplication {
  id: number;
  applicantId: number;
  applicantType: 'STUDENT' | 'TEACHER' | 'ADMIN';
  leaveTypeId: number;
  subject: string;
  fromDate: string;
  toDate: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  leaveType?: {
    id: number;
    name: string;
    description?: string;
  };
  student?: {
    id: number;
    name: string;
    class?: {
      id: number;
      name: string;
    };
    section?: {
      id: number;
      name: string;
    };
  };
  teacher?: {
    id: number;
    name: string;
    designation?: {
      id: number;
      name: string;
    };
  };
}

interface LeaveType {
  id: number;
  name: string;
  description?: string;
}

// Add these interfaces
interface ClassTeacherAssignment {
  id: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: number;
    name: string;
    email: string;
    designation?: {
      name: string;
    };
  };
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
}

// Timetable interfaces
interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakType: string | null;
}

interface Period {
  id: number;
  dayOfWeek: number;
  timeSlotId: number;
  subjectId: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  timetableId: number;
  timeSlot?: TimeSlot;
  subject?: Subject;
  teacher?: {
    id: number;
    name: string;
    user?: {
      name: string;
    };
  };
}

interface Timetable {
  id: number;
  classId: number;
  sectionId: number;
  academicYear: string;
  term: string;
  class?: {
    name: string;
  };
  section?: {
    name: string;
  };
  periods?: Period[];
}

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1', // Update this with your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
        }
        console.log(`Request [${config.method?.toUpperCase()}] ${config.url}`, config.params || config.data);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, response.status, response.data);
        return response;
    },
    (error) => {
        console.error(`API Error:`, error.response?.status, error.response?.data);
        
        // Don't redirect on auth-related endpoints
        if (error.config.url === '/auth/refresh-token' || 
            error.config.url === '/auth/login' ||
            error.config.url === '/auth/register') {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            // Handle unauthorized access for non-auth endpoints
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on the login page
            if (!window.location.pathname.includes('login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string) => 
        api.post<ApiResponse<{ token: string; user: UserResponse }>>('/auth/login', { email, password }),
    logout: () => api.post<ApiResponse<object>>('/auth/logout'),
    refreshToken: () => api.post<ApiResponse<{ token: string }>>('/auth/refresh-token'),
};

// User API
export const userAPI = {
    getProfile: () => api.get<ApiResponse<UserResponse>>('/users/profile'),
    updateProfile: (data: Record<string, unknown>) => api.patch<ApiResponse<UserResponse>>('/users/profile', data),
    updatePassword: (data: Record<string, unknown>) => api.patch<ApiResponse<{ message: string }>>('/users/password', data),
    uploadProfilePicture: (file: File) => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return api.patch<ApiResponse<{ profilePicture: string }>>('/users/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadParentProfilePicture: (parentId: number, file: File) => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return api.patch<ApiResponse<{ profilePicture: string }>>(`/users/parents/${parentId}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadStudentProfilePicture: (studentId: number, file: File) => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return api.patch<ApiResponse<{ profilePicture: string }>>(`/users/students/${studentId}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadTeacherProfilePicture: (teacherId: number, file: File) => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        return api.patch<ApiResponse<{ profilePicture: string }>>(`/users/teachers/${teacherId}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    createUser: (data: Record<string, unknown>) => api.post<ApiResponse<UserResponse>>('/users/create', data),
    createStudent: (data: StudentFormData) => api.post<ApiResponse<{ user: UserResponse; student: Student }>>('/users/create-student', data),
    createParent: (data: ParentFormData) => api.post<ApiResponse<{ user: UserResponse; parent: Parent }>>('/users/create-parent', data),
    createTeacher: (data: TeacherFormData) => api.post<ApiResponse<{ user: UserResponse; teacher: Teacher }>>('/users/create-teacher', data),
    getStudents: (params?: Record<string, unknown>) => api.get<ApiResponse<StudentsResponse>>('/users/students', { params }),
    getParents: (params?: Record<string, unknown>) => api.get<ApiResponse<ParentsResponse>>('/users/parents', { params }),
    getTeachers: (params?: Record<string, unknown>) => api.get<ApiResponse<TeachersResponse>>('/users/teachers', { params }),
    getStudentById: (id: number) => api.get<ApiResponse<{ student: Student }>>(`/users/students/${id}`),
    getParentById: (id: number) => api.get<ApiResponse<{ parent: Parent }>>(`/users/parents/${id}`),
    getTeacherById: (id: number) => api.get<ApiResponse<{ teacher: Teacher }>>(`/users/teachers/${id}`),
    updateStudent: (id: number, data: Partial<StudentFormData>) => api.patch<ApiResponse<{ student: Student }>>(`/users/students/${id}`, data),
    updateParent: (id: number, data: Partial<ParentFormData>) => api.patch<ApiResponse<{ parent: Parent }>>(`/users/parents/${id}`, data),
    updateTeacher: (id: number, data: Partial<TeacherFormData>) => api.patch<ApiResponse<{ teacher: Teacher }>>(`/users/teachers/${id}`, data),
};

// Academic API
export const academicAPI = {
    getClasses: () => api.get<ApiResponse<ClassesResponse>>('/academic/classes'),
    getSections: (classId?: number) => api.get<ApiResponse<SectionsResponse>>('/academic/sections', { 
        params: { 
            classId,
            _cache: new Date().getTime() // Add cache busting parameter 
        } 
    }),
    getSectionsByClass: (classId: number) => api.get<ApiResponse<SectionsResponse>>(`/sections/class/${classId}`),
    getSubjects: () => api.get<ApiResponse<SubjectsResponse>>('/academic/subjects'),
    getSubjectsByClass: (classId: number) => api.get<{success: boolean, data: Subject[]}>(`/academic/subjects/class/${classId}`),
    getDesignations: () => api.get<ApiResponse<DesignationsResponse>>('/academic/designations'),
};

// Announcement API
export const announcementAPI = {
    getAll: () => api.get<ApiResponse<{ announcements: Announcement[] }>>('/announcements'),
    getById: (id: string) => api.get<ApiResponse<{ announcement: Announcement }>>(`/announcements/${id}`),
    create: (data: Record<string, unknown>) => api.post<ApiResponse<{ announcement: Announcement }>>('/announcements', data),
    update: (id: string, data: Record<string, unknown>) => api.put<ApiResponse<{ announcement: Announcement }>>(`/announcements/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<object>>(`/announcements/${id}`),
};

// Attendance API
export const attendanceAPI = {
    // For backward compatibility
    getAttendance: (params?: Record<string, unknown>) => api.get<ApiResponse<{ attendance: Attendance[] }>>('/attendance', { params }),
    markAttendance: (data: Record<string, unknown>) => api.post<ApiResponse<{ attendance: Attendance }>>('/attendance', data),
    updateAttendance: (id: string, data: Record<string, unknown>) => api.put<ApiResponse<{ attendance: Attendance }>>(`/attendance/${id}`, data),
    
    // New endpoints for daily attendance
    getDailyAttendance: (params?: Record<string, unknown>) => api.get<ApiResponse<{ attendance: DailyAttendance[] }>>('/attendance/daily', { params }),
    markDailyAttendance: (data: { 
      date: string; 
      classId: number | string; 
      sectionId: number | string; 
      attendanceData: Array<{
        studentId: number;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';
        remarks?: string;
      }>;
    }) => api.post<ApiResponse<{ success: boolean }>>('/attendance/daily', data),
    
    // Monthly attendance summary
    getMonthlyAttendance: (params?: Record<string, unknown>) => api.get<ApiResponse<MonthlyAttendanceSummary[]>>('/attendance/monthly', { params }),
    
    // Statistics
    getAttendanceStats: (params?: Record<string, unknown>) => api.get<ApiResponse<AttendanceStats>>('/attendance/stats', { params }),
};

// Result API
export const resultAPI = {
    getResults: (params: Record<string, unknown>) => api.get<ApiResponse<{ results: Result[] }>>('/results/subject', { params }),
    getOverallResult: (params: Record<string, unknown>) => api.get<ApiResponse<{ result: OverallResult }>>('/results/overall', { params }),
    createResult: (data: Record<string, unknown>) => api.post<ApiResponse<{ result: Result }>>('/results/subject', data),
    updateResult: (id: string, data: Record<string, unknown>) => api.put<ApiResponse<{ result: Result }>>(`/results/${id}`, data),
    recalculateResults: (data: Record<string, unknown>) => api.post<ApiResponse<{ message: string }>>('/results/recalculate', data),
    toggleResultLock: (id: string, isLocked: boolean) => api.patch<ApiResponse<{ result: Result }>>(`/results/subject/${id}/lock`, { isLocked }),
};

// Leave API
export const leaveAPI = {
    getLeaves: (params: Record<string, unknown>) => api.get<ApiResponse<{ leaveApplications: LeaveApplication[] }>>('/leaves', { params }),
    getLeaveById: (id: number) => api.get<ApiResponse<{ leaveApplication: LeaveApplication }>>(`/leaves/${id}`),
    createLeave: (data: Record<string, unknown>) => api.post<ApiResponse<{ leaveApplication: LeaveApplication }>>('/leaves', data),
    updateLeaveStatus: (id: number, data: { status: 'APPROVED' | 'REJECTED' | 'CANCELLED', remarks?: string }) => 
        api.patch<ApiResponse<{ leaveApplication: LeaveApplication }>>(`/leaves/${id}/status`, data),
    getLeaveTypes: () => api.get<ApiResponse<{ leaveTypes: LeaveType[] }>>('/leaves/types'),
    createLeaveType: (data: { name: string, description?: string }) => 
        api.post<ApiResponse<{ leaveType: LeaveType }>>('/leaves/types', data),
};

// Dashboard API
export interface StudentDashboardData {
    student: Student;
    attendancePercentage: number;
    examResults: number;
    holidaysCount: number;
    achievementsCount: number;
    recentAnnouncements: Announcement[];
}

export const dashboardAPI = {
    getStudentDashboard: () => api.get<ApiResponse<StudentDashboardData>>('/dashboard/student'),
    getTeacherDashboard: () => api.get<ApiResponse<Record<string, unknown>>>('/dashboard/teacher'),
    getParentDashboard: () => api.get<ApiResponse<Record<string, unknown>>>('/dashboard/parent'),
    getAdminDashboard: () => api.get<ApiResponse<Record<string, unknown>>>('/dashboard/admin'),
};

// Add to the teacherAPI object
export const teacherAPI = {
  getAll: (params?: Record<string, unknown>) => 
    api.get<ApiResponse<{ teachers: Teacher[] }>>('/users/teachers', { params }),
  getById: (id: number) => 
    api.get<ApiResponse<{ teacher: Teacher }>>(`/users/teachers/${id}`),
  create: (data: TeacherFormData) => 
    api.post<ApiResponse<{ teacher: Teacher }>>('/users/teachers', data),
  update: (id: number, data: Partial<TeacherFormData>) => 
    api.patch<ApiResponse<{ teacher: Teacher }>>(`/users/teachers/${id}`, data),
  delete: (id: number) => 
    api.delete<ApiResponse<{ message: string }>>(`/users/teachers/${id}`),
  // Class teacher assignment endpoints
  assignClassTeacher: (data: { teacherId: number; classId: number; sectionId: number }) => 
    api.post<ApiResponse<{ assignment: ClassTeacherAssignment }>>('/teachers/class-teacher', data),
  getClassTeacherAssignments: () => 
    api.get<ApiResponse<{ assignments: ClassTeacherAssignment[] }>>(`/teachers/class-teacher/assignments`),
  removeClassTeacherAssignment: (id: number) => 
    api.delete<ApiResponse<{ message: string }>>(`/teachers/class-teacher/assignments/${id}`),
};

// Timetable API
export const timetableAPI = {
  // Get time slots
  getTimeSlots: () => 
    api.get<ApiResponse<TimeSlot[]>>('/timetables/timeslots'),
  
  // Add a new time slot
  addTimeSlot: (data: { startTime: string; endTime: string; isBreak: boolean; breakType: string | null }) => 
    api.post<ApiResponse<TimeSlot>>('/timetables/timeslots', data),
  
  // Delete a time slot
  deleteTimeSlot: (id: number) => 
    api.delete<ApiResponse<{ message: string }>>(`/timetables/timeslots/${id}`),
  
  // Get timetable by query parameters
  getTimetable: (params: { classId: number; sectionId: number; academicYear: string; term: string }) => 
    api.get<ApiResponse<Timetable | null>>('/timetables/query', { params }),
  
  // Get timetable by ID
  getTimetableById: (id: number) => 
    api.get<ApiResponse<Timetable>>(`/timetables/id/${id}`),
  
  // Create a new timetable
  createTimetable: (data: { classId: number; sectionId: number; academicYear: string; term: string }) => 
    api.post<ApiResponse<Timetable>>('/timetables', data),
  
  // Add a period to a timetable
  addPeriod: (data: { 
    timetableId: number;
    dayOfWeek: number;
    timeSlotId: number;
    subjectId: number;
    teacherId: number;
    classId: number;
    sectionId: number;
  }) => api.post<ApiResponse<Period>>('/timetables/period', data),
  
  // Delete a period
  deletePeriod: (id: number) => 
    api.delete<ApiResponse<{ message: string }>>(`/timetables/period/${id}`),
};

export default api; 