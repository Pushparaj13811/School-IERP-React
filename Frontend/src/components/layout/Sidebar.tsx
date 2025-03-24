import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isVisible: boolean;
}

interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  isGroup?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  const location = useLocation();
  
  const menuItems: MenuItem[] = [
    { icon: 'bi-house-door-fill', label: 'Home', isGroup: true },
    { icon: 'bi-speedometer2', label: 'Dashboard', path: '/' },
    { icon: 'bi-person', label: 'Profile', path: '/profile' },
    
    { icon: 'bi-book', label: 'Academics', isGroup: true },
    { icon: 'bi-calendar2-week', label: 'Time-Table', path: '/time-table' },
    { icon: 'bi-calendar-check', label: 'Attendance', path: '/attendance' },
    
    { icon: 'bi-file-earmark-text', label: 'Exam', isGroup: true },
    { icon: 'bi-clipboard-data', label: 'Result', path: '/result' },
    
    { icon: 'bi-three-dots', label: 'Others', isGroup: true },
    { icon: 'bi-card-list', label: 'Leave Application', path: '/leave' },
    { icon: 'bi-calendar-event', label: 'Holidays', path: '/holiday' },
    { icon: 'bi-trophy', label: 'Achievements', path: '/achievement' },
    { icon: 'bi-chat-dots', label: 'Feedback', path: '/feedback' },
    { icon: 'bi-bell', label: 'Announcements', path: '/announcements' },
    { icon: 'bi-box-arrow-right', label: 'Logout', path: '/logout' },
  ];

  const sidebarStyles = isVisible 
    ? 'left-0' 
    : '-left-64';
    
  const isActive = (path: string | undefined) => {
    if (!path) return '';
    return location.pathname === path ? 'bg-[#3b3664]' : '';
  };

  return (
    <div className={`bg-[#292648] text-white w-64 fixed top-0 bottom-0 transition-all duration-300 z-10 ${sidebarStyles}`}>
      <div className="h-full overflow-y-auto">
        <div className="py-5 px-6 text-2xl font-bold uppercase border-b border-gray-700">
          MENU
        </div>
        
        <ul className="py-2">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className={`
                ${item.isGroup 
                  ? 'bg-[#1e1c38] cursor-default' 
                  : `hover:bg-[#3b3664] ${isActive(item.path)}`}
                ${item.isGroup && index !== 0 ? 'mt-2' : ''}
              `}
            >
              {item.isGroup ? (
                <div className="flex items-center px-6 py-3 text-white font-medium">
                  <i className={`bi ${item.icon} mr-3 text-lg`}></i> {item.label}
                </div>
              ) : (
                <Link to={item.path || '#'} className="flex items-center px-6 py-3 text-white">
                  <i className={`bi ${item.icon} mr-3 text-lg`}></i> {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; 