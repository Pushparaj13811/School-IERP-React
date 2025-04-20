import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userAPI, academicAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Class, 
  Section, 
  Parent,
  StudentFormData,
  Student
} from '../../types/api';

interface LocationState {
  editMode?: boolean;
  studentData?: Student;
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

const AddStudents: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const isEditMode = locationState?.editMode || false;
  const studentToEdit = locationState?.studentData;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Classes and Sections data
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  
  // Student info
  const [name, setName] = useState('');
  const [nameAsPerBirth, setNameAsPerBirth] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('MALE');
  const [contactNo, setContactNo] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [nationality, setNationality] = useState('Nepali');
  const [religion, setReligion] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [dobNo, setDobNo] = useState('');
  
  // Class info
  const [classId, setClassId] = useState<number | string>('');
  const [sectionId, setSectionId] = useState<number | string>('');
  const [parentId, setParentId] = useState<number | string>('');
  
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

  // Fill form with student data if in edit mode
  useEffect(() => {
    if (isEditMode && studentToEdit) {
      // Set basic info
      setName(studentToEdit.name || '');
      setEmail(studentToEdit.email || '');
      setGender(studentToEdit.gender || 'MALE');
      setRollNo(studentToEdit.rollNo || '');
      setContactNo(studentToEdit.contactNo || '');
      
      // Set class and section if available
      if (studentToEdit.class?.id) {
        setClassId(studentToEdit.class.id);
      }
      
      if (studentToEdit.section?.id) {
        setSectionId(studentToEdit.section.id);
      }
      
      // Set parent if available
      if (studentToEdit.parent?.id) {
        setParentId(studentToEdit.parent.id);
      }
      
      // Set profile picture preview if available
      if (studentToEdit.profilePicture) {
        setProfilePicturePreview(studentToEdit.profilePicture);
      }
      
      // Fetch additional student details if needed
      fetchStudentDetails(studentToEdit.id);
    }
  }, [isEditMode, studentToEdit]);

  // Function to fetch additional student details
  const fetchStudentDetails = async (studentId: number) => {
    try {
      setIsLoading(true);
      const response = await userAPI.getStudentById(studentId);
      
      if (response.data?.status === 'success' && response.data?.data?.student) {
        const student = response.data.data.student;
        
        // Set all student details
        setName(student.name || '');
        setNameAsPerBirth(student.nameAsPerBirth || '');
        setEmail(student.email || '');
        setGender(student.gender || 'MALE');
        setRollNo(student.rollNo || '');
        setContactNo(student.contactNo || '');
        setEmergencyContact(student.emergencyContact || '');
        
        // Format and set date of birth
        if (student.dateOfBirth) {
          // Format date as YYYY-MM-DD for input[type=date]
          const date = new Date(student.dateOfBirth);
          const formattedDate = date.toISOString().split('T')[0];
          setDateOfBirth(formattedDate);
        }
        
        setBloodGroup(student.bloodGroup || '');
        setNationality(student.nationality || 'Nepali');
        setReligion(student.religion || '');
        setFatherName(student.fatherName || '');
        setMotherName(student.motherName || '');
        setDobNo(student.dobNo || '');
        
        // Set class and section
        if (student.classId) {
          setClassId(student.classId);
        } else if (student.class?.id) {
          setClassId(student.class.id);
        }
        
        if (student.sectionId) {
          setSectionId(student.sectionId);
        } else if (student.section?.id) {
          setSectionId(student.section.id);
        }
        
        // Set parent if available
        if (student.parentId) {
          setParentId(student.parentId);
        } else if (student.parent?.id) {
          setParentId(student.parent.id);
        }
        
        // Set address information if available
        if (student.address) {
          setAddressLine1(student.address.addressLine1 || '');
          setAddressLine2(student.address.addressLine2 || '');
          setStreet(student.address.street || '');
          setCity(student.address.city || '');
          setWard(student.address.ward || '');
          setMunicipality(student.address.municipality || '');
          setDistrict(student.address.district || '');
          setProvince(student.address.province || '');
          setCountry(student.address.country || 'Nepal');
          setPostalCode(student.address.postalCode || '');
        }
        
        // Set profile picture preview if available
        if (student.profilePicture) {
          setProfilePicturePreview(student.profilePicture);
        }
      } else {
        toast.error('Failed to load complete student data');
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load student details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classes
        const classesResponse = await academicAPI.getClasses();
        if (classesResponse.data?.status === 'success' && classesResponse.data?.data?.classes) {
          setClasses(classesResponse.data.data.classes);
        } else {
          // Fallback to empty classes array
          setClasses([]);
          toast.error('Failed to load classes data');
        }

        // Fetch parents
        const parentsResponse = await userAPI.getParents();
        if (parentsResponse.data?.status === 'success' && parentsResponse.data?.data?.parents) {
          setParents(parentsResponse.data.data.parents);
        } else {
          // Fallback to empty parents array
          setParents([]);
          toast.error('Failed to load parents data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
        // Set default empty arrays
        setClasses([]);
        setParents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch sections when class changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!classId) {
        setSections([]);
        return;
      }
      
      try {
        console.log('Fetching sections for classId:', classId);
        
        // Convert to number explicitly
        const classIdNumber = Number(classId);
        
        // Use service instead of direct axios call
        const response = await academicAPI.getSectionsByClass(classIdNumber);
        
        if (response.data?.status === 'success' && Array.isArray(response.data.data?.sections)) {
          setSections(response.data.data.sections);
          console.log('Sections set:', response.data.data.sections.length, 'items');
        } else {
          console.error('Invalid sections response format:', response.data);
          setSections([]);
          toast.error('Failed to load sections data (invalid format)');
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        setSections([]);
        toast.error('Failed to load sections data (request error)');
      }
    };

    fetchSections();
  }, [classId]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassId = e.target.value;
    console.log('Selected class ID:', selectedClassId);
    setClassId(selectedClassId);
    setSectionId(''); // Reset section when class changes
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
      
      // Prepare student data
      const studentData: StudentFormData = {
        name,
        nameAsPerBirth,
        email,
        gender,
        contactNo,
        emergencyContact,
        // Format date in ISO-8601 with time information
        dateOfBirth: dateOfBirth ? new Date(`${dateOfBirth}T00:00:00Z`).toISOString() : '',
        dobNo: dobNo || undefined,
        bloodGroup: bloodGroup || undefined,
        nationality,
        religion: religion || undefined,
        rollNo,
        fatherName,
        motherName,
        classId: Number(classId),
        sectionId: Number(sectionId),
        address: addressData,
        parentId: parentId ? Number(parentId) : undefined
      };
      
      let response;
      
      if (isEditMode && studentToEdit) {
        try {
          // Log the data being sent to API for debugging
          console.log("Student update data:", {
            id: studentToEdit.id,
            data: studentData
          });
          
          // Add validation for required fields
          if (!name || !email || !rollNo || !classId || !sectionId) {
            toast.error("Please fill in all required fields");
            setIsSubmitting(false);
            return;
          }
          
          // Update existing student - core student data only
          console.log("Updating student data:", studentToEdit.id);
          response = await userAPI.updateStudent(studentToEdit.id, studentData);
          console.log("Student data updated successfully:", response);
          
          // Handle profile picture separately if it exists
          if (profilePicture) {
            try {
              console.log("Uploading profile picture for existing student");
              // Use the specific endpoint for student profile pictures
              await userAPI.uploadStudentProfilePicture(studentToEdit.id, profilePicture);
              console.log("Profile picture updated successfully");
            } catch (pictureError) {
              console.error("Error uploading profile picture:", pictureError);
              toast.error("Student data updated but failed to update profile picture.");
            }
          }
          
          toast.success('Student updated successfully');
          navigate('/students');
        } catch (updateError) {
          const err = updateError as ApiErrorResponse;
          console.error('Error updating student:', err);
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
            toast.error('Failed to update student. Please try again.');
          }
          
          setIsSubmitting(false);
          return;
        }
      } else {
        // For new students, create first then upload profile picture
        try {
          // Create new student
          console.log("Creating new student with data:", studentData);
          response = await userAPI.createStudent(studentData);
          console.log("Student created successfully:", response);
          
          // Handle profile picture upload if present
          if (profilePicture && response.data?.data?.student?.id) {
            try {
              // Make sure we have the student ID before uploading
              const studentId = response.data.data.student.id;
              console.log("Student created with ID:", studentId);
              
              console.log("Uploading profile picture for new student");
              // Use the specific endpoint for student profile pictures
              const profilePictureResponse = await userAPI.uploadStudentProfilePicture(studentId, profilePicture);
              console.log("Profile picture upload response:", profilePictureResponse);
              
              if (profilePictureResponse?.data?.status === 'success') {
                console.log("Profile picture uploaded successfully for new student");
              } else {
                console.error("Profile picture upload returned unexpected response:", profilePictureResponse);
                toast.warning("Student created but profile picture may not have been properly linked.");
              }
            } catch (pictureError) {
              console.error("Error uploading profile picture:", pictureError);
              toast.error("Student created but failed to upload profile picture.");
            }
          }
          
          toast.success('Student created successfully');
          navigate('/students');
        } catch (createError) {
          const err = createError as ApiErrorResponse;
          console.error('Error creating student:', err);
          
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
            toast.error('Failed to create student. Please try again.');
          }
          setIsSubmitting(false);
          return;
        }
      }
      
      // Navigate only if all operations were successful
      navigate('/students');
    } catch (error) {
      console.error('Error processing student:', error);
      toast.error(isEditMode 
        ? 'Failed to update student. Please try again.' 
        : 'Failed to create student. Please try again.'
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
        {isEditMode ? 'Edit Student' : 'Add Student'}
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
                  Name As Per Birth Certificate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameAsPerBirth}
                  onChange={(e) => setNameAsPerBirth(e.target.value)}
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
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
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
                  Birth Certificate Number
                </label>
                <input
                  type="text"
                  value={dobNo}
                  onChange={(e) => setDobNo(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Religion
                </label>
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-medium mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
          
          {/* Family Information */}
          <div>
            <h2 className="text-lg font-medium mb-4">Family Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent/Guardian
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Parent (Optional)</option>
                  {parents.map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} ({parent.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">You can assign a parent later if not available now.</p>
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          <div>
            <h2 className="text-lg font-medium mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={classId}
                  onChange={handleClassChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                  disabled={!classId}
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                {sections.length === 0 && classId && (
                  <p className="text-xs text-red-500 mt-1">No sections found for this class. Please choose a different class.</p>
                )}
              </div>
            </div>
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
              {isSubmitting ? 'Processing...' : 'Save Student'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStudents; 