import React, { useState, useEffect, useRef } from 'react';
import { FaCamera } from 'react-icons/fa';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface ProfileData {
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

interface ProfileApiResponse {
  status: string;
  data: {
    user: {
      email: string;
      admin: {
        fullName: string;
        phone: string;
        dateOfBirth: string;
        joinDate: string;
        emergencyContact: string;
        bio: string | null;
        address: {
          addressLine1: string;
          city: string;
          district: string;
          province: string;
        };
        profilePicture?: {
          id: number;
          url: string;
        } | null;
      };
    };
  };
  message?: string;
}

interface ProfilePictureResponse {
  status: string;
  data: {
    profilePicture: {
      id: number;
      url: string;
    }
  };
  message?: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with empty profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    address: {
      addressLine1: '',
      city: '',
      district: '',
      province: '',
    },
    dateOfBirth: '',
    joinDate: '',
    emergencyContact: '',
    bio: '',
    profilePicture: null
  });

  // Function to format date from ISO to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  // Function to fetch profile data
  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userAPI.getProfile();
      // Use Type assertion to unknown first, then to our specific interface
      const responseData = response.data as unknown as ProfileApiResponse;
      const userData = responseData?.data?.user;
      
      if (userData?.admin) {
        setProfileData({
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
        });
      }
    } catch (err) {
      setError('Failed to load profile data. Please try again.');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // If canceling, reset form data to original data
    if (isEditing) {
      fetchProfileData();
    }
  };

  const handleSave = async () => {
    try {
      // Prepare update data
      const updateData = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        emergencyContact: profileData.emergencyContact,
        bio: profileData.bio,
        address: {
          addressLine1: profileData.address.addressLine1,
          city: profileData.address.city,
          district: profileData.address.district,
          province: profileData.address.province
        }
      };

      // Call API to update profile
      await userAPI.updateProfile(updateData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile data
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like address.addressLine1
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent as keyof ProfileData] as Record<string, unknown>,
          [child]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, JPG, or PNG)');
      return;
    }

    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const response = await userAPI.uploadProfilePicture(file);
      
      // Safe type conversion - first to unknown, then to our specific type
      const responseData = response.data as unknown as ProfilePictureResponse;
      
      if (responseData?.data?.profilePicture) {
        const newProfilePicture = responseData.data.profilePicture;
        
        setProfileData({
          ...profileData,
          profilePicture: newProfilePicture
        });
        
        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to upload profile picture. Please try again.');
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e1c39]"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
        <span>My Profile</span>
        <button
          onClick={handleEditToggle}
          className="px-4 py-1.5 text-sm bg-[#1e1c39] text-white rounded"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          {/* Profile Picture Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative">
              <div 
                className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
                onClick={handleProfilePictureClick}
              >
                <img 
                  src={profileData.profilePicture?.url || 'https://via.placeholder.com/300?text=No+Image'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Handle image loading errors
                    console.error('Error loading image:', e);
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Error+Loading';
                  }}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              {isEditing && (
                <div 
                  className="absolute bottom-2 right-2 bg-[#1e1c39] p-2 rounded-full text-white cursor-pointer hover:bg-opacity-80"
                  onClick={handleProfilePictureClick}
                >
                  <FaCamera />
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                  />
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold">{profileData.fullName}</h3>
              <p className="text-gray-500">Administrator</p>
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="w-full md:w-2/3 md:pl-8">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.fullName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                <p className="text-gray-800">{profileData.email}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                <p className="text-gray-800">{formatDateForInput(profileData.dateOfBirth)}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="text-gray-800">{profileData.emergencyContact}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Join Date</label>
                <p className="text-gray-800">{formatDateForInput(profileData.joinDate)}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address.addressLine1"
                    placeholder="Address Line"
                    value={profileData.address.addressLine1}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="address.city"
                    placeholder="City"
                    value={profileData.address.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="address.district"
                    placeholder="District"
                    value={profileData.address.district}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    name="address.province"
                    placeholder="Province"
                    value={profileData.address.province}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              ) : (
                <p className="text-gray-800">
                  {profileData.address.addressLine1}, {profileData.address.city}, {profileData.address.district}, {profileData.address.province}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-gray-800">{profileData.bio || 'No bio available'}</p>
              )}
            </div>
            
            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-[#1e1c39] text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 