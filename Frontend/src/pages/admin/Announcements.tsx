import React, { useState, useEffect } from 'react';
import {  FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { announcementAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface AnnouncementAttachment {
  name: string;
  url: string;
  type: string;
}

// Interface for API response data structure
interface AnnouncementData {
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
  targetClasses?: string[];
  targetSections?: string[];
  attachments?: AnnouncementAttachment[];
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
  attachments: AnnouncementAttachment[];
}

const Announcements: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await announcementAPI.getAll();

        if (response.data?.status === 'success' && response.data?.data) {
          // Type as API response type first, then process into our component's Announcement type
          const apiAnnouncements = response.data.data as unknown as AnnouncementData[];

          const formattedAnnouncements: Announcement[] = [];

          // Map the API data to our component's Announcement type
          for (const announcement of apiAnnouncements) {
            formattedAnnouncements.push({
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
            });
          }

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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const response = await announcementAPI.delete(id.toString());

        if (response.data?.status === 'success') {
          setAnnouncements(announcements.filter(a => a.id !== id));
          toast.success('Announcement deleted successfully');
        } else {
          toast.error('Failed to delete announcement');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Error deleting announcement');
      }
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/announcements/create-announcement?id=${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/announcements/${id}`);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/announcements/create-announcement')}
        >
          Create Announcement
        </Button>

      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-100 text-red-700">
            {error}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No announcements found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnnouncements.map(announcement => (
                <tr key={announcement.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                    <div className="text-sm text-gray-500">{announcement.content.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{announcement.createdBy.name}</div>
                    <div className="text-sm text-gray-500">{announcement.createdBy.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {announcement.targetClasses.join(', ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Sections: {announcement.targetSections.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {announcement.isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleView(announcement.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(announcement.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Announcements; 