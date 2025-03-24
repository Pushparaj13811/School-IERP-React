import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF5FF] p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        
        <div className="mt-4">
          <p className="text-gray-600">
            {user 
              ? `Sorry, your account (${user.role}) doesn't have permission to access this page.` 
              : 'Sorry, you don\'t have permission to access this page.'}
          </p>
        </div>
        
        <div className="mt-6">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 text-white bg-[#292648] rounded-md hover:bg-[#1D1B48] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Dashboard
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="w-full mt-2 px-4 py-2 text-[#292648] bg-white border border-[#292648] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go Back
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 text-white bg-[#292648] rounded-md hover:bg-[#1D1B48] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 