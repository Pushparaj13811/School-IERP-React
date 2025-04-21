import axios from 'axios';
import { toast } from 'react-toastify';

// Create API instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Make sure headers exists before setting Authorization
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`Request [${config.method?.toUpperCase()}] ${config.url}`, config.params || config.data);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
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
        const errorMessage = error.response?.data?.message || 'An error occurred';
        console.error(`API Error:`, error.response?.status, error.response?.data);
        
        // Show toast notification for errors unless it's an auth error
        if (!error.config.url?.includes('/auth/')) {
            toast.error(errorMessage);
        }
        
        // Don't redirect on auth-related endpoints
        if (error.config.url === '/auth/refresh-token' || 
            error.config.url === '/auth/login' ||
            error.config.url === '/auth/register' ||
            error.config.url?.includes('/auth/reset-password') ||
            error.config.url?.includes('/auth/forgot-password')) {
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

export default api; 