import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService, UserProfile } from '../../services/userService';
import { userAPI } from '../../services/api';
import { Teacher, Subject } from '../../types/api';

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

// Create a simple spinner component
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
  </div>
);

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
          console.log(`Fetching teacher profile with ID: ${id}`);
          const response = await userAPI.getTeacherById(parseInt(id));
          
          if (response.data?.status === 'success' && response.data?.data?.teacher) {
            console.log('Teacher data from API:', response.data.data.teacher);
            setTeacher(response.data.data.teacher as TeacherWithAddress);
            setIsOwnProfile(false);
          } else {
            throw new Error('Failed to load teacher profile data');
          }
        } 
        // Otherwise, try to get logged-in user's profile (teacher view)
        else {
          console.log('Fetching own teacher profile');
          const profile = await userService.getUserProfile();
          
          if (profile && profile.role === 'TEACHER') {
            console.log('Own teacher profile found:', profile);
            setTeacher(profile);
            setIsOwnProfile(true);
          } else {
            throw new Error('Teacher profile not found or user is not a teacher');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError('Failed to load teacher profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchTeacherData();
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

  if (!teacher) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
          No teacher profile data available.
        </div>
      </div>
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-6">
            <div className="w-48 flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mb-4 overflow-hidden">
                <img
                  src={userService.getProfileImageUrl(profilePicture)}
                  alt="Teacher"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-teacher-avatar.png";
                    console.error("Error loading profile image, using default");
                  }}
                />
              </div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-gray-600">{isOwnProfile ? userService.getRoleDisplayName((teacher as UserProfile).role) : 'Teacher'}</p>
              <div className="mt-4 space-y-2">
                <button className="w-full bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800">
                  Download Pdf
                </button>
                {isOwnProfile && (
                  <button className="w-full border border-indigo-900 text-indigo-900 px-4 py-2 rounded-md hover:bg-indigo-50">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Full Name</p>
                    <p className="font-medium">{teacherData.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Email</p>
                    <p className="font-medium">{teacherData.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Gender</p>
                    <p className="font-medium">{teacherData.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Contact Number</p>
                    <p className="font-medium">{teacherData.contactNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Designation</p>
                    <p className="font-medium">{teacherData.designation?.name || 'N/A'}</p>
                  </div>
                  {teacherData.subjects && teacherData.subjects.length > 0 && (
                    <div>
                      <p className="text-gray-600 mb-1">Subjects</p>
                      <p className="font-medium">
                        {teacherData.subjects.map((subject: Subject) => subject.name || 'Unnamed').join(', ')}
                      </p>
                    </div>
                  )}
                  {teacherData.classes && teacherData.classes.length > 0 && (
                    <div>
                      <p className="text-gray-600 mb-1">Classes</p>
                      <p className="font-medium">
                        {teacherData.classes.map((cls) => {
                          // Handle both potential data structures
                          if (cls && typeof cls === 'object' && 'class' in cls && cls.class) {
                            return cls.class.name;
                          } else if (cls && typeof cls === 'object' && 'name' in cls) {
                            // If classes is an array of direct class objects
                            return cls.name as string;
                          }
                          return '';
                        }).filter(Boolean).join(', ') || 'N/A'}
                      </p>
                    </div>
                  )}
                  {teacherData.sections && teacherData.sections.length > 0 && (
                    <div>
                      <p className="text-gray-600 mb-1">Sections</p>
                      <p className="font-medium">
                        {teacherData.sections.map((sec) => {
                          // Handle both potential data structures
                          if (sec && typeof sec === 'object' && 'section' in sec && sec.section) {
                            return sec.section.name;
                          } else if (sec && typeof sec === 'object' && 'name' in sec) {
                            // If sections is an array of direct section objects
                            return sec.name as string;
                          }
                          return '';
                        }).filter(Boolean).join(', ') || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {teacherData.address && (
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">Address</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 mb-1">Address Line 1</p>
                      <p className="font-medium">{teacherData.address.addressLine1 || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Address Line 2</p>
                      <p className="font-medium">{teacherData.address.addressLine2 || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Street</p>
                      <p className="font-medium">{teacherData.address.street || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">City</p>
                      <p className="font-medium">{teacherData.address.city || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Ward</p>
                      <p className="font-medium">{teacherData.address.ward || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Municipality</p>
                      <p className="font-medium">{teacherData.address.municipality || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">District</p>
                      <p className="font-medium">{teacherData.address.district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Province</p>
                      <p className="font-medium">{teacherData.address.province || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Country</p>
                      <p className="font-medium">{teacherData.address.country || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Postal Code</p>
                      <p className="font-medium">{teacherData.address.postalCode || 'N/A'}</p>
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

export default TeacherProfile; 