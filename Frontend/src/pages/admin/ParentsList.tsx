import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Parent } from '../../types/api';

const ParentsList: React.FC = () => {
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

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
    navigate('add-parents');
  };

  const handleEditClick = (e: React.MouseEvent, parent: Parent) => {
    e.stopPropagation();
    // Navigate to add parent form with parent data
    navigate('add-parents', { 
      state: { 
        editMode: true,
        parentData: parent 
      } 
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, parent: Parent) => {
    e.stopPropagation();
    setSelectedParent(parent);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Implement delete logic here
    console.log('Deleting parent:', selectedParent?.id);
    setDeleteModalOpen(false);
    setSelectedParent(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading parents...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Parents</h1>
        <button 
          className="bg-indigo-900 text-white px-4 py-2 rounded-md hover:bg-indigo-800"
          onClick={handleAddParent}
        >
          Add Parent
        </button>
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
                <th className="px-6 py-3 text-left text-sm font-medium">Children</th>
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
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {parent.children?.map(child => child.name).join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="text-green-600 hover:text-green-800"
                        onClick={(e) => handleEditClick(e, parent)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={(e) => handleDeleteClick(e, parent)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Parent"
        message={`Are you sure you want to delete ${selectedParent?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ParentsList; 