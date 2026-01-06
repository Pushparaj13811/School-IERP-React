import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

interface Section {
    id: number;
    name: string;
    classId: number;
}

interface Class {
    id: number;
    name: string;
    sections: Section[];
    _count?: {
        students: number;
        sections: number;
    };
}

const ClassesManagement: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [newClassName, setNewClassName] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response: { data: { data: { classes: Class[] } | Class[] } } = await api.get('/academic/classes');
            if (response.data?.data && 'classes' in response.data.data) {
                setClasses(response.data.data.classes);
            } else if (Array.isArray(response.data?.data)) {
                setClasses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) {
            toast.error('Please enter a class name');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/academic/classes', { name: newClassName.trim() });
            toast.success('Class added successfully');
            setNewClassName('');
            setShowAddModal(false);
            fetchClasses();
        } catch (error: any) {
            console.error('Error adding class:', error);
            toast.error(error.response?.data?.message || 'Failed to add class');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass || !newClassName.trim()) {
            toast.error('Please enter a class name');
            return;
        }

        try {
            setSubmitting(true);
            await api.patch(`/academic/classes/${selectedClass.id}`, { name: newClassName.trim() });
            toast.success('Class updated successfully');
            setNewClassName('');
            setShowEditModal(false);
            setSelectedClass(null);
            fetchClasses();
        } catch (error: any) {
            console.error('Error updating class:', error);
            toast.error(error.response?.data?.message || 'Failed to update class');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClass = async (classId: number) => {
        if (!window.confirm('Are you sure you want to delete this class? This will also delete all associated sections.')) {
            return;
        }

        try {
            await api.delete(`/academic/classes/${classId}`);
            toast.success('Class deleted successfully');
            fetchClasses();
        } catch (error: any) {
            console.error('Error deleting class:', error);
            toast.error(error.response?.data?.message || 'Failed to delete class');
        }
    };

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass || !newSectionName.trim()) {
            toast.error('Please enter a section name');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/sections', {
                name: newSectionName.trim(),
                classId: selectedClass.id
            });
            toast.success('Section added successfully');
            setNewSectionName('');
            setShowAddSectionModal(false);
            setSelectedClass(null);
            fetchClasses();
        } catch (error: any) {
            console.error('Error adding section:', error);
            toast.error(error.response?.data?.message || 'Failed to add section');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (classItem: Class) => {
        setSelectedClass(classItem);
        setNewClassName(classItem.name);
        setShowEditModal(true);
    };

    const openAddSectionModal = (classItem: Class) => {
        setSelectedClass(classItem);
        setNewSectionName('');
        setShowAddSectionModal(true);
    };

    const tableColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Class Name', accessor: 'name' },
        {
            header: 'Sections',
            accessor: (row: Class) => row.sections?.map(s => s.name).join(', ') || '-'
        },
        {
            header: 'Students',
            accessor: (row: Class) => row._count?.students || 0
        },
        {
            header: 'Actions',
            accessor: (row: Class) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => openAddSectionModal(row)}
                        className="!bg-transparent !border-none !p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 !rounded transition-colors"
                        title="Add Section"
                    >
                        <i className="bi bi-plus-circle text-lg"></i>
                    </button>
                    <button
                        onClick={() => openEditModal(row)}
                        className="!bg-transparent !border-none !p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 !rounded transition-colors"
                        title="Edit"
                    >
                        <i className="bi bi-pencil text-lg"></i>
                    </button>
                    <button
                        onClick={() => handleDeleteClass(row.id)}
                        className="!bg-transparent !border-none !p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 !rounded transition-colors"
                        title="Delete"
                    >
                        <i className="bi bi-trash text-lg"></i>
                    </button>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="w-full p-4 bg-[#EEF5FF] min-h-screen">
            <div className="w-full bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Classes Management</h2>
                    <Button
                        onClick={() => {
                            setNewClassName('');
                            setShowAddModal(true);
                        }}
                    >
                        <i className="bi bi-plus-lg mr-2"></i>
                        Add Class
                    </Button>
                </div>

                {classes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No classes found. Add a class to get started.
                    </div>
                ) : (
                    <Table
                        columns={tableColumns}
                        data={classes}
                        headerBackgroundColor="#292648"
                    />
                )}
            </div>

            {/* Add Class Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Class</h3>
                        <form onSubmit={handleAddClass}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Class Name
                                </label>
                                <input
                                    type="text"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="e.g., Class 1, Grade 10"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Adding...' : 'Add Class'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Class Modal */}
            {showEditModal && selectedClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Class</h3>
                        <form onSubmit={handleUpdateClass}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Class Name
                                </label>
                                <input
                                    type="text"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedClass(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Updating...' : 'Update'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Section Modal */}
            {showAddSectionModal && selectedClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add Section to {selectedClass.name}</h3>
                        <form onSubmit={handleAddSection}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Section Name
                                </label>
                                <input
                                    type="text"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="e.g., A, B, Morning"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAddSectionModal(false);
                                        setSelectedClass(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Adding...' : 'Add Section'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassesManagement;
