import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService, UserProfile } from '../../services/userService';
import { userAPI } from '../../services/api';
import { Teacher, Subject } from '../../types/api';
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

// Define interface for teacher profile data from API response
interface TeacherWithAddress extends Teacher {
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
}

const TeacherProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [teacher, setTeacher] = useState<UserProfile | TeacherWithAddress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);

        // If id parameter exists, fetch specific teacher (admin view)
        if (id) {
          const response = await userAPI.getTeacherById(parseInt(id));

          if (response.data?.status === 'success' && response.data?.data?.teacher) {
            setTeacher(response.data.data.teacher as TeacherWithAddress);
            setIsOwnProfile(false);
          } else {
            throw new Error('Failed to load teacher profile data');
          }
        }
        // Otherwise, try to get logged-in user's profile (teacher view)
        else {
          const profile = await userService.getUserProfile();

          if (profile && profile.role === 'TEACHER') {
            setTeacher(profile);
            setIsOwnProfile(true);
          } else {
            throw new Error('Teacher profile not found or user is not a teacher');
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load teacher profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  const handleDownloadProfile = async () => {
    try {
      if (!teacher) {
        toast.error("Teacher data not found");
        return;
      }

      let teacherId: number;
      if (isOwnProfile) {
        const profile = teacher as UserProfile;
        if (profile.roleSpecificData && 'id' in profile.roleSpecificData) {
          teacherId = profile.roleSpecificData.id as number;
        } else {
          toast.error("Teacher ID not found");
          return;
        }
      } else {
        teacherId = (teacher as TeacherWithAddress).id;
      }

      await userService.downloadProfile('TEACHER', teacherId);
      toast.success("Profile download initiated");
    } catch {
      toast.error("Failed to download profile");
    }
  };

  // Loading state - using shared component
  if (loading) {
    return <PageLoadingState message="Loading teacher profile..." />;
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

  if (!teacher) {
    return (
      <PageErrorState
        title="No Data Available"
        message="No teacher profile data available."
      />
    );
  }

  // Extract teacher data based on whether we're viewing own profile or specific teacher
  const teacherData = isOwnProfile
    ? (teacher as UserProfile).roleSpecificData as TeacherWithAddress
    : teacher as TeacherWithAddress;

  const displayName = isOwnProfile
    ? (teacher as UserProfile).name
    : teacherData.name;

  const profilePicture = isOwnProfile
    ? (teacher as UserProfile).profilePicture
    : teacherData.profilePicture;

  const getProfileImageUrl = () => {
    if (!profilePicture) {
      const gender = teacherData?.gender;
      if (gender === "Male") {
        return "/assets/male.png";
      } else if (gender === "Female") {
        return "/assets/female.png";
      }
      return "/assets/male.png";
    }
    return userService.getProfileImageUrl(profilePicture);
  };

  // Extract classes and sections names
  const getClassNames = () => {
    if (!teacherData.classes || teacherData.classes.length === 0) return 'N/A';
    return teacherData.classes.map((cls) => {
      if (cls && typeof cls === 'object' && 'class' in cls && cls.class) {
        return cls.class.name;
      } else if (cls && typeof cls === 'object' && 'name' in cls) {
        return cls.name as string;
      }
      return '';
    }).filter(Boolean).join(', ') || 'N/A';
  };

  const getSectionNames = () => {
    if (!teacherData.sections || teacherData.sections.length === 0) return 'N/A';
    return teacherData.sections.map((sec) => {
      if (sec && typeof sec === 'object' && 'section' in sec && sec.section) {
        return sec.section.name;
      } else if (sec && typeof sec === 'object' && 'name' in sec) {
        return sec.name as string;
      }
      return '';
    }).filter(Boolean).join(', ') || 'N/A';
  };

  const getSubjectNames = () => {
    if (!teacherData.subjects || teacherData.subjects.length === 0) return 'N/A';
    return teacherData.subjects.map((subject: Subject) => subject.name || 'Unnamed').join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Profile</h1>
        <p className="text-gray-500 mt-1">View and manage teacher information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-teal-600">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <img
                    src={getProfileImageUrl()}
                    alt={displayName || "Teacher"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const gender = teacherData?.gender;
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
                {isOwnProfile ? userService.getRoleDisplayName((teacher as UserProfile).role) : 'Teacher'}
              </p>
              {teacherData.designation?.name && (
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                  {teacherData.designation.name}
                </span>
              )}

              <div className="mt-6 space-y-3">
                <ProfileDetailItem
                  label="Email"
                  value={teacherData.email || "N/A"}
                />
                <ProfileDetailItem
                  label="Contact"
                  value={teacherData.contactNo || "N/A"}
                />
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  variant='primary'
                  className='w-full'
                  onClick={handleDownloadProfile}
                >
                  Download Profile
                </Button>
                {isOwnProfile && (
                  <Button
                    variant='outline'
                    className='w-full'
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
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
                <ProfileDetailItem label="Full Name" value={teacherData.name || "N/A"} />
                <ProfileDetailItem label="Email" value={teacherData.email || "N/A"} />
                <ProfileDetailItem label="Gender" value={teacherData.gender || "N/A"} />
                <ProfileDetailItem label="Contact Number" value={teacherData.contactNo || "N/A"} />
                <ProfileDetailItem label="Designation" value={teacherData.designation?.name || "N/A"} />
              </ProfileDetailsGrid>
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Academic Details</h3>
            </div>
            <div className="p-6">
              <ProfileDetailsGrid columns={2}>
                <ProfileDetailItem label="Subjects" value={getSubjectNames()} />
                <ProfileDetailItem label="Classes" value={getClassNames()} />
                <ProfileDetailItem label="Sections" value={getSectionNames()} />
              </ProfileDetailsGrid>
            </div>
          </div>

          {/* Address Details */}
          {teacherData.address && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Address Details</h3>
              </div>
              <div className="p-6">
                <ProfileDetailsGrid columns={2}>
                  <ProfileDetailItem label="Address Line 1" value={teacherData.address.addressLine1 || "N/A"} />
                  <ProfileDetailItem label="Address Line 2" value={teacherData.address.addressLine2 || "N/A"} />
                  <ProfileDetailItem label="Street" value={teacherData.address.street || "N/A"} />
                  <ProfileDetailItem label="City" value={teacherData.address.city || "N/A"} />
                  <ProfileDetailItem label="Ward" value={teacherData.address.ward || "N/A"} />
                  <ProfileDetailItem label="Municipality" value={teacherData.address.municipality || "N/A"} />
                  <ProfileDetailItem label="District" value={teacherData.address.district || "N/A"} />
                  <ProfileDetailItem label="Province" value={teacherData.address.province || "N/A"} />
                  <ProfileDetailItem label="Country" value={teacherData.address.country || "N/A"} />
                  <ProfileDetailItem label="Postal Code" value={teacherData.address.postalCode || "N/A"} />
                </ProfileDetailsGrid>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
