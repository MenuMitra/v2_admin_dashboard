'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';
import ubacService from '@/api/services/ubacService';
import { isAuthenticated } from '@/utils/auth';
import { getAuthHeaders } from '@/utils/apiUtils';
import Modal from '@/components/ui/Modal';

export default function RoleMappingPage({ params }) {
  const router = useRouter();
  // Use React.use() to unwrap params as recommended
  const unwrappedParams = React.use(params);
  // Ensure roleId is converted to a number
  const roleId = parseInt(unwrappedParams.id, 10);
  
  // Log for debugging
  console.log("Role Mapping Page - roleId:", roleId, "params.id:", unwrappedParams.id);
  
  const [loading, setLoading] = useState(true);
  const [roleMappings, setRoleMappings] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [functionalities, setFunctionalities] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [selectedFunctionality, setSelectedFunctionality] = useState('');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Check authentication and fetch data
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }

    fetchData();
  }, [roleId, router]);

  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Validate roleId
      if (!roleId) {
        console.error('Invalid role ID:', unwrappedParams.id);
        toast.error('Invalid role ID');
        router.push('/access-control/roles');
        return;
      }
      
      console.log('Fetching data for role ID:', roleId);
      
      // Fetch the role mappings using the correct API
      const mappings = await ubacService.listviewRoleFunctionalityMapping(roleId);
      console.log('Retrieved mappings:', mappings);
      
      // Handle API errors
      if (!Array.isArray(mappings)) {
        if (mappings && mappings.detail) {
          throw new Error(mappings.detail);
        } else {
          throw new Error('Invalid response format');
        }
      }
      
      // Set the retrieved mappings
      setRoleMappings(mappings);

      // Fetch all functionalities to populate the dropdown
      const allFunctionalities = await ubacService.getFunctionalities();
      if (!Array.isArray(allFunctionalities)) {
        console.error('Failed to fetch functionalities:', allFunctionalities);
        throw new Error('Failed to load functionalities');
      }
      setFunctionalities(allFunctionalities);

      // Set role name based on roleId
      // Since there's no dedicated API endpoint to get role details
      setRoleName(`Role ${roleId}`);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(error.message || 'Failed to load data');
      
      if (error.message === 'Role id is required') {
        router.push('/access-control/roles');
      }
    } finally {
      setLoading(false);
    }
  };

  // Open add functionality modal
  const handleAddMapping = () => {
    setSelectedFunctionality('');
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = (mapping) => {
    setSelectedMapping(mapping);
    setSelectedFunctionality(mapping.ubac_functionality_id.toString());
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (mapping) => {
    setSelectedMapping(mapping);
    setIsDeleteModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMapping(null);
    setSelectedFunctionality('');
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedMapping(null);
  };

  // Handle functionality selection change
  const handleFunctionalityChange = (e) => {
    setSelectedFunctionality(e.target.value);
  };

  // Submit new mapping
  const handleSubmitMapping = async (e) => {
    e.preventDefault();
    if (!selectedFunctionality) {
      toast.error('Please select a functionality');
      return;
    }

    setLoading(true);
    try {
      // Use the updated API format
      const response = await ubacService.createRoleFunctionalityMapping({
        role_id: roleId,
        functionality_id: parseInt(selectedFunctionality, 10)
      });

      if (response && response.detail) {
        toast.success(response.detail || 'Functionality assigned successfully');
      } else {
        toast.success('Functionality assigned successfully');
      }
      
      setIsAddModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create mapping:', error);
      toast.error(error.message || 'Failed to assign functionality');
    } finally {
      setLoading(false);
    }
  };

  // Submit updated mapping
  const handleSubmitEditMapping = async (e) => {
    e.preventDefault();
    if (!selectedFunctionality || !selectedMapping) {
      toast.error('Please select a functionality');
      return;
    }

    setLoading(true);
    try {
      // Use the updateRoleFunctionalityMapping method
      const response = await ubacService.updateRoleFunctionalityMapping({
        role_functionality_mapping_id: selectedMapping.ubac_role_functionality_mapping_id,
        role_id: roleId,
        functionality_id: parseInt(selectedFunctionality, 10)
      });

      if (response && response.detail) {
        toast.success(response.detail || 'Functionality updated successfully');
        
        // Update the state locally to avoid a full re-fetch
        setRoleMappings(prev => prev.map(mapping => 
          mapping.ubac_role_functionality_mapping_id === selectedMapping.ubac_role_functionality_mapping_id
            ? {...mapping, ubac_functionality_id: parseInt(selectedFunctionality, 10)}
            : mapping
        ));
      } else {
        toast.success('Functionality updated successfully');
        // Refresh data to be safe
        fetchData();
      }
      
      closeEditModal();
    } catch (error) {
      console.error('Failed to update mapping:', error);
      toast.error(error.message || 'Failed to update functionality');
      fetchData(); // Refresh to ensure UI is in sync
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete mapping
  const confirmDelete = async () => {
    if (!selectedMapping) return;

    setLoading(true);
    try {
      // Use the mapping ID from the selected mapping
      const mappingId = selectedMapping.ubac_role_functionality_mapping_id;
      const response = await ubacService.deleteRoleFunctionalityMapping(mappingId);
      
      // Only update state if the backend operation was successful
      if (response && !response.error && (response.detail === 'Functionality unassigned successfully' || 
          response.detail === 'Mapping deleted successfully')) {
        // Update mappings locally to avoid full page refresh
        setRoleMappings(prev => 
          prev.filter(mapping => mapping.ubac_role_functionality_mapping_id !== mappingId)
        );
        
        toast.success(response.detail || 'Functionality unassigned successfully');
      } else {
        // If we get a response but without success message, something went wrong
        console.error('Unexpected response from API:', response);
        toast.error(response?.detail || 'Failed to unassign functionality. Please try again.');
        
        // Refresh data to ensure UI is in sync with backend
        fetchData();
      }
      
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      toast.error(error.message || 'Failed to unassign functionality. Please try again.');
      
      // Refresh data to ensure UI is in sync with backend
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  // Render add mapping form
  const renderAddForm = () => {
    const availableFunctionalities = functionalities.filter(
      func => !roleMappings.some(
        mapping => mapping.ubac_functionality_id === func.ubac_functionality_id
      )
    );

    return (
      <form onSubmit={handleSubmitMapping} className="space-y-4">
        <div>
          <label htmlFor="functionality" className="block text-sm font-medium text-gray-700 mb-1">
            Select Functionality
          </label>
          <select
            id="functionality"
            value={selectedFunctionality}
            onChange={handleFunctionalityChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900"
            required
          >
            <option value="">-- Select a functionality --</option>
            {availableFunctionalities.map(func => (
              <option key={func.ubac_functionality_id} value={func.ubac_functionality_id}>
                {func.functionality_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedFunctionality}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:bg-gray-400"
          >
            {loading ? 'Assigning...' : 'Assign Functionality'}
          </button>
        </div>
      </form>
    );
  };

  // Render edit mapping form
  const renderEditForm = () => {
    const availableFunctionalities = functionalities.filter(
      func => !roleMappings.some(
        mapping => mapping.ubac_functionality_id === func.ubac_functionality_id && 
                  mapping.ubac_role_functionality_mapping_id !== selectedMapping?.ubac_role_functionality_mapping_id
      )
    );
    
    // Add the currently selected functionality if it's not in the list
    const currentFunctionality = functionalities.find(
      func => func.ubac_functionality_id === selectedMapping?.ubac_functionality_id
    );
    
    if (currentFunctionality && !availableFunctionalities.some(f => f.ubac_functionality_id === currentFunctionality.ubac_functionality_id)) {
      availableFunctionalities.push(currentFunctionality);
    }

    return (
      <form onSubmit={handleSubmitEditMapping} className="space-y-4">
        <div>
          <label htmlFor="edit-functionality" className="block text-sm font-medium text-gray-700 mb-1">
            Select Functionality
          </label>
          <select
            id="edit-functionality"
            value={selectedFunctionality}
            onChange={handleFunctionalityChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 text-gray-900"
            required
          >
            <option value="">-- Select a functionality --</option>
            {availableFunctionalities.map(func => (
              <option key={func.ubac_functionality_id} value={func.ubac_functionality_id}>
                {func.functionality_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={closeEditModal}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedFunctionality}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Functionality'}
          </button>
        </div>
      </form>
    );
  };

  // Render delete confirmation modal
  const renderDeleteConfirmation = () => {
    if (!selectedMapping) return null;
    
    // Find the functionality name
    const functionality = functionalities.find(
      f => f.ubac_functionality_id === selectedMapping.ubac_functionality_id
    );
    const functionalityName = functionality ? functionality.functionality_name : 'this functionality';

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Unassign Functionality</h3>
          <p className="text-gray-700 mt-2">
            Are you sure you want to unassign <span className="font-medium">{functionalityName}</span> from <span className="font-medium capitalize">{roleName}</span> role?
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
            {loading ? 'Unassigning...' : 'Unassign'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => router.push('/access-control/roles')}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{roleName || 'Role'} Functionalities</h1>
          </div>
          <p className="mt-1 text-gray-600">Manage functionalities assigned to this role</p>
        </div>
        <button
          onClick={handleAddMapping}
          className="inline-flex items-center px-4 py-2 border border-gray-800 rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition duration-150"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Assign Functionality
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-900 text-white">
          <h2 className="text-lg font-medium">Assigned Functionalities</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600">Loading functionalities...</p>
            </div>
          ) : roleMappings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No functionalities assigned to this role</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sr No
                  </th>
                  
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Functionality Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roleMappings.map((mapping, index) => {
                  const functionality = functionalities.find(
                    f => f.ubac_functionality_id === mapping.ubac_functionality_id
                  );
                  
                  return (
                    <tr key={mapping.ubac_role_functionality_mapping_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-800 font-medium">{index + 1}</span>
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-800">
                          {functionality ? functionality.functionality_name : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-800">{formatDate(mapping.created_on)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(mapping)}
                            className="p-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                            title="Edit Functionality"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(mapping)}
                            className="p-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                            title="Unassign Functionality"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Mapping Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Assign Functionality"
      >
        {renderAddForm()}
      </Modal>

      {/* Edit Mapping Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Functionality Assignment"
      >
        {renderEditForm()}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirm Unassign"
        size="sm"
      >
        {renderDeleteConfirmation()}
      </Modal>
    </div>
  );
} 