import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUpload, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { ParentFormData, Parent, Student } from '../../types/api';

interface LocationState {
  editMode?: boolean;
  parentData?: Parent;
}

// Define a more generic Error type interface
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  request?: unknown;
  message?: string;
}

const AddParents: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const isEditMode = locationState?.editMode || false;
  const parentToEdit = locationState?.parentData;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Parent info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('MALE');
  const [contactNo, setContactNo] = useState('');
  
  // Child information
  const [children, setChildren] = useState<number[]>([]);
  
  // Available students for selection
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  
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

  // Fetch available students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        const response = await userAPI.getStudents();
        
        if (response.data?.status === 'success' && response.data?.data?.students) {
          console.log("Fetched students data:", response.data.data.students);
          setAvailableStudents(response.data.data.students);
        } else {
          toast.error('Failed to load students data');
          setAvailableStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students. Please try again.');
        setAvailableStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fill form with parent data if in edit mode
  useEffect(() => {
    if (isEditMode && parentToEdit) {
      // Set basic info
      setName(parentToEdit.name || '');
      setEmail(parentToEdit.email || '');
      setGender(parentToEdit.gender || 'MALE');
      setContactNo(parentToEdit.contactNo || '');
      
      // Set children if available
      if (parentToEdit.children && parentToEdit.children.length > 0) {
        setChildren(parentToEdit.children.map(child => child.id));
      }
      
      // Set profile picture preview if available
      if (parentToEdit.profilePicture) {
        setProfilePicturePreview(parentToEdit.profilePicture);
      }
      
      // Fetch additional parent details if needed
      fetchParentDetails(parentToEdit.id);
    } else {
      // Only stop loading if not in edit mode
      setIsLoading(false);
    }
  }, [isEditMode, parentToEdit]);

  // Function to fetch additional parent details
  const fetchParentDetails = async (parentId: number) => {
    try {
      setIsLoading(true);
      const response = await userAPI.getParentById(parentId);
      
      if (response.data?.status === 'success' && response.data?.data?.parent) {
        const parent = response.data.data.parent;
        
        // Set all parent details
        setName(parent.name || '');
        setEmail(parent.email || '');
        setGender(parent.gender || 'MALE');
        setContactNo(parent.contactNo || '');
        
        // Set children if available
        if (parent.children && parent.children.length > 0) {
          setChildren(parent.children.map(child => child.id));
        }
        
        // Set address information if available
        if (parent.address) {
          setAddressLine1(parent.address.addressLine1 || '');
          setAddressLine2(parent.address.addressLine2 || '');
          setStreet(parent.address.street || '');
          setCity(parent.address.city || '');
          setWard(parent.address.ward || '');
          setMunicipality(parent.address.municipality || '');
          setDistrict(parent.address.district || '');
          setProvince(parent.address.province || '');
          setCountry(parent.address.country || 'Nepal');
          setPostalCode(parent.address.postalCode || '');
        }
        
        // Set profile picture preview if available
        if (parent.profilePicture) {
          setProfilePicturePreview(parent.profilePicture);
        }
      } else {
        toast.error('Failed to load complete parent data');
      }
    } catch (error) {
      console.error('Error fetching parent details:', error);
      toast.error('Failed to load parent details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
    }
  };

  const handleAddChild = () => {
    setChildren(prev => [...prev, 0]); // Add a placeholder for a new child selection
  };

  const handleRemoveChild = (index: number) => {
    setChildren(prev => prev.filter((_, i) => i !== index));
  };

  const handleChildChange = (index: number, studentId: number) => {
    setChildren(prev => {
      const newChildren = [...prev];
      newChildren[index] = studentId;
      return newChildren;
    });
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
      
      // Prepare parent data - specify all required properties to avoid TypeScript errors
      const parentData: ParentFormData = {
        name,
        email,
        gender,
        contactNo,
        address: addressData
      };
      
      // Only add children if any are selected
      if (children.length > 0 && children.some(id => id > 0)) {
        parentData.children = children.filter(id => id > 0);
      }
      
      let response;
      
      if (isEditMode && parentToEdit) {
        try {
          // Log the parent data for debugging
          console.log("Updating parent data:", {
            id: parentToEdit.id,
            data: parentData
          });
          
          // First, let's handle the profile picture if it exists
          let profilePictureResponse;
          if (profilePicture) {
            try {
              console.log("Uploading profile picture for existing parent");
              // Use the new endpoint for parent profile pictures
              profilePictureResponse = await userAPI.uploadParentProfilePicture(parentToEdit.id, profilePicture);
              console.log("Profile picture upload response:", profilePictureResponse);
              
              // If upload was successful, we should update the parent with the picture ID
              if (profilePictureResponse?.data?.status === 'success' && 
                  profilePictureResponse?.data?.data?.profilePicture) {
                console.log("Profile picture uploaded successfully, proceeding with parent update");
              }
            } catch (pictureError) {
              console.error("Error uploading profile picture:", pictureError);
              toast.error("Failed to upload profile picture. Continuing with parent update.");
            }
          }
          
          // Now update the parent data
          console.log("Updating parent data:", parentToEdit.id);
          response = await userAPI.updateParent(parentToEdit.id, parentData);
          console.log("Parent update response:", response);
          
          toast.success('Parent updated successfully');
          navigate('/parents');
        } catch (updateError) {
          const err = updateError as ApiErrorResponse;
          console.error('Error updating parent:', err);
          
          // Log more details about the error
          if (err.response) {
            console.error('Error response:', err.response.data);
            console.error('Status code:', err.response.status);
            
            // Display more specific error message
            if (err.response.data?.message) {
              toast.error(`Update failed: ${err.response.data.message}`);
            } else {
              toast.error(`Update failed: Server returned ${err.response.status}`);
            }
          } else if (err.request) {
            console.error('Error request:', err.request);
            toast.error('No response received from server. Please check your connection.');
          } else {
            toast.error('Failed to update parent. Please try again.');
          }
          setIsSubmitting(false);
          return;
        }
      } else {
        // Update the profile picture upload flow for new parent creation
        try {
          // For new parents, we need to create the parent first, then upload the profile picture
          console.log("Creating new parent with data:", parentData);
          response = await userAPI.createParent(parentData);
          console.log("Parent creation response:", response);
          
          // If parent creation successful, upload profile picture
          if (response?.data?.status === 'success' && profilePicture) {
            try {
              // Make sure we have the parent ID before uploading profile picture
              const parentId = response.data.data.parent.id;
              console.log("Parent created with ID:", parentId);
              
              console.log("Uploading profile picture for new parent");
              // Use the new endpoint for parent profile pictures
              const profilePictureResponse = await userAPI.uploadParentProfilePicture(parentId, profilePicture);
              console.log("Profile picture upload response:", profilePictureResponse);
              
              if (profilePictureResponse?.data?.status === 'success') {
                console.log("Profile picture uploaded successfully for new parent");
              } else {
                console.error("Profile picture upload returned unexpected response:", profilePictureResponse);
                toast.warning("Parent created but profile picture may not have been properly linked.");
              }
            } catch (pictureError) {
              console.error("Error uploading profile picture:", pictureError);
              toast.error("Parent created but failed to upload profile picture.");
            }
          }
          
          toast.success('Parent added successfully');
          navigate('/parents');
        } catch (createError) {
          const err = createError as ApiErrorResponse;
          console.error('Error creating parent:', err);
          
          // Log more details about the error
          if (err.response) {
            console.error('Error response:', err.response.data);
            console.error('Status code:', err.response.status);
            
            // Display more specific error message
            if (err.response.data?.message) {
              toast.error(`Creation failed: ${err.response.data.message}`);
            } else {
              toast.error(`Creation failed: Server returned ${err.response.status}`);
            }
          } else if (err.request) {
            console.error('Error request:', err.request);
            toast.error('No response received from server. Please check your connection.');
          } else {
            toast.error('Failed to create parent. Please try again.');
          }
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error: unknown) {
      interface ErrorWithResponse {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
      
      const errorMessage = 
        error && typeof error === 'object' && 'response' in error 
          ? ((error as ErrorWithResponse).response)?.data?.message || 'An unexpected error occurred'
          : 'Failed to process parent data';
      toast.error(errorMessage);
      console.error('Error processing parent:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading parent data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">
        {isEditMode ? 'Edit Parent' : 'Add Parent'}
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
            </div>
          </div>
          
          {/* Children Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Children (Optional)</h2>
              <button
                type="button"
                onClick={handleAddChild}
                className="px-2 py-1 bg-green-600 text-white rounded-md flex items-center gap-1 text-sm"
              >
                <FaPlus size={12} />
                Add Child
              </button>
            </div>
            
            {children.length === 0 ? (
              <div className="text-gray-500 italic mb-4">No children added yet. You can add children later.</div>
            ) : (
              <div className="space-y-3 mb-4">
                {children.map((childId, index) => (
                  <div key={index} className="flex items-center gap-2">
            <select
                      value={childId}
                      onChange={(e) => handleChildChange(index, Number(e.target.value))}
                      className="flex-grow p-2 border rounded-md"
                    >
                      <option value={0}>Select a student</option>
                      {studentsLoading ? (
                        <option disabled>Loading students...</option>
                      ) : availableStudents.length > 0 ? (
                        availableStudents.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} {student.rollNo ? `(Roll: ${student.rollNo})` : ''} {student.class?.name ? `- ${student.class.name}` : ''}
                          </option>
                        ))
                      ) : (
                        <option disabled>No students available</option>
                      )}
            </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {availableStudents.length === 0 && !studentsLoading && (
              <div className="text-yellow-600 text-sm mb-4">
                No students available. Please add students first before assigning them to a parent.
              </div>
            )}
          </div>
          
          {/* Profile Picture */}
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
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Parent' : 'Create Parent')}
          </button>
        </div>
      </div>
      </form>
    </div>
  );
};

export default AddParents; 