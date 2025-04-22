import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaPaperclip, FaArrowLeft } from 'react-icons/fa';
import { announcementAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../utils/roles';

interface AnnouncementAttachment {
  name: string;
  url: string;
  type: string;
}

interface ClassObject {
  id: number;
  name: string;
}

interface SectionObject {
  id: number;
  name: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdBy: {
    name: string;
    role: string;
  };
  targetClasses: string[] | ClassObject[];
  targetSections: string[] | SectionObject[];
  targetRoles?: string[];
  attachments: AnnouncementAttachment[];
}

const AnnouncementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await announcementAPI.getById(id);
        
        if (response.data?.status === 'success' && response.data?.data) {
          const announcementData = response.data.data as unknown as Announcement;
          setAnnouncement(announcementData);
        } else {
          setError('Failed to load announcement');
          toast.error('Failed to load announcement');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        setError('Error loading announcement. Please try again later.');
        toast.error('Error loading announcement');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncement();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    if (announcement) {
      navigate(`/announcements/create-announcement?id=${announcement.id}`);
    }
  };

  const handleBack = () => {
    navigate('/announcements');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="mb-4 flex items-center gap-2"
        >
          <FaArrowLeft /> Back to Announcements
        </Button>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading announcement...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            {error}
          </div>
        ) : announcement ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
              {user?.role === UserRole.ADMIN && (
                <Button
                  variant="primary"
                  onClick={handleEdit}
                >
                  Edit Announcement
                </Button>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaCalendarAlt />
                <span>Created: {formatDate(announcement.createdAt)}</span>
              </div>
              {announcement.expiresAt && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaCalendarAlt />
                  <span>Expires: {formatDate(announcement.expiresAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaUser />
                <span>{announcement.createdBy.name} ({announcement.createdBy.role})</span>
              </div>
              <div className="text-gray-600 mb-2">
                <span className="font-medium">Priority: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </span>
              </div>
              {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                <div className="text-gray-600 mb-2">
                  <span className="font-medium">Roles: </span>
                  {announcement.targetRoles.map(role => 
                    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
                  ).join(', ')}
                </div>
              )}
              <div className="text-gray-600">
                <span className="font-medium">Target: </span>
                {Array.isArray(announcement.targetClasses) && announcement.targetClasses.length > 0 ? (
                  announcement.targetClasses.map(cls => 
                    typeof cls === 'string' ? cls : cls.name
                  ).join(', ')
                ) : 'All Classes'}
                {Array.isArray(announcement.targetSections) && announcement.targetSections.length > 0 && (
                  ` - Sections: ${
                    announcement.targetSections.map(section => 
                      typeof section === 'string' ? section : section.name
                    ).join(', ')
                  }`
                )}
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line">{announcement.content}</p>
            </div>

            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <FaPaperclip /> Attachments
                </h3>
                <div className="space-y-2">
                  {announcement.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span>{attachment.name}</span>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-auto"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
            Announcement not found
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementDetail; 