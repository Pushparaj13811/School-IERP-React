import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../../services/api';
import HolidayForm from '../../components/holiday/HolidayForm';
import HolidayTypeForm from '../../components/holiday/HolidayTypeForm';
import Button from '../../components/ui/Button';

// Types
interface Holiday {
    id: number;
    name: string;
    description: string | null;
    fromDate: string;
    toDate: string;
    holidayTypeId: number;
    isRecurring: boolean;
    recurrencePattern: string | null;
    holidayType: {
        id: number;
        name: string;
    };
}

interface HolidayType {
    id: number;
    name: string;
    description: string | null;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    pageSize: number;
}

// Delete Confirmation Modal
const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, title, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Confirm Delete</h2>
                </div>

                <div className="p-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete "{title}"? This action cannot be undone.
                    </p>
                </div>

                <div className="bg-gray-50 px-4 py-3 flex justify-end border-t">
                    <Button
                        type="button"
                        variant="outline"
                        className="bg-white text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm mr-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        className={`text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isDeleting
                            ? 'bg-red-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                            }`}
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </span>
                        ) : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const HolidayManagement: React.FC = () => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [holidayTypes, setHolidayTypes] = useState<HolidayType[]>([]);
    const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        pageSize: 10
    });

    // Add new state variables
    const [activeTab, setActiveTab] = useState<'holidays' | 'holidayTypes'>('holidays');
    const [showHolidayForm, setShowHolidayForm] = useState(false);
    const [showHolidayTypeForm, setShowHolidayTypeForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteTypeModal, setShowDeleteTypeModal] = useState(false);
    const [selectedHolidayType, setSelectedHolidayType] = useState<HolidayType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchHolidays = async (page = 1) => {
        setIsSubmitting(true);
        try {
            const response = await api.get<ApiResponse<{
                holidays: Holiday[],
                pagination: PaginationInfo
            }>>(`/holidays?page=${page}`);

            if (response.data.success) {
                setHolidays(response.data.data.holidays);
                setPagination(response.data.data.pagination);
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error('Error fetching holidays:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchHolidayTypes = async () => {
        try {
            const response = await api.get<ApiResponse<{ holidayTypes: HolidayType[] }>>('/holidays/types');
            if (response.data.success) {
                setHolidayTypes(response.data.data.holidayTypes);
            }
        } catch (err) {
            console.error('Error fetching holiday types:', err);
            toast.error('Failed to fetch holiday types');
        }
    };

    useEffect(() => {
        fetchHolidays();
        fetchHolidayTypes();
    }, []);

    const handlePageChange = (newPage: number) => {
        fetchHolidays(newPage);
    };

    const deleteHoliday = async () => {
        if (!selectedHoliday) return;

        setIsDeleting(true);
        try {
            const response = await api.delete<ApiResponse<null>>(`/holidays/${selectedHoliday.id}`);

            if (response.data.success) {
                toast.success('Holiday deleted successfully');

                // Refresh the list
                fetchHolidays(pagination.currentPage);
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error('Error deleting holiday:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to delete holiday');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const saveHoliday = async (data: Omit<Holiday, 'id' | 'holidayType'>) => {
        setIsSubmitting(true);
        try {
            let response;

            if (selectedHoliday) {
                // Update existing holiday
                response = await api.put<ApiResponse<{ holiday: Holiday }>>(`/holidays/${selectedHoliday.id}`, data);
            } else {
                // Create new holiday
                response = await api.post<ApiResponse<{ holiday: Holiday }>>('/holidays', data);
            }

            if (response.data.success) {
                toast.success(selectedHoliday ? 'Holiday updated successfully' : 'Holiday created successfully');

                // Refresh the list
                fetchHolidays(pagination.currentPage);
                setShowHolidayForm(false);
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error('Error saving holiday:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to save holiday');
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveHolidayType = async (name: string, color: string) => {
        setIsSubmitting(true);
        try {
            const response = await api.post<ApiResponse<{ holidayType: HolidayType }>>('/holidays/types', {
                name,
                color
            });

            if (response.data.success) {
                toast.success('Holiday type created successfully');

                // Refresh the list
                fetchHolidayTypes();
                setShowHolidayTypeForm(false);
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error('Error saving holiday type:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to save holiday type');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteHolidayType = async (id: number) => {
        setIsDeleting(true);
        try {
            const response = await api.delete<ApiResponse<null>>(`/holidays/types/${id}`);

            if (response.data.success) {
                toast.success('Holiday type deleted successfully');

                // Refresh the list
                fetchHolidayTypes();
            } else {
                console.error(response.data.message);
            }
        } catch (err) {
            console.error('Error deleting holiday type:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to delete holiday type');
        } finally {
            setIsDeleting(false);
            setShowDeleteTypeModal(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Holiday Management</h1>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-5">
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => setActiveTab('holidays')}
                        >
                            Holidays
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => setActiveTab('holidayTypes')}
                        >
                            Holiday Types
                        </Button>
                    </nav>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'holidays' ? (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Holidays List</h2>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setSelectedHoliday(null);
                                setShowHolidayForm(true);
                            }}
                        >
                            Add Holiday
                        </Button>
                    </div>

                    {/* Holiday list */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Recurring
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {holidays.length > 0 ? (
                                        holidays.map((holiday) => (
                                            <tr key={holiday.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {holiday.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(holiday.fromDate), 'MMM dd, yyyy')}
                                                    {holiday.fromDate !== holiday.toDate &&
                                                        ` - ${format(new Date(holiday.toDate), 'MMM dd, yyyy')}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {holiday.holidayType?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {holiday.isRecurring ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            No
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => {
                                                            setSelectedHoliday(holiday);
                                                            setShowHolidayForm(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => {
                                                            setSelectedHoliday(holiday);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No holidays found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                                        </span>{' '}
                                        of <span className="font-medium">{pagination.totalItems}</span> results
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.currentPage === pagination.totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Holiday Types tab content */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Holiday Types</h2>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setSelectedHolidayType(null);
                                setShowHolidayTypeForm(true);
                            }}
                        >
                            Add Holiday Type
                        </Button>
                    </div>

                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {holidayTypes.map((type) => (
                                        <tr key={type.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {type.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {type.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setSelectedHolidayType(type);
                                                        setShowHolidayTypeForm(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => {
                                                        setSelectedHolidayType(type);
                                                        setShowDeleteTypeModal(true);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Holiday Form Modal */}
            <HolidayForm
                isOpen={showHolidayForm}
                onClose={() => setShowHolidayForm(false)}
                holiday={selectedHoliday}
                holidayTypes={holidayTypes}
                onSave={saveHoliday}
                isSubmitting={isSubmitting}
            />

            {/* Holiday Type Form */}
            <HolidayTypeForm
                isOpen={showHolidayTypeForm}
                onClose={() => setShowHolidayTypeForm(false)}
                onSave={saveHolidayType}
                isSubmitting={isSubmitting}
                holidayType={selectedHolidayType}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={deleteHoliday}
                isDeleting={isDeleting}
                title="Delete Holiday"
            />

            {/* Delete Holiday Type Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteTypeModal}
                onClose={() => setShowDeleteTypeModal(false)}
                onConfirm={() => deleteHolidayType(selectedHolidayType?.id || 0)}
                isDeleting={isDeleting}
                title="Delete Holiday Type"
            />
        </div>
    );
};

export default HolidayManagement; 