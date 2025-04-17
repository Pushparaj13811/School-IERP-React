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

interface Result {
  id: number;
  marks: number;
  grade: string;
  studentId: number;
  subjectId: number;
  student?: Student;
  subject?: { name: string };
}

interface Leave {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  userId: number;
  user?: { name: string };
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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect on refresh token failures
        if (error.config.url === '/auth/refresh-token') {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
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
    getAttendance: (params: Record<string, unknown>) => api.get<ApiResponse<{ attendance: Attendance[] }>>('/attendance', { params }),
    markAttendance: (data: Record<string, unknown>) => api.post<ApiResponse<{ attendance: Attendance }>>('/attendance', data),
    updateAttendance: (id: string, data: Record<string, unknown>) => api.put<ApiResponse<{ attendance: Attendance }>>(`/attendance/${id}`, data),
};

// Result API
export const resultAPI = {
    getResults: (params: Record<string, unknown>) => api.get<ApiResponse<{ results: Result[] }>>('/results/subject', { params }),
    createResult: (data: Record<string, unknown>) => api.post<ApiResponse<{ result: Result }>>('/results/subject', data),
    updateResult: (id: string, data: Record<string, unknown>) => api.put<ApiResponse<{ result: Result }>>(`/results/${id}`, data),
    recalculateResults: (data: Record<string, unknown>) => api.post<ApiResponse<{ message: string }>>('/results/recalculate', data),
    toggleResultLock: (id: string, isLocked: boolean) => api.patch<ApiResponse<{ result: Result }>>(`/results/subject/${id}/lock`, { isLocked }),
};

// Leave API
export const leaveAPI = {
    getLeaves: (params: Record<string, unknown>) => api.get<ApiResponse<{ leaves: Leave[] }>>('/leaves', { params }),
    createLeave: (data: Record<string, unknown>) => api.post<ApiResponse<{ leave: Leave }>>('/leaves', data),
    updateLeave: (id: string, data: Record<string, unknown>) => api.put<ApiResponse<{ leave: Leave }>>(`/leaves/${id}`, data),
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

export default api; 