import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaPaperclip} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { UserRole } from '../../utils/roles';
import { announcementAPI } from '../../services/api';
import { toast } from 'react-toastify';

// Interface for API response data structure
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
  targetClasses?: string[];
  targetSections?: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

// Interface for the component's state
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
  targetClasses: string[];
  targetSections: string[];
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
}

const AnnouncementView: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const response = await announcementAPI.getAll();
                
                if (response.data?.status === 'success' && response.data?.data) {
                    // Type as API response type first, then process into our known Announcement type
                    const apiAnnouncements = response.data.data as unknown as AnnouncementData[];
                    
                    const formattedAnnouncements: Announcement[] = apiAnnouncements.map(announcement => ({
                        id: announcement.id,
                        title: announcement.title,
                        content: announcement.content,
                        priority: announcement.priority,
                        createdAt: announcement.createdAt,
                        expiresAt: announcement.expiresAt,
                        isActive: announcement.isActive,
                        createdBy: announcement.createdBy,
                        targetClasses: announcement.targetClasses || [],
                        targetSections: announcement.targetSections || [],
                        attachments: announcement.attachments || []
                    }));
                    
                    setAnnouncements(formattedAnnouncements);
                } else {
                    setError('Failed to load announcements');
                    toast.error('Failed to load announcements');
                }
            } catch (error) {
                console.error('Error fetching announcements:', error);
                setError('Error loading announcements. Please try again later.');
                toast.error('Error loading announcements');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && announcement.isActive) ||
            (filter === 'expired' && !announcement.isActive);

        const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;

        const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.content.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesPriority && matchesSearch;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full p-4 bg-[#EEF5FF]">
            <div className="w-full bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
                    {user?.role === UserRole.TEACHER && (
                        <Button
                            variant="primary"
                            onClick={() => navigate('/announcements/create')}
                        >
                            Create Announcement
                        </Button>
                    )}
                    {user?.role === UserRole.ADMIN && (
                        <Button
                            variant="primary"
                            onClick={() => navigate('/admin/announcements/create-announcement')}
                        >
                            Create Announcement
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as typeof filter)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="all">All</option>
                            <option value="LOW">Low</option>
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search announcements..."
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>

                <div className="w-full">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-gray-500">Loading announcements...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded">
                            {error}
                        </div>
                    ) : filteredAnnouncements.length === 0 ? (
                        <div className="bg-blue-50 p-8 rounded text-center">
                            <p className="text-gray-600">No announcements found.</p>
                        </div>
                    ) : (
                        filteredAnnouncements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="mb-4 cursor-pointer transition-transform hover:scale-[1.02]"
                                onClick={() => setSelectedAnnouncement(announcement)}
                            >
                                <div className="bg-[#292648] text-white p-3 rounded-t">
                                    <h3 className="font-medium">{announcement.title}</h3>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-b">
                                    <p className="text-gray-700 font-medium mb-2">
                                        {formatDate(announcement.createdAt)}
                                        {announcement.expiresAt && ` - Expires: ${formatDate(announcement.expiresAt)}`}
                                    </p>
                                    <p className="text-gray-600 whitespace-pre-line">{announcement.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal for detailed view */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedAnnouncement.title}</h2>
                                <Button
                                    variant="primary"
                                    onClick={() => setSelectedAnnouncement(null)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaCalendarAlt />
                                    <span>Created: {formatDate(selectedAnnouncement.createdAt)}</span>
                                </div>
                                {selectedAnnouncement.expiresAt && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaCalendarAlt />
                                        <span>Expires: {formatDate(selectedAnnouncement.expiresAt)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaUser />
                                    <span>{selectedAnnouncement.createdBy.name} ({selectedAnnouncement.createdBy.role})</span>
                                </div>
                                <div className="text-gray-600">
                                    <span className="font-medium">Target: </span>
                                    {selectedAnnouncement.targetClasses.join(', ')}
                                    {selectedAnnouncement.targetSections.length > 0 && ` - Sections: ${selectedAnnouncement.targetSections.join(', ')}`}
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-gray-700 whitespace-pre-line">{selectedAnnouncement.content}</p>
                                </div>

                                {selectedAnnouncement.attachments.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Attachments</h3>
                                        <div className="space-y-2">
                                            {selectedAnnouncement.attachments.map((attachment, index) => (
                                                <a
                                                    key={index}
                                                    href={attachment.url}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaPaperclip />
                                                    {attachment.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementView; 