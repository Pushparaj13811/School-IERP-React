import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLayout from './PageLayout';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#292648]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show layout with content if authenticated
  return <PageLayout />;
};

export default AuthLayout;
