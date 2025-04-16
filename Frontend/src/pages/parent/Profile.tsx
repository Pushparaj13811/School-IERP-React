import React, { useState, useEffect } from 'react';
import { userService, UserProfile } from '../../services/userService';
import { Parent } from '../../types/api';

// Create a simple spinner component since we couldn't find the import
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#292648]"></div>
  </div>
);

const ParentProfile: React.FC = () => {
  const [parent, setParent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true);
        const profile = await userService.getUserProfile();
        
        if (!profile || profile.role !== 'PARENT') {
          throw new Error('Parent profile not found or user is not a parent');
        }
        
        setParent(profile);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching parent data:', err);
        setError('Failed to load parent profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchParentData();
  }, []);

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

  if (!parent || !parent.roleSpecificData) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
          No parent profile data available.
        </div>
      </div>
    );
  }

  // Type assertion to access parent properties safely
  const parentData = parent.roleSpecificData as Parent;
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center w-48">
              <div className="w-32 h-32 mb-4 overflow-hidden bg-blue-100 rounded-full">
                <img
                  src={userService.getProfileImageUrl(parent.profilePicture)}
                  alt="Parent"
                  className="object-cover w-100 h-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-parent-avatar.png";
                    console.error("Error loading profile image, using default");
                  }}
                />
              </div>
              <h2 className="text-xl font-semibold">{parent.name}</h2>
              <p className="text-gray-600">{userService.getRoleDisplayName(parent.role)}</p>
              <div className="mt-4 space-y-2">
                <button className="w-full px-4 py-2 bg-[#292648] text-white rounded-md ">
                  Download Pdf
                </button>
                <button className="w-full px-4 py-2 border bg-[#292648] text-white rounded-md">
                  Edit Profile
                </button>
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
                    <div>
                      <p className="mb-1 text-gray-600">Children</p>
                      <p className="font-medium">
                        {parentData.children.map((child: {name?: string}) => child.name || 'Unnamed').join(', ')}
                      </p>
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