import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserRole } from '../utils/roles';
import { authAPI } from '../services/api';

interface Student {
  id: number;
  name: string;
  // Add other student properties as needed
}

interface Teacher {
  id: number;
  name: string;
  // Add other teacher properties as needed
}

interface Admin {
  id: number;
  fullName: string;
  // Add other admin properties as needed
}

interface Parent {
  id: number;
  name: string;
  // Add other parent properties as needed
}

interface User {
  id: number;
  email: string;
  role: UserRole;
  student?: Student;
  teacher?: Teacher;
  admin?: Admin;
  parent?: Parent;
}

interface ApiResponseData {
  statusCode: number;
  data: {
    status: string;
    token: string;
    data: {
      user: User;
    }
  };
  message: string;
  success: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Helper function to normalize the role to match UserRole enum
  const normalizeRole = (role: string): UserRole => {
    return role.toLowerCase() as UserRole;
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        console.log('Token found in localStorage, attempting to refresh');
        try {
          const response = await authAPI.refreshToken();
          console.log('Refresh token response:', response.data);
          
          const responseData = response.data as ApiResponseData;
          const actualToken = responseData.data.token;
          const actualUser = responseData.data.data.user;
          
          // Normalize the role
          actualUser.role = normalizeRole(actualUser.role);
          
          localStorage.setItem('token', actualToken);
          localStorage.setItem('user', JSON.stringify(actualUser));
          setUser(actualUser);
          console.log('User authenticated:', actualUser);
          setLoading(false);
          return true;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          return false;
        }
      }

      console.log('No token found, user is not authenticated');
      setUser(null);
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('Attempting login with:', email);
      const response = await authAPI.login(email, password);
      console.log('Login response:', response.data);
      
      const responseData = response.data as ApiResponseData;
      const actualToken = responseData.data.token;
      const actualUser = responseData.data.data.user;
      
      // Normalize the role
      actualUser.role = normalizeRole(actualUser.role);
      
      console.log('Setting token:', actualToken);
      console.log('Setting user with normalized role:', actualUser);
      
      localStorage.setItem('token', actualToken);
      localStorage.setItem('user', JSON.stringify(actualUser));
      setUser(actualUser);
      setLoading(false);
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 