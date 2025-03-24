import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device and set sidebar accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    // Run once on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="min-h-screen bg-[#EEF5FF]">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isVisible={sidebarVisible} />
      
      <div 
        className={`transition-all  duration-300 ${
          sidebarVisible ? 'md:ml-64' : 'ml-0'
        }`}
      >
        <div className="pt-14 min-w-screen min-h-screen">
          {children}
        </div>
      </div>

      {/* Overlay to close sidebar on mobile when clicked outside */}
      {isMobile && sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[5]" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default PageLayout; 