import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import DetailsSection from "../../components/common/DetailsSection";
import Button from "../../components/ui/Button";
import { userAPI } from "../../services/api";
import { Student } from "../../types/api";
import { toast } from "react-toastify";
import { format } from "date-fns";

// Define a profile response structure that includes student data
interface ProfileResponse {
  status: string;
  data: {
    user: {
      id: number;
      email: string;
      role: string; 
      student?: Student;
    };
  };
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're viewing our own profile (student role) or accessing via admin
  const isOwnProfile = !id || location.pathname === '/profile';

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        let response;

        if (isOwnProfile) {
          // Get own profile
          response = await userAPI.getProfile();
          // Cast response to our custom interface
          const profileData = response.data as unknown as ProfileResponse;
          console.log("Profile response data:", JSON.stringify(profileData, null, 2));
          
          if (profileData?.status === 'success' && profileData?.data?.user) {
            // Extract student data from user object
            const userData = profileData.data.user;
            if (userData.student) {
              console.log("Student data from profile:", userData.student);
              
              // Get the profilePicture value - it might be the full object in getProfile response
              let profilePicturePath = userData.student.profilePicture;
              console.log("Raw profile picture value:", profilePicturePath);
              
              // If it's an object with profilePicture
              if (userData.student.profilePicture && 
                  typeof userData.student.profilePicture === 'object' &&
                  userData.student.profilePicture !== null &&
                  'url' in (userData.student.profilePicture as object)) {
                profilePicturePath = (userData.student.profilePicture as { url: string }).url;
                console.log("Extracted URL from object:", profilePicturePath);
              }
              
              // Create a copy of the student data with adjusted profilePicture
              const studentWithAdjustedPicture = {
                ...userData.student,
                profilePicture: profilePicturePath
              };
              
              console.log("Student with adjusted picture:", studentWithAdjustedPicture);
              setStudent(studentWithAdjustedPicture);
            } else {
              setError("Student data not found in profile");
            }
          } else {
            setError("Failed to load profile data");
          }
        } else if (id) {
          // Get specific student by ID (admin view)
          response = await userAPI.getStudentById(parseInt(id));
          console.log("Student by ID response:", JSON.stringify(response.data, null, 2));
          
          if (response.data?.status === 'success' && response.data?.data?.student) {
            const studentData = response.data.data.student;
            console.log("Student data loaded:", studentData);
            console.log("Student profile picture:", studentData.profilePicture);
            setStudent(studentData);
          } else {
            setError("Failed to load student data");
          }
        } else {
          setError("No student ID provided");
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Error loading student profile");
        toast.error("Could not load student profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id, isOwnProfile]);

  // Format date from ISO to DD-MM-YYYY
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch {
      return dateString;
    }
  };

  const getProfileImageUrl = () => {
    console.log("getProfileImageUrl called with student:", student);
    
    if (!student) {
      console.log("No student data available");
      return "https://via.placeholder.com/150?text=Student";
    }
    
    const profilePicture = student.profilePicture;
    console.log("Profile picture value:", profilePicture);
    
    if (!profilePicture) {
      console.log("No profile picture available, using default");
      return "https://via.placeholder.com/150?text=Student";
    }
    
    try {
      // Check if profilePicture is an object with url property
      if (profilePicture && typeof profilePicture === 'object' && profilePicture !== null) {
        // Type assertion to access the url property safely
        const pictureObj = profilePicture as unknown as { url?: string };
        if (pictureObj.url) {
          console.log("Profile picture is an object with url:", pictureObj.url);
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          const fullUrl = `${baseUrl}${pictureObj.url.startsWith('/') ? '' : '/'}${pictureObj.url}`;
          console.log("Constructed full URL from object:", fullUrl);
          return fullUrl;
        }
      }
      
      // If it's a string
      if (typeof profilePicture === 'string') {
        console.log("Profile picture is a string");
        
        // Check if it's already a full URL
        if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
          console.log("Using profile picture as is (already full URL):", profilePicture);
          return profilePicture;
        }
        
        // Otherwise, prepend the API base URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`;
        console.log("Constructed full URL from string:", fullUrl);
        return fullUrl;
      }
      
      console.log("Unhandled profile picture format, using default", typeof profilePicture);
      return "https://via.placeholder.com/150?text=Student";
    } catch (error) {
      console.error("Error processing profile picture:", error);
      return "https://via.placeholder.com/150?text=Student";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-4 bg-[#EEF5FF] flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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

  const personalDetails = [
    { label: "Name", value: student.name || "N/A" },
    { label: "As Per Birth Certificate", value: student.nameAsPerBirth || "N/A" },
    { label: "Father's Name", value: student.fatherName || "N/A" },
    { label: "Mother's Name", value: student.motherName || "N/A" },
    { label: "Gender", value: student.gender || "N/A" },
    { label: "Date of Birth", value: formatDate(student.dateOfBirth) },
    { label: "DOB No", value: student.dobNo || "N/A" },
    { label: "Blood Group", value: student.bloodGroup || "N/A" },
    { label: "Nationality", value: student.nationality || "N/A" },
    { label: "Religion", value: student.religion || "N/A" },
    { label: "Roll No", value: student.rollNo || "N/A" },
    { label: "Email", value: student.email || "N/A" },
    { label: "Contact Number", value: student.contactNo || "N/A" },
    { label: "Emergency Contact", value: student.emergencyContact || "N/A" },
    { label: "Class", value: student.class?.name || "N/A" },
    { label: "Section", value: student.section?.name || "N/A" },
  ];
  
  const addressDetails = student.address ? [
    { label: "Address Line 1", value: student.address.addressLine1 || "N/A" },
    { label: "Address Line 2", value: student.address.addressLine2 || "N/A" },
    { label: "Street", value: student.address.street || "N/A" },
    { label: "City", value: student.address.city || "N/A" },
    { label: "Ward", value: student.address.ward || "N/A" },
    { label: "Municipality", value: student.address.municipality || "N/A" },
    { label: "District", value: student.address.district || "N/A" },
    { label: "Province", value: student.address.province || "N/A" },
    { label: "Country", value: student.address.country || "N/A" },
    { label: "Postal Code", value: student.address.postalCode || "N/A" },
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
                    console.error('Profile image failed to load:', student.profilePicture);
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Student";
                  }}
                />
                <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full border-2 border-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-1">{student.name}</h4>
              <p className="text-gray-600 font-medium mb-4">Student</p>
              <Button className="w-full mb-2" variant="primary">
                Download Profile
              </Button>
              <Button className="w-full" variant="outline">
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Personal Details */}
          <div className="lg:col-span-9">
            <DetailsSection title="Personal Details" details={personalDetails} />
          </div>
          
          {/* Address Details */}
          {addressDetails.length > 0 && (
            <div className="lg:col-span-12">
              <DetailsSection title="Address" details={addressDetails} />
            </div>
          )}

          {/* Parent Details */}
          {student.parent && (
            <div className="lg:col-span-12">
              <DetailsSection 
                title="Parent/Guardian Details" 
                details={[
                  { label: "Name", value: student.parent.name || "N/A" },
                  { label: "Email", value: student.parent.email || "N/A" },
                  { label: "Contact", value: student.parent.contactNo || "N/A" },
                  { label: "Gender", value: student.parent.gender || "N/A" },
                ]} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 