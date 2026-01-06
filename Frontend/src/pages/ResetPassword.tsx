import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

// Define a more comprehensive ApiError type
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      errors?: string[];
    };
  };
  message?: string;
}

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [token, setToken] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ token?: string }>();

  // Extract token from URL when component mounts
  useEffect(() => {
    // First check if token is in the URL path params
    const pathToken = params.token;

    // If not, check if it's in the query params
    const queryParams = new URLSearchParams(location.search);
    const queryToken = queryParams.get('token');

    // Use whichever token is available
    const resetToken = pathToken || queryToken;

    if (!resetToken) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    setToken(resetToken);
  }, [location, params]);

  const validatePasswordStrength = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('One lowercase letter');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('One uppercase letter');
    }
    if (!/\d/.test(pwd)) {
      errors.push('One number');
    }
    if (!/[^a-zA-Z0-9]/.test(pwd)) {
      errors.push('One special character');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError('');
    setValidationErrors([]);

    // Validate password
    if (!password) {
      setError('Please enter a new password');
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      setValidationErrors(passwordValidation.errors);
      setError('Password does not meet requirements:');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);

      // Make API call with both password and confirmPassword
      await authAPI.resetPassword(token, password, confirmPassword);

      // Display success message
      setIsSuccess(true);
      toast.success('Your password has been successfully reset');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      const apiError = err as ApiError;

      // Extract error message - handle various error formats
      let errorMessage = 'An error occurred while resetting your password';

      if (apiError.response?.data?.errors && Array.isArray(apiError.response.data.errors)) {
        // Handle validation errors array from backend
        setValidationErrors(apiError.response.data.errors);
        errorMessage = 'Password reset failed:';
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render error if token is missing
  if (error === 'Reset token is missing. Please use the link from your email.') {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1e1c39]">Invalid Reset Link</h1>
          <p className="text-gray-600 mt-2">
            The password reset link appears to be invalid or expired.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium focus:outline-none">
            Request New Reset Link
          </Link>

          <Link to="/login" className="block mt-4 text-blue-600 hover:text-blue-800">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // Render success message
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1e1c39]">Password Reset Successful</h1>
          <p className="text-gray-600 mt-2">
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Render form
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#1e1c39]">
              <polygon points="50,0 95,25 95,75 50,100 5,75 5,25" fill="none" stroke="currentColor" strokeWidth="3"></polygon>
              <path d="M50,20 L50,80" stroke="currentColor" strokeWidth="2"></path>
              <path d="M30,40 L70,40" stroke="currentColor" strokeWidth="2"></path>
              <path d="M30,60 L70,60" stroke="currentColor" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1e1c39]">Reset Password</h1>
        <p className="text-sm text-gray-600 mt-1">
          Enter your new password below to reset your account.
        </p>
      </div>

      {error && error !== 'Reset token is missing. Please use the link from your email.' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700 rounded-r">
          <p className="font-medium">{error}</p>
          {validationErrors.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {validationErrors.map((err, index) => (
                <li key={index} className="text-red-600">{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 pr-12 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-70 transition-all"
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
          <p className="mt-1.5 text-xs text-gray-500">
            Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 pr-12 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-70 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-0"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
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
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </>
            ) : 'Reset Password'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
