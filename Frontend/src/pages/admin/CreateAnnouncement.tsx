import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateAnnouncement: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
    const [expiresAt, setExpiresAt] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Target audience state
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [classesLoading, setClassesLoading] = useState(true);
    
    const [classSections, setClassSections] = useState<Record<number, Section[]>>({});
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    
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
            
            // For now, we're not handling file uploads in this example
            // In a real implementation, you would upload files to a server/cloud storage
            // and then include the URLs in the announcement data
            
            const announcementData = {
                title,
                content,
                priority,
                expiresAt: expiresAt || undefined,
                targetClassIds: selectedClasses,
                targetSectionIds: selectedSections,
                targetRoles: selectedRoles,
                attachments: attachments.map(attachment => ({
                    name: attachment.name,
                    url: URL.createObjectURL(attachment.file), // For demo purposes
                    type: attachment.type,
                    size: attachment.size
                }))
            };
            
            const response = await announcementAPI.create(announcementData);
            
            if (response.data?.status === 'success') {
                toast.success('Announcement published successfully!');
                
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
                    navigate('/admin/announcements');
                }, 2000);
            } else {
                throw new Error('Failed to publish announcement');
            }
        } catch (error) {
            console.error('Error publishing announcement:', error);
            toast.error('Failed to publish announcement. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Create Announcement</h1>

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
                        {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateAnnouncement; 