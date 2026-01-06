import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { userAPI } from "../../services/api";
import { userService, UserProfile } from "../../services/userService";
import { Student } from "../../types/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FaStar } from 'react-icons/fa';
import TextareaAutosize from 'react-textarea-autosize';
import feedbackService, { Feedback } from "../../services/feedbackService";

// Import shared components - eliminates duplicate Spinner definition
import {
  PageLoadingState,
  InlineLoadingState,
  PageErrorState,
  ProfileCard,
  ProfileDetailItem,
  ProfileDetailsGrid,
  StatusBadge
} from "../../components/common";

// Import shared utilities
import { formatDate as formatDateUtil } from "../../utils/dateUtils";

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: number;
}

/**
 * Star Rating Component - Could be extracted to shared components if used elsewhere
 */
const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 20 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={`${star <= rating ? 'text-amber-500' : 'text-gray-300'} ${setRating ? 'cursor-pointer hover:text-amber-400' : ''} transition-colors`}
        onClick={() => setRating?.(star)}
        size={size}
      />
    ))}
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

  const isIdProvided = !!id;

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);

        if (isIdProvided) {
          const response = await userAPI.getStudentById(parseInt(id as string));

          if (response.data?.status === 'success' && response.data?.data?.student) {
            setStudent(response.data.data.student);
            setIsOwnProfile(false);
          } else {
            throw new Error('Failed to load student profile data');
          }
        } else {
          const profile = await userService.getUserProfile();

          if (profile && profile.role === 'STUDENT') {
            setStudent(profile);
            setIsOwnProfile(true);
          } else {
            throw new Error('Student profile not found or user is not a student');
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError("Error loading student profile");
        toast.error("Could not load student profile");
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id, isIdProvided]);

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

        // TODO: Replace mock data with actual API call in production
        // const feedbacksData = await feedbackService.getStudentFeedbacks(studentId);
        const feedbacksData = feedbackService.getMockFeedbacks(studentId);

        setFeedbacks(feedbacksData);
      } catch {
        toast.error("Failed to load feedback data");
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    if (student) {
      fetchFeedbacks();
    }
  }, [student, isOwnProfile]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch {
      return dateString;
    }
  };

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
    const profileData = getProfileData();

    if (!profileData?.profilePicture) {
      if (profileData?.studentData?.gender === "Male") {
        return "/assets/@Student-male.jpg";
      }
      if (profileData?.studentData?.gender === "Female") {
        return "/assets/@student-female.jpg";
      }
      return "/assets/@Student-male.jpg";
    }

    return userService.getProfileImageUrl(profileData?.profilePicture);
  };

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

      // TODO: Replace with actual API call in production
      // const feedbackData = {
      //   content: feedbackText,
      //   rating: feedbackRating,
      //   studentId: profileData.studentData.id
      // };
      // const newFeedback = await feedbackService.addFeedback(feedbackData);

      await new Promise(resolve => setTimeout(resolve, 500));

      const newFeedback: Feedback = {
        id: Math.floor(Math.random() * 1000),
        content: feedbackText,
        rating: feedbackRating,
        createdAt: new Date().toISOString(),
        studentId: profileData.studentData.id,
        givenBy: {
          id: 999,
          name: "You",
          role: "TEACHER"
        }
      };

      setFeedbacks([newFeedback, ...feedbacks]);
      setFeedbackText('');
      setFeedbackRating(0);
      setShowFeedbackForm(false);
      toast.success("Feedback submitted successfully");
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDownloadProfile = async () => {
    try {
      const profileData = getProfileData();
      if (!profileData?.studentData) {
        toast.error("Student data not found");
        return;
      }

      await userService.downloadProfile('STUDENT', profileData.studentData.id);
      toast.success("Profile download initiated");
    } catch {
      toast.error("Failed to download profile");
    }
  };

  // Loading state - using shared component
  if (isLoading) {
    return <PageLoadingState message="Loading student profile..." />;
  }

  // Error state - using shared component
  if (error || !student) {
    return (
      <PageErrorState
        title="Error Loading Profile"
        message={error || "Student not found"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const profileData = getProfileData();
  if (!profileData || !profileData.studentData) {
    return (
      <PageErrorState
        title="No Data Available"
        message="No student data available"
      />
    );
  }

  const studentData = profileData.studentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-gray-500 mt-1">View and manage student information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-blue-600">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <img
                    src={getProfileImageUrl()}
                    alt={studentData.name || "Student"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const gender = studentData?.gender;
                      if (gender === "Male") {
                        e.currentTarget.src = "/assets/@Student-male.jpg";
                      } else if (gender === "Female") {
                        e.currentTarget.src = "/assets/@student-female.jpg";
                      } else {
                        e.currentTarget.src = "/assets/@Student-male.jpg";
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
              <h2 className="text-xl font-bold text-gray-900">{studentData.name || "N/A"}</h2>
              <p className="text-gray-500">{studentData.class?.name} - {studentData.section?.name}</p>
              <p className="text-sm text-gray-400 mt-1">Roll No: {studentData.rollNo || "N/A"}</p>

              <div className="mt-6 space-y-3">
                <ProfileDetailItem
                  label="Email"
                  value={studentData.email || "N/A"}
                />
                <ProfileDetailItem
                  label="Contact"
                  value={studentData.contactNo || "N/A"}
                />
              </div>

              <button
                onClick={handleDownloadProfile}
                className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md shadow-indigo-200"
              >
                Download Profile
              </button>
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
                <ProfileDetailItem label="Full Name" value={studentData.name || "N/A"} />
                <ProfileDetailItem label="As Per Birth Certificate" value={studentData.nameAsPerBirth || "N/A"} />
                <ProfileDetailItem label="Father's Name" value={studentData.fatherName || "N/A"} />
                <ProfileDetailItem label="Mother's Name" value={studentData.motherName || "N/A"} />
                <ProfileDetailItem label="Gender" value={studentData.gender || "N/A"} />
                <ProfileDetailItem label="Date of Birth" value={formatDate(studentData.dateOfBirth)} />
                <ProfileDetailItem label="DOB No" value={studentData.dobNo || "N/A"} />
                <ProfileDetailItem label="Blood Group" value={studentData.bloodGroup || "N/A"} />
                <ProfileDetailItem label="Nationality" value={studentData.nationality || "N/A"} />
                <ProfileDetailItem label="Religion" value={studentData.religion || "N/A"} />
                <ProfileDetailItem label="Emergency Contact" value={studentData.emergencyContact || "N/A"} />
              </ProfileDetailsGrid>
            </div>
          </div>

          {/* Address Details */}
          {studentData.address && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Address Details</h3>
              </div>
              <div className="p-6">
                <ProfileDetailsGrid columns={2}>
                  <ProfileDetailItem label="Address Line 1" value={studentData.address.addressLine1 || "N/A"} />
                  <ProfileDetailItem label="Address Line 2" value={studentData.address.addressLine2 || "N/A"} />
                  <ProfileDetailItem label="Street" value={studentData.address.street || "N/A"} />
                  <ProfileDetailItem label="City" value={studentData.address.city || "N/A"} />
                  <ProfileDetailItem label="Ward" value={studentData.address.ward || "N/A"} />
                  <ProfileDetailItem label="Municipality" value={studentData.address.municipality || "N/A"} />
                  <ProfileDetailItem label="District" value={studentData.address.district || "N/A"} />
                  <ProfileDetailItem label="Province" value={studentData.address.province || "N/A"} />
                  <ProfileDetailItem label="Country" value={studentData.address.country || "N/A"} />
                  <ProfileDetailItem label="Postal Code" value={studentData.address.postalCode || "N/A"} />
                </ProfileDetailsGrid>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Feedback & Progress</h3>
                {!isOwnProfile && (
                  <button
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {showFeedbackForm ? 'Cancel' : 'Add Feedback'}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Feedback Form */}
              {showFeedbackForm && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <StarRating rating={feedbackRating} setRating={setFeedbackRating} size={24} />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback
                      </label>
                      <TextareaAutosize
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        minRows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Provide your feedback here..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingFeedback}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Feedback List */}
              {loadingFeedbacks ? (
                <InlineLoadingState height="h-32" />
              ) : feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{feedback.givenBy.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDateUtil(feedback.createdAt)}
                          </p>
                        </div>
                        <StarRating rating={feedback.rating} size={16} />
                      </div>
                      <p className="text-gray-700">{feedback.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No feedback yet</p>
                  <p className="text-sm text-gray-400 mt-1">Feedback will appear here</p>
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
