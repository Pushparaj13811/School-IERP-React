import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../utils/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user } = useAuth();

  // Auth check is already handled by AuthLayout
  // This component only checks role-based permissions
  
  // If user doesn't have required role, redirect to unauthorized page
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If role check passes, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 