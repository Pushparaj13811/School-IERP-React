import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  const { isAuthenticated, loading, loginInProgress } = useAuth();

  // Only show loading indicator for initial auth check, not for login attempts
  if (loading && !loginInProgress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#292648]"></div>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render children content
  return (
    <div className="w-full min-h-screen flex items-center justify-center relative">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
        <div className="absolute inset-0 bg-[#EEF5FF]/50 bg-opacity-70 z-10"></div>
      </div>
     
      {/* School name header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-[#292648]/80 to-transparent">
        <div className="text-center text-white font-semibold text-xl">
          श्री जनहित मा. वि. हार्दिक स्वागत गर्दछ ।
        </div>
      </div>
      
      {/* Content area - full width */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout; 