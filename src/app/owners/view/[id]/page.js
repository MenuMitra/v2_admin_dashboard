'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard, FiArrowLeft, FiEdit, FiTrash2, FiCheck, FiX, FiClock, FiShield, FiAlertCircle } from 'react-icons/fi';
import ownerService from '@/api/services/ownerService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function ViewOwnerPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const ownerId = unwrappedParams.id;
  
  const router = useRouter();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    
    fetchOwnerDetails();
  }, []);

  const fetchOwnerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerDetails = await ownerService.viewOwner(ownerId);
      
      if (ownerDetails.detail && typeof ownerDetails.detail === 'string') {
        // This is an error response from the API
        setError(ownerDetails.detail);
        setLoading(false);
        return;
      }
      
      setOwner(ownerDetails);
    } catch (error) {
      console.error('Failed to fetch owner details:', error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || 'Failed to load owner details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/owners/edit/${ownerId}`);
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const response = await ownerService.deleteOwner(ownerId, userId);
      
      if (response.detail) {
        if (response.detail.includes("successfully")) {
          toast.success(response.detail);
          router.push('/owners');
        } else {
          // Set error to the exact API error message
          setError(response.detail);
          setShowDeleteModal(false);
        }
      } else {
        toast.success('Owner deleted successfully');
        router.push('/owners');
      }
    } catch (error) {
      console.error('Failed to delete owner:', error);
      // Set error to the exact API error message if available
      setError(error.detail || error.message || 'Failed to delete owner');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const goBack = () => {
    router.push('/owners');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gray-100 min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-gray-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700">Loading owner details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100">
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Owner Details</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage owner information</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Owners
          </button>
          {!error && owner && (
            <>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <FiEdit className="mr-2 h-4 w-4" />
                Edit
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
            <h3 className="text-lg font-medium">Owner Details</h3>
          </div>
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={20} />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
      
      {!error && owner && (
        <>
          {/* Define owner detail arrays here where owner is guaranteed to be non-null */}
          {(() => {
            // Group owner details for display
            const personalDetails = [
              { icon: FiUser, label: 'Name', value: owner.name },
              { icon: FiMail, label: 'Email', value: owner.email },
              { icon: FiPhone, label: 'Mobile', value: owner.mobile },
              { icon: FiMapPin, label: 'Address', value: owner.address },
              { icon: FiCalendar, label: 'Date of Birth', value: formatDate(owner.dob) },
              { icon: FiCreditCard, label: 'Aadhar Number', value: owner.aadhar_number },
            ];

            const accountDetails = [
              { icon: FiShield, label: 'Role', value: owner.role },
              { icon: FiCheck, label: 'Account Status', value: owner.account_status ? 'Active' : 'Inactive', 
                status: owner.account_status ? 'active' : 'inactive' },
              { icon: FiCheck, label: 'Active Status', value: owner.is_active ? 'Active' : 'Inactive',
                status: owner.is_active ? 'active' : 'inactive' },
              { icon: FiCheck, label: 'Staff Status', value: owner.is_staff ? 'Yes' : 'No',
                status: owner.is_staff ? 'active' : 'inactive' },
              { icon: FiCheck, label: 'Superuser Status', value: owner.is_superuser ? 'Yes' : 'No',
                status: owner.is_superuser ? 'active' : 'inactive' },
              { icon: FiClock, label: 'Created On', value: owner.created_on || 'N/A' },
              { icon: FiUser, label: 'Created By', value: owner.created_by || 'N/A' },
            ];

            if (owner.updated_on) {
              accountDetails.push(
                { icon: FiClock, label: 'Updated On', value: owner.updated_on },
                { icon: FiUser, label: 'Updated By', value: owner.updated_by || 'N/A' }
              );
            }

            return (
              /* Owner details sections */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                  </div>
                  <div className="p-6">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {personalDetails.map((detail, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md flex items-start">
                          <div className="mr-4 mt-1 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <detail.icon className="text-gray-600" />
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                            <dd className="mt-1 text-sm font-medium text-gray-900">{detail.value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                {/* Account Information Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
                    <h3 className="text-lg font-medium">Account Information</h3>
                  </div>
                  <div className="p-6">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {accountDetails.map((detail, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md flex items-start">
                          <div className="mr-4 mt-1 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <detail.icon className="text-gray-600" />
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                            {detail.status ? (
                              <dd className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  detail.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {detail.value}
                                </span>
                              </dd>
                            ) : (
                              <dd className="mt-1 text-sm font-medium text-gray-900">{detail.value}</dd>
                            )}
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Outlets Section - if owner has outlets */}
          {owner.outlets && owner.outlets.length > 0 && (
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-900 text-white">
                  <h3 className="text-lg font-medium">Outlets</h3>
                </div>
                <div className="p-6">
                  <div className="overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {owner.outlets.map((outlet, index) => (
                        <li key={index} className="py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <span className="font-medium text-gray-900">{outlet.name}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            outlet.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {outlet.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FiAlertCircle className="text-red-500 mr-2" size={20} />
              Confirm Deletion
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to delete this owner? This action cannot be undone. All data associated with this owner will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:bg-red-300"
              >
                {loading ? 'Deleting...' : 'Delete Owner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 