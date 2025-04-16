import React, { useState, useEffect } from 'react';    
import { FaPaperPlane, FaTimes, FaUpload } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { academicAPI, announcementAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Class, Section } from '../../types/api';

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
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Target audience state
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  
  const [classSections, setClassSections] = useState<Record<number, Section[]>>({});
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  
  const [targetTeachersOnly, setTargetTeachersOnly] = useState(false);
  const [targetAll, setTargetAll] = useState(false);
  
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
  
  // Handle target audience options
  const handleTargetTeachersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetTeachersOnly(e.target.checked);
    if (e.target.checked) {
      setTargetAll(false);
    }
  };
  
  const handleTargetAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetAll(e.target.checked);
    if (e.target.checked) {
      setTargetTeachersOnly(false);
      setSelectedClasses([]);
      setSelectedSections([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare target roles array
      const targetRoles: string[] = [];
      if (targetTeachersOnly) {
        targetRoles.push('TEACHER');
      } else if (!targetAll && selectedClasses.length === 0) {
        // If no specific target is selected, default to all
        setTargetAll(true);
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
        targetRoles,
        attachments: attachments.map(attachment => ({
          name: attachment.name,
          url: URL.createObjectURL(attachment.file), // For demo purposes
          type: attachment.type,
          size: attachment.size
        }))
      };
      
      const response = await announcementAPI.create(announcementData);
      
      if (response.data?.status === 'success') {
        setSubmitStatus('success');
        toast.success('Announcement published successfully!');
        
        // Reset form
        setTitle('');
        setContent('');
        setPriority('NORMAL');
        setExpiresAt('');
        setSelectedClasses([]);
        setSelectedSections([]);
        setAttachments([]);
        setTargetTeachersOnly(false);
        setTargetAll(false);
        
        // Navigate back to announcements page
        setTimeout(() => {
          navigate('/announcements');
        }, 2000);
      } else {
        throw new Error('Failed to publish announcement');
      }
    } catch (error) {
      console.error('Error publishing announcement:', error);
      setSubmitStatus('error');
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Expiry Date (Optional)
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="target-all"
                checked={targetAll}
                onChange={handleTargetAllChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="target-all" className="text-sm text-gray-700">
                All users (Students, Teachers, Parents, Admin)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="target-teachers"
                checked={targetTeachersOnly}
                onChange={handleTargetTeachersChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="target-teachers" className="text-sm text-gray-700">
                Teachers only
              </label>
            </div>
          </div>
          
          {!targetAll && !targetTeachersOnly && (
            <div className="mt-4 space-y-4">
              {classesLoading ? (
                <div className="text-gray-500">Loading classes...</div>
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
                            <div className="text-gray-500 text-sm">Loading sections...</div>
                          ) : classSections[cls.id]?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {classSections[cls.id]?.map(section => (
                                <label key={section.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedSections.includes(section.id)}
                                    onChange={() => handleSectionChange(section.id)}
                                    className="rounded"
                                  />
                                  <span>Section {section.name}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="text-yellow-600 text-sm">
                              No sections available for this class.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <label className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 flex items-center gap-2">
              <FaUpload />
              Upload File
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
            </label>
            <span className="text-sm text-gray-500">
              Upload documents, images, or any other relevant files
            </span>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="truncate max-w-md">{file.name}</span>
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
            variant="primary"
            type="submit"
            disabled={isSubmitting}
          >
            <FaPaperPlane className="mr-2" />
            {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
          </Button>
        </div>
      </form>

      {submitStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          Announcement published successfully!
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error publishing announcement. Please try again.
        </div>
      )}
    </div>
  );
};

export default CreateAnnouncement; 