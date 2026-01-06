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
  const [showPassword, setShowPassword] = useState(false);
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

    // Sanitize inputs - trim whitespace and convert email to lowercase
    const sanitizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate input
    if (!sanitizedEmail || !trimmedPassword) {
      setError('Please enter both email and password');
      return;
    }

    try {
      // Login with sanitized inputs
      await login(sanitizedEmail, trimmedPassword);
      
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
              className="w-full px-4 py-2.5 pr-12 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-70 transition-all"
              aria-required="true"
              aria-invalid={error && !email ? "true" : "false"}
            />
            <div className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Password"
              required
              disabled={loginInProgress}
              className="w-full px-4 py-2.5 pr-12 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-70 transition-all"
              aria-required="true"
              aria-invalid={error && !password ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-0"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loginInProgress}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 flex justify-center items-center"
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