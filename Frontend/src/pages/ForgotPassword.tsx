import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import type { ApiError } from './Login';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate email
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Make API call
      await authAPI.forgotPassword(email);
      
      // Display success message
      setIsSuccess(true);
      toast.success('Password reset instructions have been sent to your email');
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      const apiError = err as ApiError;
      
      // Extract error message
      const errorMessage = 
        apiError.response?.data?.message || 
        apiError.message || 
        'An error occurred while processing your request';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          <h1 className="text-2xl font-bold text-[#1e1c39]">Check Your Email</h1>
          <p className="text-gray-600 mt-2">
            We've sent instructions to reset your password to: <strong>{email}</strong>
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or
            <Button
              variant="outline"
              onClick={() => {
                handleSubmit(new Event('submit') as unknown as React.FormEvent);
              }}
              disabled={isSubmitting}
              className="ml-1 text-blue-600 hover:text-blue-800 underline"
            >
              try again
            </Button>
          </p>
          
          <Link to="/login" className="block mt-4 text-blue-600 hover:text-blue-800">
            Return to Login
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
        
        <h1 className="text-2xl font-bold text-[#1e1c39]">Forgot Password</h1>
        <p className="text-sm text-gray-600 mt-1">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#292648] disabled:opacity-70"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="pt-2 flex justify-center">
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Reset Password'}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword; 