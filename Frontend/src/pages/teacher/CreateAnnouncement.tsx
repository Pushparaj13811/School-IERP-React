import React, { useState } from 'react';    
import { FaPaperPlane, FaTimes, FaUpload } from 'react-icons/fa';
import Button from '../../components/ui/Button';
interface Class {
  id: number;
  name: string;
  sections: Section[];
}

interface Section {
  id: number;
  name: string;
}

// Dummy data - replace with API calls
const dummyClasses: Class[] = [
  {
    id: 1,
    name: 'Class 9',
    sections: [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ],
  },
  {
    id: 2,
    name: 'Class 10',
    sections: [
      { id: 4, name: 'A' },
      { id: 5, name: 'B' },
      { id: 6, name: 'C' },
    ],
  },
];

const CreateAnnouncement: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleClassChange = (classId: number) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      }
      return [...prev, classId];
    });
    // Clear sections when class is deselected
    setSelectedSections(prev => 
      prev.filter(sectionId => 
        dummyClasses.find(cls => 
          cls.sections.some(section => section.id === sectionId)
        )?.id === classId
      )
    );
  };

  const handleSectionChange = (sectionId: number) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      }
      return [...prev, sectionId];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      // Reset form
      setTitle('');
      setContent('');
      setPriority('NORMAL');
      setExpiresAt('');
      setSelectedClasses([]);
      setSelectedSections([]);
      setAttachments([]);
    } catch {
      setSubmitStatus('error');
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
              onChange={(e) => setPriority(e.target.value as typeof priority)}
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
            {dummyClasses.map(cls => (
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
                    {cls.sections.map(section => (
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
                )}
              </div>
            ))}
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
            <div className="mt-2 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span>{file.name}</span>
                  <Button
                    variant="secondary"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTimes />
                  </Button>
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
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'
                }`}
          >
            <FaPaperPlane />
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