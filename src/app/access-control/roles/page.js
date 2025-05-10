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

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    role_name: '',
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
      header: 'Role Name',
      accessor: 'role_name',
      render: (row) => (
        <span className="capitalize text-gray-900">{row.role_name}</span>
      )
    },
    {
      header: 'Created On',
      accessor: 'created_on',
      render: (row) => (
        <span className="text-gray-900">{formatDate(row.created_on)}</span>
      )
    }
  ];
  
  // Fetch roles on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchRoles();
    }
  }, []);
  
  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await ubacService.getRoles();
      
      // Check for authentication error
      if (data && data.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to load roles');
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
  
  // Open modal for adding new role
  const handleAddNew = () => {
    setFormData({
      role_name: '',
    });
    setIsModalOpen(true);
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
  
  // Delete role
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    try {
      const response = await ubacService.deleteRole(itemToDelete.ubac_role_id);
      
      // Check for authentication error
      if (response && response.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to delete role');
      }
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };
  
  // Submit form for creating role
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await ubacService.createRole({
        role_name: formData.role_name
      });
      
      // Check for authentication error
      if (response && response.detail === 'Not authenticated') {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
        return;
      }
      
      toast.success('Role created successfully');
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
      
      // Handle authentication error
      if (error.message && error.message.includes('Not authenticated')) {
        toast.error('Authentication required. Please log in.');
        router.push('/auth/login');
      } else {
        toast.error('Failed to create role');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // View role's assigned functionalities
  const handleView = (role) => {
    // Navigate to role-mapping page
    router.push(`/dashboard/access-control/role-mapping/${role.ubac_role_id}`);
  };
  
  // Render form
  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role_name" className="block text-sm font-medium text-gray-900 mb-1">
            Role Name
          </label>
          <input
            type="text"
            id="role_name"
            name="role_name"
            value={formData.role_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Enter role name"
            required
          />
        </div>
        
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
            {loading ? 'Creating...' : 'Create Role'}
          </button>
        </div>
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
          <h3 className="text-lg font-medium text-gray-900">Delete Role</h3>
          <p className="text-gray-700 mt-2">
            Are you sure you want to delete <span className="font-medium capitalize">{itemToDelete.role_name}</span>? This action cannot be undone.
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
        <h1 className="text-2xl font-bold text-gray-900">Access Control Roles</h1>
        <p className="text-gray-700 mt-1">Manage user roles for access control</p>
      </div>
      
      <div className="mb-8">
        <DataTable
          title="Roles"
          data={roles}
          columns={columns}
          onAdd={handleAddNew}
          onView={handleView}
          onDelete={handleDeleteClick}
          addButtonLabel="Add Role"
          emptyMessage={loading ? "Loading roles..." : "No roles found"}
        />
      </div>
      
      {/* Add Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Role"
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