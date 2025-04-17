import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { routes } from '../../routes';
import { UserRole } from '../../utils/roles';

interface SidebarProps {
  isVisible: boolean;
}

interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  isGroup?: boolean;
  roles?: UserRole[];
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Function to check if a route is accessible to the user
  const isRouteAccessible = (path: string | undefined): boolean => {
    if (!path || !user) return false;
    
    const route = routes.find(r => r.path === path);
    return route ? route.roles.includes(user.role) : false;
  };
  
  // Define menu items for each role
  const adminMenuItems: MenuItem[] = [
    { icon: 'bi-house-door-fill', label: 'Home', isGroup: true },
    { icon: 'bi-speedometer2', label: 'Dashboard', path: '/' },
    { icon: 'bi-person', label: 'Profile', path: '/profile' },
    
    { icon: 'bi-file-earmark-text', label: 'Results Management', isGroup: true },
    { icon: 'bi-key', label: 'Manage Results', path: '/manage-results' },
    { icon: 'bi-clipboard-data', label: 'Report', path: '/report' },
    
    { icon: 'bi-people', label: 'User Management', isGroup: true },
    { icon: 'bi-person-plus', label: 'Teacher', path: '/teachers' },
    { icon: 'bi-people', label: 'Parents', path: '/parents' },
    { icon: 'bi-mortarboard', label: 'Students', path: '/students' },
    
    { icon: 'bi-megaphone', label: 'Announcements', isGroup: true },
    { icon: 'bi-bell', label: 'View Announcements', path: '/announcements' },
    { icon: 'bi-plus-circle', label: 'Create Announcement', path: '/announcements/create-announcement' },
    
    { icon: 'bi-box-arrow-right', label: 'Logout', path: '/logout' },
  ];
  
  const parentMenuItems: MenuItem[] = [
    { icon: 'bi-house-door-fill', label: 'Home', isGroup: true },
    { icon: 'bi-speedometer2', label: 'Dashboard', path: '/' },
    { icon: 'bi-person', label: 'Profile', path: '/profile' },
    { icon: 'bi-clipboard-data', label: 'Report', path: '/report' },
    { icon: 'bi-three-dots', label: 'Others', isGroup: true },
    { icon: 'bi-calendar-event', label: 'Holidays', path: '/holiday' },
    { icon: 'bi-bell', label: 'Announcements', path: '/announcements' },
    { icon: 'bi-chat-dots', label: 'Feedback', path: '/feedback' },
    { icon: 'bi-calendar-event', label: 'Contact Us', path: '/contact_us' },
    { icon: 'bi-box-arrow-right', label: 'Logout', path: '/logout' },
  ];
  
  const teacherMenuItems: MenuItem[] = [
    { icon: 'bi-house-door-fill', label: 'Home', isGroup: true },
    { icon: 'bi-speedometer2', label: 'Dashboard', path: '/' },
    { icon: 'bi-person', label: 'Profile', path: '/profile' },
    
    { icon: 'bi-book', label: 'Academics', isGroup: true },
    { icon: 'bi-calendar-check', label: 'Attendance', path: '/attendance' },
    
    { icon: 'bi-file-earmark-text', label: 'Exam', isGroup: true },
    { icon: 'bi-clipboard-data', label: 'Result', path: '/result' },
    
    { icon: 'bi-three-dots', label: 'Others', isGroup: true },
    { icon: 'bi-card-list', label: 'Leave Application', path: '/leave' },
    { icon: 'bi-calendar-event', label: 'Holidays', path: '/holiday' },
    { icon: 'bi-chat-dots', label: 'Feedback', path: '/feedback' },
    { icon: 'bi-bell', label: 'View Announcements', path: '/announcements' },
    { icon: 'bi-box-arrow-right', label: 'Logout', path: '/logout' },
  ];
  
  const studentMenuItems: MenuItem[] = [
    { icon: 'bi-house-door-fill', label: 'Home', isGroup: true },
    { icon: 'bi-speedometer2', label: 'Dashboard', path: '/' },
    { icon: 'bi-person', label: 'Profile', path: '/profile' },
    
    { icon: 'bi-book', label: 'Academics', isGroup: true },
    { icon: 'bi-calendar2-week', label: 'Time Table', path: '/time-table' },
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
  
  // Select menu items based on user role
  let menuItems: MenuItem[] = [];
  
  if (user) {
    switch(user.role) {
      case UserRole.ADMIN:
        menuItems = adminMenuItems;
        break;
      case UserRole.PARENT:
        menuItems = parentMenuItems;
        break;
      case UserRole.TEACHER:
        menuItems = teacherMenuItems;
        break;
      case UserRole.STUDENT:
        menuItems = studentMenuItems;
        break;
      default:
        menuItems = studentMenuItems; // Default to student if role is not recognized
    }
  }

  // Filter out menu items for which the user doesn't have access permission
  const filteredMenuItems = menuItems.filter(item => {
    if (item.isGroup) {
      // Keep the group header if at least one child is accessible
      const nextGroupIndex = menuItems.indexOf(item) + 1;
      const childrenItems = menuItems.slice(nextGroupIndex);
      const nextGroupItemIndex = childrenItems.findIndex(i => i.isGroup);
      const groupItems = nextGroupItemIndex === -1 
        ? childrenItems 
        : childrenItems.slice(0, nextGroupItemIndex);
      
      return groupItems.some(childItem => isRouteAccessible(childItem.path));
    }
    
    return item.path === '/logout' || isRouteAccessible(item.path);
  });

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
        <div className="px-6 py-5 text-2xl font-bold uppercase border-b border-gray-700">
          MENU
        </div>
        
        <ul className="py-2">
          {filteredMenuItems.map((item, index) => (
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
                <div className="flex items-center px-6 py-3 font-medium text-white">
                  <i className={`bi ${item.icon} mr-3 text-lg`}></i> {item.label}
                </div>
              ) : (
                <Link to={item.path || '#'} className="flex items-center px-6 py-3 text-sm text-white">
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