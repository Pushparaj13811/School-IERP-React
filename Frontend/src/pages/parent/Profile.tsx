import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService, UserProfile } from '../../services/userService';
import { userAPI } from '../../services/api';
import { Parent, Student } from '../../types/api';

// Create a simple spinner component since we couldn't find the import
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#292648]"></div>
  </div>
);

const ParentProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [parent, setParent] = useState<UserProfile | Parent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true);
        
        // If id parameter exists, fetch specific parent (admin view)
        if (id) {
          console.log(`Fetching parent profile with ID: ${id}`);
          const response = await userAPI.getParentById(parseInt(id));
          
          if (response.data?.status === 'success' && response.data?.data?.parent) {
            console.log('Parent data from API:', response.data.data.parent);
            setParent(response.data.data.parent);
            setIsOwnProfile(false);
          } else {
            throw new Error('Failed to load parent profile data');
          }
        } 
        // Otherwise, try to get logged-in user's profile (parent view)
        else {
          console.log('Fetching own parent profile');
          const profile = await userService.getUserProfile();
          
          if (profile && profile.role === 'PARENT') {
            console.log('Own parent profile found:', profile);
            setParent(profile);
            setIsOwnProfile(true);
          } else {
            throw new Error('Parent profile not found or user is not a parent');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching parent data:', err);
        setError('Failed to load parent profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchParentData();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
          No parent profile data available.
        </div>
      </div>
    );
  }

  // Extract parent data based on whether we're viewing own profile or specific parent
  const parentData = isOwnProfile 
    ? (parent as UserProfile).roleSpecificData as Parent 
    : parent as Parent;
  
  const displayName = isOwnProfile 
    ? (parent as UserProfile).name 
    : parentData.name;
  
  const profilePicture = isOwnProfile 
    ? (parent as UserProfile).profilePicture 
    : parentData.profilePicture;
  
  const getProfileImageUrl = () => {
    console.log("Parent component - profile picture:", profilePicture);
    if (!profilePicture) {
      console.log("No profile picture available for parent");
      return "/default-parent-avatar.png";
    }
    
    return userService.getProfileImageUrl(profilePicture);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center w-48">
              <div className="w-32 h-32 mb-4 overflow-hidden bg-blue-100 rounded-full">
                <img
                  src={getProfileImageUrl()}
                  alt="Parent"
                  className="object-cover w-100 h-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-parent-avatar.png";
                    console.error("Error loading profile image, using default");
                  }}
                />
              </div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-gray-600">{isOwnProfile ? userService.getRoleDisplayName((parent as UserProfile).role) : 'Parent'}</p>
              <div className="mt-4 space-y-2">
                <button className="w-full px-4 py-2 bg-[#292648] text-white rounded-md ">
                  Download Pdf
                </button>
                {isOwnProfile && (
                  <button className="w-full px-4 py-2 border bg-[#292648] text-white rounded-md">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h3 className="pb-2 mb-4 text-lg font-semibold border-b">Personal Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-1 text-gray-600">Full Name</p>
                    <p className="font-medium">{parentData.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Email</p>
                    <p className="font-medium">{parentData.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Gender</p>
                    <p className="font-medium">{parentData.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-gray-600">Contact Number</p>
                    <p className="font-medium">{parentData.contactNo || 'N/A'}</p>
                  </div>
                  {parentData.children && parentData.children.length > 0 && (
                    <div className="col-span-2">
                      <p className="mb-1 text-gray-600">Children</p>
                      <ul className="pl-5 list-disc">
                        {parentData.children.map((child: Student) => (
                          <li key={child.id} className="font-medium">
                            {child.name} 
                            {child.class && ` (${child.class.name}`}
                            {child.section && child.class && ` - ${child.section.name}`}
                            {child.class && ')'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {parentData.address && (
                <div className="mb-6">
                  <h3 className="pb-2 mb-4 text-lg font-semibold border-b">Address</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-gray-600">Address Line 1</p>
                      <p className="font-medium">{parentData.address.addressLine1 || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">Address Line 2</p>
                      <p className="font-medium">{parentData.address.addressLine2 || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">Street</p>
                      <p className="font-medium">{parentData.address.street || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">City</p>
                      <p className="font-medium">{parentData.address.city || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">Ward</p>
                      <p className="font-medium">{parentData.address.ward || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">Municipality</p>
                      <p className="font-medium">{parentData.address.municipality || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">District</p>
                      <p className="font-medium">{parentData.address.district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">Province</p>
                      <p className="font-medium">{parentData.address.province || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">Country</p>
                      <p className="font-medium">{parentData.address.country || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-600">Postal Code</p>
                      <p className="font-medium">{parentData.address.postalCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfile; 