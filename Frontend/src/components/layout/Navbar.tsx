import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-[#EEF5FF] z-20 shadow-md">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side - Logo and title */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="font-bold text-xl text-[#292648] mr-2">JST</div>
            <div className="text-[#292648] font-bold text-xl">ERP</div>
          </Link>
          <div className="hidden md:block ml-6 font-semibold text-gray-700 text-lg">
            Shree Janahit School Management System
          </div>
        </div>

        {/* Right side - Search, language, and profile */}
        <div className="flex items-center space-x-4">
          {/* Search box */}
          <div className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search Here"
              className="bg-white border border-gray-300 rounded-md py-1 px-3 pl-9 text-sm focus:outline-none"
            />
            <i className="bi bi-search absolute left-3 text-gray-500"></i>
          </div>

          {/* Language selector */}
          <div className="hidden md:flex items-center text-gray-700 cursor-pointer">
            <span>Language</span>
            <i className="bi bi-chevron-down ml-1"></i>
          </div>

          {/* Profile dropdown */}
          <div className="flex items-center text-gray-700 cursor-pointer">
            <div className="hidden md:block mr-2 text-right">
              <div className="font-semibold">Ruchi</div>
              <div className="text-xs text-gray-500">Student</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#292648] flex items-center justify-center text-white overflow-hidden">
              <img 
                src="https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg"
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <i className="bi bi-chevron-down ml-1"></i>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <i className="bi bi-list text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 