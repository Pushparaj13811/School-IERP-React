import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService, UserProfile } from '../../services/userService';
import { userAPI } from '../../services/api';
import { Parent, Student } from '../../types/api';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

// Import shared components - eliminates duplicate Spinner definition
import {
  PageLoadingState,
  PageErrorState,
  ProfileDetailItem,
  ProfileDetailsGrid,
  StatusBadge
} from '../../components/common';

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
          const response = await userAPI.getParentById(parseInt(id));

          if (response.data?.status === 'success' && response.data?.data?.parent) {
            setParent(response.data.data.parent);
            setIsOwnProfile(false);
          } else {
            throw new Error('Failed to load parent profile data');
          }
        }
        // Otherwise, try to get logged-in user's profile (parent view)
        else {
          const profile = await userService.getUserProfile();

          if (profile && profile.role === 'PARENT') {
            setParent(profile);
            setIsOwnProfile(true);
          } else {
            throw new Error('Parent profile not found or user is not a parent');
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load parent profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchParentData();
  }, [id]);

  const handleDownloadProfile = async () => {
    try {
      if (!parent) {
        toast.error("Parent data not found");
        return;
      }

      let parentId: number;
      if (isOwnProfile) {
        const profile = parent as UserProfile;
        if (profile.roleSpecificData && 'id' in profile.roleSpecificData) {
          parentId = profile.roleSpecificData.id as number;
        } else {
          toast.error("Parent ID not found");
          return;
        }
      } else {
        parentId = (parent as Parent).id;
      }

      await userService.downloadProfile('PARENT', parentId);
      toast.success("Profile download initiated");
    } catch {
      toast.error("Failed to download profile");
    }
  };

  // Loading state - using shared component
  if (loading) {
    return <PageLoadingState message="Loading parent profile..." />;
  }

  // Error state - using shared component
  if (error) {
    return (
      <PageErrorState
        title="Error Loading Profile"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!parent) {
    return (
      <PageErrorState
        title="No Data Available"
        message="No parent profile data available."
      />
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
    if (!profilePicture) {
      const gender = parentData?.gender;
      if (gender === "Male") {
        return "/assets/male.png";
      } else if (gender === "Female") {
        return "/assets/female.png";
      }
      return "/assets/male.png";
    }
    return userService.getProfileImageUrl(profilePicture);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Parent Profile</h1>
        <p className="text-gray-500 mt-1">View and manage parent information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <img
                    src={getProfileImageUrl()}
                    alt={displayName || "Parent"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const gender = parentData?.gender;
                      if (gender === "Male") {
                        e.currentTarget.src = "/assets/male.png";
                      } else if (gender === "Female") {
                        e.currentTarget.src = "/assets/female.png";
                      } else {
                        e.currentTarget.src = "/assets/male.png";
                      }
                    }}
                  />
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <StatusBadge status="ACTIVE" variant="dot" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 px-6 pb-6 text-center">
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-gray-500">
                {isOwnProfile ? userService.getRoleDisplayName((parent as UserProfile).role) : 'Parent'}
              </p>

              <div className="mt-6 space-y-3">
                <ProfileDetailItem
                  label="Email"
                  value={parentData.email || "N/A"}
                />
                <ProfileDetailItem
                  label="Contact"
                  value={parentData.contactNo || "N/A"}
                />
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleDownloadProfile}
                >
                  Download Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Children Card */}
          {parentData.children && parentData.children.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Children</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {parentData.children.map((child: Student) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {child.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{child.name}</p>
                        <p className="text-sm text-gray-500">
                          {child.class?.name || 'N/A'} - {child.section?.name || 'N/A'}
                        </p>
                      </div>
                      <StatusBadge status="ACTIVE" size="sm" variant="dot" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
            </div>
            <div className="p-6">
              <ProfileDetailsGrid columns={2}>
                <ProfileDetailItem label="Full Name" value={parentData.name || "N/A"} />
                <ProfileDetailItem label="Email" value={parentData.email || "N/A"} />
                <ProfileDetailItem label="Gender" value={parentData.gender || "N/A"} />
                <ProfileDetailItem label="Contact Number" value={parentData.contactNo || "N/A"} />
              </ProfileDetailsGrid>
            </div>
          </div>

          {/* Address Details */}
          {parentData.address && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Address Details</h3>
              </div>
              <div className="p-6">
                <ProfileDetailsGrid columns={2}>
                  <ProfileDetailItem label="Address Line 1" value={parentData.address.addressLine1 || "N/A"} />
                  <ProfileDetailItem label="Address Line 2" value={parentData.address.addressLine2 || "N/A"} />
                  <ProfileDetailItem label="Street" value={parentData.address.street || "N/A"} />
                  <ProfileDetailItem label="City" value={parentData.address.city || "N/A"} />
                  <ProfileDetailItem label="Ward" value={parentData.address.ward || "N/A"} />
                  <ProfileDetailItem label="Municipality" value={parentData.address.municipality || "N/A"} />
                  <ProfileDetailItem label="District" value={parentData.address.district || "N/A"} />
                  <ProfileDetailItem label="Province" value={parentData.address.province || "N/A"} />
                  <ProfileDetailItem label="Country" value={parentData.address.country || "N/A"} />
                  <ProfileDetailItem label="Postal Code" value={parentData.address.postalCode || "N/A"} />
                </ProfileDetailsGrid>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentProfile;
