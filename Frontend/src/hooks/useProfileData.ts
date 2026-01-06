import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

/**
 * Generic profile data structure
 */
export interface BaseProfile {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  gender?: 'MALE' | 'FEMALE';
  status?: 'ACTIVE' | 'INACTIVE';
  profile?: {
    profilePicture?: string;
    bio?: string;
    [key: string]: unknown;
  };
}

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface UseProfileDataOptions {
  role: UserRole;
  id?: string | number;
  autoFetch?: boolean;
}

export interface UseProfileDataReturn<T extends BaseProfile> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getProfileImageUrl: () => string;
}

// Default avatars - should be imported from assets in actual usage
const DEFAULT_MALE_AVATAR = '/assets/default-male-avatar.png';
const DEFAULT_FEMALE_AVATAR = '/assets/default-female-avatar.png';

/**
 * Hook for fetching and managing profile data across all roles
 * Eliminates duplicate profile fetching logic in Profile pages
 */
export function useProfileData<T extends BaseProfile>({
  role,
  id,
  autoFetch = true
}: UseProfileDataOptions): UseProfileDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;

      if (id) {
        // Fetch specific profile by ID
        switch (role) {
          case 'student':
            response = await userService.getStudentById(id);
            break;
          case 'teacher':
            response = await userService.getTeacherById(id);
            break;
          case 'parent':
            response = await userService.getParentById(id);
            break;
          case 'admin':
            response = await userService.getUserProfile();
            break;
          default:
            throw new Error(`Unknown role: ${role}`);
        }
      } else {
        // Fetch own profile
        response = await userService.getUserProfile();
      }

      if (response?.data?.data) {
        // Handle nested data structure
        const profileData = response.data.data[role] || response.data.data;
        setData(profileData as T);
      } else if (response?.data) {
        setData(response.data as T);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${role} profile`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [role, id]);

  useEffect(() => {
    if (autoFetch) {
      fetchProfile();
    }
  }, [autoFetch, fetchProfile]);

  const getProfileImageUrl = useCallback((): string => {
    if (!data) {
      return DEFAULT_MALE_AVATAR;
    }

    // Check nested profile picture first
    const profilePicture = data.profile?.profilePicture || data.profilePicture;

    if (profilePicture) {
      return profilePicture;
    }

    // Return gender-specific default avatar
    return data.gender === 'FEMALE' ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR;
  }, [data]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchProfile,
    getProfileImageUrl
  };
}

export default useProfileData;
