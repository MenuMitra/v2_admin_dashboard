'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
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
      render: (row, index) => (
        <span className="text-gray-800 font-medium">{index + 1}</span>
      ),
    },
    {
      header: 'Functionality Name',
      accessor: 'functionality_name',
      render: (row) => (
        <span className="text-gray-800 font-medium capitalize">{row.functionality_name}</span>
      ),
    },
    {
      header: 'Created On',
      accessor: 'created_on',
      render: (row) => (
        <span className="text-gray-800">{formatDate(row.created_on)}</span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-3">
         
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            title="Edit Functionality"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            title="Delete Functionality"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
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

      // Only update state if the backend operation was successful
      if (response && response.detail === "Functionality deleted successfully") {
        // Update state locally instead of fetching all data again
        setFunctionalities(prev => 
          prev.filter(item => item.ubac_functionality_id !== itemToDelete.ubac_functionality_id)
        );
        
        toast.success('Functionality deleted successfully');
      } else {
        // If we get a response but without success message, something went wrong
        console.error('Unexpected response from API:', response);
        toast.error('Failed to delete functionality. Please try again.');
        
        // Refresh data to ensure UI is in sync with backend
        fetchFunctionalities();
      }
    } catch (error) {
      console.error('Failed to delete functionality:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to delete functionality. Please try again.');
      }

      // Refresh data to ensure UI is in sync with backend
      fetchFunctionalities();
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
        
        // Update state locally
        if (response && response.ubac_functionality_id) {
          // Add the new functionality to the state
          setFunctionalities(prev => [...prev, response]);
        }
      } else if (modalMode === 'edit') {
        response = await ubacService.updateFunctionality({
          functionality_id: formData.functionality_id,
          functionality_name: formData.functionality_name
        });
        
        // Update state locally
        if (response) {
          setFunctionalities(prev => 
            prev.map(item => 
              item.ubac_functionality_id === formData.functionality_id 
                ? {...item, functionality_name: formData.functionality_name}
                : item
            )
          );
        }
      }
      
      // Check for authentication error
      if (response && response.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      toast.success(`Functionality ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
      setIsModalOpen(false);
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
          <label htmlFor="functionality_name" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900"
              placeholder="Enter functionality name"
              required
            />
          )}
        </div>
        
        {isViewMode && (
          <div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Created On</label>
              <div className="px-4 py-2 bg-gray-100 rounded-md text-gray-900">{formatDate(currentFunctionality?.created_on)}</div>
            </div>
          </div>
        )}
        
        {!isViewMode && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:bg-gray-400"
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
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-700"
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
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Access Control Functionalities</h1>
        <p className="text-gray-600 mt-1">Manage system functionalities for access control</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-900 text-white flex items-center justify-between">
          <h2 className="text-lg font-medium">Functionalities</h2>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
          >
            <FiPlus className="mr-1.5 h-4 w-4" />
            Add Functionality
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600">Loading functionalities...</p>
            </div>
          ) : functionalities.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No functionalities found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th 
                      key={index}
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {functionalities.map((functionality, rowIndex) => (
                  <tr key={functionality.ubac_functionality_id} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                        {column.render ? column.render(functionality, rowIndex) : functionality[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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