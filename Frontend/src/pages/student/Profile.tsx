import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DetailsSection from "../../components/common/DetailsSection";
import Button from "../../components/ui/Button";
import { userAPI } from "../../services/api";
import { userService, UserProfile } from "../../services/userService";
import { Student } from "../../types/api";
import { toast } from "react-toastify";
import { format } from "date-fns";

// Create a simple spinner component
const Spinner: React.FC = () => (
  <div className="w-full p-4 bg-[#EEF5FF] flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [student, setStudent] = useState<UserProfile | Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);

  // Check if we're viewing our own profile (student role) or accessing via admin
  const isIdProvided = !!id;

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        
        // If id parameter exists, fetch specific student (admin view)
        if (isIdProvided) {
          console.log(`Fetching student profile with ID: ${id}`);
          const response = await userAPI.getStudentById(parseInt(id as string));
          
          if (response.data?.status === 'success' && response.data?.data?.student) {
            console.log("Student data from API:", response.data.data.student);
            setStudent(response.data.data.student);
            setIsOwnProfile(false);
          } else {
            throw new Error('Failed to load student profile data');
          }
        } 
        // Otherwise, try to get logged-in user's profile (student view)
        else {
          console.log('Fetching own student profile');
          const profile = await userService.getUserProfile();
          
          if (profile && profile.role === 'STUDENT') {
            console.log('Own student profile found:', profile);
            setStudent(profile);
            setIsOwnProfile(true);
          } else {
            throw new Error('Student profile not found or user is not a student');
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Error loading student profile");
        toast.error("Could not load student profile");
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id, isIdProvided]);

  // Format date from ISO to DD-MM-YYYY
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch {
      return dateString;
    }
  };

  // Extract student data and handle profile picture
  const getProfileData = () => {
    if (!student) return null;

    if (isOwnProfile) {
      const userProfile = student as UserProfile;
      return {
        studentData: userProfile.roleSpecificData as Student,
        profilePicture: userProfile.profilePicture
      };
    } else {
      const studentData = student as Student;
      return {
        studentData,
        profilePicture: studentData.profilePicture
      };
    }
  };

  const getProfileImageUrl = () => {
    console.log("Getting profile image URL for:", student);
    const profileData = getProfileData();
    if (!profileData) {
      console.log("No student data available");
      return "/default-student-avatar.png";
    }
    
    console.log("Profile data for image URL:", profileData);
    if (!profileData.profilePicture) {
      console.log("No profile picture found in profile data");
      return "/default-student-avatar.png";
    }
    
    return userService.getProfileImageUrl(profileData.profilePicture);
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !student) {
    return (
      <div className="w-full p-4 bg-[#EEF5FF]">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          {error || "Student not found"}
        </div>
      </div>
    );
  }

  const profileData = getProfileData();
  if (!profileData || !profileData.studentData) {
    return (
      <div className="w-full p-4 bg-[#EEF5FF]">
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
          No student data available
        </div>
      </div>
    );
  }

  const studentData = profileData.studentData;
  
  const personalDetails = [
    { label: "Name", value: studentData.name || "N/A" },
    { label: "As Per Birth Certificate", value: studentData.nameAsPerBirth || "N/A" },
    { label: "Father's Name", value: studentData.fatherName || "N/A" },
    { label: "Mother's Name", value: studentData.motherName || "N/A" },
    { label: "Gender", value: studentData.gender || "N/A" },
    { label: "Date of Birth", value: formatDate(studentData.dateOfBirth) },
    { label: "DOB No", value: studentData.dobNo || "N/A" },
    { label: "Blood Group", value: studentData.bloodGroup || "N/A" },
    { label: "Nationality", value: studentData.nationality || "N/A" },
    { label: "Religion", value: studentData.religion || "N/A" },
    { label: "Roll No", value: studentData.rollNo || "N/A" },
    { label: "Email", value: studentData.email || "N/A" },
    { label: "Contact Number", value: studentData.contactNo || "N/A" },
    { label: "Emergency Contact", value: studentData.emergencyContact || "N/A" },
    { label: "Class", value: studentData.class?.name || "N/A" },
    { label: "Section", value: studentData.section?.name || "N/A" },
  ];
  
  const addressDetails = studentData.address ? [
    { label: "Address Line 1", value: studentData.address.addressLine1 || "N/A" },
    { label: "Address Line 2", value: studentData.address.addressLine2 || "N/A" },
    { label: "Street", value: studentData.address.street || "N/A" },
    { label: "City", value: studentData.address.city || "N/A" },
    { label: "Ward", value: studentData.address.ward || "N/A" },
    { label: "Municipality", value: studentData.address.municipality || "N/A" },
    { label: "District", value: studentData.address.district || "N/A" },
    { label: "Province", value: studentData.address.province || "N/A" },
    { label: "Country", value: studentData.address.country || "N/A" },
    { label: "Postal Code", value: studentData.address.postalCode || "N/A" },
  ] : [];

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Profile</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Profile Picture & Download Button */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  className="rounded-full border-4 border-blue-400 shadow-md w-[150px] h-[150px] object-cover"
                  src={getProfileImageUrl()}
                  alt="Profile"
                  width={150}
                  height={150}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Profile image failed to load');
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Student";
                  }}
                />
                {isOwnProfile && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full border-2 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-1">{studentData.name}</h4>
              <p className="text-sm text-gray-500 mb-4">
                {studentData.class?.name} {studentData.section?.name}
              </p>
              
              <div className="w-full">
                <Button 
                  variant="primary" 
                  className="w-full mb-2"
                  onClick={() => toast.info("Download feature coming soon")}
                >
                  Download Profile
                </Button>
                
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast.info("Edit feature coming soon")}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Personal Details & Address */}
          <div className="lg:col-span-9">
            <DetailsSection title="Personal Details" details={personalDetails} />
            
            {addressDetails.length > 0 && (
              <div className="mt-6">
                <DetailsSection title="Address Details" details={addressDetails} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 