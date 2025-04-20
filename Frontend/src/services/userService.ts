import { userAPI } from './api';
import { Student, Teacher, Parent } from '../types/api';
import { ProfileApiResponse } from './profileService';

// Interface for the user profile with additional context
export interface UserProfile {
  id: number;
  email: string;
  role: string;
  name: string;
  profilePicture?: string | { id: number; url: string } | null;
  displayName: string;
  roleSpecificData?: Student | Teacher | Parent | Record<string, unknown>;
  isActive: boolean;
}

// Define a type to handle the API student data
interface ApiStudent {
  id: number;
  name?: string;
  class?: { name?: string };
  section?: { name?: string };
}

class UserService {
  private userCache: UserProfile | null = null;
  
  // Get logged in user profile with all details
  async getUserProfile(): Promise<UserProfile | null> {
    // If we have cached data, return it
    if (this.userCache) {
      return this.userCache;
    }
    
    try {
      const response = await userAPI.getProfile();
      console.log('API response:', response.data);
      
      // Cast to our specific response structure which includes the nested user
      const profileResponse = response.data as unknown as ProfileApiResponse;
      
      if (profileResponse?.status === 'success' && profileResponse?.data?.user) {
        const userData = profileResponse.data.user;
        console.log('User data from API:', userData);
        
        // Initialize with default values
        const userProfile: UserProfile = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.email, // Default fallback name
          displayName: userData.email,
          isActive: true // Default to active
        };
        
        // Extract role-specific data and update name accordingly
        if (userData.role === 'STUDENT' && userData.student) {
          console.log('Processing student data:', userData.student);
          userProfile.name = userData.student.name || userData.email;
          userProfile.profilePicture = userData.student.profilePicture;
          // Store as roleSpecificData but don't try to convert to Student type
          userProfile.roleSpecificData = userData.student;
          userProfile.displayName = this.formatStudentDisplayName(userData.student as ApiStudent);
        } else if (userData.role === 'TEACHER' && userData.teacher) {
          console.log('Processing teacher data:', userData.teacher);
          userProfile.name = userData.teacher.name || userData.email;
          userProfile.profilePicture = userData.teacher.profilePicture;
          userProfile.roleSpecificData = userData.teacher;
          userProfile.displayName = userData.teacher.name || userData.email;
        } else if (userData.role === 'PARENT' && userData.parent) {
          console.log('Processing parent data:', userData.parent);
          userProfile.name = userData.parent.name || userData.email;
          userProfile.profilePicture = userData.parent.profilePicture;
          userProfile.roleSpecificData = userData.parent;
          userProfile.displayName = userData.parent.name || userData.email;
        } else if (userData.role === 'ADMIN' && userData.admin) {
          console.log('Processing admin data:', userData.admin);
          userProfile.name = userData.admin.fullName || userData.email;
          // For admin, we need to pass the whole profilePicture object to maintain the URL structure
          userProfile.profilePicture = userData.admin.profilePicture;
          userProfile.roleSpecificData = userData.admin;
          userProfile.displayName = userData.admin.fullName || userData.email;
        }
        
        console.log('Processed user profile:', userProfile);
        
        // Cache the processed user profile
        this.userCache = userProfile;
        return userProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
  
  // Format a student's display name (used for UI)
  formatStudentDisplayName(student: Student | ApiStudent | null): string {
    if (!student) return 'Student';
    
    let displayName = student.name || 'Student';
    
    // Handle both Student type and API student type
    if ('class' in student && student.class) {
      // For ApiStudent
      if (typeof student.class === 'object' && 'name' in student.class) {
        displayName += ` (${student.class.name || ''}`;
        if (student.section && typeof student.section === 'object' && 'name' in student.section) {
          displayName += ` ${student.section.name || ''}`;
        }
        displayName += ')';
      } 
      // For Student
      else if (student.class && typeof student.class.name === 'string') {
        displayName += ` (${student.class.name}`;
        if (student.section && student.section.name) {
          displayName += ` ${student.section.name}`;
        }
        displayName += ')';
      }
    }
    
    return displayName;
  }
  
  // Get formatted role name for display
  getRoleDisplayName(role: string | undefined | null): string {
    if (!role) return 'User';
    
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'Administrator';
      case 'TEACHER':
        return 'Teacher';
      case 'STUDENT':
        return 'Student';
      case 'PARENT':
        return 'Parent';
      default:
        return role;
    }
  }
  
  // Get the profile picture URL
  getProfileImageUrl(profilePicture?: string | { id: number; url: string } | null): string {
    console.log('getProfileImageUrl received:', profilePicture);
    
    try {
      // Check if profilePicture is an object with url property
      if (typeof profilePicture === 'object' && profilePicture !== null) {
        console.log('Profile picture is an object:', profilePicture);
        
        // If it's an admin profile picture with defined structure
        if ('url' in profilePicture && profilePicture.url) {
          console.log('Found url property:', profilePicture.url);
          
          // Check if the URL is already absolute
          if (profilePicture.url.startsWith('http://') || profilePicture.url.startsWith('https://')) {
            return profilePicture.url;
          }
          
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          return `${baseUrl}${profilePicture.url.startsWith('/') ? '' : '/'}${profilePicture.url}`;
        }
        
        console.log('No url property found in object');
        return "/default-avatar.png";
      }
      
      // If it's a string
      if (typeof profilePicture === 'string') {
        console.log('Profile picture is a string:', profilePicture);
        
        // Check if it's already a full URL
        if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
          console.log('Already a full URL');
          return profilePicture;
        }
        
        // Otherwise, prepend the API base URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`;
        console.log('Created full URL:', fullUrl);
        return fullUrl;
      }

      return "/default-avatar.png";
    } catch (error) {
      console.error("Error processing profile picture:", error);
      return "/default-avatar.png";
    }
  }
  
  // Clear the user cache (useful after logout or updates)
  clearCache(): void {
    this.userCache = null;
  }
}

export const userService = new UserService();
export default userService; 