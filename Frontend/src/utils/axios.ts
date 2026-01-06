import axios from 'axios';
import { toast } from 'react-toastify';

// Get API base URL from environment - fail loudly in production if not set
const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;

    if (envUrl) {
        return envUrl;
    }

    // In production, require explicit configuration
    if (import.meta.env.PROD) {
        console.error('VITE_API_BASE_URL is not configured. API calls will fail.');
        return '/api/v1'; // Use relative URL as fallback in production
    }

    // Development fallback
    return '/api/v1';
};

// Create API instance
const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
    withCredentials: true, // Include credentials for CORS
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Only log in development
        if (import.meta.env.DEV) {
            console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('[API] Request error:', error);
        }
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.debug(`[API] Response ${response.status} from ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        const errorMessage = error.response?.data?.message || 'An error occurred';

        if (import.meta.env.DEV) {
            console.error(`[API] Error ${error.response?.status}:`, errorMessage);
        }

        // Show toast notification for errors unless it's an auth error
        if (!error.config?.url?.includes('/auth/')) {
            toast.error(errorMessage);
        }

        // Don't redirect on auth-related endpoints
        const authEndpoints = [
            '/auth/refresh-token',
            '/auth/login',
            '/auth/register',
            '/auth/reset-password',
            '/auth/forgot-password'
        ];

        const isAuthEndpoint = authEndpoints.some(endpoint =>
            error.config?.url?.includes(endpoint)
        );

        if (isAuthEndpoint) {
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