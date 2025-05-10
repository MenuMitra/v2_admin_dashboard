'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ubacService from '@/api/services/ubacService';
import { isAuthenticated } from '@/utils/auth';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function FunctionalitiesPage() {
  const router = useRouter();
  const [functionalities, setFunctionalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentFunctionality, setCurrentFunctionality] = useState(null);
  const [formData, setFormData] = useState({
    functionality_name: '',
    functionality_id: null
  });
  
  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
  }, [router]);
  
  // Table columns configuration
  const columns = [
    {
      header: 'Sr No',
      render: () => null, // This will be populated directly in the UI
    },
    {
      header: 'Functionality Name',
      accessor: 'functionality_name',
      render: (row) => (
        <span className="text-gray-900">{row.functionality_name}</span>
      ),
    },
    {
      header: 'Created On',
      accessor: 'created_on',
      render: (row) => (
        <span className="text-gray-900">{formatDate(row.created_on)}</span>
      )
    }
  ];
  
  // Fetch functionalities on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchFunctionalities();
    }
  }, []);
  
  // Fetch functionalities from API
  const fetchFunctionalities = async () => {
    setLoading(true);
    try {
      const data = await ubacService.getFunctionalities();
      
      // Check for authentication error
      if (data && data.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      setFunctionalities(data);
    } catch (error) {
      console.error('Failed to fetch functionalities:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to load functionalities');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Open modal for adding new functionality
  const handleAddNew = () => {
    setFormData({
      functionality_name: '',
      functionality_id: null
    });
    setModalMode('add');
    setIsModalOpen(true);
  };
  
  // Open modal for editing functionality
  const handleEdit = (item) => {
    setCurrentFunctionality(item);
    setFormData({
      functionality_name: item.functionality_name,
      functionality_id: item.ubac_functionality_id
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  // Open modal for viewing functionality details
  const handleView = async (item) => {
    setLoading(true);
    try {
      const functionality = await ubacService.viewFunctionality(item.ubac_functionality_id);
      
      // Check for authentication error
      if (functionality && functionality.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      setCurrentFunctionality(functionality);
      setModalMode('view');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to get functionality details:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to load functionality details');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Open delete confirmation modal
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };
  
  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };
  
  // Delete functionality
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    try {
      const response = await ubacService.deleteFunctionality(itemToDelete.ubac_functionality_id);
      
      // Check for authentication error
      if (response && response.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      toast.success('Functionality deleted successfully');
      fetchFunctionalities();
    } catch (error) {
      console.error('Failed to delete functionality:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to delete functionality');
      }
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };
  
  // Submit form for creating or updating functionality
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      
      if (modalMode === 'add') {
        response = await ubacService.createFunctionality({
          functionality_name: formData.functionality_name
        });
      } else if (modalMode === 'edit') {
        response = await ubacService.updateFunctionality({
          functionality_id: formData.functionality_id,
          functionality_name: formData.functionality_name
        });
      }
      
      // Check for authentication error
      if (response && response.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      toast.success(`Functionality ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
      setIsModalOpen(false);
      fetchFunctionalities();
    } catch (error) {
      console.error(`Failed to ${modalMode} functionality:`, error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error(`Failed to ${modalMode} functionality`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Render form based on modal mode
  const renderForm = () => {
    const isViewMode = modalMode === 'view';
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="functionality_name" className="block text-sm font-medium text-gray-900 mb-1">
            Functionality Name
          </label>
          {isViewMode ? (
            <div className="w-full px-4 py-2 bg-gray-100 rounded-md text-gray-900">
              {currentFunctionality?.functionality_name}
            </div>
          ) : (
            <input
              type="text"
              id="functionality_name"
              name="functionality_name"
              value={formData.functionality_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter functionality name"
              required
            />
          )}
        </div>
        
        {isViewMode && (
          <div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Created On</label>
              <div className="px-4 py-2 bg-gray-100 rounded-md text-gray-900">{formatDate(currentFunctionality?.created_on)}</div>
            </div>
          </div>
        )}
        
        {!isViewMode && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : (modalMode === 'add' ? 'Create' : 'Update')}
            </button>
          </div>
        )}
      </form>
    );
  };
  
  // Render delete confirmation modal
  const renderDeleteConfirmation = () => {
    if (!itemToDelete) return null;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Delete Functionality</h3>
          <p className="text-gray-700 mt-2">
            Are you sure you want to delete <span className="font-medium">{itemToDelete.functionality_name}</span>? This action cannot be undone.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Access Control Functionalities</h1>
        <p className="text-gray-700 mt-1">Manage user access control functionalities</p>
      </div>
      
      <div className="mb-8">
        <DataTable
          title="Functionalities"
          data={functionalities}
          columns={columns}
          onAdd={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}

          addButtonLabel="Add Functionality"
          emptyMessage={loading ? "Loading functionalities..." : "No functionalities found"}
        />
      </div>
      
      {/* Main Modal (Add/Edit/View) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'add' 
            ? 'Add New Functionality' 
            : modalMode === 'edit'
              ? 'Edit Functionality'
              : 'Functionality Details'
        }
      >
        {renderForm()}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
} 