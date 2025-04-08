import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 bg-[#EEF5FF] z-20 shadow-md">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side - Logo and title */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="font-bold text-xl text-[#292648] mr-2">JST</div>
            <div className="text-[#292648] font-bold text-xl">ERP</div>
          </Link>
          <div className="hidden ml-6 text-lg font-semibold text-gray-700 md:block">
            Shree Janahit School Management System
          </div>
        </div>

        {/* Right side - Search, language, and profile */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              {/* Search box - Only show when authenticated */}
              <div className="relative items-center hidden md:flex">
                <input
                  type="text"
                  placeholder="Search Here"
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md pl-9 focus:outline-none"
                />
                <i className="absolute text-gray-500 bi bi-search left-3"></i>
              </div>

              {/* Language selector - Only show when authenticated */}
              <div className="items-center hidden text-gray-700 cursor-pointer md:flex">
                <span>Language</span>
                <i className="ml-1 bi bi-chevron-down"></i>
              </div>
            </>
          )}

          {/* Profile dropdown */}
          <div className="flex items-center text-gray-700 cursor-pointer">
            {isAuthenticated ? (
              <>
                
                <div className="h-9 w-9 rounded-full bg-[#292648] flex items-center justify-center text-white overflow-hidden">
                  <img 
                    src="https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg"
                    alt="Profile" 
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="hidden ml-1 mr-1 md:block text-start">
                  <div className="font-semibold ">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 ">{user?.role || 'Student'}</div>
                </div>
                <i className="ml-1 bi bi-chevron-down"></i>
              </>
            ) : (
              <Link to="/login" className="flex items-center">
                <span className="text-[#292648] font-semibold">Login</span>
                <i className="ml-1 text-lg bi bi-box-arrow-in-right"></i>
              </Link>
            )}
          </div>

          {/* Mobile menu button - Only show when authenticated */}
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="bg-[#D9E4FF] md:hidden focus:outline-none"
            >
              <i className="text-2xl bi bi-list"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;