import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DetailsSection from "../../components/common/DetailsSection";
import Button from "../../components/ui/Button";
import { userAPI } from "../../services/api";
import { userService, UserProfile } from "../../services/userService";
import { Student } from "../../types/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FaStar } from 'react-icons/fa';
import TextareaAutosize from 'react-textarea-autosize';
import feedbackService, { Feedback } from "../../services/feedbackService";

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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

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

  // Fetch feedbacks after student data is loaded
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!student) return;
      
      try {
        setLoadingFeedbacks(true);
        let studentId: number;
        
        if (isOwnProfile) {
          const userProfile = student as UserProfile;
          studentId = (userProfile.roleSpecificData as Student).id;
        } else {
          studentId = (student as Student).id;
        }
        
        // In a production environment, use the API call:
        // const feedbacksData = await feedbackService.getStudentFeedbacks(studentId);
        
        // For development/testing, use mock data:
        const feedbacksData = feedbackService.getMockFeedbacks(studentId);
        
        setFeedbacks(feedbacksData);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        toast.error("Failed to load feedback data");
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    if (student) {
      fetchFeedbacks();
    }
  }, [student, isOwnProfile]);

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
    console.log("Profile data for image URL:", profileData);
    
    if (!profileData?.profilePicture || profileData?.profilePicture === null) {
      console.log("No profile picture found in profile data");
      
      // Return gender-specific default avatar for students
      if (profileData?.studentData?.gender === "Male") {
        return "/assets/@Student-male.jpg"; // Male student avatar
      }
      if (profileData?.studentData?.gender === "Female") {
        return "/assets/@student-female.jpg"; // Female student avatar
      }
      
      // Fallback if gender is not specified
      return "/assets/@Student-male.jpg";
    }
    
    return userService.getProfileImageUrl(profileData?.profilePicture);
  };

  // Add function to handle feedback submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim() || feedbackRating === 0) {
      toast.error("Please provide both feedback text and rating");
      return;
    }
    
    setIsSubmittingFeedback(true);
    
    try {
      const profileData = getProfileData();
      if (!profileData?.studentData) {
        throw new Error("Student data not found");
      }
      
      // In a production environment, use the API call:
      // const feedbackData = {
      //   content: feedbackText,
      //   rating: feedbackRating,
      //   studentId: profileData.studentData.id
      // };
      // const newFeedback = await feedbackService.addFeedback(feedbackData);
      // if (newFeedback) {
      //   setFeedbacks([newFeedback, ...feedbacks]);
      // }
      
      // For development/testing, simulate API call:
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFeedback: Feedback = {
        id: Math.floor(Math.random() * 1000),
        content: feedbackText,
        rating: feedbackRating,
        createdAt: new Date().toISOString(),
        studentId: profileData.studentData.id,
        givenBy: {
          id: 999, // Would be the current user's ID
          name: "You",
          role: "TEACHER" // Would be the current user's role
        }
      };
      
      setFeedbacks([newFeedback, ...feedbacks]);
      setFeedbackText('');
      setFeedbackRating(0);
      setShowFeedbackForm(false);
      toast.success("Feedback submitted successfully");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Add star rating component
  const StarRating = ({ rating, setRating }: { rating: number, setRating?: (rating: number) => void }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar 
            key={star}
            className={`${star <= rating ? 'text-yellow-500' : 'text-gray-300'} ${setRating ? 'cursor-pointer' : ''}`}
            onClick={() => setRating && setRating(star)}
            size={20}
          />
        ))}
      </div>
    );
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
                  onError={(e) => {
                    console.log("Profile image failed to load");
                    // Use gender-specific fallback image
                    const gender = profileData?.studentData?.gender;
                    if (gender === "Male") {
                      e.currentTarget.src = "/assets/@Student-male.jpg";
                    } else if (gender === "Female") {
                      e.currentTarget.src = "/assets/@student-female.jpg";
                    } else {
                      e.currentTarget.src = "/assets/@Student-male.jpg";
                    }
                    e.currentTarget.onerror = null; // Prevent infinite error loops
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
            
            {/* Feedback Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Feedback & Progress</h3>
                {!isOwnProfile && (
                  <Button 
                    variant="outline" 
                    className="text-sm"
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  >
                    {showFeedbackForm ? 'Cancel' : 'Add Feedback'}
                  </Button>
                )}
              </div>
              
              {/* Feedback Form */}
              {showFeedbackForm && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <StarRating rating={feedbackRating} setRating={setFeedbackRating} />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback
                      </label>
                      <TextareaAutosize
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        minRows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Provide your feedback here..."
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        className="text-sm"
                        disabled={isSubmittingFeedback}
                      >
                        {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Feedback List */}
              {loadingFeedbacks ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{feedback.givenBy.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StarRating rating={feedback.rating} />
                      </div>
                      <p className="text-gray-700">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                  No feedback available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 