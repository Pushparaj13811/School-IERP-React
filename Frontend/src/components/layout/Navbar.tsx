import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService, { UserProfile } from '../../services/userService';
import profileService from '../../services/profileService';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const profile = await userService.getUserProfile();
          console.log('Navbar profile data:', profile);
          setUserProfile(profile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated]);
  
  // Handle user logout
  const handleLogout = () => {
    userService.clearCache();
    logout();
  };

  // Get profile image URL
  const getProfileImage = (profile: UserProfile | null) => {
    if (!profile) {
      console.log('No profile available');
      return "https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg";
    }
    
    console.log('Profile data in Navbar:', profile);
    
    if (!profile.profilePicture) {
      console.log('No profile picture available');
      return "https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg";
    }
    
    console.log('Profile picture data in Navbar:', profile.profilePicture);
    
    try {
      let imageUrl;
      // If it's an object with url property (used by admin profiles)
      if (typeof profile.profilePicture === 'object' && profile.profilePicture !== null && 'url' in profile.profilePicture) {
        imageUrl = profileService.getProfileImageUrl(profile.profilePicture);
      } else {
        // Otherwise use the userService
        imageUrl = userService.getProfileImageUrl(profile.profilePicture);
      }
      console.log('Image URL resolved to:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Error getting profile image URL:', error);
      return "https://via.placeholder.com/150?text=User";
    }
  };
  
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
                {/* User Profile Dropdown */}
                {isAuthenticated && !loading && userProfile && (
                  <div>
                    <button
                      type="button"
                      className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                      id="user-menu-button"
                      aria-expanded="false"
                      data-dropdown-toggle="user-dropdown"
                      data-dropdown-placement="bottom"
                    >
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="w-8 h-8 rounded-full"
                        src={getProfileImage(userProfile)}
                        alt="user photo"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error('Error loading profile image');
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=User";
                        }}
                      />
                    </button>
                    <div
                      className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                      id="user-dropdown"
                    >
                      <div className="px-4 py-3">
                        <span className="block text-sm text-gray-900 dark:text-white">
                          {userProfile.displayName}
                        </span>
                        <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                          {userProfile.email}
                        </span>
                        <span className="block text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          {userProfile.role ? userService.getRoleDisplayName(userProfile.role) : 'User'}
                        </span>
                      </div>
                      <ul className="py-2" aria-labelledby="user-menu-button">
                        <li>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                          >
                            Profile
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                          >
                            Sign out
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
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