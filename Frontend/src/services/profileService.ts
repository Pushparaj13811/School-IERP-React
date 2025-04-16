import { userAPI } from './api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Define interfaces for different profile types
export interface AdminProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: {
    addressLine1: string;
    city: string;
    district: string;
    province: string;
  };
  dateOfBirth: string;
  joinDate: string;
  emergencyContact: string;
  bio: string | null;
  profilePicture?: {
    id: number;
    url: string;
  } | null;
}

export interface StudentProfileData {
  name: string;
  email: string;
  gender: string;
  rollNo: string;
  contactNo: string;
  emergencyContact: string;
  dateOfBirth: string;
  dobNo: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  fatherName: string;
  motherName: string;
  className: string;
  sectionName: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
  profilePicture?: {
    id: number;
    url: string;
  } | null;
}

export interface TeacherProfileData {
  name: string;
  email: string;
  gender: string;
  contactNo: string;
  designationName: string;
  subjects: string[];
  classes: string[];
  address: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
  profilePicture?: {
    id: number;
    url: string;
  } | null;
}

export interface ParentProfileData {
  name: string;
  email: string;
  gender: string;
  contactNo: string;
  children: {
    id: number;
    name: string;
    className: string;
    sectionName: string;
  }[];
  address: {
    addressLine1: string;
    addressLine2?: string;
    street: string;
    city: string;
    ward: string;
    municipality: string;
    district: string;
    province: string;
    country: string;
    postalCode?: string;
  };
  profilePicture?: {
    id: number;
    url: string;
  } | null;
}

export type ProfileData = AdminProfileData | StudentProfileData | TeacherProfileData | ParentProfileData;

export interface ProfileApiResponse {
  status: string;
  data: {
    user: {
      id: number;
      email: string;
      role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
      student?: {
        id: number;
        name: string;
        gender?: string;
        rollNo?: string;
        contactNo?: string;
        emergencyContact?: string;
        dateOfBirth?: string;
        dobNo?: string;
        bloodGroup?: string;
        nationality?: string;
        religion?: string;
        fatherName?: string;
        motherName?: string;
        class?: { name: string };
        section?: { name: string };
        address?: {
          addressLine1: string;
          addressLine2?: string;
          street: string;
          city: string;
          ward: string;
          municipality: string;
          district: string;
          province: string;
          country: string;
          postalCode?: string;
        };
        profilePicture?: { id: number; url: string } | null;
      } | null;
      teacher?: {
        id: number;
        name: string;
        gender?: string;
        contactNo?: string;
        designation?: { name: string };
        subjects?: Array<{ name: string }>;
        classes?: Array<{ class?: { name?: string } }>;
        profilePicture?: { id: number; url: string } | null;
      } | null;
      parent?: {
        id: number;
        name: string;
        gender?: string;
        contactNo?: string;
        children?: Array<{
          id: number;
          name?: string;
          class?: { name?: string };
          section?: { name?: string };
        }>;
        address?: {
          addressLine1: string;
          addressLine2?: string;
          street: string;
          city: string;
          ward: string;
          municipality: string;
          district: string;
          province: string;
          country: string;
          postalCode?: string;
        };
        profilePicture?: { id: number; url: string } | null;
      } | null;
      admin?: {
        id: number;
        fullName: string;
        phone?: string;
        dateOfBirth?: string;
        joinDate?: string;
        emergencyContact?: string;
        bio?: string | null;
        address?: {
          addressLine1: string;
          city: string;
          district: string;
          province: string;
        };
        profilePicture?: { id: number; url: string } | null;
      } | null;
    };
  };
  message?: string;
}

export interface ProfilePictureResponse {
  status: string;
  data: {
    profilePicture: {
      id: number;
      url: string;
    }
  };
  message?: string;
}

class ProfileService {
  private profileCache: Record<string, ProfileData> = {};
  
  // Format date for display
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
  
  // Get profile data based on user role
  async getProfileData(role?: string): Promise<ProfileData | null> {
    console.log('getProfileData called' + (role ? ` for role: ${role}` : ''));
    
    try {
      console.log('Fetching profile data from API...');
      const response = await userAPI.getProfile();
      console.log('Profile API response status:', response.status);
      console.log('Raw API response data:', response.data);
      
      if (!response.data) {
        console.error('API response data is empty or undefined');
        return null;
      }
      
      // Cast to our specific response structure which includes the nested user property
      const profileResponse = response.data as unknown as ProfileApiResponse;
      
      if (profileResponse?.status === 'success' && profileResponse?.data?.user) {
        // Access the nested user object correctly
        const userData = profileResponse.data.user;
        console.log('User data extracted from API response:', userData);
        
        // Get the actual role from the API response
        const userRole = userData.role;
        console.log('User role from API:', userRole);
        
        if (!userRole) {
          console.error('Role information is missing. Raw data:', JSON.stringify(userData, null, 2));
          return null;
        }
        
        // If a specific role was requested, but doesn't match the actual role
        if (role && userRole !== role) {
          console.warn(`Requested role (${role}) doesn't match user's actual role (${userRole})`);
          // Continue with actual role instead of requested role
        }
        
        // Use the actual role for caching key
        const cacheKey = userRole;
        
        // Check cache with actual role
        if (this.profileCache[cacheKey]) {
          console.log('Returning profile data from cache');
          return this.profileCache[cacheKey];
        }
        
        let profileData: ProfileData | null = null;
        
        // Process based on role
        if (userRole === 'ADMIN' && userData.admin) {
          console.log('Processing admin data:', userData.admin);
          profileData = {
            fullName: userData.admin.fullName || '',
            email: userData.email || '',
            phone: userData.admin.phone || '',
            address: {
              addressLine1: userData.admin.address?.addressLine1 || '',
              city: userData.admin.address?.city || '',
              district: userData.admin.address?.district || '',
              province: userData.admin.address?.province || '',
            },
            dateOfBirth: userData.admin.dateOfBirth || '',
            joinDate: userData.admin.joinDate || '',
            emergencyContact: userData.admin.emergencyContact || '',
            bio: userData.admin.bio || '',
            profilePicture: userData.admin.profilePicture || null
          } as AdminProfileData;
        } 
        else if (userRole === 'STUDENT' && userData.student) {
          console.log('Processing student data:', userData.student);
          profileData = {
            name: userData.student.name || '',
            email: userData.email || '',
            gender: userData.student.gender || '',
            rollNo: userData.student.rollNo || '',
            contactNo: userData.student.contactNo || '',
            emergencyContact: userData.student.emergencyContact || '',
            dateOfBirth: userData.student.dateOfBirth || '',
            dobNo: userData.student.dobNo || '',
            bloodGroup: userData.student.bloodGroup || '',
            nationality: userData.student.nationality || '',
            religion: userData.student.religion || '',
            fatherName: userData.student.fatherName || '',
            motherName: userData.student.motherName || '',
            className: userData.student.class?.name || '',
            sectionName: userData.student.section?.name || '',
            address: userData.student.address || {
              addressLine1: '',
              street: '',
              city: '',
              ward: '',
              municipality: '',
              district: '',
              province: '',
              country: '',
            },
            profilePicture: userData.student.profilePicture || null
          } as StudentProfileData;
        }
        else if (userRole === 'TEACHER' && userData.teacher) {
          console.log('Processing teacher data:', userData.teacher);
          
          // Define proper interfaces for teacher data
          interface TeacherSubject { name: string; }
          interface TeacherClass { class?: { name?: string }; }
          
          profileData = {
            name: userData.teacher.name || '',
            email: userData.email || '',
            gender: userData.teacher.gender || '',
            contactNo: userData.teacher.contactNo || '',
            designationName: userData.teacher.designation?.name || '',
            subjects: (userData.teacher.subjects || []).map((s: TeacherSubject) => s.name || ''),
            classes: (userData.teacher.classes || []).map((c: TeacherClass) => c.class?.name || ''),
            address: {
              // Provide default address since Teacher type might not have address property
              addressLine1: '',
              street: '',
              city: '',
              ward: '',
              municipality: '',
              district: '',
              province: '',
              country: '',
            },
            profilePicture: userData.teacher.profilePicture || null
          } as TeacherProfileData;
        }
        else if (userRole === 'PARENT' && userData.parent) {
          console.log('Processing parent data:', userData.parent);
          
          // Define proper interface for child data
          interface ParentChild {
            id: number;
            name?: string;
            class?: { name?: string };
            section?: { name?: string };
          }
          
          profileData = {
            name: userData.parent.name || '',
            email: userData.email || '',
            gender: userData.parent.gender || '',
            contactNo: userData.parent.contactNo || '',
            children: (userData.parent.children || []).map((child: ParentChild) => ({
              id: child.id,
              name: child.name || '',
              className: child.class?.name || '',
              sectionName: child.section?.name || ''
            })),
            address: userData.parent.address || {
              addressLine1: '',
              street: '',
              city: '',
              ward: '',
              municipality: '',
              district: '',
              province: '',
              country: '',
            },
            profilePicture: userData.parent.profilePicture || null
          } as ParentProfileData;
        } else {
          console.error('Unable to process user data. Role:', userRole);
          console.error('Role-specific data missing:', {
            hasAdmin: !!userData.admin,
            hasStudent: !!userData.student,
            hasTeacher: !!userData.teacher,
            hasParent: !!userData.parent
          });
          console.error('Full user data:', JSON.stringify(userData, null, 2));
        }
        
        if (profileData) {
          console.log('Profile data processed successfully:', profileData);
          // Cache the profile data with actual role
          this.profileCache[cacheKey] = profileData;
          return profileData;
        } else {
          console.error('Failed to process profile data');
        }
      } else {
        console.error('API response unsuccessful or missing data');
        console.error('Response status:', profileResponse?.status);
        console.error('Response message:', profileResponse?.message);
        console.error('Has user data:', !!profileResponse?.data?.user);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return null;
    }
  }
  
  // Update profile based on role
  async updateProfile(data: Partial<ProfileData>, role?: string): Promise<boolean> {
    try {
      console.log('Updating profile with data:', data);
      
      // If no role is specified, get the current user's role from the API
      if (!role) {
        console.log('No role specified, fetching current user profile');
        const currentProfile = await this.getProfileData();
        
        if (!currentProfile) {
          console.error('Failed to get current profile to determine role');
          return false;
        }
        
        // Determine role based on the profile data type
        if ('fullName' in currentProfile) {
          role = 'ADMIN';
        } else if ('rollNo' in currentProfile) {
          role = 'STUDENT';
        } else if ('subjects' in currentProfile) {
          role = 'TEACHER';
        } else if ('children' in currentProfile) {
          role = 'PARENT';
        } else {
          console.error('Could not determine role from profile');
          return false;
        }
        
        console.log('Determined role:', role);
      }
      
      // Prepare update data based on role
      let updateData: Record<string, unknown> = {};
      
      if (role === 'ADMIN') {
        const adminData = data as Partial<AdminProfileData>;
        updateData = {
          fullName: adminData.fullName,
          phone: adminData.phone,
          emergencyContact: adminData.emergencyContact,
          bio: adminData.bio,
          address: adminData.address
        };
      } 
      else if (role === 'STUDENT') {
        const studentData = data as Partial<StudentProfileData>;
        updateData = {
          name: studentData.name,
          gender: studentData.gender,
          contactNo: studentData.contactNo,
          emergencyContact: studentData.emergencyContact,
          address: studentData.address
        };
      }
      else if (role === 'TEACHER') {
        const teacherData = data as Partial<TeacherProfileData>;
        updateData = {
          name: teacherData.name,
          gender: teacherData.gender,
          contactNo: teacherData.contactNo,
          address: teacherData.address
        };
      }
      else if (role === 'PARENT') {
        const parentData = data as Partial<ParentProfileData>;
        updateData = {
          name: parentData.name,
          gender: parentData.gender,
          contactNo: parentData.contactNo,
          address: parentData.address
        };
      } else {
        console.error('Invalid role for update:', role);
        return false;
      }
      
      console.log('Prepared update data:', updateData);
      
      // Call API to update profile
      const response = await userAPI.updateProfile(updateData);
      console.log('Update response:', response.data);
      
      // Clear all caches to ensure fresh data next time
      this.clearAllCaches();
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }
  
  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<{ success: boolean; data?: { id: number; url: string } }> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, JPG, or PNG)');
        return { success: false };
      }

      // Validate file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return { success: false };
      }

      const response = await userAPI.uploadProfilePicture(file);
      
      // Convert response to expected type
      const responseData = response.data as unknown as ProfilePictureResponse;
      
      if (responseData?.data?.profilePicture) {
        // Clear all profile caches when profile picture is updated
        this.clearAllCaches();
        return { 
          success: true, 
          data: responseData.data.profilePicture 
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return { success: false };
    }
  }
  
  // Get image URL for display
  getProfileImageUrl(profilePicture?: { id: number; url: string } | null): string {
    if (!profilePicture || !profilePicture.url) {
      return "https://via.placeholder.com/300?text=No+Image";
    }
    
    try {
      // Handle relative vs absolute URLs
      if (profilePicture.url.startsWith('http://') || profilePicture.url.startsWith('https://')) {
        return profilePicture.url;
      }
      
      // Build full URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${profilePicture.url.startsWith('/') ? '' : '/'}${profilePicture.url}`;
    } catch (error) {
      console.error('Error processing profile picture URL:', error);
      return "https://via.placeholder.com/300?text=Error+Loading";
    }
  }
  
  // Clear cache for a specific role
  clearCache(role: string): void {
    delete this.profileCache[role];
  }
  
  // Clear all caches
  clearAllCaches(): void {
    this.profileCache = {};
  }
}

export const profileService = new ProfileService();
export default profileService; 