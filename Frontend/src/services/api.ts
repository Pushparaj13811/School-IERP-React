import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1', // Update this with your backend URL
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
        api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh-token'),
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
    updatePassword: (data: Record<string, unknown>) => api.put('/users/password', data),
    createUser: (data: Record<string, unknown>) => api.post('/users', data),
    createStudent: (data: Record<string, unknown>) => api.post('/users/students', data),
    createParent: (data: Record<string, unknown>) => api.post('/users/parents', data),
    createTeacher: (data: Record<string, unknown>) => api.post('/users/teachers', data),
};

// Announcement API
export const announcementAPI = {
    getAll: () => api.get('/announcements'),
    create: (data: Record<string, unknown>) => api.post('/announcements', data),
    update: (id: string, data: Record<string, unknown>) => api.put(`/announcements/${id}`, data),
    delete: (id: string) => api.delete(`/announcements/${id}`),
};

// Attendance API
export const attendanceAPI = {
    getAttendance: (params: Record<string, unknown>) => api.get('/attendance', { params }),
    markAttendance: (data: Record<string, unknown>) => api.post('/attendance', data),
    updateAttendance: (id: string, data: Record<string, unknown>) => api.put(`/attendance/${id}`, data),
};

// Result API
export const resultAPI = {
    getResults: (params: Record<string, unknown>) => api.get('/results', { params }),
    createResult: (data: Record<string, unknown>) => api.post('/results', data),
    updateResult: (id: string, data: Record<string, unknown>) => api.put(`/results/${id}`, data),
};

// Leave API
export const leaveAPI = {
    getLeaves: (params: Record<string, unknown>) => api.get('/leaves', { params }),
    createLeave: (data: Record<string, unknown>) => api.post('/leaves', data),
    updateLeave: (id: string, data: Record<string, unknown>) => api.put(`/leaves/${id}`, data),
};

export default api; 