'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEye, FiEdit, FiTrash2, FiPlus, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import DataTable from '@/components/ui/DataTable';
import ownerService from '@/api/services/ownerService';
import { isAuthenticated } from '@/utils/auth';
import tokenService from '@/services/tokenService';
import Modal from '@/components/ui/Modal';

export default function OwnersPage() {
  const router = useRouter();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
  }, [router]);

  // Fetch owners on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      fetchOwners();
    }
  }, []);

  // Fetch owners from API
  const fetchOwners = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1; // Get userId from auth context
      console.log('Fetching owners for user ID:', userId);
      
      const data = await ownerService.listOwners(userId);
      
      if (data.detail && typeof data.detail === 'string') {
        // This is likely an error message
        setError(data.detail);
        // Don't show toast here, we'll display in the UI
        return;
      }
      
      setOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
      setError(error.message || 'Failed to load owners');
      // Don't show toast here, we'll display in the UI
    } finally {
      setLoading(false);
    }
  };

  // Navigate to add new owner page
  const handleAddNew = () => {
    router.push('/owners/create');
  };

  // Navigate to edit page for specific owner
  const handleEdit = (owner) => {
    router.push(`/owners/edit/${owner.user_id}`);
  };

  // Navigate to view page for specific owner
  const handleView = (owner) => {
    router.push(`/owners/view/${owner.user_id}`);
  };

  // Show delete confirmation modal
  const confirmDelete = (owner) => {
    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  // Handle owner deletion
  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1; // Get userId from auth context
      
      const response = await ownerService.deleteOwner(ownerToDelete.user_id, userId);
      
      if (response.detail && response.detail.includes("successfully")) {
        toast.success('Owner deleted successfully');
        fetchOwners(); // Refresh the list
      } else if (response.detail) {
        setError(response.detail);
        setShowDeleteModal(false);
      } else {
        toast.success('Owner deleted successfully');
        fetchOwners(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete owner:', error);
      setError(error.message || 'Failed to delete owner');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setOwnerToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Management</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage all restaurant owners</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
        >
          <FiPlus className="mr-2" /> Add New Owner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-800">Owner List</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 min-h-[300px]">
              <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
                <FiAlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Owners</h3>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiArrowLeft className="mr-2" /> Go Back to Dashboard
                </button>
              </div>
            </div>
          ) : owners.length === 0 ? (
            <div className="text-center py-8">
              <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No owners found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new owner</p>
              <button
                onClick={handleAddNew}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                Add New Owner
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {owners.map((owner, index) => (
                    <tr key={owner.user_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                            <div className="text-sm text-gray-500">{owner.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.email}</div>
                        <div className="text-sm text-gray-500">{owner.mobile}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          owner.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {owner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleView(owner)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(owner)}
                            className="text-amber-600 hover:text-amber-900 transition-colors duration-200"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(owner)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Owner"
          onClose={() => setShowDeleteModal(false)}
          showClose={true}
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-4 text-red-600">
              <FiTrash2 size={48} />
            </div>
            <h3 className="text-lg text-center font-medium text-gray-900 mb-2">
              Are you sure you want to delete this owner?
            </h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              This action cannot be undone. All data associated with this owner will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
              >
                {loading ? 'Deleting...' : 'Delete Owner'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 