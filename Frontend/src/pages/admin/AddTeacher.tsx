import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userAPI, academicAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Designation, Teacher } from '../../types/api';

// Define the location state interface
interface LocationState {
  editMode?: boolean;
  teacherData?: Teacher;
}

const AddTeacher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Teacher info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('MALE');
  const [contactNo, setContactNo] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [designationId, setDesignationId] = useState<number | string>('');
  const [bio, setBio] = useState('');
  
  // Address info
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('Nepal');
  const [postalCode, setPostalCode] = useState('');

  // File upload
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  // Add location state handling
  const locationState = location.state as LocationState;
  const isEditMode = locationState?.editMode || false;
  const teacherToEdit = locationState?.teacherData;
  
  // Fetch designations from backend
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await academicAPI.getDesignations();
        
        if (response.data.status === 'success' && response.data.data.designations) {
          setDesignations(response.data.data.designations);
        } else {
          // Fallback to default designations if API doesn't return expected data
          setDesignations([
            { id: 1, name: 'Principal' },
            { id: 2, name: 'Vice Principal' },
            { id: 3, name: 'Head of Department' },
            { id: 4, name: 'Senior Teacher' },
            { id: 5, name: 'Teacher' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching designations:', error);
        toast.error('Failed to load designations data');
        // Fallback to default designations
        setDesignations([
          { id: 1, name: 'Principal' },
          { id: 2, name: 'Vice Principal' },
          { id: 3, name: 'Head of Department' },
          { id: 4, name: 'Senior Teacher' },
          { id: 5, name: 'Teacher' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesignations();
    
    // Fill form with teacher data if in edit mode
    if (isEditMode && teacherToEdit) {
      // Set basic info
      setName(teacherToEdit.name || '');
      setEmail(teacherToEdit.email || '');
      setGender(teacherToEdit.gender || 'MALE');
      setContactNo(teacherToEdit.contactNo || '');
      
      // Set professional info if available
      if (teacherToEdit.designation?.id) {
        setDesignationId(teacherToEdit.designation.id);
      }
      
      // Set profile picture preview if available
      if (teacherToEdit.profilePicture) {
        setProfilePicturePreview(teacherToEdit.profilePicture);
      }
    }
  }, [isEditMode, teacherToEdit]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare address data
      const addressData = {
        addressLine1,
        addressLine2: addressLine2 || undefined,
        street,
        city,
        ward,
        municipality,
        district,
        province,
        country,
        postalCode: postalCode || undefined
      };
      
      // Prepare teacher data
      const teacherData = {
        name,
        gender,
        contactNo,
        emergencyContact,
        dateOfBirth,
        joinDate,
        designationId: Number(designationId),
        bio: bio || undefined,
        address: addressData
      };
      
      let response;
      
      if (isEditMode && teacherToEdit) {
        try {
          // Update existing teacher - core teacher data only
          console.log("Updating teacher data:", teacherToEdit.id);
          response = await userAPI.updateTeacher(teacherToEdit.id, teacherData);
          console.log("Teacher data updated successfully");
          
          // Handle profile picture upload separately
          if (profilePicture) {
            try {
              console.log("Uploading profile picture for existing teacher");
              await userAPI.uploadProfilePicture(profilePicture);
              console.log("Profile picture updated successfully");
            } catch (pictureError) {
              console.error("Error uploading profile picture:", pictureError);
              toast.error("Teacher data updated but failed to update profile picture.");
            }
          }
          
          toast.success('Teacher updated successfully');
        } catch (updateError) {
          console.error('Error updating teacher:', updateError);
          toast.error('Failed to update teacher. Please try again.');
          return;
        }
      } else {
        try {
          // Create new teacher
          response = await userAPI.createTeacher({
            email,
            ...teacherData
          });
          console.log("Teacher created successfully");
          
          // Handle profile picture upload if present - in a separate try/catch
          if (profilePicture && response.data?.data?.teacher?.id) {
            try {
              await userAPI.uploadProfilePicture(profilePicture);
              console.log("Profile picture uploaded successfully");
            } catch (pictureError) {
              console.error("Error uploading profile picture:", pictureError);
              toast.error("Teacher created but failed to upload profile picture.");
            }
          }
          
          toast.success('Teacher created successfully');
        } catch (createError) {
          console.error('Error creating teacher:', createError);
          toast.error('Failed to create teacher. Please try again.');
          return;
        }
      }
      
      // Navigate only if everything succeeded
      navigate('/teachers');
    } catch (error) {
      console.error('Error processing teacher:', error);
      toast.error(isEditMode 
        ? 'Failed to update teacher. Please try again.' 
        : 'Failed to create teacher. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">
        {isEditMode ? 'Edit Teacher' : 'Add Teacher'}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
            <input
              type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  value={designationId}
                  onChange={(e) => setDesignationId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation.id} value={designation.id}>
                      {designation.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
            />
          </div>
          
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
            <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
            />
          </div>
          
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Date <span className="text-red-500">*</span>
                </label>
            <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Bio Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border rounded-md h-24"
              placeholder="Enter teacher's bio or description"
            />
          </div>
          
          {/* Profile Picture Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-gray-100">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                )}
              </div>
              <label className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 flex items-center gap-2">
                <FaUpload />
                Upload Picture
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Address Information */}
          <div>
            <h2 className="text-lg font-medium mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
              <input
                type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
              />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward <span className="text-red-500">*</span>
                </label>
              <input
                type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
              />
            </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Municipality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
          </div>
          
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
          </div>
          
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province <span className="text-red-500">*</span>
                </label>
            <input
              type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
            />
          </div>
          
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
            <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-md"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white font-medium rounded-md flex items-center gap-2"
            >
              <FaPaperPlane />
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher; 