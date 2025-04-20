import React, { useState, useEffect, useRef } from 'react';
import { FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import profileService, { AdminProfileData } from '../../services/profileService';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with empty profile data
  const [profileData, setProfileData] = useState<AdminProfileData>({
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

  // Function to fetch profile data
  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching profile data, user role:", user?.role);
      const data = await profileService.getProfileData();
      
      if (data) {
        // Check if data is admin profile data
        if ('fullName' in data) {
          setProfileData(data as AdminProfileData);
        } else {
          setError('Not an administrator account. This page is for admin profiles only.');
        }
      } else {
        setError('Failed to load profile data. Please try again.');
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

      // Call service to update profile
      const success = await profileService.updateProfile(updateData);
      
      if (success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        
        // Refresh profile data
        fetchProfileData();
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
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
          ...profileData[parent as keyof AdminProfileData] as Record<string, unknown>,
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
    
    try {
      setIsUploading(true);
      const result = await profileService.uploadProfilePicture(file);
      
      if (result.success && result.data) {
        setProfileData({
          ...profileData,
          profilePicture: result.data
        });
        
        toast.success('Profile picture updated successfully!');
      } else {
        toast.error('Failed to upload profile picture. Please try again.');
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
                {profileData.profilePicture ? (
                  <img 
                    src={profileService.getProfileImageUrl(profileData.profilePicture)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      // Handle image loading errors
                      console.error('Error loading image:', e);
                      console.log('Profile picture data:', profileData.profilePicture);
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Error+Loading';
                    }}
                  />
                ) : (
                  <img 
                    src="https://via.placeholder.com/300?text=No+Image" 
                    alt="No Profile"
                    className="w-full h-full object-cover"
                  />
                )}
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
                <p className="text-gray-800">{profileService.formatDateForInput(profileData.dateOfBirth)}</p>
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
                <p className="text-gray-800">{profileService.formatDateForInput(profileData.joinDate)}</p>
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