import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the previous location or default to home
  const { from } = (location.state as LocationState) || { from: { pathname: '/' } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Use optional chaining and provide a default path
      navigate(from?.pathname || '/', { replace: true });
    } catch (err: unknown) {
      console.error('Login error:', err);
      // Type guard for error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }
  };

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
        
        <h1 className="text-2xl font-bold text-[#1e1c39]">Login</h1>
        <h2 className="text-sm font-medium text-gray-600 mt-1">Janahit Secondary School, Jomsom</h2>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-2 mb-4 text-xs text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username"
              required
              className="w-full px-4 py-2 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#292648]"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2 bg-[#fcfcf6] rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#292648]"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l2.257-2.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[#171630] hover:bg-[#292648] text-white rounded-md font-medium focus:outline-none"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-center text-gray-500">
        <p>Use these test accounts:</p>
        <p className="text-[10px] mt-1">
          student@example.com / password<br />
          teacher@example.com / password<br />
          admin@example.com / password<br />
          parent@example.com / password
        </p>
      </div>
    </div>
  );
};

export default Login;