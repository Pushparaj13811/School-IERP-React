import React, { useState, useEffect } from 'react';
import { FaEdit,FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Parent } from '../../types/api';
import Button from '../../components/ui/Button';

const ParentsList: React.FC = () => {
    const navigate = useNavigate();
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'activate' | 'deactivate'>('delete');
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getParents();
            
            if (response.data?.status === 'success' && Array.isArray(response.data?.data?.parents)) {
                setParents(response.data.data.parents);
            } else {
                toast.error('Failed to load parents data');
                setParents([]);
            }
        } catch (error) {
            console.error('Error fetching parents:', error);
            toast.error('Failed to load parents. Please try again.');
            setParents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (parentId: number) => {
        navigate(`/parent-profile/${parentId}`);
    };

    const handleAddParent = () => {
        navigate('add-parent');
    };

    const handleEditClick = (parent: Parent) => {
        // Navigate to add parent form with parent data
        navigate('add-parent', { 
            state: { 
                editMode: true,
                parentData: parent 
            } 
        });
    };


    const handleToggleActiveClick = (parent: Parent) => {
        const newAction = parent.isActive ? 'deactivate' : 'activate';
        setActionType(newAction);
        setSelectedParent(parent);
        setActionModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedParent) return;
        
        try {
            // API call to delete parent
            toast.success(`${selectedParent.name} has been deleted successfully`);
            setParents(parents.filter(parent => parent.id !== selectedParent.id));
        } catch (error) {
            console.error('Error deleting parent:', error);
            toast.error('Failed to delete parent. Please try again.');
        } finally {
            setSelectedParent(null);
        }
    };

    const handleActionConfirm = async () => {
        if (!selectedParent) return;
        
        if (actionType === 'delete') {
            handleDeleteConfirm();
            return;
        }
        
        try {
            // Toggle active status based on current status
            const isActive = actionType === 'activate';
            const response = await userAPI.toggleParentActiveStatus(selectedParent.id, isActive);
            
            if (response.data?.status === 'success') {
                toast.success(`${selectedParent.name} has been ${isActive ? 'activated' : 'deactivated'} successfully`);
                
                // Update the parent in the list with the new active status
                setParents(parents.map(parent => 
                    parent.id === selectedParent.id 
                        ? { ...parent, isActive: isActive } 
                        : parent
                ));
            } else {
                toast.error(response.data?.message || `Failed to ${actionType} parent. Please try again.`);
            }
        } catch (error) {
            console.error(`Error ${actionType}ing parent:`, error);
            toast.error(`Failed to ${actionType} parent. Please try again.`);
        } finally {
            setActionModalOpen(false);
            setSelectedParent(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading parents...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">All Parents</h1>
                <Button 
                    variant="primary"
                    onClick={handleAddParent}
                >   
                    Add Parent
                </Button>
            </div>

            {parents.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">No parents found. Add your first parent to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-indigo-900 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Gender</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Contact No.</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {parents.map((parent, index) => (
                                <tr 
                                    key={parent.id} 
                                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} cursor-pointer hover:bg-gray-100`}
                                    onClick={() => handleRowClick(parent.id)}
                                >
                                    <td className="px-6 py-4 text-sm text-gray-900">{parent.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{parent.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{parent.gender}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{parent.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{parent.contactNo}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${parent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {parent.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                                            <Button 
                                                variant="outline"   
                                                onClick={() => handleEditClick(parent)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button 
                                                variant={parent.isActive ? "danger" : "primary"}
                                                onClick={() => handleToggleActiveClick(parent)}
                                            >
                                                {parent.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationModal
                isOpen={actionModalOpen}
                onClose={() => setActionModalOpen(false)}
                onConfirm={handleActionConfirm}
                title={actionType === 'activate' ? "Activate Parent" : "Deactivate Parent"}
                message={`Are you sure you want to ${actionType} ${selectedParent?.name}? ${
                    actionType === 'deactivate' 
                        ? "They will no longer be able to log in or access any features."
                        : "This will restore their access to the system."
                }`}
                confirmLabel={actionType === 'activate' ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default ParentsList; 