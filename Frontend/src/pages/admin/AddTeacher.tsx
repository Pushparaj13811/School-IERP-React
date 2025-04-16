import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUpload, } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userAPI, academicAPI } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Designation, Teacher, Class, Subject, Section } from '../../types/api';

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
  
  // Classes and subjects assignments
  const [classes, setClasses] = useState<Class[]>([]);
  const [classSubjects, setClassSubjects] = useState<Record<number, Subject[]>>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  
  // Sections handling
  const [classSections, setClassSections] = useState<Record<number, Section[]>>({});
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  
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
  
  // Fetch classes and subjects from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        
        // Fetch classes
        const classesResponse = await academicAPI.getClasses();
        if (classesResponse.data.status === 'success' && classesResponse.data.data.classes) {
          setClasses(classesResponse.data.data.classes);
        } else {
          toast.error('Failed to load classes data');
          setClasses([]);
        }
        
        // We'll no longer fetch all subjects here; they'll be fetched after class selection
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes data');
      } finally {
        setLoadingClasses(false);
      }
    };
    
    fetchClasses();
  }, []);

  // Update available subjects when selected classes change
  useEffect(() => {
    const fetchClassSpecificSubjects = async () => {
      if (selectedClasses.length === 0) {
        // If no classes selected, show empty subjects list
        setSubjects([]);
        setSelectedSubjects([]);
        return;
      }

      setLoadingSubjects(true);
      try {
        // Create a set to store unique subjects
        const uniqueSubjectsMap = new Map<number, Subject>();
        
        // Fetch subjects for each selected class
        for (const classId of selectedClasses) {
          // Check if we already have subjects for this class
          if (!classSubjects[classId]) {
            try {
              const response = await academicAPI.getSubjectsByClass(classId);
              if (response.data?.success && response.data?.data) {
                const fetchedSubjects = response.data.data;
                // Store subjects for this class
                setClassSubjects(prev => ({
                  ...prev,
                  [classId]: fetchedSubjects
                }));
                
                // Add to unique subjects map
                fetchedSubjects.forEach((subject: Subject) => {
                  uniqueSubjectsMap.set(subject.id, subject);
                });
              }
            } catch (error) {
              console.error(`Error fetching subjects for class ${classId}:`, error);
              toast.error(`Failed to load subjects for class ${classId}`);
            }
          } else {
            // Use cached subjects for this class
            classSubjects[classId].forEach(subject => {
              uniqueSubjectsMap.set(subject.id, subject);
            });
          }
        }
        
        // Convert map to array
        const combinedSubjects = Array.from(uniqueSubjectsMap.values());
        setSubjects(combinedSubjects);
        
        // Update selected subjects to only include those available for the selected classes
        setSelectedSubjects(prev => 
          prev.filter(subjectId => 
            combinedSubjects.some(subject => subject.id === subjectId)
          )
        );
      } catch (error) {
        console.error('Error updating subjects based on classes:', error);
        toast.error('Failed to update subjects for selected classes');
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchClassSpecificSubjects();
  }, [selectedClasses, classSubjects]);
  
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
      
      // Set classes and subjects if available
      if (teacherToEdit.classes && Array.isArray(teacherToEdit.classes)) {
        // Handle different potential class data structures with proper null checks
        const classIds = teacherToEdit.classes.map(c => {
          // Handle potential structure: { class: { id: number } }
          if (c && typeof c === 'object' && 'class' in c && c.class && typeof c.class === 'object' && 'id' in c.class) {
            return c.class.id;
          }
          // Handle potential structure: { id: number }
          else if (c && typeof c === 'object' && 'id' in c) {
            return c.id;
          }
          return null;
        }).filter(Boolean) as number[]; // Filter out null/undefined values and assert type
        
        if (classIds.length > 0) {
          setSelectedClasses(classIds);
          
          // Fetch sections for each class
          classIds.forEach(classId => {
            if (classId) {
              fetchSectionsForClass(classId);
            }
          });
        }
        
        // Note: We don't need to fetch subjects here as it will be triggered by the
        // useEffect that watches selectedClasses
      }
      
      if (teacherToEdit.subjects && Array.isArray(teacherToEdit.subjects)) {
        // Handle different potential subject data structures with proper null checks
        const subjectIds = teacherToEdit.subjects.map(s => {
          if (s && typeof s === 'object' && 'id' in s) {
            return s.id;
          }
          return null;
        }).filter(Boolean) as number[]; // Filter out null/undefined values and assert type
        
        if (subjectIds.length > 0) {
          setSelectedSubjects(subjectIds);
        }
      }
      
      // Set profile picture preview if available
      if (teacherToEdit.profilePicture) {
        setProfilePicturePreview(teacherToEdit.profilePicture);
      }
      
      // Fetch additional teacher details if needed
      if (teacherToEdit.id) {
        fetchTeacherDetails(teacherToEdit.id);
      } else {
        console.warn('Teacher ID is undefined, cannot fetch additional details');
      }
    }
  }, [isEditMode, teacherToEdit]);

  // Function to fetch additional teacher details
  const fetchTeacherDetails = async (teacherId: number) => {
    try {
      const response = await userAPI.getTeacherById(teacherId);
      
      if (response.data?.status === 'success' && response.data?.data?.teacher) {
        const teacher = response.data.data.teacher;
        
        // Utility function to format ISO date string to YYYY-MM-DD for form inputs
        const formatDateForForm = (isoDateString: string) => {
          if (!isoDateString) return '';
          try {
            // Extract just the YYYY-MM-DD part for date inputs
            return isoDateString.substring(0, 10);
          } catch (error) {
            console.error('Error formatting date:', error);
            return '';
          }
        };
        
        // Set additional teacher details
        setEmergencyContact(teacher.emergencyContact || '');
        setDateOfBirth(teacher.dateOfBirth ? formatDateForForm(teacher.dateOfBirth) : '');
        setJoinDate(teacher.joinDate ? formatDateForForm(teacher.joinDate) : '');
        setBio(teacher.bio || '');
        
        // Set address information if available
        if (teacher.address) {
          setAddressLine1(teacher.address.addressLine1 || '');
          setAddressLine2(teacher.address.addressLine2 || '');
          setStreet(teacher.address.street || '');
          setCity(teacher.address.city || '');
          setWard(teacher.address.ward || '');
          setMunicipality(teacher.address.municipality || '');
          setDistrict(teacher.address.district || '');
          setProvince(teacher.address.province || '');
          setCountry(teacher.address.country || 'Nepal');
          setPostalCode(teacher.address.postalCode || '');
        }
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      toast.error('Failed to load complete teacher data');
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

  // Handle class selection
  const handleClassToggle = (classId: number) => {
    setSelectedClasses(prev => {
      const newSelectedClasses = prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId];
      
      // If we're removing a class, also remove its sections
      if (prev.includes(classId)) {
        setSelectedSections(sections => 
          sections.filter(sectionId => 
            !classSections[classId]?.some(section => section.id === sectionId)
          )
        );
      } else {
        // If we're adding a class, fetch sections and subjects for this class
        if (!classSections[classId]) {
          fetchSectionsForClass(classId);
        }
      }
      
      return newSelectedClasses;
    });
  };
  
  // Fetch sections for a specific class
  const fetchSectionsForClass = async (classId: number) => {
    try {
      setLoadingSections(true);
      const response = await academicAPI.getSections(classId);
      
      if (response.data.status === 'success' && response.data.data.sections) {
        const classSectionList = response.data.data.sections;
        setClassSections(prev => ({
          ...prev,
          [classId]: classSectionList
        }));
      } else {
        toast.error(`Failed to load sections for class ID ${classId}`);
      }
    } catch (error) {
      console.error(`Error fetching sections for class ID ${classId}:`, error);
      toast.error(`Failed to load sections for the selected class`);
    } finally {
      setLoadingSections(false);
    }
  };
  
  // Handle subject selection
  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };
  
  // Handle section selection
  const handleSectionToggle = (sectionId: number) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
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
      
      // Format dates properly for ISO-8601 DateTime format
      // If the date is just YYYY-MM-DD, we need to add time component
      const formatDateForAPI = (dateString: string) => {
        if (!dateString) return dateString;
        // Check if it's already a complete ISO string
        if (dateString.includes('T')) return dateString;
        // Add the time component to make it a valid ISO-8601 DateTime
        return `${dateString}T00:00:00.000Z`;
      };
      
      // Prepare teacher data with properly formatted dates
      const teacherData = {
        name,
        gender,
        contactNo,
        emergencyContact,
        dateOfBirth: formatDateForAPI(dateOfBirth),
        joinDate: formatDateForAPI(joinDate),
        designation: {
          connect: {
            id: Number(designationId)
          }
        },
        bio: bio || undefined,
        classes: selectedClasses.length > 0 ? selectedClasses : undefined,
        subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        address: addressData
      };
      
      // We'll still track selected sections in the UI but won't send them to the API
      console.log("Selected section IDs (tracked in UI but not sent to API):", selectedSections);
      
      let response;
      
      if (isEditMode && teacherToEdit) {
        try {
          // Update existing teacher - core teacher data only
          console.log("Updating teacher data:", teacherToEdit.id);
          console.log("Updating teacher with data:", {
            name,
            gender,
            contactNo,
            emergencyContact,
            dateOfBirth: formatDateForAPI(dateOfBirth),
            joinDate: formatDateForAPI(joinDate),
            designation: {
              connect: {
                id: Number(designationId)
              }
            },
            bio: bio || undefined
          });
          console.log("Selected class IDs:", selectedClasses);
          console.log("Selected subject IDs:", selectedSubjects);
          console.log("Selected section IDs (tracked in UI but not sent to API):", selectedSections);
          
          response = await userAPI.updateTeacher(teacherToEdit.id, teacherData);
          console.log("Teacher data updated successfully");
          
          // Handle profile picture upload separately
          if (profilePicture) {
            try {
              console.log("Uploading profile picture for existing teacher");
              await userAPI.uploadTeacherProfilePicture(teacherToEdit.id, profilePicture);
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
          console.log("Creating teacher with data:", {
            name,
            email,
            gender,
            contactNo,
            emergencyContact,
            dateOfBirth: formatDateForAPI(dateOfBirth),
            joinDate: formatDateForAPI(joinDate),
            designation: {
              connect: {
                id: Number(designationId)
              }
            },
            bio: bio || undefined
          });
          console.log("Selected class IDs:", selectedClasses);
          console.log("Selected subject IDs:", selectedSubjects);
          console.log("Selected section IDs (tracked in UI but not sent to API):", selectedSections);
          
          response = await userAPI.createTeacher({
            email,
            ...teacherData
          });
          console.log("Teacher created successfully");
          
          // Handle profile picture upload if present - in a separate try/catch
          if (profilePicture && response.data?.data?.teacher?.id) {
            try {
              const teacherId = response.data.data.teacher.id;
              await userAPI.uploadTeacherProfilePicture(teacherId, profilePicture);
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
          
          {/* Classes and Subjects Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Classes and Subjects</h2>
            
            {/* Classes Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Classes
              </label>
              {loadingClasses ? (
                <div className="text-gray-500">Loading classes...</div>
              ) : classes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {classes.map(cls => (
                    <div key={cls.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`class-${cls.id}`}
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`class-${cls.id}`} className="text-sm">
                        {cls.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-yellow-600 text-sm">
                  No classes available. Please add classes first.
                </div>
              )}
            </div>
            
            {/* Sections Selection */}
            {selectedClasses.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Sections
                </label>
                <div className="space-y-3">
                  {selectedClasses.map(classId => {
                    const classData = classes.find(c => c.id === classId);
                    const availableSections = classSections[classId] || [];
                    
                    return (
                      <div key={`sections-${classId}`} className="border p-3 rounded-md">
                        <h3 className="font-medium text-sm mb-2">{classData?.name} Sections:</h3>
                        {loadingSections && !classSections[classId] ? (
                          <div className="text-gray-500 text-sm">Loading sections...</div>
                        ) : availableSections.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {availableSections.map(section => (
                              <div key={section.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`section-${section.id}`}
                                  checked={selectedSections.includes(section.id)}
                                  onChange={() => handleSectionToggle(section.id)}
                                  className="mr-2"
                                />
                                <label htmlFor={`section-${section.id}`} className="text-sm">
                                  {section.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-yellow-600 text-sm">
                            No sections available for this class.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Subjects Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Subjects
                {selectedClasses.length > 0 ? ' (Filtered by selected classes)' : ' (Please select a class first)'}
              </label>
              {loadingSubjects ? (
                <div className="text-gray-500">Loading subjects...</div>
              ) : subjects.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`subject-${subject.id}`}
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={() => handleSubjectToggle(subject.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`subject-${subject.id}`} className="text-sm">
                        {subject.name} ({subject.code})
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-yellow-600 text-sm">
                  {selectedClasses.length > 0 
                    ? 'No subjects available for the selected classes. Please assign subjects to these classes first.'
                    : 'Please select a class to view available subjects.'}
                </div>
              )}
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