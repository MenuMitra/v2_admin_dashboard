'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard, FiArrowLeft, FiEdit, FiTrash2, FiCheck, FiX, FiClock, FiShield, FiAlertCircle } from 'react-icons/fi';
import ownerService from '@/api/services/ownerService';
import tokenService from '@/services/tokenService';
import { isAuthenticated } from '@/utils/auth';
import Modal from '@/components/ui/Modal';

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function ViewOwnerPage({ params }) {
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
      const ownerId = params.id;
      const ownerDetails = await ownerService.viewOwner(ownerId);
      
      if (ownerDetails.detail && typeof ownerDetails.detail === 'string' && !ownerDetails.name) {
        // This is likely an error
        setError(ownerDetails.detail);
        return;
      }
      
      setOwner(ownerDetails);
    } catch (error) {
      console.error('Failed to fetch owner details:', error);
      setError(error.message || 'Failed to load owner details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/owners/edit/${params.id}`);
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const response = await ownerService.deleteOwner(params.id, userId);
      
      if (response.detail && response.detail.includes("successfully")) {
        toast.success('Owner deleted successfully');
        router.push('/owners');
      } else if (response.detail) {
        setError(response.detail);
        setShowDeleteModal(false);
      } else {
        toast.success('Owner deleted successfully');
        router.push('/owners');
      }
    } catch (error) {
      console.error('Failed to delete owner:', error);
      setError(error.message || 'Failed to delete owner');
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
      <div className="max-w-4xl px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl px-6 h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
          <FiAlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Owner</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <FiArrowLeft className="mr-2" /> Go Back to Owners
          </button>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="max-w-4xl px-6 h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-lg">
          <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Owner Not Found</h3>
          <p className="text-gray-500 mb-6">The owner you're looking for doesn't exist or has been removed</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiArrowLeft className="mr-2" /> Go Back to Owners
          </button>
        </div>
      </div>
    );
  }

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
    <div className="max-w-4xl px-6">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goBack}
          className="inline-flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" /> Back to Owners
        </button>
        <div className="space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-sm"
          >
            <FiEdit className="mr-2" /> Edit
          </button>
          <button
            onClick={confirmDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm"
          >
            <FiTrash2 className="mr-2" /> Delete
          </button>
        </div>
      </div>

      {/* Owner details card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Owner Details</h1>
        </div>
        
        <div className="p-6">
          {/* Personal Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {personalDetails.map((detail, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <div className="mr-4 mt-1 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <detail.icon className="text-blue-600" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{detail.label}</span>
                    <span className="block text-base font-medium text-gray-900 mt-1">{detail.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Information Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Account Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {accountDetails.map((detail, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <div className="mr-4 mt-1 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <detail.icon className="text-blue-600" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">{detail.label}</span>
                    {detail.status ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        detail.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {detail.value}
                      </span>
                    ) : (
                      <span className="block text-base font-medium text-gray-900 mt-1">{detail.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outlets Section - if owner has outlets */}
          {owner.outlets && owner.outlets.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Outlets</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="divide-y divide-gray-200">
                  {owner.outlets.map((outlet, index) => (
                    <li key={index} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900">{outlet.name}</span>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
                disabled={loading}
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