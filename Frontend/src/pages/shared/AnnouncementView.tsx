import React, { useState } from 'react';
import { FaCalendarAlt, FaUser, FaPaperclip} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { UserRole } from '../../utils/roles';

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

// Dummy data - replace with API calls
const dummyAnnouncements: Announcement[] = [
    {
        id: 1,
        title: 'Annual Day Celebration',
        content: 'The school will be organizing its annual day celebration on December 15th. All students are required to participate in the cultural programs. The event will start at 9:00 AM and end at 4:00 PM. Parents are cordially invited to attend the celebration.',
        priority: 'HIGH',
        createdAt: '2024-02-20T10:00:00',
        expiresAt: '2024-12-15T23:59:59',
        isActive: true,
        createdBy: {
            name: 'John Doe',
            role: 'Admin'
        },
        targetClasses: ['Class 9', 'Class 10'],
        targetSections: ['A', 'B'],
        attachments: [
            { name: 'Annual Day Schedule.pdf', url: '#', type: 'application/pdf' }
        ]
    },
    {
        id: 2,
        title: 'Parent-Teacher Meeting',
        content: 'Parent-teacher meeting for Class 10 students will be held on February 25th. The meeting will be conducted in the school auditorium from 10:00 AM to 2:00 PM. Parents are requested to bring their child\'s progress report.',
        priority: 'NORMAL',
        createdAt: '2024-02-19T14:30:00',
        expiresAt: '2024-02-25T17:00:00',
        isActive: true,
        createdBy: {
            name: 'Jane Smith',
            role: 'Teacher'
        },
        targetClasses: ['Class 10'],
        targetSections: ['All'],
        attachments: []
    }
];

const AnnouncementView: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const filteredAnnouncements = dummyAnnouncements.filter(announcement => {
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
                    {filteredAnnouncements.map((announcement) => (
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
                    ))}
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