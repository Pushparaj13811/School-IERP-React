import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

interface Class {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    code: string;
    description?: string;
    classes?: Class[];
}

const SubjectsManagement: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    });
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subjectsRes, classesRes] = await Promise.all([
                api.get('/subjects'),
                api.get('/academic/classes')
            ]);

            // Type the responses properly
            const subjectsResponse = subjectsRes as { data: { data: { subjects: Subject[] } | Subject[] } };
            const classesResponse = classesRes as { data: { data: { classes: Class[] } | Class[] } };

            if (subjectsResponse.data?.data && 'subjects' in subjectsResponse.data.data) {
                setSubjects(subjectsResponse.data.data.subjects);
            } else if (Array.isArray(subjectsResponse.data?.data)) {
                setSubjects(subjectsResponse.data.data);
            }

            if (classesResponse.data?.data && 'classes' in classesResponse.data.data) {
                setClasses(classesResponse.data.data.classes);
            } else if (Array.isArray(classesResponse.data?.data)) {
                setClasses(classesResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.code.trim()) {
            toast.error('Please enter subject name and code');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/subjects', {
                name: formData.name.trim(),
                code: formData.code.trim(),
                description: formData.description.trim() || undefined
            });
            toast.success('Subject added successfully');
            resetForm();
            setShowAddModal(false);
            fetchData();
        } catch (error: any) {
            console.error('Error adding subject:', error);
            toast.error(error.response?.data?.message || 'Failed to add subject');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject || !formData.name.trim() || !formData.code.trim()) {
            toast.error('Please enter subject name and code');
            return;
        }

        try {
            setSubmitting(true);
            await api.patch(`/subjects/${selectedSubject.id}`, {
                name: formData.name.trim(),
                code: formData.code.trim(),
                description: formData.description.trim() || undefined
            });
            toast.success('Subject updated successfully');
            resetForm();
            setShowEditModal(false);
            setSelectedSubject(null);
            fetchData();
        } catch (error: any) {
            console.error('Error updating subject:', error);
            toast.error(error.response?.data?.message || 'Failed to update subject');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSubject = async (subjectId: number) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) {
            return;
        }

        try {
            await api.delete(`/subjects/${subjectId}`);
            toast.success('Subject deleted successfully');
            fetchData();
        } catch (error: any) {
            console.error('Error deleting subject:', error);
            toast.error(error.response?.data?.message || 'Failed to delete subject');
        }
    };

    const handleAssignClasses = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject) {
            return;
        }

        try {
            setSubmitting(true);
            await api.post(`/subjects/${selectedSubject.id}/assign-classes`, {
                classIds: selectedClasses
            });
            toast.success('Classes assigned successfully');
            setShowAssignModal(false);
            setSelectedSubject(null);
            setSelectedClasses([]);
            fetchData();
        } catch (error: any) {
            console.error('Error assigning classes:', error);
            toast.error(error.response?.data?.message || 'Failed to assign classes');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', description: '' });
    };

    const openEditModal = (subject: Subject) => {
        setSelectedSubject(subject);
        setFormData({
            name: subject.name,
            code: subject.code,
            description: subject.description || ''
        });
        setShowEditModal(true);
    };

    const openAssignModal = (subject: Subject) => {
        setSelectedSubject(subject);
        setSelectedClasses(subject.classes?.map(c => c.id) || []);
        setShowAssignModal(true);
    };

    const toggleClassSelection = (classId: number) => {
        setSelectedClasses(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    const tableColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Subject Name', accessor: 'name' },
        { header: 'Code', accessor: 'code' },
        {
            header: 'Description',
            accessor: (row: Subject) => row.description || '-'
        },
        {
            header: 'Assigned Classes',
            accessor: (row: Subject) => row.classes?.map(c => c.name.replace(/^Class\s*/i, '')).join(', ') || '-'
        },
        {
            header: 'Actions',
            accessor: (row: Subject) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => openAssignModal(row)}
                        className="!bg-transparent !border-none !p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 !rounded transition-colors"
                        title="Assign Classes"
                    >
                        <i className="bi bi-link-45deg text-lg"></i>
                    </button>
                    <button
                        onClick={() => openEditModal(row)}
                        className="!bg-transparent !border-none !p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 !rounded transition-colors"
                        title="Edit"
                    >
                        <i className="bi bi-pencil text-lg"></i>
                    </button>
                    <button
                        onClick={() => handleDeleteSubject(row.id)}
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
                    <h2 className="text-2xl font-bold text-gray-800">Subjects Management</h2>
                    <Button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                    >
                        <i className="bi bi-plus-lg mr-2"></i>
                        Add Subject
                    </Button>
                </div>

                {subjects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No subjects found. Add a subject to get started.
                    </div>
                ) : (
                    <Table
                        columns={tableColumns}
                        data={subjects}
                        headerBackgroundColor="#292648"
                    />
                )}
            </div>

            {/* Add Subject Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Subject</h3>
                        <form onSubmit={handleAddSubject}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Subject Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="e.g., Mathematics, Science"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Subject Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="e.g., MATH101, SCI102"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Brief description of the subject"
                                    rows={3}
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
                                    {submitting ? 'Adding...' : 'Add Subject'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Subject Modal */}
            {showEditModal && selectedSubject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Subject</h3>
                        <form onSubmit={handleUpdateSubject}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Subject Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Subject Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedSubject(null);
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

            {/* Assign Classes Modal */}
            {showAssignModal && selectedSubject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Assign Classes to {selectedSubject.name}</h3>
                        <form onSubmit={handleAssignClasses}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Classes
                                </label>
                                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded p-2">
                                    {classes.length === 0 ? (
                                        <p className="text-gray-500 text-center py-2">No classes available</p>
                                    ) : (
                                        classes.map(cls => (
                                            <label key={cls.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClasses.includes(cls.id)}
                                                    onChange={() => toggleClassSelection(cls.id)}
                                                    className="w-4 h-4"
                                                />
                                                <span>{cls.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedSubject(null);
                                        setSelectedClasses([]);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Assigning...' : 'Assign Classes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsManagement;
