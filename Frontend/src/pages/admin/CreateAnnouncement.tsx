import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaTimes, FaUpload } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { academicAPI, announcementAPI } from '../../services/api';
import { Class, Section } from '../../types/api';
import { UserRole } from '../../utils/roles';

interface Attachment {
  name: string;
  file: File;
  type: string;
  size: number;
  url?: string;
}

interface AnnouncementData {
    id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdBy: {
    name: string;
    role: string;
  };
  targetClasses?: { id: number; name: string }[];
  targetSections?: { id: number; name: string }[];
  targetRoles?: string[];
  attachments?: {
    id: number;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

const CreateAnnouncement: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const announcementId = queryParams.get('id');
    const isEditMode = !!announcementId;
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
    const [expiresAt, setExpiresAt] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);
    
    // Target audience state
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [classesLoading, setClassesLoading] = useState(true);
    
    const [classSections, setClassSections] = useState<Record<number, Section[]>>({});
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    
    // Fetch announcement data when in edit mode
    useEffect(() => {
        if (isEditMode && announcementId) {
            const fetchAnnouncementData = async () => {
                try {
                    setIsLoading(true);
                    const response = await announcementAPI.getById(announcementId);
                    
                    if (response.data?.status === 'success' && response.data?.data) {
                        // Convert to unknown first, then to AnnouncementData
                        const announcement = response.data.data as unknown as AnnouncementData;
                        
                        // Set basic announcement data
                        setTitle(announcement.title);
                        setContent(announcement.content);
                        setPriority(announcement.priority);
                        
                        // Format and set expiry date if it exists
                        if (announcement.expiresAt) {
                            // Format the date to YYYY-MM-DDThh:mm format for datetime-local input
                            const date = new Date(announcement.expiresAt);
                            const formattedDate = date.toISOString().slice(0, 16);
                            setExpiresAt(formattedDate);
                        }
                        
                        // Set target classes
                        if (announcement.targetClasses && announcement.targetClasses.length > 0) {
                            const classIds = announcement.targetClasses.map(cls => cls.id);
                            setSelectedClasses(classIds);
                            
                            // Fetch sections for each selected class
                            for (const classId of classIds) {
                                fetchSectionsForClass(classId);
                            }
                        }
                        
                        // Set target sections
                        if (announcement.targetSections && announcement.targetSections.length > 0) {
                            setSelectedSections(announcement.targetSections.map(section => section.id));
                        }
                        
                        // Set target roles if they exist
                        if (announcement.targetRoles && announcement.targetRoles.length > 0) {
                            const roles = announcement.targetRoles.map(role => {
                                // Convert uppercase role (e.g., 'STUDENT') to UserRole enum value (e.g., UserRole.STUDENT)
                                const normalizedRole = role.toLowerCase() as Lowercase<typeof role>;
                                return UserRole[normalizedRole.toUpperCase() as keyof typeof UserRole];
                            }).filter(Boolean);
                            
                            setSelectedRoles(roles);
                        }
                        
                        // Handle attachments if they exist
                        // Note: For existing attachments, we can't get the file object
                        // but we can display them and allow for deleting them
                        if (announcement.attachments && announcement.attachments.length > 0) {
                            // We'll create a representation of existing attachments
                            const existingAttachments: Attachment[] = announcement.attachments.map(
                                attachment => ({
                                    name: attachment.name,
                                    type: attachment.type,
                                    size: attachment.size,
                                    url: attachment.url,
                                    // This is a hack as we can't get the actual File object for existing attachments
                                    file: new File([], attachment.name, { type: attachment.type }),
                                })
                            );
                            setAttachments(existingAttachments);
                        }
                        
                    } else {
                        toast.error('Failed to load announcement data');
                        // Navigate back on error
                        navigate('/announcements');
                    }
                } catch (error) {
                    console.error('Error fetching announcement data:', error);
                    toast.error('Error loading announcement data');
                    // Navigate back on error
                    navigate('/announcements');
                } finally {
                    setIsLoading(false);
                }
            };
            
            fetchAnnouncementData();
        }
    }, [announcementId, isEditMode, navigate]);
    
    // Fetch classes when component mounts
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setClassesLoading(true);
                const response = await academicAPI.getClasses();
                
                if (response.data?.status === 'success' && response.data?.data?.classes) {
                    setClasses(response.data.data.classes);
                } else {
                    toast.error('Failed to load classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                toast.error('Failed to load classes');
            } finally {
                setClassesLoading(false);
            }
        };
        
        fetchClasses();
    }, []);
    
    // Fetch sections when a class is selected
    const fetchSectionsForClass = async (classId: number) => {
        try {
            setSectionsLoading(true);
            const response = await academicAPI.getSections(classId);
            
            if (response.data?.status === 'success' && response.data?.data?.sections) {
                setClassSections(prev => ({
                    ...prev,
                    [classId]: response.data.data.sections
                }));
            } else {
                toast.error(`Failed to load sections for class ID ${classId}`);
            }
        } catch (error) {
            console.error(`Error fetching sections for class ID ${classId}:`, error);
            toast.error('Failed to load sections');
        } finally {
            setSectionsLoading(false);
        }
    };
    
    // Handle class toggle
    const handleClassChange = (classId: number) => {
        setSelectedClasses(prev => {
            const isSelected = prev.includes(classId);
            const newSelectedClasses = isSelected 
                ? prev.filter(id => id !== classId)
                : [...prev, classId];
            
            // If we're adding a class, fetch its sections
            if (!isSelected && !classSections[classId]) {
                fetchSectionsForClass(classId);
            }
            
            // If we're removing a class, also remove its sections
            if (isSelected) {
        setSelectedSections(prev =>
            prev.filter(sectionId =>
                        !classSections[classId]?.some(section => section.id === sectionId)
            )
        );
            }
            
            return newSelectedClasses;
        });
    };

    // Handle section toggle
    const handleSectionChange = (sectionId: number) => {
        setSelectedSections(prev => 
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };
    
    // Handle role toggle
    const handleRoleChange = (role: UserRole) => {
        setSelectedRoles(prev => {
            if (prev.includes(role)) {
                return prev.filter(r => r !== role);
            }
            return [...prev, role];
        });
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newAttachments = Array.from(e.target.files).map(file => ({
                name: file.name,
                file,
                type: file.type,
                size: file.size
            }));
            
            setAttachments(prev => [...prev, ...newAttachments]);
            
            // Clear the input value so the same file can be selected again
            e.target.value = '';
        }
    };

    const removeFile = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Validate form
            if (selectedRoles.length === 0 && selectedClasses.length === 0) {
                toast.error('Please select at least one target audience (roles or classes)');
                setIsSubmitting(false);
                return;
            }
            
            // Prepare the targetRoles to match the backend's expected Role enum
            // Convert from lowercase (e.g., 'student') to uppercase (e.g., 'STUDENT')
            const formattedRoles = selectedRoles.map(role => role.toUpperCase());
            
            let response;
            
            if (isEditMode && announcementId) {
                // Check if there are new attachments to upload (without URLs)
                const newAttachments = attachments.filter(a => !a.url || !a.url.startsWith('http'));
                
                if (newAttachments.length > 0) {
                    // If there are new files to upload, use FormData but with special handling for arrays
                    const formData = new FormData();
                    
                    // Add basic announcement data
                    formData.append('title', title);
                    formData.append('content', content);
                    formData.append('priority', priority);
                    
                    if (expiresAt) {
                        formData.append('expiresAt', expiresAt);
                    }
                    
                    // For arrays, append each item individually with array notation in the key
                    // This is the correct way to handle arrays in FormData for most backends
                    selectedClasses.forEach((classId, index) => {
                        formData.append(`targetClassIds[${index}]`, classId.toString());
                    });
                    
                    selectedSections.forEach((sectionId, index) => {
                        formData.append(`targetSectionIds[${index}]`, sectionId.toString());
                    });
                    
                    formattedRoles.forEach((role, index) => {
                        formData.append(`targetRoles[${index}]`, role);
                    });
                    
                    // Add new attachment files
                    newAttachments.forEach(attachment => {
                        formData.append('attachments', attachment.file);
                    });
                    
                    // Update existing announcement with files
                    response = await announcementAPI.updateWithFiles(announcementId, formData);
                } else {
                    // No new files, use regular JSON
                    const updateData = {
                        title,
                        content,
                        priority,
                        expiresAt: expiresAt || undefined,
                        targetClassIds: selectedClasses,
                        targetSectionIds: selectedSections,
                        targetRoles: formattedRoles
                    };
                    
                    // Update existing announcement without files
                    response = await announcementAPI.update(announcementId, updateData);
                }
                
                if (response.data?.status === 'success') {
                    toast.success('Announcement updated successfully!');
                }
            } else {
                // For create requests, use FormData as before
                const formData = new FormData();
                
                // Add basic announcement data
                formData.append('title', title);
                formData.append('content', content);
                formData.append('priority', priority);
                
                if (expiresAt) {
                    formData.append('expiresAt', expiresAt);
                }
                
                // For create requests, append each item separately
                selectedClasses.forEach(classId => {
                    formData.append('targetClassIds', classId.toString());
                });
                
                selectedSections.forEach(sectionId => {
                    formData.append('targetSectionIds', sectionId.toString());
                });
                
                formattedRoles.forEach(role => {
                    formData.append('targetRoles', role);
                });
                
                // Add attachments
                attachments.forEach(attachment => {
                    // Only append new files (not existing ones with URLs)
                    if (!attachment.url || !attachment.url.startsWith('http')) {
                        formData.append('attachments', attachment.file);
                    }
                });
                
                // Create new announcement
                response = await announcementAPI.create(formData);
                if (response.data?.status === 'success') {
                    toast.success('Announcement published successfully!');
                }
            }
            
            if (response?.data?.status === 'success') {
                // Reset form
                setTitle('');
                setContent('');
                setPriority('NORMAL');
                setExpiresAt('');
                setSelectedClasses([]);
                setSelectedSections([]);
                setSelectedRoles([]);
                setAttachments([]);
                
                // Navigate back to announcements page
                setTimeout(() => {
                    navigate('/announcements');
                }, 2000);
            } else {
                throw new Error(isEditMode ? 'Failed to update announcement' : 'Failed to publish announcement');
            }
        } catch (error) {
            console.error(isEditMode ? 'Error updating announcement:' : 'Error publishing announcement:', error);
            toast.error(isEditMode ? 'Failed to update announcement. Please try again.' : 'Failed to publish announcement. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Announcement' : 'Create Announcement'}</h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500">Loading announcement data...</p>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border rounded-md h-32"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={priority}
                                onChange={(e) => setPriority(e.target.value as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="LOW">Low</option>
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expires At
                        </label>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                    </label>
                    <div className="space-y-4">
                        {/* Role-based targeting */}
                        <div className="border rounded-md p-4">
                            <h3 className="font-medium mb-2">Select Roles</h3>
                            <div className="space-y-2">
                                    {Object.values(UserRole).map((role) => (
                                    <label key={role} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(role)}
                                            onChange={() => handleRoleChange(role)}
                                            className="rounded"
                                        />
                                            <span>{role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Class and Section targeting */}
                        <div className="border rounded-md p-4">
                            <h3 className="font-medium mb-2">Select Classes and Sections</h3>
                                {classesLoading ? (
                                    <p className="text-gray-500">Loading classes...</p>
                                ) : (
                            <div className="space-y-4">
                                        {classes.map(cls => (
                                    <div key={cls.id} className="border rounded-md p-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedClasses.includes(cls.id)}
                                                onChange={() => handleClassChange(cls.id)}
                                                className="rounded"
                                            />
                                            <span className="font-medium">{cls.name}</span>
                                        </label>
                                        {selectedClasses.includes(cls.id) && (
                                            <div className="ml-6 mt-2 space-y-2">
                                                        {sectionsLoading && !classSections[cls.id] ? (
                                                            <p className="text-gray-500">Loading sections...</p>
                                                        ) : (
                                                            classSections[cls.id]?.map(section => (
                                                    <label key={section.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSections.includes(section.id)}
                                                            onChange={() => handleSectionChange(section.id)}
                                                            className="rounded"
                                                        />
                                                        <span>Section {section.name}</span>
                                                    </label>
                                                            ))
                                                        )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 flex items-center gap-2">
                            <FaUpload />
                            Upload Files
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                            {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between border rounded-md p-2 pr-4">
                                        <span className="truncate">{file.name}</span>
                                        <button
                                            type="button"
                                        onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTimes />
                                        </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                            className="flex items-center gap-2"
                    >
                        <FaPaperPlane />
                            {isSubmitting 
                                ? (isEditMode ? 'Updating...' : 'Publishing...') 
                                : (isEditMode ? 'Update Announcement' : 'Publish Announcement')
                            }
                    </Button>
                </div>
            </form>
            )}
        </div>
    );
};

export default CreateAnnouncement; 