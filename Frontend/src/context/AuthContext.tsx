import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserRole } from '../utils/roles';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
    // Check if user is authenticated on app load
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      // For demo purposes - replace with actual API call
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return true;
      }

      // No default user - require explicit login
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
      
      // Validate credentials
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password !== 'password') {
        throw new Error('Invalid password');
      }
      
      // Mock login - replace with actual API call
      console.log(`Login attempt with password length: ${password.length}`);
      
      const mockUser = {
        id: '1',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email,
        role: email.includes('admin') 
          ? UserRole.ADMIN 
          : email.includes('teacher') 
            ? UserRole.TEACHER 
            : email.includes('parent') 
              ? UserRole.PARENT 
              : UserRole.STUDENT
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setLoading(false);
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
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