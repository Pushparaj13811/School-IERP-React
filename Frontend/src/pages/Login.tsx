import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginInProgress } = useAuth();
  
  // Get the previous location or default to home
  const { from } = (location.state as LocationState) || { from: { pathname: '/' } };

  const handleSubmit = async (e: React.FormEvent) => {
    // Ensure form doesn't refresh the page
    e.preventDefault();
    
    // Clear previous error
    setError('');
    
    // Validate input
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      // Login - loginInProgress state is managed in AuthContext now
      await login(email, password);
      
      // Only navigate on successful login
      navigate(from?.pathname || '/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const apiError = err as ApiError;
      
      // Extract error message from different possible sources
      const errorMessage = 
        apiError.response?.data?.message || 
        apiError.message || 
        'Invalid email or password. Please try again.';
      
      setError(errorMessage);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit form on Enter key when focused on any input
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8" role="main">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#1e1c39]">
              <polygon points="50,0 95,25 95,75 50,100 5,75 5,25" fill="none" stroke="currentColor" strokeWidth="3"></polygon>
              <path d="M50,20 L50,80" stroke="currentColor" strokeWidth="2"></path>
              <path d="M30,40 L70,40" stroke="currentColor" strokeWidth="2"></path>
              <path d="M30,60 L70,60" stroke="currentColor" strokeWidth="2"></path>
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-[#1e1c39]">Login</h1>
        <h2 className="text-sm font-medium text-gray-600 mt-1">Janahit Secondary School, Jomsom</h2>
      </div>
      
      {error && (
        <div 
          className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">Username</label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Username"
              required
              disabled={loginInProgress}
              className="w-full px-4 py-2 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#292648] disabled:opacity-70"
              aria-required="true"
              aria-invalid={error && !email ? "true" : "false"}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Password"
              required
              disabled={loginInProgress}
              className="w-full px-4 py-2 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#292648] disabled:opacity-70"
              aria-required="true"
              aria-invalid={error && !password ? "true" : "false"}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l2.257-2.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loginInProgress}
            className="w-full py-2 px-4 bg-[#171630] hover:bg-[#292648] text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#292648] disabled:opacity-70 flex justify-center items-center"
            aria-busy={loginInProgress ? "true" : "false"}
          >
            {loginInProgress ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Login'}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <Link 
            to="/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
            aria-label="Forgot password"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;